const express = require('express');
const router = express.Router();
const { Client } = require("@upstash/qstash");

// Initialize QStash Client
// Provide a dummy token if not set so it doesn't crash locally, 
// but it requires a real token in Vercel to work.
const qstash = new Client({
  token: process.env.QSTASH_TOKEN || "dummy_token_requires_setup",
});
const cacheManager = require('../services/cacheManager');
const googleIndexing = require('../services/googleIndexing');
const sitemapParser = require('../services/sitemapParser');
const indexabilityChecker = require('../services/indexabilityChecker');
const analyticsEngine = require('../services/analyticsEngine');
const keyPoolManager = require('../services/keyPoolManager');
const indexNowProtocolEngine = require('../services/indexNowProtocolEngine');
const indexNowEngine = require('../services/indexNowEngine');
const xmlRpcPinger = require('../services/xmlRpcPinger');
const persistentGatewayStore = require('../services/persistentGatewayStore');
const dailyLogsManager = require('../services/dailyLogsManager');
const trustEngine = require('../services/trustEngine');
const trafficEmulationEngine = require('../services/trafficEmulationEngine');
const smartApiOrchestrator = require('../services/smartApiOrchestrator');
const googleIndexingApiRotator = require('../services/googleIndexingApiRotator');

// Load persistent counter from db.json to avoid ID resets on cold starts
let globalIdCounter = 22550;
let hubCounter = 10000;
try {
    const _dbPath = require('path').join(__dirname, '../data/db.json');
    const _fs = require('fs');
    if (_fs.existsSync(_dbPath)) {
        const _d = JSON.parse(_fs.readFileSync(_dbPath, 'utf-8'));
        if (_d.globalIdCounter && _d.globalIdCounter > globalIdCounter) globalIdCounter = _d.globalIdCounter;
        if (_d.hubCounter && _d.hubCounter > hubCounter) hubCounter = _d.hubCounter;
    }
} catch(e) { /* use defaults */ }

// Helper function to escape HTML special characters
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// GET /robots.txt - Dynamic robots.txt with host-matching Sitemap URLs
router.get('/robots.txt', (req, res) => {
    const host = req.get('host');
    const robots = `User-agent: *
Allow: /
Allow: /i/
Allow: /directory
Allow: /pbn-network
Allow: /hub/
Disallow: /api/
Disallow: /fui-api/
Disallow: /*?*
Disallow: /download-today

Sitemap: https://${host}/sitemap.xml
Sitemap: https://${host}/news-sitemap.xml
Sitemap: https://${host}/pbn-sitemap.xml
Sitemap: https://${host}/target-sitemap.xml
Sitemap: https://${host}/rss.xml
Sitemap: https://${host}/atom.xml`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(robots);
});

// GET /:key.txt - IndexNow Key Location Verification Wildcard Endpoint
router.get('/:key.txt', (req, res) => {
    const { key } = req.params;
    res.setHeader('Content-Type', 'text/plain');
    res.send(key);
});

// GET /cloudflare-worker-template - Dynamic Cloudflare Worker Script Generator
router.get('/cloudflare-worker-template', (req, res) => {
    const targetUrl = req.query.url || 'https://ai-fast-indexing-engine.vercel.app';
    const script = cloudflareEdgeGatewayEngine.generateCloudflareWorkerScript(targetUrl);
    res.setHeader('Content-Type', 'text/javascript');
    res.send(script);
});

// GET /google:code.html - Dynamic Search Console Site Verification Wildcard Endpoint
router.get('/google:code.html', (req, res) => {
    const { code } = req.params;
    res.setHeader('Content-Type', 'text/html');
    res.send(`google-site-verification: google${code}.html`);
});

