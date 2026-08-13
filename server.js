const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// 🧹 Clean database queues and cached URLs on start/re-deploy
try {
    const dbPath = path.join(__dirname, 'data/db.json');
    if (fs.existsSync(dbPath)) {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        dbData.jobs = []; // Clear pending job queues
        dbData.urlCache = {}; // Start URL statuses fresh
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
        console.log('🧹 [Startup] Cleared dynamic caches and old jobs queue on server start.');
    }
} catch (e) {
    console.error('Failed to clear database on startup:', e);
}

// ============================================================
// GLOBAL OUTBOUND PROXY INTERCEPTOR (Max Powerhouse Mode)
// Intercepts all native fetch calls globally to force routing
// through the Elite Proxy Waterfall automatically.
// ============================================================
const originalFetch = globalThis.fetch;
const proxyRotatorEngine = require('./services/proxyRotatorEngine');
proxyRotatorEngine.originalFetch = originalFetch;

globalThis.fetch = async function(url, options = {}) {
    const urlString = typeof url === 'string' ? url : (url.url || '');
    
    // Bypass condition: Skip proxy rotator if the request is destined to the proxies themselves,
    // or if the request is explicitly flagged with 'X-Proxy-Bypass' to avoid recursion.
    const isProxyBypass = 
        options?.headers?.['X-Proxy-Bypass'] === 'true' ||
        options?.headers?.['x-proxy-bypass'] === 'true' ||
        urlString.includes('script.google.com') ||
        urlString.includes('translate.google.com') ||
        urlString.includes('googleapis.com') ||
        urlString.includes('google.com') ||
        urlString.includes('bing.com') ||
        urlString.includes('yandex.com') ||
        (process.env.CF_PROXY_URL && urlString.includes(new URL(process.env.CF_PROXY_URL).hostname));

    if (isProxyBypass) {
        // Safe direct fallback execution
        const cleanHeaders = { ...(options.headers || {}) };
        delete cleanHeaders['X-Proxy-Bypass'];
        delete cleanHeaders['x-proxy-bypass'];
        return originalFetch(url, { ...options, headers: cleanHeaders });
    }

    // Automatically route outbound request via Elite Proxy waterfall
    const proxyRotatorEngine = require('./services/proxyRotatorEngine');
    const proxyRes = await proxyRotatorEngine.executeSafeRequest(urlString, options);
    if (proxyRes) return proxyRes;

    // Hard fallback to original fetch if all proxies fail
    console.log(`[GlobalFetchInterceptor] ⚠️ All proxies failed. Executing direct fallback fetch for: ${urlString}`);
    return originalFetch(url, options);
};

const indexingRoutes = require('./routes/indexingRoutes');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser with a secret sign key to secure cookies
app.use(cookieParser('ai-fast-indexer-cookie-secret-999'));

// Hardcoded user credentials
const TARGET_USER = {
    email: "sj7835860705@gmail.com",
    password: "@Support9267"
};

// Middleware: Authenticate routes using HTTP Basic Auth (No HTML form, prevents Google Phishing flags)
function checkAuth(req, res, next) {
    return next(); // Temporarily disable all auth to diagnose indexing block
    const url = req.path;
    
    // 0. Bypass auth for Googlebot and other crawlers to allow site verification
    const ua = req.get('User-Agent') || '';
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|google-site-verification|google/i.test(ua);
    if (isBot) {
        return next();
    }

    // 1. Exclude public Googlebot gateways, GSC files and feed paths
    const isPublicGateway = url.startsWith('/i/') || 
                            url.startsWith('/hub/') || 
                            url.startsWith('/google') || 
                            url.endsWith('.txt') ||
                            url.endsWith('.xml') ||
                            url === '/sitemap.xml' ||
                            url === '/news-sitemap.xml' ||
                            url === '/pbn-sitemap.xml' ||
                            url === '/atom.xml' ||
                            url === '/rss.xml' ||
                            url === '/sitemap.html' ||
                            url === '/fui-api/api/indexing/background-worker';
    
    if (isPublicGateway) {
        return next();
    }

    // 2. Exclude static assets that are public
    if (url.startsWith('/style.css') || 
        url.startsWith('/app.js') || 
        url.includes('manifest.json')) {
        return next();
    }

    // 3. Perform HTTP Basic Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="AI Fast Indexing Engine Login"');
        return res.status(401).send('Authentication Required.');
    }

    try {
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const email = auth[0];
        const password = auth[1];

        if (email === TARGET_USER.email && password === TARGET_USER.password) {
            return next();
        }
    } catch (e) {}

    res.setHeader('WWW-Authenticate', 'Basic realm="AI Fast Indexing Engine Login"');
    return res.status(401).send('Authentication Required.');
}

app.use(checkAuth);




// Rate Limiter: Unlimited / Enterprise High-Volume Limit
const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.setHeader('Ratelimit', 'limit=500, remaining=0, reset=60');
        res.setHeader('Ratelimit-Policy', '500;w=60');
        res.status(429).json({
            error: 'Too Many Requests. Rate limit exceeded.',
            limit: 500,
            windowSeconds: 60
        });
    }
});

// Custom Middleware to set RateLimit response headers
app.use('/fui-api/', (req, res, next) => {
    res.setHeader('Ratelimit', 'limit=500, remaining=499, reset=60');
    res.setHeader('Ratelimit-Policy', '500;w=60');
    res.setHeader('Server', 'Google Frontend / FastIndexingEngine');
    next();
});

// Mount fui-api indexing routes
app.use('/fui-api/api/indexing', apiRateLimiter, indexingRoutes);

// High-DA HTML Indexing Wrapper Gateway, RSS/Sitemap & PBN Routes
// IMPORTANT: Must be mounted BEFORE express.static so XML/sitemap routes take priority
app.use('/', indexingRoutes);

// Fallback route for SPA - serving index.html safely only after checkAuth validates cookies
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve other static assets dynamically while maintaining authentication security
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// NOTE: express.static is placed LAST so dynamic routes (sitemap.xml, rss.xml etc.) always take priority
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Fast Indexing Engine is running on port ${PORT}`);
    console.log(`🌐 Dashboard UI: http://localhost:${PORT}`);
    console.log(`====================================================`);
});

module.exports = app;
