const express = require('express');
const router = express.Router();

// Required modules for URL processing
const keyPoolManager = require('../services/keyPoolManager');
const humanEmulationEngine = require('../services/humanEmulationEngine');
const indexNowProtocolEngine = require('../services/indexNowProtocolEngine');
const googleSyndicationEngine = require('../services/googleSyndicationEngine');
const stealthScraperEngine = require('../services/stealthScraperEngine');
const secretBypassEngine = require('../services/secretBypassEngine');
const multiBotSwarmEngine = require('../services/multiBotSwarmEngine');

/**
 * POST /api/queue-worker
 * Endpoint invoked by Upstash QStash webhook.
 * Processes ONE url at a time to prevent serverless timeouts.
 */
router.post('/queue-worker', async (req, res) => {
    try {
        const { url, gatewayUrl, jobId } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Missing url in payload.' });
        }

        console.log(`[QStash Worker] 🛠️ Processing Job ${jobId} | URL: ${url}`);

        // 🚀 THE SECRET TO 1-MINUTE INDEXING: 301 GATEWAY BYPASS
        // Submitting a 3rd party URL to Google API throws a 403 Permission Denied.
        // Fast-indexing tools submit a URL on their OWN verified domain (gatewayUrl) 
        // which instantly 301 redirects Googlebot to the target URL!
        const gscResult = await keyPoolManager.publishWithRotatedPool(gatewayUrl);
        
        // 🔥 Execute all secondary fast-indexing pings concurrently
        const pingPromises = [
            indexNowProtocolEngine.submitIndexNowBatch([gatewayUrl], req.get('host') || 'ai-fast-indexing-engine.vercel.app').catch(() => null),
            googleSyndicationEngine.pushInstantSyndication(gatewayUrl).catch(() => null),
            stealthScraperEngine.fetchSemanticSnapshot(url).catch(() => null), // Puppeteer Headless emulation
            humanEmulationEngine.dispatchHumanEmulationPool(gatewayUrl || url, 25).catch(() => null),
            secretBypassEngine.executeAllBypassTricks(gatewayUrl || url, req.get('host')).catch(() => null),
            multiBotSwarmEngine.dispatchBotSwarm(gatewayUrl || url).catch(() => null)
        ];

        await Promise.allSettled(pingPromises);

        console.log(`[QStash Worker] ✅ Successfully processed 301 Gateway Indexing for ${url}`);
        
        res.status(200).json({ 
            success: true, 
            url,
            gatewayUrl,
            gscResult
        });

    } catch (error) {
        console.error(`[QStash Worker] ❌ Error processing URL:`, error);
        // Return 500 so QStash knows to retry this message later
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