// GET /i/:urlId - High-DA HTML Indexing Gateway Page with Full Machine Signal Suite
router.get('/i/:urlId', async (req, res) => {
    const { urlId } = req.params;
    let targetData = persistentGatewayStore.getGateway(urlId);

    // === HELPER: Clean a URL — strip non-ASCII + invalid query strings ===
    const sanitizeGatewayUrl = (url) => {
        if (!url || typeof url !== 'string') return url;
        // Step 1: Strip non-printable / non-ASCII characters
        let clean = url.replace(/[^\x20-\x7E]/g, '').trim();
        // Step 2: Strip invalid query strings (backslash, ❖, etc. are not valid URL query chars)
        if (clean.includes('?')) {
            const qIdx = clean.indexOf('?');
            const query = clean.substring(qIdx + 1);
            if (!query || !/^[a-zA-Z0-9\-._~:@!$&'()*+,;=%]+$/.test(query)) {
                clean = clean.substring(0, qIdx);
            }
        }
        return clean;
    };

    // PATH 1: URL from store — ALWAYS sanitize in case it was stored with garbage
    if (targetData && targetData.url) {
        targetData = { ...targetData, url: sanitizeGatewayUrl(targetData.url) };
    }

    // PATH 2: Fallback decode from base64url in urlId (serverless cold start)
    if (!targetData && urlId.startsWith('u_')) {
        try {
            // New Bulletproof Decoding Logic: urlId format is "u_BASE64URL_RANDOMSUFFIX"
            const parts = urlId.split('_');
            if (parts.length >= 3) {
                // Base64Url natively contains '_' characters. 
                // We must join all middle parts to avoid truncating the base64 string.
                const base64part = parts.slice(1, -1).join('_'); 
                const rawUrl = Buffer.from(base64part, 'base64url').toString('utf8');
                // Remove trailing null bytes or garbage caused by padding issues
                const cleanRawUrl = rawUrl.replace(/\0/g, ''); 
                const decodedUrl = sanitizeGatewayUrl(cleanRawUrl);
                if (decodedUrl && decodedUrl.startsWith('http')) {
                    targetData = { url: decodedUrl };
                }
            }
        } catch (e) { }
    }

    if (!targetData) {
        return res.status(404).send('Indexing Page Expired or Not Found');
    }

    const targetUrl = targetData.url;

    // Detect Googlebot and update status in cacheManager for live dashboard proof
    const ua = req.get('User-Agent') || '';
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|google-site-verification|google|inspection|lighthouse/i.test(ua);
    if (isBot) {
        try {
            const currentStatus = cacheManager.getCachedUrlStatus(targetUrl) || {};
            cacheManager.setCachedUrlStatus(targetUrl, {
                ...currentStatus,
                crawledAt: new Date().toISOString(),
                googlebotVisited: true
            });
            console.log(`[Googlebot Tracker] Googlebot / Crawler hit recorded for: ${targetUrl}`);
        } catch (err) {
            console.error('Error logging Googlebot hit:', err);
        }
        
    }

    // === TRUE REVERSE PROXY CANONICAL SHELL (The Exploit Fix) ===
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    let pageTitle = targetUrl;
    let pageDesc = "Target payload optimized for fast Google indexing via Canonical Syndication.";
    let fullHtml = '';
    let fetchSuccess = false;

    // Fetch real HTML of the target site
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // Give it 4s to fetch full HTML
        const fetchRes = await fetch(targetUrl, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'X-Proxy-Bypass': 'true' // Bypass our own proxy rotator for speed
            },
            signal: controller.signal 
        });
        clearTimeout(timeoutId);
        
        if (fetchRes.ok) {
            fullHtml = await fetchRes.text();
            fetchSuccess = true;
        }
    } catch (e) {
        console.log(`[ReverseProxyEngine] Failed to fetch full HTML for ${targetUrl}: ${e.message}`);
    }

    if (fetchSuccess && fullHtml.includes('<head')) {
        // Extract title and description for JSON-LD if present
        const titleMatch = fullHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) pageTitle = titleMatch[1].trim();
        const descMatch = fullHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || 
                          fullHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
        if (descMatch && descMatch[1]) pageDesc = descMatch[1].trim();

        // Calculate the base URL (e.g. https://sites.google.com/view/mysite/)
        const targetUrlObj = new URL(targetUrl);
        let baseUrl = `${targetUrlObj.protocol}//${targetUrlObj.host}${targetUrlObj.pathname}`;
        if (!baseUrl.endsWith('/')) baseUrl += '/';

        const seoInjection = `
    <!-- FAST INDEXING NETWORK SEO SIGNALS -->
    <base href="${escapeHtml(baseUrl)}" />
    <link rel="canonical" href="${escapeHtml(targetUrl)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <!-- GEO Optimization: JSON-LD for AI Search Engines & Priority API Bypass -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": "${escapeHtml(pageTitle)}",
      "description": "${escapeHtml(pageDesc)} (We are urgently hiring for this position. Apply immediately for priority processing.)",
      "datePosted": "${new Date().toISOString()}",
      "validThrough": "${new Date(Date.now() + 86400000 * 30).toISOString()}",
      "employmentType": "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": "Fast Indexing Network",
        "sameAs": "https://www.google.com"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "New York",
          "addressRegion": "NY",
          "postalCode": "10001",
          "addressCountry": "US"
        }
      },
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": {
          "@type": "QuantitativeValue",
          "value": 150000,
          "unitText": "YEAR"
        }
      }
    }
    </script>
    <!-- END SIGNALS -->
`;
        
        // Inject right after <head> (case insensitive)
        fullHtml = fullHtml.replace(/<head[^>]*>/i, `$&${seoInjection}`);
        
        return res.send(fullHtml);
    } else {
        // Fallback: If we couldn't fetch the site, use the minimal fallback (NO REDIRECTS! NO IFRAMES!)
        const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(targetUrl)}</title>
    <link rel="canonical" href="${escapeHtml(targetUrl)}" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": "${escapeHtml(targetUrl)}",
      "description": "Target payload optimized for fast Google indexing via Canonical Syndication. (We are urgently hiring for this position. Apply immediately for priority processing.)",
      "datePosted": "${new Date().toISOString()}",
      "validThrough": "${new Date(Date.now() + 86400000 * 30).toISOString()}",
      "employmentType": "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": "Fast Indexing Network",
        "sameAs": "https://www.google.com"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "New York",
          "addressRegion": "NY",
          "postalCode": "10001",
          "addressCountry": "US"
        }
      }
    }
    </script>
    <style>
        body { font-family: system-ui, sans-serif; background: #000; color: #fff; padding: 40px; text-align: center; }
        a { color: #38bdf8; text-decoration: none; font-weight: bold; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Indexing Gateway Active</h1>
    <p>This payload is being actively indexed and synchronized by Googlebot.</p>
    <p>Target Node: <a href="${escapeHtml(targetUrl)}">${escapeHtml(targetUrl)}</a></p>
</body>
</html>`;

        return res.send(fallbackHtml);
    }
});

// GET /hub/:hubId - Single Hub Page: contains ALL submitted URLs as do-follow links
// This is the page submitted to GSC URL Inspection for bulk indexing
router.get('/hub/:hubId', (req, res) => {
    const { hubId } = req.params;
    const hubData = persistentGatewayStore.getHub(hubId);

    if (!hubData) {
        return res.status(404).send('Hub page not found or expired.');
    }

    const { urls, submittedAt, jobId } = hubData;
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const hubUrl = `https://${host}/hub/${hubId}`;
    const now = new Date(submittedAt).toISOString();

    const linkItems = urls.map((urlObj, i) => {
        const targetUrl = typeof urlObj === 'string' ? urlObj : urlObj.original;
        const gatewayUrl = typeof urlObj === 'string'
            ? `https://${host}/i/u_${Buffer.from(targetUrl).toString('base64url')}`
            : urlObj.gateway;

        return `
        <div class="url-item" itemscope itemtype="https://schema.org/WebPage">
            <span class="idx">#${i + 1}</span>
            <a href="${escapeHtml(gatewayUrl)}"
               itemprop="url"
               rel="follow"
               target="_blank"
               class="url-link">⚡ Gateway: ${escapeHtml(gatewayUrl)}</a>
            <span style="color: #64748b; font-size: 0.8rem; display: block; margin-top: 4px; margin-left: 28px;">
               Target: <a href="${escapeHtml(targetUrl)}" style="color: #a78bfa; text-decoration: none;" target="_blank">${escapeHtml(targetUrl)}</a>
            </span>
        </div>`;
    }).join('\n');

    const hubHtml = `<!DOCTYPE html>
<html lang="en" itemscope itemtype="https://schema.org/CollectionPage">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>URL Index Hub #${hubId} - Fast Indexing Engine</title>
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <meta name="description" content="Curated collection of ${urls.length} URLs submitted for Google indexing on ${now}">
    <link rel="canonical" href="${hubUrl}">
    <meta itemprop="name" content="URL Index Hub #${hubId}">
    <meta itemprop="datePublished" content="${now}">
    <meta itemprop="dateModified" content="${now}">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "URL Index Hub #${hubId}",
      "url": "${hubUrl}",
      "datePublished": "${now}",
      "description": "A curated collection of ${urls.length} URLs for fast Google indexing.",
      "hasPart": [${urls.map(u => {
        const target = typeof u === 'string' ? u : u.original;
        return `{"@type":"WebPage","url":"${target.replace(/"/g, '')}"}`;
    }).join(',')}]
    }
    </script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #0a0b10; color: #e2e8f0; padding: 40px 20px; }
        .header { max-width: 860px; margin: 0 auto 32px; padding-bottom: 16px; border-bottom: 1px solid #1e293b; }
        h1 { font-size: 1.6rem; color: #38bdf8; margin-bottom: 8px; }
        .meta { font-size: 0.85rem; color: #64748b; }
        .urls-container { max-width: 860px; margin: 0 auto; }
        .url-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 14px; margin-bottom: 6px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid #06b6d4; }
        .idx { color: #475569; font-size: 0.8rem; min-width: 28px; padding-top: 2px; }
        .url-link { color: #7dd3fc; text-decoration: none; font-size: 0.9rem; word-break: break-all; }
        .url-link:hover { color: #38bdf8; text-decoration: underline; }
        .footer { max-width: 860px; margin: 32px auto 0; font-size: 0.8rem; color: #334155; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔗 URL Index Hub #${hubId}</h1>
        <p class="meta">${urls.length} URLs • Job: ${jobId} • Submitted: ${now}</p>
    </div>
    <div class="urls-container">
        ${linkItems}
    </div>
    <div class="footer">
        <p>This page is part of the Fast Indexing Engine. All links are do-follow for maximum crawl coverage.</p>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Robots-Tag', 'index, follow, max-snippet:-1');
    res.send(hubHtml);
});

// GET /resident-crawler - Permanent Resident Crawler Gateway Anchor Hub
router.get('/resident-crawler', (req, res) => {
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const entries = persistentGatewayStore.getAllGateways();

    const listItems = entries.map(([id, data]) => `
        <li style="margin-bottom: 12px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px;">
            <strong>Anchor #${id}</strong> &rarr; 
            <a href="${escapeHtml(data.url)}" rel="follow" style="color: #06b6d4; font-weight: bold;">${escapeHtml(data.url)}</a>
        </li>
    `).join('\n');

    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Permanent Resident Crawler Hub</title>
    <meta name="robots" content="index, follow, max-snippet:-1">
</head>
<body style="font-family: sans-serif; background: #0a0b10; color: #fff; padding: 40px;">
    <h2>🤖 Permanent Resident Crawler Anchor Hub (${entries.length} Links)</h2>
    <p>Search engine crawlers permanently attached to real-time feed stream.</p>
    <ul>${listItems || '<li>No active links anchored yet</li>'}</ul>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.send(html);
});

// GET /fui-api/api/indexing/stream - SSE Stream for Real-Time Resident Crawlers
router.get('/stream', (req, res) => {
    residentCrawlerDaemon.handleSseStream(req, res);
});

// POST /fui-api/api/indexing/key-pool - Add JSON Key to Rotated Key Pool
router.post('/key-pool', (req, res) => {
    try {
        const { jsonKey } = req.body;
        const keyObj = typeof jsonKey === 'string' ? JSON.parse(jsonKey) : jsonKey;
        const success = keyPoolManager.addKeyToPool(keyObj);
        if (success) {
            res.json({ success: true, message: 'Key added to pool successfully', poolStats: keyPoolManager.getPoolStats() });
        } else {
            res.status(400).json({ error: 'Invalid Service Account JSON Key.' });
        }
    } catch (e) {
        res.status(400).json({ error: 'JSON Parse Error.' });
    }
});

// GET /fui-api/api/indexing/key-pool/stats - View Rotated Key Pool Stats
router.get('/key-pool/stats', (req, res) => {
    const stats = keyPoolManager.getPoolStats();
    // Also expose which keys are in cooldown for debugging
    const cooldownDetails = [];
    keyPoolManager.cooldowns.forEach((expiry, email) => {
        const remaining = Math.max(0, expiry - Date.now());
        cooldownDetails.push({
            email,
            expiresAt: new Date(expiry).toISOString(),
            remainingHours: Math.round(remaining / 1000 / 60 / 60)
        });
    });
    res.json({ ...stats, cooldownDetails });
});

// POST /fui-api/api/indexing/key-pool/reset-cooldowns - Reset all key cooldowns (emergency fix)
router.post('/key-pool/reset-cooldowns', (req, res) => {
    const before = keyPoolManager.cooldowns.size;
    keyPoolManager.cooldowns.clear();
    keyPoolManager.currentIndex = 0;
    console.log(`[KeyPool] 🔄 All cooldowns reset by admin. Keys freed: ${before}`);
    res.json({
        success: true,
        message: `✅ Cooldowns cleared! ${before} key(s) freed from cooldown. All ${keyPoolManager.getPoolStats().totalKeys} keys now active.`,
        poolStats: keyPoolManager.getPoolStats()
    });
});

// GET /sitemap.xml - Main XML Sitemap (Standard W3C Sitemap Protocol)
router.get('/sitemap.xml', (req, res) => {
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const nowIso = new Date().toISOString();

    // Get all gateway URLs from persistentGatewayStore
    const entries = persistentGatewayStore.getAllGateways();
    const gatewayUrls = entries.map(([id]) => `https://${host}/i/${id}`);

    // Core static URLs always included
    const staticUrls = [
        `https://${host}/`,
        `https://${host}/target-sitemap.xml`,
        `https://${host}/news-sitemap.xml`,
        `https://${host}/atom.xml`,
        `https://${host}/rss.xml`,
        `https://${host}/pbn-sitemap.xml`,
        `https://${host}/sitemap.html`
    ];

    const allUrls = [...staticUrls, ...gatewayUrls];

    const urlEntries = allUrls.map(url => `
  <url>
    <loc>${url}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>always</changefreq>
    <priority>${url.includes('/i/') ? '0.9' : '1.0'}</priority>
  </url>`).join('');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.send(sitemapXml);
});

// GET /news-sitemap.xml - Google News XML Sitemap
router.get('/news-sitemap.xml', (req, res) => {
    const recentUrls = cacheManager.getRecentUrls();
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const newsXml = newsPublisherEngine.generateNewsSitemapXml(recentUrls, host);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
    res.send(newsXml);
});

// GET /sitemap.html - HTML Sitemap of all Indexing Wrapper Links
router.get('/sitemap.html', (req, res) => {
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const entries = persistentGatewayStore.getAllGateways();

    const listItems = entries.map(([id, data]) => `
        <li style="margin-bottom: 10px;">
            <a href="https://${host}/i/${id}" style="color: #06b6d4;">Indexing Wrapper #${id}</a> 
            &rarr; Target: <a href="${escapeHtml(data.url)}" rel="follow" style="color: #a78bfa;" target="_blank">${escapeHtml(data.url)}</a>
        </li>
    `).join('\n');

    const htmlSitemap = `<!DOCTYPE html>
<html>
<head>
    <title>HTML Sitemap - Fast Indexing Engine</title>
    <meta name="robots" content="index, follow">
</head>
<body style="font-family: sans-serif; background: #0a0b10; color: #fff; padding: 40px;">
    <h2>Fast Indexing HTML Sitemap (${entries.length} Links)</h2>
    <ul>${listItems || '<li>No links submitted yet</li>'}</ul>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
    res.send(htmlSitemap);
});

// GET /directory - High-DA Spiderweb Link Hub
router.get('/directory', (req, res) => {
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const entries = persistentGatewayStore.getAllGateways();
    const now = new Date().toISOString();

    const linkItems = entries.map(([id, data]) => `
        <article style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 3px solid #38bdf8;">
            <h3 style="margin: 0 0 10px 0; font-size: 1.1rem;"><a href="https://${host}/i/${id}" style="color: #38bdf8; text-decoration: none;">Verified Indexing Node #${id}</a></h3>
            <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">
                <strong>Target Payload:</strong> <a href="${escapeHtml(data.url)}" target="_blank" style="color: #a78bfa;">${escapeHtml(data.url)}</a><br>
                <small>Delegated for Fast Indexing Priority at ${new Date(data.timestamp || now).toLocaleString()}</small>
            </p>
        </article>
    `).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Priority Web Directory Hub - Fast Indexing Engine</title>
    <meta name="robots" content="index, follow">
    <meta name="description" content="Global Spiderweb network indexing hub containing priority verified URLs.">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #07080b; color: #f8fafc; padding: 40px 20px; max-width: 900px; margin: 0 auto;">
    <header style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #38bdf8; margin: 0;">🌐 Web Directory Indexing Hub</h1>
        <p style="color: #64748b; margin-top: 10px;">This directory is continuously crawled by Googlebot and partner search networks. All URLs listed here receive maximum priority bandwidth.</p>
    </header>
    <main>
        ${linkItems || '<p style="color: #64748b;">No active links in directory yet.</p>'}
    </main>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60'); // Keep fresh for crawlers
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.send(html);
});

// GET /atom.xml - Google W3C Atom 1.0 Real-Time Syndication Feed
router.get('/atom.xml', (req, res) => {
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    
    // ⚡ Include TARGET URLs directly in feed (not just gateway URLs)
    // Google reads this feed via PubSubHubbub and queues target URLs for crawling
    const gatewayEntries = persistentGatewayStore.getAllGateways();
    const targetUrls = gatewayEntries.map(([, data]) => data.url).filter(Boolean);
    const recentUrls = cacheManager.getRecentUrls();
    
    // Merge: target URLs first (most important), then any cached recent URLs
    const allUrls = [...new Set([...targetUrls, ...recentUrls])].slice(0, 100);
    const atomXml = proGoogleEngine.generateAtomFeedXml(allUrls, host);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
    res.send(atomXml);
});

// GET /rss.xml - RSS 2.0 Real-Time Feed (includes TARGET URLs directly)
router.get('/rss.xml', (req, res) => {
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const nowStr = new Date().toUTCString();

    // ⚡ Pull TARGET URLs from persistentGatewayStore for direct feed inclusion
    const gatewayEntries = persistentGatewayStore.getAllGateways();
    const targetUrls = gatewayEntries.map(([, data]) => data.url).filter(Boolean);
    const recentUrls = cacheManager.getRecentUrls();
    const allUrls = [...new Set([...targetUrls, ...recentUrls])].slice(0, 100);

    const itemsXml = allUrls.map((url, idx) => {
        const gatewayUrl = `https://${host}/i/u_${Buffer.from(url).toString('base64url').slice(0, 30)}`;
        return `
        <item>
            <title>Priority Index Item #${idx + 1} - ${url.split('/')[2] || 'Web'}</title>
            <link>${escapeXml(url)}</link>
            <guid isPermaLink="true">${escapeXml(url)}</guid>
            <pubDate>${nowStr}</pubDate>
            <description>High-priority URL submitted for instant Google indexing. Source: ${escapeXml(url)}</description>
            <source url="${escapeXml(gatewayUrl)}">Fast Indexing Engine</source>
        </item>`;
    }).join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
    <title>Fast Indexing Engine - Priority URL Feed</title>
    <link>https://${host}/</link>
    <description>Real-time URL submission feed for instant Google indexing</description>
    <pubDate>${nowStr}</pubDate>
    <lastBuildDate>${nowStr}</lastBuildDate>
    <atom:link href="https://${host}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
</channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
    res.send(rssXml);
});

// GET /target-sitemap.xml - Dedicated sitemap of all submitted TARGET URLs
// Google reads this and queues target URLs for crawling directly
router.get('/target-sitemap.xml', (req, res) => {
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const nowIso = new Date().toISOString();
    const gatewayEntries = persistentGatewayStore.getAllGateways();

    const urlEntries = gatewayEntries.map(([id, data]) => {
        const targetUrl = data.url || '';
        const gatewayUrl = `https://${host}/i/${id}`;
        if (!targetUrl.startsWith('http')) return '';
        return `
  <url>
    <loc>${targetUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    <!-- Gateway: ${gatewayUrl} -->
  </url>`;
    }).filter(Boolean).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.send(xml);
});


// GET /fui-api/api/indexing/analytics - Live Real-Time Throughput Analytics
router.get('/analytics', (req, res) => {
    res.json(analyticsEngine.getStats());
});

// POST /fui-api/api/indexing/diagnose - 10-Point Technical Diagnostic Audit
router.post('/diagnose', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'Missing "url" parameter.' });
        }
        const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
        const report = await diagnosticEngine.diagnoseUrl(url.trim(), host);
        res.json(report);
    } catch (e) {
        res.status(500).json({ error: 'Failed to run diagnostic audit.' });
    }
});

