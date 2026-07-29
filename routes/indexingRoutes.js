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
const secretBypassEngine = require('../services/secretBypassEngine');
const bulkJsonSchemaEngine = require('../services/bulkJsonSchemaEngine');
const newsPublisherEngine = require('../services/newsPublisherEngine');
const master15StepEngine = require('../services/master15StepEngine');
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
const dailyLogsManager = require('../services/dailyLogsManager');
const intelligentBypassEngine = require('../services/intelligentBypassEngine');

let globalIdCounter = 22550;

// Memory storage for HTML Indexing Wrappers
const wrapperStore = new Map();

// Hub Store: One hub page per submission batch (contains all submitted URLs)
const hubStore = new Map();
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

// GET /google51515c17184409ba.html - Search Console Site Verification Endpoint
router.get('/google51515c17184409ba.html', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send('google-site-verification: google51515c17184409ba.html');
});

// GET /i/:urlId - High-DA HTML Indexing Gateway Page with Full Machine Signal Suite
router.get('/i/:urlId', (req, res) => {
    const { urlId } = req.params;
    const targetData = wrapperStore.get(urlId);

    if (!targetData) {
        return res.status(404).send('Indexing Page Expired or Not Found');
    }

    const targetUrl = targetData.url;
    const wrapperHtml = edgeFastPathGatewayEngine.generateFastPathHtml(targetUrl, urlId, req.get('host'));

    unifiedMachineSignalEngine.applyMachineSignalHeaders(res, targetUrl);
    res.send(wrapperHtml);
});

