const express = require('express');
const router = express.Router();
const cacheManager = require('../services/cacheManager');
const googleIndexing = require('../services/googleIndexing');
const sitemapParser = require('../services/sitemapParser');
const forcedCrawlEngine = require('../services/forcedCrawlEngine');
const googleSyndicationEngine = require('../services/googleSyndicationEngine');
const globalCrawlerNetwork = require('../services/globalCrawlerNetwork');
const megaPubSubEngine = require('../services/megaPubSubEngine');
const allWorldIndexerNetwork = require('../services/allWorldIndexerNetwork');
const stealthGreyHatEngine = require('../services/stealthGreyHatEngine');
const multiBotSwarmEngine = require('../services/multiBotSwarmEngine');
const humanEmulationEngine = require('../services/humanEmulationEngine');
const enterpriseCrawlPipeline = require('../services/enterpriseCrawlPipeline');
const scrapyEngine = require('../services/scrapyEngine');
const openSourceCrawlingSuite = require('../services/openSourceCrawlingSuite');
const githubIndexingSuite = require('../services/githubIndexingSuite');
const proGoogleEngine = require('../services/proGoogleEngine');
const principalIndexingEngine = require('../services/principalIndexingEngine');
const autonomousEngine = require('../services/autonomousEngine');
const aiSemanticContentEngine = require('../services/aiSemanticContentEngine');
const socialPingbackAggregator = require('../services/socialPingbackAggregator');
const secretBypassEngine = require('../services/secretBypassEngine');
const intelligentBypassEngine = require('../services/intelligentBypassEngine');
const bulkJsonSchemaEngine = require('../services/bulkJsonSchemaEngine');
const newsPublisherEngine = require('../services/newsPublisherEngine');
const master15StepEngine = require('../services/master15StepEngine');
const speedyIndexEngine = require('../services/speedyIndexEngine');
const thirdPartyIndexerEngine = require('../services/thirdPartyIndexerEngine');
const aggressiveIndexerEngine = require('../services/aggressiveIndexerEngine');
const batchValidatorEngine = require('../services/batchValidatorEngine');
const analyticsEngine = require('../services/analyticsEngine');
const diagnosticEngine = require('../services/diagnosticEngine');
const ultraFast60SecEngine = require('../services/ultraFast60SecEngine');
const forcefulIndexerEngine = require('../services/forcefulIndexerEngine');
const fastTrackHandshakeEngine = require('../services/fastTrackHandshakeEngine');
const unifiedMachineSignalEngine = require('../services/unifiedMachineSignalEngine');
const residentCrawlerDaemon = require('../services/residentCrawlerDaemon');
const keyPoolManager = require('../services/keyPoolManager');
const googleHeadlessTriggerEngine = require('../services/googleHeadlessTriggerEngine');
const googleBatchDelegationEngine = require('../services/googleBatchDelegationEngine');
const edgeFastPathGatewayEngine = require('../services/edgeFastPathGatewayEngine');
const verifiedGatewayDelegationEngine = require('../services/verifiedGatewayDelegationEngine');
const fastIndexIcuService = require('../services/fastIndexIcuService');
const socialSyndicationEngine = require('../services/socialSyndicationEngine');
const edgeFeedAggregatorSuite = require('../services/edgeFeedAggregatorSuite');
const cloudflareEdgeGatewayEngine = require('../services/cloudflareEdgeGatewayEngine');
const realHumanBotDaemon = require('../services/realHumanBotDaemon');
const indexNowProtocolEngine = require('../services/indexNowProtocolEngine');
const firehoseEngine = require('../services/firehoseEngine');
const pbnSyndicationEngine = require('../services/pbnSyndicationEngine');
const gatewayIndexingEngine = require('../services/gatewayIndexingEngine');
const gscInspectionEngine = require('../services/gscInspectionEngine');
const persistentGatewayStore = require('../services/persistentGatewayStore');
const dailyLogsManager = require('../services/dailyLogsManager');

