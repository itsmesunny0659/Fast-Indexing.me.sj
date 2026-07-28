const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
const indexingRoutes = require('./routes/indexingRoutes');

const app = express();
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

// API Endpoint: Authenticate user login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === TARGET_USER.email && password === TARGET_USER.password) {
        // Set secure signed cookies
        res.cookie('auth_user', email, { signed: true, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.cookie('last_active', Date.now().toString(), { signed: true, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        return res.json({ success: true, message: 'Authentication successful' });
    }
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
});

// API Endpoint: Log out user session
app.get('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_user');
    res.clearCookie('last_active');
    res.redirect('/login.html');
});

// Middleware: Authenticate routes
function checkAuth(req, res, next) {
    const url = req.path;
    
    // 1. Exclude public Googlebot gateways, GSC files and feed paths
    const isPublicGateway = url.startsWith('/i/') || 
                            url.startsWith('/hub/') || 
                            url.includes('google51515c17184409ba.html') || 
                            url.endsWith('.txt') ||
                            url.endsWith('.xml');
    
    if (isPublicGateway) {
        return next();
    }

    // 2. Exclude static login files and auth APIs
    if (url === '/login.html' || 
        url === '/api/auth/login' || 
        url.startsWith('/style.css') || 
        url.startsWith('/app.js') || 
        url.includes('manifest.json')) {
        return next();
    }

    const authUser = req.signedCookies.auth_user;
    const lastActiveStr = req.signedCookies.last_active;

    // 3. Reject if cookie missing
    if (!authUser || !lastActiveStr) {
        res.clearCookie('auth_user');
        res.clearCookie('last_active');
        if (req.xhr || url.startsWith('/fui-api/')) {
            return res.status(401).json({ error: 'Unauthorized. Please login first.' });
        }
        return res.redirect('/login.html');
    }

    // 4. Inactivity Check (5 minutes limit = 300,000 milliseconds)
    const lastActive = parseInt(lastActiveStr) || 0;
    const now = Date.now();
    if (now - lastActive > 5 * 60 * 1000) {
        res.clearCookie('auth_user');
        res.clearCookie('last_active');
        if (req.xhr || url.startsWith('/fui-api/')) {
            return res.status(401).json({ error: 'Session expired due to 5 minutes of inactivity.' });
        }
        return res.redirect('/login.html');
    }

    // Update active timestamp cookie to sliding window
    res.cookie('last_active', now.toString(), { signed: true, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    next();
}

app.use(checkAuth);

// Serve static login page
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

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

// High-DA HTML Indexing Wrapper Gateway, RSS/Sitemap & PBN Routes (checked for auth dynamically)
app.use('/', indexingRoutes);

// Fallback route for SPA
app.get('*', (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Fast Indexing Engine is running on port ${PORT}`);
    console.log(`🌐 Dashboard UI: http://localhost:${PORT}`);
    console.log(`====================================================`);
});

module.exports = app;
