/**
 * Third-Party Fast-Index.icu Botfarm Connector Engine (Enhanced High-Reliability Version)
 * Integrates external fast-index.icu API for batch processing URLs (up to 500 URLs/batch)
 * with Dual-Header Authentication and Adaptive 6000ms Timeout.
 */
class FastIndexIcuService {
    constructor() {
        this.apiKey = '2P28PAFPX7GGLYK8V846FVKA@';
        this.apiUrl = 'https://fast-index.icu/botfarms/api.php';
    }

    async fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            return res;
        } catch (e) {
            clearTimeout(id);
            return null;
        }
    }

    /**
     * Submits a batch of URLs (max 500) to fast-index.icu botfarms API
     */
    async submitBatchToBotfarm(urls) {
        if (!urls || urls.length === 0) return { success: false, reason: 'EMPTY_URLS' };

        console.log(`📡 [FastIndexIcuService] Dispatching ${urls.length} URLs to fast-index.icu API...`);

        // Batch into chunks of max 500 URLs
        const chunkSize = 500;
        const chunks = [];
        for (let i = 0; i < urls.length; i += chunkSize) {
            chunks.push(urls.slice(i, i + chunkSize));
        }

        const dispatchPromises = chunks.map(chunk =>
            this.fetchWithTimeout(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({ urls: chunk })
            }, 6000)
        );

        const results = await Promise.allSettled(dispatchPromises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value && r.value.ok).length;

        return {
            totalBatches: chunks.length,
            successfulBatches: successCount,
            totalUrlsDispatched: urls.length,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new FastIndexIcuService();