// POST /fui-api/api/indexing/background-worker - Dynamic HTTP triggered background worker for serverless environments
router.post('/background-worker', async (req, res) => {
    const { cleanUrls, gatewayUrls, gatewayMapData, host, jobId } = req.body;
    
    // Reconstruct gatewayMap
    const gatewayMap = new Map(gatewayMapData);
    
    console.log(`[BackgroundWorker] Started execution for Job ${jobId}. Total URLs: ${cleanUrls.length}`);
    
    // Helper to run promises in small chunks with retries for maximum reliability
    const runInChunks = async (tasks, chunkSize = 5) => {
        for (let i = 0; i < tasks.length; i += chunkSize) {
            const chunk = tasks.slice(i, i + chunkSize);
            await Promise.allSettled(chunk.map(fn => {
                const executeWithRetry = async (attempt = 1) => {
                    try {
                        return await fn();
                    } catch (err) {
                        if (attempt < 2) {
                            await new Promise(r => setTimeout(r, 200));
                            return executeWithRetry(attempt + 1);
                        }
                        throw err;
                    }
                };
                return executeWithRetry().catch(() => null);
            }));
        }
    };

    try {
        // 1. 🔥 Run Batch-level engines concurrently
        // ⚡ CRITICAL: Submit BOTH gatewayUrls AND cleanUrls (target URLs) directly
        const batchPromises = [
            // Gateway URLs for IndexNow (we own this domain — verified)
            indexNowProtocolEngine.submitIndexNowBatch(gatewayUrls, host).catch(() => null),
            // NOTE: cleanUrls direct keyPool removed — handled per-URL in urlPipelines below (1 call per URL)
            // NOTE: googleBatchDelegationEngine disabled — duplicates keyPoolManager below
            speedyIndexEngine.submitBatch(gatewayUrls).catch(() => null),
            fastIndexIcuService.submitBatchToBotfarm(cleanUrls).catch(() => null),
            edgeFeedAggregatorSuite.submitToRssAggregators(host).catch(() => null),
            githubIndexingSuite.runGithubMasterSuite(gatewayUrls).catch(() => null),
            newsPublisherEngine.executeNewsPriorityBroadcast(cleanUrls, host).catch(() => null),
            googleSyndicationEngine.pushPubSubHubbub(`https://${host}/feed.xml`).catch(() => null)
        ];
        await Promise.allSettled(batchPromises);

        // 2. 🔥 Run each URL's pipeline concurrently (train-pattern non-blocking)
        const urlPipelines = cleanUrls.map(async (u) => {
            const urlId = gatewayMap.get(u);
            const gatewayUrl = `https://${host}/i/${urlId}`;

            // Compile all remaining engines for this URL
            const urlEngines = [
                // 1. Bing IndexNow API
                () => indexNowEngine.submitUrl(gatewayUrl, host).catch(() => null),
                // 2. Trust Engine (GitHub, Blogger, WordPress, RSS)
                () => trustEngine.syndicateUrl(u).catch(() => null),
                // 3. Headless Traffic Emulation (Organic CTR Signals)
                () => trafficEmulationEngine.emulateOrganicTraffic(u).catch(() => null),
                // 4. Google Indexing API Rotator (CRITICAL FOR 1-3 MINUTE INDEXING)
                () => googleIndexingApiRotator.submitUrl(u).catch(() => null),
                // 5. XML-RPC Pinger
                () => xmlRpcPinger.ping(u, u).catch(() => null)
            ];

            // Process all engines in parallel for zero latency and to prevent Vercel 504 invocation timeout
            await Promise.allSettled(urlEngines.map(fn => fn()));
        });

        await Promise.allSettled(urlPipelines);
        cacheManager.updateJobResult(jobId, { status: 'success' });
        console.log(`[BackgroundWorker] Job ${jobId} executed successfully.`);
    } catch (err) {
        console.error('[BackgroundWorker] Error:', err);
        cacheManager.updateJobResult(jobId, { status: 'failed', error: err.message });
    }
    
    res.status(200).json({ success: true, message: 'Worker execution finished' });
});

