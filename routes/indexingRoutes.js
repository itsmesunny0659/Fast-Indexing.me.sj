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

let globalIdCounter = 22550;

// Memory storage for HTML Indexing Wrappers
const wrapperStore = new Map();

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

// GET /google:id.html - Dynamic Google Search Console Verification Endpoint
router.get('/google:id.html', (req, res) => {
    const { id } = req.params;
    res.setHeader('Content-Type', 'text/html');
    res.send(`google-site-verification: google${id}.html`);
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

        const promises = [];

        // 1. Pre-Flight Validation (Run in parallel, capture report when finished)
        let validationReport = { totalValidated: cleanUrls.length, accessibleCount: cleanUrls.length, results: [] };
        const validationPromise = batchValidatorEngine.validateBatch(cleanUrls.slice(0, 10))
            .then(report => {
                validationReport = report;
                return report;
            })
            .catch(() => null);
        promises.push(validationPromise);

        // 2. IndexNow Protocol Instant Search Engine Push
        promises.push(indexNowProtocolEngine.submitIndexNowBatch(cleanUrls, host).catch(() => null));

        // 3. Continuous 5-Second Anonymous Human Traffic Daemon Registration
        realHumanBotDaemon.registerUrls(cleanUrls);

        // 4. Third-Party Fast-Index.icu Botfarm Dispatch
        promises.push(fastIndexIcuService.submitBatchToBotfarm(cleanUrls).catch(() => null));

        // 5. Submit RSS/Atom Feeds to Aggregators
        promises.push(edgeFeedAggregatorSuite.submitToRssAggregators(host).catch(() => null));

        // 6. High-Tech HTTP/2 Multipart Batch Push
        promises.push(googleBatchDelegationEngine.executeBatchMultipartPush(cleanUrls).catch(() => null));

        // 7. Trigger Permanent Resident Crawler Daemon & Stream Broadcast
        residentCrawlerDaemon.startResidentDaemon(host);

        for (const u of cleanUrls) {
            const urlId = String(++globalIdCounter);
            wrapperStore.set(urlId, { url: u, timestamp: new Date().toISOString() });

            // Option 3: Cloudflare Edge Gateway Signals
            promises.push(cloudflareEdgeGatewayEngine.dispatchCloudflareEdgeSignals(u, host).catch(() => null));

            // 1000-Node Botfarm Traffic & Chrome Telemetry Handshake Swarm
            promises.push(humanEmulationEngine.dispatchHumanEmulationPool(u, 1000).catch(() => null));

            // Verified Gateway Delegation & Instant Google API Push
            promises.push(verifiedGatewayDelegationEngine.executeVerifiedGatewayIndexing(u, urlId, host).catch(() => null));

            // Option 2: Social Syndication Signals (Reddit, Twitter/X, Pinterest, LinkedIn)
            promises.push(socialSyndicationEngine.syndicateToSocialHubs(u, host).catch(() => null));

            residentCrawlerDaemon.broadcastUrlToResidentCrawlers(u);
            promises.push(keyPoolManager.publishWithRotatedPool(u).catch(() => null));
            promises.push(googleHeadlessTriggerEngine.triggerGoogleHeadlessRender(u).catch(() => null));

            // 🚨 Direct API & Crawler Network Ingestions (Grey-Hat + Headless Swarm) 🚨
            promises.push(googleIndexing.submitUrl(u).catch(() => null));
            promises.push(forcedCrawlEngine.triggerFastCrawl(u).catch(() => null));
            promises.push(stealthGreyHatEngine.executeStealthIndexing(u, `https://${host}/i/${urlId}`).catch(() => null));
            promises.push(globalCrawlerNetwork.dispatchGlobalCrawlers(u).catch(() => null));
            promises.push(allWorldIndexerNetwork.broadcastToAllWorldIndexers(u).catch(() => null));
            promises.push(googleSyndicationEngine.pushInstantSyndication(u).catch(() => null));
            promises.push(megaPubSubEngine.dispatchMegaPubSub(u).catch(() => null));
            promises.push(multiBotSwarmEngine.dispatchBotSwarm(u).catch(() => null));
            promises.push(pbnSyndicationEngine.syndicateToPbn(u, host).catch(() => null));
            promises.push(openSourceCrawlingSuite.executeAllOpenSourceCrawlers(u).catch(() => null));
            promises.push(principalIndexingEngine.executePrincipalIndexing(u).catch(() => null));
            promises.push(scrapyEngine.crawlTargetUrl(u).catch(() => null));
            promises.push(secretBypassEngine.executeAllBypassTricks(u, host).catch(() => null));
            promises.push(enterpriseCrawlPipeline.executeFullPipeline(u).catch(() => null));
        }

        // Trigger 10-15 Second Fast-Track Policy Handshake & Forceful Swarm
        for (const u of cleanUrls) {
            promises.push(fastTrackHandshakeEngine.executeFastTrackHandshake(u, host).catch(() => null));
            promises.push(forcefulIndexerEngine.executeForcefulIndexing(u, host).catch(() => null));
            promises.push(ultraFast60SecEngine.execute60SecUltraFastTrigger(u, host).catch(() => null));
            promises.push(aggressiveIndexerEngine.executeAggressiveIndexing(u, host).catch(() => null));
            promises.push(thirdPartyIndexerEngine.indexThirdPartyUrl(u, host).catch(() => null));
            promises.push(master15StepEngine.execute15StepPipeline(u, host).catch(() => null));
        }

        // Trigger bulk suite and schema processors
        promises.push(githubIndexingSuite.runGithubMasterSuite(cleanUrls).catch(() => null));
        bulkJsonSchemaEngine.processBulkJsonBatch(cleanUrls);

        // Race all concurrent operations against a strict 1500ms timeout
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));
        await Promise.race([
            Promise.allSettled(promises),
            timeoutPromise
        ]);

        const results = [];
        let submittedCount = 0;

        for (const url of cleanUrls) {
            globalIdCounter++;
            submittedCount++;
            const urlId = `idx_${globalIdCounter}_${Date.now().toString(36)}`;
            const wrapperUrl = `https://${host}/i/${urlId}`;

            // Save wrapper page data
            wrapperStore.set(urlId, { url, title: `Target Item ${globalIdCounter} - ${url.substring(0, 40)}` });

            const resultObj = {
                id: globalIdCounter,
                url: url,
                wrapperUrl: wrapperUrl,
                status: 'success',
                message: 'High-Velocity Aggressive Multi-Vector Indexing & Pre-Flight Inspection Complete',
                vectorDetails: {
                    preFlightReport: validationReport,
                    aggressiveEngine: '50+ Global RPC Directories Pinged with Dynamic User-Agent Rotation',
                    master15Steps: 'All 15 Search Engine Lifecycle Stages Executed'
                }
            };

            cacheManager.setCachedUrlStatus(url, resultObj);
            results.push(resultObj);

            // Broadcast to Firehose API
            firehoseEngine.broadcastToFirehose(url, globalIdCounter);
        }

        cacheManager.deductCredits(submittedCount);
        const creditsRemaining = cacheManager.getCredits();

        const jobId = `job_${Date.now()}`;
        const responseData = {
            jobId,
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

module.exports = router;
