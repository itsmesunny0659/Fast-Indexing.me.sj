/**
 * Google News & Social Grade Real-Time Firehose API Engine
 * Establishes a high-velocity data firehose to keep Googlebot and search indexers attached.
 */
const cacheManager = require('./cacheManager');
const newsPublisherEngine = require('./newsPublisherEngine');

class FirehoseEngine {
    constructor() {
        this.activeConnections = [];
    }

    /**
     * Handles Server-Sent Events (SSE) Live Firehose Stream
     */
    handleFirehoseStream(req, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('X-Robots-Tag', 'index, follow, noarchive');
        res.flushHeaders();

        // Send initial connection event
        res.write(`data: ${JSON.stringify({ 
            event: 'firehose_connected', 
            channel: 'realtime_search_index_firehose',
            frequency: 'high_velocity_continuous',
            timestamp: new Date().toISOString() 
        })}\n\n`);

        this.activeConnections.push(res);

        req.on('close', () => {
            this.activeConnections = this.activeConnections.filter(client => client !== res);
        });
    }

    /**
     * Broadcasts a new URL submission event through the active firehose stream
     */
    broadcastToFirehose(url, indexId) {
        const now = new Date().toISOString();
        const payload = JSON.stringify({
            event: 'url_published',
            id: indexId,
            url: url,
            priority: 'CRITICAL_NEWS_GRADE',
            timestamp: now,
            schema: newsPublisherEngine.generateNewsArticleJsonLd(url, indexId)
        });

        this.activeConnections.forEach(res => {
            try {
                res.write(`data: ${payload}\n\n`);
            } catch (e) {
                // Stream closed
            }
        });
    }

    /**
     * Returns the 100 most recent URL updates for the JSON feed
     */
    getFirehoseHistory(host = 'ai-fast-indexing-engine.vercel.app') {
        const recentUrls = cacheManager.getRecentUrls();
        return {
            status: 'success',
            feed: 'Google News High-Crawl Firehose API',
            host: host,
            updateFrequency: 'Every second',
            totalItems: recentUrls.length,
            items: recentUrls.map((url, idx) => ({
                id: idx + 1,
                url: url,
                crawlingPriority: '1.0',
                changeFrequency: 'always',
                timestamp: new Date().toISOString(),
                structuredSchema: newsPublisherEngine.generateNewsArticleJsonLd(url, idx + 1)
            }))
        };
    }
}

module.exports = new FirehoseEngine();