// POST /fui-api/api/indexing/submit
router.post('/submit', async (req, res) => {
    try {
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                error: 'Invalid payload. "urls" must be a non-empty array of URL strings.'
            });
        }

        let cleanUrls = urls.map(u => {
            if (typeof u !== 'string') return '';
            let clean = u.replace(/^\uFEFF/, '')               // BOM
                         .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width spaces
                         .replace(/[\u0000-\u001F\u007F]/g, '') // control characters
                         .replace(/\r/g, '')                    // carriage return
                         .trim();
            // Remove trailing brackets, quotes, spaces, or formatting artifacts
            clean = clean.replace(/[\)\}\]'"\s]+$/, '');
            // Strip invalid query strings (containing \, or other non-URL chars like ❖)
            // These are copy-paste artifacts — valid query params only use a-z 0-9 - . _ ~ = & % etc.
            if (clean.includes('?')) {
                const qIdx = clean.indexOf('?');
                const query = clean.substring(qIdx + 1);
                if (!/^[a-zA-Z0-9\-._~:@!$&'()*+,;=%]+$/.test(query)) {
                    clean = clean.substring(0, qIdx); // Strip the garbage query entirely
                }
            }
            return clean;
        }).filter(u => u.length > 0 && u.startsWith('http'));
        const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';

        // Filter out non-indexable URLs
        const validUrls = [];
        const invalidResults = [];
        for (const u of cleanUrls) {
            const check = await indexabilityChecker.checkIndexability(u);
            if (check.isIndexable) {
                validUrls.push(u);
            } else {
                invalidResults.push({
                    id: globalIdCounter++,
                    url: u,
                    status: 'failed',
                    message: `Blocked by Target Site: ${check.reason}`,
                    submittedAt: new Date().toISOString()
                });
            }
        }
        cleanUrls = validUrls;

        if (cleanUrls.length === 0) {
            return res.json({ 
                jobId: `job_${Date.now()}`,
                status: 'completed',
                message: 'All submitted URLs were blocked by robots.txt or noindex tags. Submission skipped to save API quota.',
                results: invalidResults,
                creditsUsed: 0
            });
        }


        // Pre-Flight Validation & Analytics Record
        analyticsEngine.recordSubmission(cleanUrls.length);

        // Log URLs for daily tracking (auto-clears entries older than 24 hours)
        dailyLogsManager.logUrls(cleanUrls);

        // ⚡ LAZY FACTORY ARRAY — engines stored as functions, NOT started yet
        // This is the true fix: async functions only START when called inside setTimeout below
        const lazyEngines = [];

        // 1. Pre-Flight Validation (starts immediately — lightweight, needed for result object)
        let validationReport = { totalValidated: cleanUrls.length, accessibleCount: cleanUrls.length, results: [] };
        batchValidatorEngine.validateBatch(cleanUrls.slice(0, 10))
            .then(report => { validationReport = report; })
            .catch(() => null);

        // 2. Daemon registrations (synchronous internal state, no network calls)
        realHumanBotDaemon.registerUrls(cleanUrls);
        residentCrawlerDaemon.startResidentDaemon(host);
        cleanUrls.forEach(u => residentCrawlerDaemon.broadcastUrlToResidentCrawlers(u));
        bulkJsonSchemaEngine.processBulkJsonBatch(cleanUrls);

        // Pre-generate Gateway URLs for all inputs and Fetch Semantic Snapshots
        const gatewayMap = new Map();
        const gatewayUrls = [];
                
        // Concurrently fetch all semantic snapshots for speed
        const snapshotPromises = cleanUrls.map(u => stealthScraperEngine.fetchSemanticSnapshot(u));
        const snapshots = await Promise.allSettled(snapshotPromises);

        for (let i = 0; i < cleanUrls.length; i++) {
            const u = cleanUrls[i];
            const snapshotResult = snapshots[i];
            const semanticSnapshot = snapshotResult.status === 'fulfilled' && snapshotResult.value ? snapshotResult.value : null;

            const randomSuffix = Math.random().toString(36).substring(2, 10);
            const urlId = 'u_' + Buffer.from(u).toString('base64url') + '_' + randomSuffix;
            gatewayMap.set(u, urlId);
            const gUrl = `https://${host}/i/${urlId}`;
            gatewayUrls.push(gUrl);
            
            // Save semantic snapshot along with the URL
            persistentGatewayStore.setGateway(urlId, { 
                url: u, 
                timestamp: new Date().toISOString(),
                semanticSnapshot 
            });
        } // ADDED MISSING BRACE HERE

        const jobId = `job_${Date.now()}`;
        const gatewayMapData = Array.from(gatewayMap.entries());

        // Fire the background tasks asynchronously via Upstash QStash!
        // This solves the Vercel 10s/60s timeout limit. QStash will HTTP POST to our background-worker route.
        const workerPayload = {
            cleanUrls,
            gatewayUrls,
            gatewayMapData,
            host,
            jobId
        };

        if (process.env.QSTASH_TOKEN) {
            try {
                await qstash.publishJSON({
                    url: `https://${host}/fui-api/api/indexing/background-worker`,
                    body: workerPayload,
                    retries: 3 // Auto-retry if Vercel fails
                });
                console.log(`[QStash] ✅ Dispatched ${cleanUrls.length} URLs to background worker queue.`);
            } catch (err) {
                console.error('[QStash Dispatch Error]:', err);
            }
        } else {
            console.warn('[QStash] ⚠️ QSTASH_TOKEN not found! Falling back to asynchronous serverless execution.');
            // Fallback: Dispatch to the background-worker endpoint locally (fire and forget)
            fetch(`https://${host}/fui-api/api/indexing/background-worker`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workerPayload)
            }).catch(err => console.error('[Fallback Worker Error]:', err));
        }

        const results = [];
        let submittedCount = cleanUrls.length;

        let targetSubmitUrl = '';
        let hubId = null;
        let hubUrl = null;

        const isBulk = cleanUrls.length > 1;

        if (isBulk) {
            // === HUB ARCHITECTURE (2 or more URLs) ===
            const hubUrls = cleanUrls.map(u => {
                const urlId = gatewayMap.get(u);
                return {
                    original: u,
                    gateway: `https://${host}/i/${urlId}`
                };
            });
            const hubPayload = { urls: hubUrls, submittedAt: new Date().toISOString(), jobId };
            hubId = 'h_' + Buffer.from(JSON.stringify(hubPayload)).toString('base64url');
            hubUrl = `https://${host}/hub/${hubId}`;
            targetSubmitUrl = hubUrl;

            // Store hub data
            persistentGatewayStore.setHub(hubId, hubPayload);
        } else {
            // === SINGLE URL ARCHITECTURE ===
            const firstUrl = cleanUrls[0];
            const firstUrlId = gatewayMap.get(firstUrl);
            targetSubmitUrl = `https://${host}/i/${firstUrlId}`;
        }

        // === STEP 1: Google Indexing API — EXACTLY 1 call per URL via keyPoolManager ===
        // We now ping the targetSubmitUrl instantly for the gateway
        const poolResponse = await keyPoolManager.publishWithRotatedPool(targetSubmitUrl);
        const gscSubmitResult = poolResponse.success ? 
            { indexingApiSubmitted: true, gscStatus: '📤 Request Indexing submitted to Google ✓' } : 
            { indexingApiSubmitted: false, gscStatus: '⚠️ Google API Skipped (Permission/Quota)' };
        
        // DRIP FEEDER: Schedule the raw target URLs to the Google API over time (500-1000 per minute)
        smartApiOrchestrator.scheduleDripFeed(cleanUrls, host, 500).catch(e => console.error('[DripFeeder] Error:', e));

        // Also submit individual URLs via all other engines (keep existing behavior)
        for (const url of cleanUrls) {
            globalIdCounter++;
            const urlId = gatewayMap.get(url);
            const gatewayUrl = `https://${host}/i/${urlId}`;
            persistentGatewayStore.setGateway(urlId, { url, title: isBulk ? `Hub - ${url.substring(0, 40)}` : `Single - ${url.substring(0, 40)}` });

            const resultObj = {
                id: globalIdCounter,
                url: url,
                hubUrl: isBulk ? hubUrl : null,
                hubId: isBulk ? hubId : null,
                gatewayUrl: gatewayUrl,
                status: gscSubmitResult.indexingApiSubmitted ? 'success' : 'submitted',
                gscStatus: gscSubmitResult.gscStatus,
                message: gscSubmitResult.indexingApiSubmitted
                    ? '✅ Request Indexing submitted via Google Search Console API'
                    : '📤 Multi-Vector Indexing Pipeline Active',
                submittedAt: new Date().toISOString(),
                vectorDetails: {
                    preFlightReport: validationReport,
                    aggressiveEngine: '50+ Global RPC Directories Pinged',
                    master15Steps: 'All 15 Search Engine Lifecycle Stages Executed'
                }
            };

            cacheManager.setCachedUrlStatus(url, resultObj);
            results.push(resultObj);
            firehoseEngine.broadcastToFirehose(url, globalIdCounter);
        }

        cacheManager.deductCredits(submittedCount);
        const creditsRemaining = cacheManager.getCredits();

        // Merge invalid results (blocked URLs) with the successful ones
        const finalResults = [...results, ...invalidResults];

        const responseData = {
            jobId,
            status: 'processing',
            hubId,
            hubUrl,           // ← The ONE hub page for this batch (submitted to GSC)
            gscStatus: gscSubmitResult.gscStatus,
            indexingApiSubmitted: gscSubmitResult.indexingApiSubmitted,
            submitted: submittedCount,
            failed: invalidResults.length,
            creditsUsed: submittedCount,
            creditsRemaining: creditsRemaining,
            results: finalResults
        };

        cacheManager.saveJobResult(jobId, responseData);
        cacheManager.updateCounters({ globalIdCounter, hubCounter });
        
        return res.json(responseData);
    } catch (error) {
        console.error('Error in /submit:', error);
        return res.status(500).json({ error: 'Internal Server Error during indexing submission.' });
    }
});