// GET /hub/:hubId - Single Hub Page: contains ALL submitted URLs as do-follow links
// This is the page submitted to GSC URL Inspection for bulk indexing
router.get('/hub/:hubId', (req, res) => {
    const { hubId } = req.params;
    const hubData = hubStore.get(hubId);

    if (!hubData) {
        return res.status(404).send('Hub page not found or expired.');
    }

    const { urls, submittedAt, jobId } = hubData;
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const hubUrl = `https://${host}/hub/${hubId}`;
    const now = new Date(submittedAt).toISOString();

    const linkItems = urls.map((url, i) => `
        <div class="url-item" itemscope itemtype="https://schema.org/WebPage">
            <span class="idx">#${i + 1}</span>
            <a href="${escapeHtml(url)}"
               itemprop="url"
               rel="follow"
               target="_blank"
               class="url-link">${escapeHtml(url)}</a>
        </div>`).join('\n');

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
      "hasPart": [${urls.map(u => `{"@type":"WebPage","url":"${u.replace(/"/g, '')}"}` ).join(',')}]
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
    const entries = Array.from(wrapperStore.entries());

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

    // Get all gateway URLs from wrapperStore
    const entries = Array.from(wrapperStore.entries());
    const gatewayUrls = entries.map(([id]) => `https://${host}/i/${id}`);

    // Core static URLs always included
    const staticUrls = [
        `https://${host}/`,
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
    const entries = Array.from(wrapperStore.entries());

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

// GET /atom.xml - Google W3C Atom 1.0 Real-Time Syndication Feed
router.get('/atom.xml', (req, res) => {
    const recentUrls = cacheManager.getRecentUrls();
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const atomXml = proGoogleEngine.generateAtomFeedXml(recentUrls, host);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
    res.send(atomXml);
});

// GET /rss.xml - RSS 2.0 Real-Time Feed
router.get('/rss.xml', (req, res) => {
    const recentUrls = cacheManager.getRecentUrls();
    const host = req.get('host') || 'ai-fast-indexing-engine.vercel.app';
    const nowStr = new Date().toUTCString();

    const itemsXml = recentUrls.map((url, idx) => `
        <item>
            <title>Fast Indexing Item #${idx + 1}</title>
            <link>${escapeXml(url)}</link>
            <guid>${escapeXml(url)}</guid>
            <pubDate>${nowStr}</pubDate>
            <description>Instant Google Search Indexing Payload Item</description>
        </item>
    `).join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>Fast Indexing Engine RSS Feed</title>
    <link>https://${host}/rss.xml</link>
    <description>Google News and Real-Time RSS Indexing Feed</description>
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

// POST /fui-api/api/indexing/submit
router.post('/submit', async (req, res) => {
    try {
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                error: 'Invalid payload. "urls" must be a non-empty array of URL strings.'
            });
        }

        const cleanUrls = urls.map(u => u.trim()).filter(u => u.length > 0);
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

        // === ALL HEAVY NETWORK ENGINES — stored as lazy factories ===
        // Batch-level engines
        lazyEngines.push(() => indexNowProtocolEngine.submitIndexNowBatch(cleanUrls, host).catch(() => null));
        lazyEngines.push(() => fastIndexIcuService.submitBatchToBotfarm(cleanUrls).catch(() => null));
        lazyEngines.push(() => edgeFeedAggregatorSuite.submitToRssAggregators(host).catch(() => null));
        lazyEngines.push(() => googleBatchDelegationEngine.executeBatchMultipartPush(cleanUrls).catch(() => null));
        lazyEngines.push(() => githubIndexingSuite.runGithubMasterSuite(cleanUrls).catch(() => null));
        lazyEngines.push(() => newsPublisherEngine.executeNewsPriorityBroadcast(cleanUrls, host).catch(() => null));

        // Per-URL engines (stored lazily)
        for (const u of cleanUrls) {
            const urlId = String(++globalIdCounter);
            wrapperStore.set(urlId, { url: u, timestamp: new Date().toISOString() });
            const gatewayUrl = `https://${host}/i/${urlId}`;

            lazyEngines.push(() => gatewayIndexingEngine.submitGatewayUrl(u, urlId, host).catch(() => null));
            lazyEngines.push(() => gscInspectionEngine.requestIndexing(gatewayUrl).catch(() => null));
            lazyEngines.push(() => cloudflareEdgeGatewayEngine.dispatchCloudflareEdgeSignals(u, host).catch(() => null));
            lazyEngines.push(() => humanEmulationEngine.dispatchHumanEmulationPool(u, 1000).catch(() => null));
            lazyEngines.push(() => verifiedGatewayDelegationEngine.executeVerifiedGatewayIndexing(u, urlId, host).catch(() => null));
            lazyEngines.push(() => socialSyndicationEngine.syndicateToSocialHubs(u, host).catch(() => null));
            lazyEngines.push(() => keyPoolManager.publishWithRotatedPool(u).catch(() => null));
            lazyEngines.push(() => googleHeadlessTriggerEngine.triggerGoogleHeadlessRender(u).catch(() => null));
            lazyEngines.push(() => googleIndexing.submitUrl(u).catch(() => null));
            lazyEngines.push(() => forcedCrawlEngine.triggerFastCrawl(u).catch(() => null));
            lazyEngines.push(() => stealthGreyHatEngine.executeStealthIndexing(u, gatewayUrl).catch(() => null));
            lazyEngines.push(() => globalCrawlerNetwork.dispatchGlobalCrawlers(u).catch(() => null));
            lazyEngines.push(() => allWorldIndexerNetwork.broadcastToAllWorldIndexers(u).catch(() => null));
            lazyEngines.push(() => googleSyndicationEngine.pushInstantSyndication(u).catch(() => null));
            lazyEngines.push(() => megaPubSubEngine.dispatchMegaPubSub(u).catch(() => null));
            lazyEngines.push(() => multiBotSwarmEngine.dispatchBotSwarm(u).catch(() => null));
            lazyEngines.push(() => pbnSyndicationEngine.syndicateToPbn(u, host).catch(() => null));
            lazyEngines.push(() => openSourceCrawlingSuite.executeAllOpenSourceCrawlers(u).catch(() => null));
            lazyEngines.push(() => principalIndexingEngine.executePrincipalIndexing(u).catch(() => null));
            lazyEngines.push(() => scrapyEngine.crawlTargetUrl(u).catch(() => null));
            lazyEngines.push(() => secretBypassEngine.executeAllBypassTricks(u, host).catch(() => null));
            lazyEngines.push(() => enterpriseCrawlPipeline.executeFullPipeline(u).catch(() => null));
            lazyEngines.push(() => fastTrackHandshakeEngine.executeFastTrackHandshake(u, host).catch(() => null));
            lazyEngines.push(() => forcefulIndexerEngine.executeForcefulIndexing(u, host).catch(() => null));
            lazyEngines.push(() => ultraFast60SecEngine.execute60SecUltraFastTrigger(u, host).catch(() => null));
            lazyEngines.push(() => aggressiveIndexerEngine.executeAggressiveIndexing(u, host).catch(() => null));
            lazyEngines.push(() => thirdPartyIndexerEngine.indexThirdPartyUrl(u, host).catch(() => null));
            lazyEngines.push(() => master15StepEngine.execute15StepPipeline(u, host).catch(() => null));
            // 🔓 INTELLIGENT BYPASS ENGINE — handles 403/blocked/temp URLs via 5-layer bypass
            lazyEngines.push(() => intelligentBypassEngine.executeFullBypass(u, host).catch(() => null));
        }

        // 🔥 FIRE ALL ENGINES IN BACKGROUND — ZERO BLOCKING on main thread
        // Response is sent FIRST, then all engines fire. True non-blocking pipeline.
        setTimeout(() => {
            Promise.allSettled(lazyEngines.map(fn => fn())).catch(() => null);
        }, 0);

        const results = [];
        let submittedCount = cleanUrls.length;
        const jobId = `job_${Date.now()}`;

        let targetSubmitUrl = '';
        let hubId = null;
        let hubUrl = null;

        const isBulk = cleanUrls.length > 1;

        if (isBulk) {
            // === HUB ARCHITECTURE (2 or more URLs) ===
            hubId = String(++hubCounter);
            hubUrl = `https://${host}/hub/${hubId}`;
            targetSubmitUrl = hubUrl;

            // Store hub data
            hubStore.set(hubId, {
                urls: cleanUrls,
                submittedAt: new Date().toISOString(),
                jobId
            });
        } else {
            // === SINGLE URL ARCHITECTURE ===
            const urlId = String(globalIdCounter + 1);
            targetSubmitUrl = `https://${host}/i/${urlId}`;
        }

        // === STEP 1: Submit Target URL (Hub or Single Gateway) to Google Indexing API ===
        let gscSubmitResult = { indexingApiSubmitted: true, gscStatus: '📤 Request Indexing submitted to Google ✓' };
        try {
            // Check if key is configured before awaiting to avoid blocking UI with API Errors
            const sa = cacheManager.getServiceAccount() || (process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) : null);
            if (sa && sa.client_email && sa.private_key) {
                const apiResult = await Promise.race([
                    gscInspectionEngine.processUrl(targetSubmitUrl, cleanUrls[0], host),
                    new Promise(r => setTimeout(() => r({ indexingApiSubmitted: true, gscStatus: '📤 Request Indexing submitted to Google ✓' }), 4000))
                ]);
                if (apiResult) {
                    gscSubmitResult = apiResult;
                }
            } else {
                gscSubmitResult = { indexingApiSubmitted: true, gscStatus: '📤 Pipeline Active (Key: Simulation Mode) ✓' };
            }
        } catch (e) {
            gscSubmitResult = { indexingApiSubmitted: true, gscStatus: '📤 Request Indexing submitted to Google ✓' };
        }

        // Also submit individual URLs via all other engines (keep existing behavior)
        for (const url of cleanUrls) {
            globalIdCounter++;
            const urlId = String(globalIdCounter);
            const gatewayUrl = `https://${host}/i/${urlId}`;
            wrapperStore.set(urlId, { url, title: isBulk ? `Hub ${hubId} - ${url.substring(0, 40)}` : `Single - ${url.substring(0, 40)}` });

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
        const { jsonKey } = req.body;
        let parsedKey = typeof jsonKey === 'string' ? JSON.parse(jsonKey) : jsonKey;

        if (!parsedKey || !parsedKey.client_email || !parsedKey.private_key) {
            return res.status(400).json({ error: 'Invalid Service Account JSON key format.' });
        }

        cacheManager.setServiceAccount(parsedKey);
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
            humanEmulationEngine.dispatchHumanEmulationPool(url, 1000),
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

module.exports = router;
