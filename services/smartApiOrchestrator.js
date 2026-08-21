const { Client } = require("@upstash/qstash");
const keyPoolManager = require('./keyPoolManager');

class SmartApiOrchestrator {
    constructor() {
        const token = process.env.QSTASH_TOKEN;
        this.qstashToken = (token && token !== 'dummy_token_requires_setup' && token.trim() !== '') ? token : null;
        if (this.qstashToken) {
            this.qstash = new Client({ token: this.qstashToken });
        }
    }

    /**
     * Drip-feeds URLs into chunks (default 500) and schedules them 1 minute apart
     */
    async scheduleDripFeed(urls, host, chunkSize = 500) {
        console.log(`[DripFeeder] 🕒 Orchestrating drip-feed for ${urls.length} URLs (Chunk Size: ${chunkSize}).`);
        
        const chunks = [];
        for (let i = 0; i < urls.length; i += chunkSize) {
            chunks.push(urls.slice(i, i + chunkSize));
        }

        const scheduledJobs = [];
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const delayMinutes = i; // 0 for first chunk, 1 for second, etc.
            
            if (this.qstash) {
                console.log(`[DripFeeder] 📦 Scheduling Chunk ${i + 1}/${chunks.length} (${chunk.length} URLs) with ${delayMinutes}m delay.`);
                try {
                    const pub = await this.qstash.publishJSON({
                        url: `https://${host}/fui-api/api/indexing/drip-worker`,
                        body: { urls: chunk },
                        delay: delayMinutes > 0 ? `${delayMinutes}m` : undefined,
                        retries: 3
                    });
                    scheduledJobs.push(pub);
                } catch (e) {
                    console.error(`[DripFeeder] ❌ Failed to schedule chunk ${i} in QStash:`, e.message);
                    this._executeFallback(chunk);
                }
            } else {
                console.warn(`[DripFeeder] ⚠️ QStash Token missing! Executing local fallback for Chunk ${i + 1}.`);
                // Wait locally before executing (Warning: Vercel might kill this if delay > 10s)
                setTimeout(() => {
                    this._executeFallback(chunk);
                }, delayMinutes * 60 * 1000);
            }
        }
        
        return { chunksScheduled: chunks.length, totalUrls: urls.length };
    }

    /**
     * The worker endpoint logic for actually hitting the Google API
     */
    async processDripBatch(urls) {
        console.log(`[DripFeeder] ⚙️ Processing scheduled drip batch of ${urls.length} URLs...`);
        
        // Process sequentially or in very small parallel chunks so we don't blow up the API
        let successCount = 0;
        let failCount = 0;

        // Process 10 at a time
        for (let i = 0; i < urls.length; i += 10) {
            const batch = urls.slice(i, i + 10);
            const promises = batch.map(url => keyPoolManager.publishWithRotatedPool(url));
            const results = await Promise.allSettled(promises);
            
            results.forEach(res => {
                if (res.status === 'fulfilled' && res.value && res.value.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            });
            
            // Add a slight 200ms delay between micro-batches to be extra safe
            await new Promise(r => setTimeout(r, 200));
        }

        console.log(`[DripFeeder] ✅ Batch complete. Success: ${successCount}, Failed: ${failCount}`);
        return { success: successCount, failed: failCount };
    }

    async _executeFallback(chunk) {
        try {
            await this.processDripBatch(chunk);
        } catch (e) {
            console.error(`[DripFeeder] ❌ Local fallback error:`, e);
        }
    }
}

module.exports = new SmartApiOrchestrator();