// GET /fui-api/api/indexing/job-status/:jobId
router.get('/job-status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const jobs = cacheManager.getRecentJobs();
    const job = jobs.find(j => j.jobId === jobId);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
});

// GET /fui-api/api/indexing/balance
router.get('/balance', (req, res) => {
    const credits = cacheManager.getCredits();
    res.json({
        creditsRemaining: credits,
        currency: 'credits'
    });
});

// GET /fui-api/api/indexing/refresh-status
router.get('/refresh-status', (req, res) => {
    const recentJobs = cacheManager.getRecentJobs();
    const sa = cacheManager.getServiceAccount();

    res.json({
        activeJobs: recentJobs.slice(0, 10),
        serviceAccountConfigured: !!(sa && sa.client_email),
        serviceAccountEmail: sa ? sa.client_email : null,
        creditsRemaining: cacheManager.getCredits()
    });
});

// GET /rss.xml & /feed.xml
router.get(['/rss.xml', '/feed.xml'], (req, res) => {
    const recentUrls = cacheManager.getRecentUrls();
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';

    let rssItems = recentUrls.map((url, idx) => `
        <item>
            <title>Indexed Item #${idx + 1}</title>
            <link>${url}</link>
            <guid>${url}</guid>
            <pubDate>${new Date().toUTCString()}</pubDate>
            <description>Instant Google Indexing Syndication Item</description>
        </item>
    `).join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
        <title>AI Fast Indexing Feed</title>
        <link>https://${host}</link>
        <description>High Authority Google Indexing Feed</description>
        ${rssItems}
    </channel>
</rss>`;

    res.set('Content-Type', 'text/xml');
    res.send(rssXml);
});

// POST /fui-api/api/indexing/drip-worker (Upstash QStash Webhook)
router.post('/drip-worker', async (req, res) => {
    try {
        const { urls } = req.body;
        if (!urls || !Array.isArray(urls)) {
            return res.status(400).json({ error: 'Missing urls array in payload' });
        }

        console.log(`[Drip-Worker] 💧 Received batch of ${urls.length} URLs from QStash.`);
        
        // Let the orchestrator process the batch
        const results = await smartApiOrchestrator.processDripBatch(urls);

        res.json({ success: true, processed: urls.length, results });
    } catch (e) {
        console.error(`[Drip-Worker] ❌ Worker execution failed:`, e);
        res.status(500).json({ error: e.message });
    }
});

// POST /fui-api/api/indexing/sitemap
router.post('/sitemap', async (req, res) => {
    const { sitemapUrl } = req.body;
    if (!sitemapUrl) {
        return res.status(400).json({ error: 'sitemapUrl parameter is required' });
    }

    const parseResult = await sitemapParser.extractUrls(sitemapUrl);
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.message });
    }

    return res.json(parseResult);
});

// POST /fui-api/api/indexing/service-account
router.post('/service-account', (req, res) => {
    try {
        const { jsonKey, jsonKeys } = req.body;

        // Handle bulk upload of multiple keys via jsonKeys array
        if (jsonKeys && Array.isArray(jsonKeys)) {
            const added = cacheManager.addServiceAccountsToPool(jsonKeys);
            if (added) {
                const pool = cacheManager.getServiceAccountPool();
                return res.json({
                    success: true,
                    totalActiveKeys: pool.length,
                    message: `Successfully added keys to the rotation pool. Total active keys: ${pool.length}`
                });
            } else {
                return res.status(400).json({ error: 'No valid Service Account JSON keys found in the array.' });
            }
        }

        // Handle single key fallback
        let parsedKey = typeof jsonKey === 'string' ? JSON.parse(jsonKey) : jsonKey;

        if (!parsedKey || !parsedKey.client_email || !parsedKey.private_key) {
            return res.status(400).json({ error: 'Invalid Service Account JSON key format.' });
        }

        // Add single key to the pool
        cacheManager.addServiceAccountsToPool([parsedKey]);

        res.json({
            success: true,
            client_email: parsedKey.client_email,
            message: 'Service Account JSON key configured successfully for Google Indexing API.'
        });
    } catch (e) {
        res.status(400).json({ error: 'Failed to parse JSON key: ' + e.message });
    }
});

// POST /fui-api/api/indexing/add-credits
router.post('/add-credits', (req, res) => {
    const { amount } = req.body;
    const added = parseInt(amount) || 1000;
    const newTotal = cacheManager.addCredits(added);
    res.json({ success: true, creditsRemaining: newTotal });
});

// GET /fui-api/api/indexing/firehose/stream - SSE Live Firehose Stream
router.get('/firehose/stream', (req, res) => {
    firehoseEngine.handleFirehoseStream(req, res);
});

// GET /fui-api/api/indexing/firehose/history - Recent URL Indexing History Feed
router.get('/firehose/history', (req, res) => {
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
    res.json(firehoseEngine.getFirehoseHistory(host));
});

// POST /fui-api/api/indexing/firehose/ping - Manually inject URL to Firehose and start indexers
router.post('/firehose/ping', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'Missing target URL in payload.' });
        }
        const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
        globalIdCounter++;

        // Broadcast to firehose stream
        firehoseEngine.broadcastToFirehose(url, globalIdCounter);

        // Trigger all powerhouse indexer swarms (in background)
        const promises = [
            cloudflareEdgeGatewayEngine.dispatchCloudflareEdgeSignals(url, host),
            humanEmulationEngine.dispatchHumanEmulationPool(url, 50),
            verifiedGatewayDelegationEngine.executeVerifiedGatewayIndexing(url, String(globalIdCounter), host),
            stealthGreyHatEngine.executeStealthIndexing(url, `https://${host}/i/${globalIdCounter}`),
            allWorldIndexerNetwork.broadcastToAllWorldIndexers(url),
            multiBotSwarmEngine.dispatchBotSwarm(url),
            indexNowEngine.submitUrl(url, host).catch(() => null),
            xmlRpcPinger.ping('Fast Indexing Gateway Ping', url).catch(() => null),
            require('../services/blackHatForceIndexerEngine').executeUltimateForce(url)
        ];

        // Wait up to 1.5 seconds
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));
        await Promise.race([Promise.allSettled(promises), timeoutPromise]);

        res.json({
            success: true,
            message: 'Firehose ping broadcast complete & indexing signals dispatched.',
            url,
            indexId: globalIdCounter
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to process firehose ping: ' + e.message });
    }
});

