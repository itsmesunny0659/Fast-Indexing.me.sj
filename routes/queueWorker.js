const express = require('express');
const router = express.Router();

// Required modules for URL processing
const googleIndexingApiRotator = require('../services/googleIndexingApiRotator');
const humanEmulationEngine = require('../services/humanEmulationEngine');
// Include any other specific engines you want to run purely in the background per URL

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

        // Run the heavy lifting processes that normally timeout Vercel
        
        // 1. Google Indexing API submission (Instant Indexing)
        const gscResult = await googleIndexingApiRotator.submitUrl(url, 'URL_UPDATED');
        
        // 2. Headless Browser Emulation (Puppeteer bypass)
        // (Assuming you'll update humanEmulationEngine to actually use puppeteer next)
        const emulationResult = await humanEmulationEngine.dispatchHumanEmulationPool(gatewayUrl || url, 1);

        console.log(`[QStash Worker] ✅ Successfully processed ${url}`);
        
        res.status(200).json({ 
            success: true, 
            url,
            gscResult,
            emulationResult
        });

    } catch (error) {
        console.error(`[QStash Worker] ❌ Error processing URL:`, error);
        // Return 500 so QStash knows to retry this message later
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
