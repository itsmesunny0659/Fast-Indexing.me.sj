/**
 * IndexNow Protocol Instant Indexing Engine
 * Implements the open IndexNow protocol (backed by Microsoft Bing, Yandex, Seznam, and Naver)
 * to instantly push URL changes directly to search engine crawler queues via API.
 */
class IndexNowProtocolEngine {
    constructor() {
        this.apiKey = '8a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d';
        this.endpoints = [
            'https://api.indexnow.org/indexnow',
            'https://www.bing.com/indexnow',
            'https://yandex.com/indexnow'
        ];
    }

    async fetchWithTimeout(url, options = {}, timeoutMs = 3000) {
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
     * Pushes target URLs directly to IndexNow global search engine protocol endpoints
     */
    async submitIndexNowBatch(urls, host = 'ai-fast-indexing-engine.vercel.app') {
        console.log(`⚡ [IndexNowProtocolEngine] Submitting ${urls.length} URLs to IndexNow Protocol Network...`);

        const payload = {
            host: host,
            key: this.apiKey,
            keyLocation: `https://${host}/${this.apiKey}.txt`,
            urlList: urls
        };

        const promises = this.endpoints.map(endpoint =>
            this.fetchWithTimeout(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(payload)
            }, 3000)
        );

        const results = await Promise.allSettled(promises);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value && (r.value.status === 200 || r.value.status === 202)).length;

        return {
            urlsSubmitted: urls.length,
            endpointsPinged: this.endpoints.length,
            successfulResponses: successCount,
            status: 'indexnow_protocol_dispatched',
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new IndexNowProtocolEngine();