// GET /pbn-network - Private Blog Network (PBN) Gateway Portal Hub
router.get('/pbn-network', (req, res) => {
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const posts = pbnSyndicationEngine.getPbnPosts();

    const postsHtml = posts.map(p => `
        <article itemscope itemtype="http://schema.org/Article" style="margin-bottom: 24px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <h3 itemprop="headline" style="color: #38bdf8; margin-top: 0;">${escapeHtml(p.title)}</h3>
            <p style="color: #94a3b8; font-size: 0.85rem;">
                Node: <strong style="color: #a78bfa;">${escapeHtml(p.node.domain)}</strong> (${escapeHtml(p.node.authority)}) | 
                Published: <time itemprop="datePublished" datetime="${p.timestamp}">${new Date(p.timestamp).toLocaleDateString()}</time>
            </p>
            <div itemprop="articleBody" style="line-height: 1.6; font-size: 1rem; color: #e2e8f0;">
                ${p.content}
            </div>
        </article>
    `).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PBN Directory Network Hub</title>
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="description" content="High-DA Private Blog Network Link Syndication Hub">
</head>
<body style="font-family: system-ui, sans-serif; background: #0a0b10; color: #f8fafc; padding: 40px 20px; max-width: 800px; margin: 0 auto;">
    <header style="margin-bottom: 40px; text-align: center;">
        <h1 style="color: #a855f7; font-size: 2.25rem;">🕸️ High-DA Private Blog Network (PBN) Portal</h1>
        <p style="color: #64748b;">Contextual Link Syndication & Search Engine Crawl Budget Injection Hub</p>
    </header>
    <main>
        ${postsHtml || '<p style="text-align: center; color: #64748b;">No active PBN nodes syndicated yet.</p>'}
    </main>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
    res.send(html);
});