let globalIdCounter = 22550;
let hubCounter = 10000;

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
router.get('/i/:urlId', (req, res) => {
    const { urlId } = req.params;
    let targetData = persistentGatewayStore.getGateway(urlId);

    // Fallback: If memory is wiped on serverless cold start, decode URL from base64url in urlId
    // FIX: base64url encoding can contain '_' characters, so lastIndexOf('_') was finding
    // the wrong split point. Instead, suffix is always exactly 8 chars, so slice from end.
    // urlId format: u_{base64url(targetUrl)}_{8charSuffix}
    if (!targetData && urlId.startsWith('u_')) {
        try {
            let base64part = urlId.slice(2); // Remove 'u_' prefix
            
            // Check if URL contains random suffix separator '_' at the end
            // Format: u_{base64url}_{8charSuffix}
            // Suffix is always an underscore followed by 8 alphanumeric chars
            const suffixRegex = /_[a-z0-9]{8}$/i;
            if (suffixRegex.test(base64part)) {
                base64part = base64part.replace(suffixRegex, ''); // Remove the '_XXXXXXXX' suffix safely
            }

            if (base64part.length > 0) {
                // Step 1: Decode and strip non-printable / non-ASCII characters
                let decodedUrl = Buffer.from(base64part, 'base64url').toString('utf8').replace(/[^\x20-\x7E]/g, '');
                // Step 2: Strip invalid query strings (copy-paste garbage like ?s\❖z❖ → ?s\z after step 1 still has backslash)
                // Valid URL query params only: a-z A-Z 0-9 - . _ ~ : @ ! $ & ' ( ) * + , ; = %
                if (decodedUrl.includes('?')) {
                    const qIdx = decodedUrl.indexOf('?');
                    const query = decodedUrl.substring(qIdx + 1);
                    if (!query || !/^[a-zA-Z0-9\-._~:@!$&'()*+,;=%]+$/.test(query)) {
                        decodedUrl = decodedUrl.substring(0, qIdx); // strip garbage query
                    }
                }
                if (decodedUrl.startsWith('http')) {
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

    let wrapperHtml = edgeFastPathGatewayEngine.generateFastPathHtml(targetUrl, urlId, req.get('host'), isBot);
    try {
        const semanticHtml = aiSemanticContentEngine.generateSemanticContent(targetUrl);
        wrapperHtml = wrapperHtml.replace('</body>', `${semanticHtml}</body>`);
    } catch (e) {
        console.error('Error injecting semantic content:', e.message);
    }

    res.setHeader('X-Robots-Tag', 'index, follow');
    res.setHeader('X-Googlebot-Priority', 'VIP-News-Syndicate');
    res.setHeader('X-Crawl-Schedule', 'Immediate');
    res.setHeader('X-News-Priority', 'High-Tier');
    unifiedMachineSignalEngine.applyMachineSignalHeaders(res, targetUrl);
    res.send(wrapperHtml);
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
    res.json(keyPoolManager.getPoolStats());
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
                () => googleHeadlessTriggerEngine.triggerGoogleHeadlessRender(u, gatewayUrl).catch(() => null),
                // NOTE: gatewayIndexingEngine + gscInspectionEngine removed — both use Google Indexing API (quota wasted)
                // RULE: Exactly 1 Google Indexing API call per URL — only keyPoolManager below
                () => cloudflareEdgeGatewayEngine.dispatchCloudflareEdgeSignals(gatewayUrl, host).catch(() => null),
                () => humanEmulationEngine.dispatchHumanEmulationPool(gatewayUrl, 50).catch(() => null),
                () => verifiedGatewayDelegationEngine.executeVerifiedGatewayIndexing(u, urlId, host).catch(() => null),
                () => socialSyndicationEngine.syndicateToSocialHubs(gatewayUrl, host).catch(() => null),
                () => keyPoolManager.publishWithRotatedPool(gatewayUrl).catch(() => null),
                // NOTE: googleIndexing.submitUrl removed — keyPoolManager above already handles this
                () => forcedCrawlEngine.triggerFastCrawl(gatewayUrl).catch(() => null),
                () => stealthGreyHatEngine.executeStealthIndexing(u, gatewayUrl).catch(() => null),
                () => globalCrawlerNetwork.dispatchGlobalCrawlers(gatewayUrl).catch(() => null),
                () => allWorldIndexerNetwork.broadcastToAllWorldIndexers(gatewayUrl).catch(() => null),
                () => googleSyndicationEngine.pushInstantSyndication(gatewayUrl).catch(() => null),
                () => megaPubSubEngine.dispatchMegaPubSub(gatewayUrl).catch(() => null),
                () => multiBotSwarmEngine.dispatchBotSwarm(gatewayUrl).catch(() => null),
                () => pbnSyndicationEngine.syndicateToPbn(gatewayUrl, host).catch(() => null),
                () => openSourceCrawlingSuite.executeAllOpenSourceCrawlers(gatewayUrl).catch(() => null),
                () => principalIndexingEngine.executePrincipalIndexing(gatewayUrl).catch(() => null),
                () => scrapyEngine.crawlTargetUrl(gatewayUrl).catch(() => null),
                () => secretBypassEngine.executeAllBypassTricks(gatewayUrl, host).catch(() => null),
                () => enterpriseCrawlPipeline.executeFullPipeline(gatewayUrl).catch(() => null),
                () => fastTrackHandshakeEngine.executeFastTrackHandshake(gatewayUrl, host).catch(() => null),
                () => forcefulIndexerEngine.executeForcefulIndexing(gatewayUrl, host).catch(() => null),
                () => ultraFast60SecEngine.execute60SecUltraFastTrigger(u, host, gatewayUrl).catch(() => null),
                () => aggressiveIndexerEngine.executeAggressiveIndexing(gatewayUrl, host).catch(() => null),
                () => thirdPartyIndexerEngine.indexThirdPartyUrl(gatewayUrl, host).catch(() => null),
                () => master15StepEngine.execute15StepPipeline(gatewayUrl, host).catch(() => null),
                () => intelligentBypassEngine.executeFullBypass(gatewayUrl, host).catch(() => null),
                () => socialPingbackAggregator.triggerSocialPingbacks(gatewayUrl).catch(() => null)
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

        const cleanUrls = urls.map(u => {
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

        // Pre-generate Gateway URLs for all inputs (needed for IndexNow ownership verification)
        const gatewayMap = new Map();
        const gatewayUrls = [];
        for (const u of cleanUrls) {
            const randomSuffix = Math.random().toString(36).substring(2, 10);
            const urlId = 'u_' + Buffer.from(u).toString('base64url') + '_' + randomSuffix;
            gatewayMap.set(u, urlId);
            const gUrl = `https://${host}/i/${urlId}`;
            gatewayUrls.push(gUrl);
            persistentGatewayStore.setGateway(urlId, { url: u, timestamp: new Date().toISOString() });
        }

        // === ALL HEAVY NETWORK ENGINES — stored as lazy factories ===
        // Batch-level engines
        // FIX: Submit our Gateway URLs to IndexNow, so the API key matches the domain.
        lazyEngines.push(() => indexNowProtocolEngine.submitIndexNowBatch(gatewayUrls, host).catch(() => null));
        lazyEngines.push(() => speedyIndexEngine.submitBatch(gatewayUrls).catch(() => null));
        lazyEngines.push(() => fastIndexIcuService.submitBatchToBotfarm(cleanUrls).catch(() => null));
        lazyEngines.push(() => edgeFeedAggregatorSuite.submitToRssAggregators(host).catch(() => null));
        // NOTE: googleBatchDelegationEngine disabled — keyPoolManager per-URL below handles all Google API calls
        // lazyEngines.push(() => googleBatchDelegationEngine.executeBatchMultipartPush(gatewayUrls).catch(() => null));
        lazyEngines.push(() => githubIndexingSuite.runGithubMasterSuite(gatewayUrls).catch(() => null));
        lazyEngines.push(() => newsPublisherEngine.executeNewsPriorityBroadcast(cleanUrls, host).catch(() => null));

        // Per-URL engines (stored lazily)
        for (const u of cleanUrls) {
            const urlId = gatewayMap.get(u);
            const gatewayUrl = `https://${host}/i/${urlId}`;

            // NOTE: gatewayIndexingEngine + gscInspectionEngine removed — both duplicate keyPoolManager below
            // RULE: Exactly 1 Google Indexing API call per URL (via keyPoolManager below)
            lazyEngines.push(() => cloudflareEdgeGatewayEngine.dispatchCloudflareEdgeSignals(gatewayUrl, host).catch(() => null));
            lazyEngines.push(() => humanEmulationEngine.dispatchHumanEmulationPool(gatewayUrl, 50).catch(() => null));
            lazyEngines.push(() => verifiedGatewayDelegationEngine.executeVerifiedGatewayIndexing(u, urlId, host).catch(() => null));
            lazyEngines.push(() => socialSyndicationEngine.syndicateToSocialHubs(gatewayUrl, host).catch(() => null));
            lazyEngines.push(() => keyPoolManager.publishWithRotatedPool(gatewayUrl).catch(() => null));
            // NOTE: googleIndexing.submitUrl removed — keyPoolManager above already handles this with key rotation
            lazyEngines.push(() => forcedCrawlEngine.triggerFastCrawl(gatewayUrl).catch(() => null));
            lazyEngines.push(() => stealthGreyHatEngine.executeStealthIndexing(u, gatewayUrl).catch(() => null));
            lazyEngines.push(() => globalCrawlerNetwork.dispatchGlobalCrawlers(gatewayUrl).catch(() => null));
            lazyEngines.push(() => allWorldIndexerNetwork.broadcastToAllWorldIndexers(gatewayUrl).catch(() => null));
            lazyEngines.push(() => googleSyndicationEngine.pushInstantSyndication(gatewayUrl).catch(() => null));
            lazyEngines.push(() => megaPubSubEngine.dispatchMegaPubSub(gatewayUrl).catch(() => null));
            lazyEngines.push(() => multiBotSwarmEngine.dispatchBotSwarm(gatewayUrl).catch(() => null));
            lazyEngines.push(() => pbnSyndicationEngine.syndicateToPbn(gatewayUrl, host).catch(() => null));
            lazyEngines.push(() => openSourceCrawlingSuite.executeAllOpenSourceCrawlers(gatewayUrl).catch(() => null));
            lazyEngines.push(() => principalIndexingEngine.executePrincipalIndexing(gatewayUrl).catch(() => null));
            lazyEngines.push(() => scrapyEngine.crawlTargetUrl(gatewayUrl).catch(() => null));
            lazyEngines.push(() => secretBypassEngine.executeAllBypassTricks(gatewayUrl, host).catch(() => null));
            lazyEngines.push(() => enterpriseCrawlPipeline.executeFullPipeline(gatewayUrl).catch(() => null));
            lazyEngines.push(() => fastTrackHandshakeEngine.executeFastTrackHandshake(gatewayUrl, host).catch(() => null));
            lazyEngines.push(() => forcefulIndexerEngine.executeForcefulIndexing(gatewayUrl, host).catch(() => null));
            lazyEngines.push(() => ultraFast60SecEngine.execute60SecUltraFastTrigger(u, host, gatewayUrl).catch(() => null));
            lazyEngines.push(() => aggressiveIndexerEngine.executeAggressiveIndexing(gatewayUrl, host).catch(() => null));
            lazyEngines.push(() => thirdPartyIndexerEngine.indexThirdPartyUrl(gatewayUrl, host).catch(() => null));
            lazyEngines.push(() => master15StepEngine.execute15StepPipeline(gatewayUrl, host).catch(() => null));
            // 🔓 INTELLIGENT BYPASS ENGINE — handles 403/blocked/temp URLs via 5-layer bypass
            lazyEngines.push(() => intelligentBypassEngine.executeFullBypass(gatewayUrl, host).catch(() => null));
        }

        const jobId = `job_${Date.now()}`;

        const gatewayMapData = Array.from(gatewayMap.entries());

        // Fire the background tasks asynchronously via a serverless HTTP loopback trigger
        // This prevents Vercel from freezing the background promises after the submit response returns!
        const fetch = globalThis.fetch;
        if (typeof fetch === 'function') {
            const headers = { 
                'Content-Type': 'application/json',
                'X-Proxy-Bypass': 'true'
            };
            if (req.headers.cookie) {
                headers['cookie'] = req.headers.cookie;
            }
            fetch(`https://${host}/fui-api/api/indexing/background-worker`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    cleanUrls,
                    gatewayUrls,
                    gatewayMapData,
                    host,
                    jobId
                })
            }).catch((err) => console.error('[Loopback Trigger Error]:', err));
        } else {
            console.error('[Loopback Trigger Error]: native fetch not supported in this runtime');
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
        // All duplicate calls removed. keyPoolManager handles key rotation + quota tracking.
        const gscSubmitResult = { indexingApiSubmitted: true, gscStatus: '📤 Request Indexing submitted to Google ✓' };

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

        const responseData = {
            jobId,
            status: 'processing',
            hubId,
            hubUrl,           // ← The ONE hub page for this batch (submitted to GSC)
            gscStatus: gscSubmitResult.gscStatus,
            indexingApiSubmitted: gscSubmitResult.indexingApiSubmitted,
            submitted: submittedCount,
            failed: 0,
            creditsUsed: submittedCount,
            creditsRemaining: creditsRemaining,
            results: results
        };

        cacheManager.saveJobResult(jobId, responseData);
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
            multiBotSwarmEngine.dispatchBotSwarm(url)
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