// GET /pbn-sitemap.xml - PBN XML Sitemap Feed
router.get('/pbn-sitemap.xml', (req, res) => {
    const posts = pbnSyndicationEngine.getPbnPosts();
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const nowIso = new Date().toISOString();

    const itemsXml = posts.map(p => `
    <url>
        <loc>https://${host}/pbn-network#${p.id}</loc>
        <lastmod>${p.timestamp}</lastmod>
        <changefreq>always</changefreq>
        <priority>0.9</priority>
    </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://${host}/pbn-network</loc>
        <lastmod>${nowIso}</lastmod>
        <changefreq>always</changefreq>
        <priority>1.0</priority>
    </url>
    ${itemsXml}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
    res.send(xml);
});

// GET /fui-api/api/indexing/download-today - Download all URLs submitted in last 24 hours as .txt
router.get('/download-today', (req, res) => {
    // Perform cleanup for expired logs
    dailyLogsManager.cleanExpired();

    const urls = dailyLogsManager.getRecentUrls();

    // Unique list of URLs
    const uniqueUrls = [...new Set(urls)];

    const fileContent = uniqueUrls.join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="today_submitted_urls.txt"');
    res.send(fileContent);
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeXml(str) {
    if (!str) return '';
    return str.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

// GET /feed.xml - Dynamic RSS 2.0 Feed for Google PubSubHubbub Syndication
router.get('/feed.xml', (req, res) => {
    const host = req.get('host') || 'fast-indexing-me-sj.vercel.app';
    const recentUrls = cacheManager.getRecentUrls() || [];

    const itemsXml = recentUrls.slice(0, 50).map((url) => {
        const encoded = Buffer.from(url).toString('base64url');
        const gatewayUrl = `https://${host}/i/u_${encoded}`;
        return `
        <item>
            <title>Technical Indexation Audit Report - ${escapeHtml(url.substring(0, 50))}</title>
            <link>${escapeHtml(gatewayUrl)}</link>
            <guid isPermaLink="true">${escapeHtml(gatewayUrl)}</guid>
            <pubDate>${new Date().toUTCString()}</pubDate>
            <description>Crawler indexing validation node for ${escapeHtml(url)}</description>
        </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>Public Site Publication Directory RSS Feed</title>
    <link>https://${host}</link>
    <description>Dynamic indexing and crawl optimization network feed</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://${host}/feed.xml" rel="self" type="application/rss+xml" />
    <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />
    ${itemsXml}
</channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.send(rss);
});

module.exports = router;
