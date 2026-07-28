/**
 * Permanent Resident Crawler Daemon & Real-Time Event Stream Engine
 * Anchors Googlebot, Bingbot, and Global Crawlers to the Domain:
 * 1. Server-Sent Events (SSE) Real-Time URL Feed Stream (/fui-api/api/indexing/stream)
 * 2. 15-Second High-Frequency Self-Sustaining Re-Ping Daemon
 * 3. Permanent Resident Gateway Hub (/resident-crawler)
 * 4. Real-Time Atom 1.0 & RSS 2.0 Dynamic Node Push
 */
const cacheManager = require('./cacheManager');
const proGoogleEngine = require('./proGoogleEngine');

class ResidentCrawlerDaemon {
    constructor() {
        this.isDaemonActive = false;
        this.daemonInterval = null;
        this.connectedClients = [];
    }

    startResidentDaemon(host = 'ai-fast-indexing-engine.vercel.app') {
        if (this.isDaemonActive) return;
        this.isDaemonActive = true;
        console.log('🤖 [ResidentCrawlerDaemon] Permanent Resident Crawler Daemon Activated!');

        // Run high-frequency daemon loop every 15 seconds
        this.daemonInterval = setInterval(() => {
            this.executeResidentPingCycle(host).catch(() => null);
        }, 15000);
        if (this.daemonInterval && typeof this.daemonInterval.unref === 'function') {
            this.daemonInterval.unref();
        }

        // Immediate first execution
        this.executeResidentPingCycle(host).catch(() => null);
    }

    async executeResidentPingCycle(host) {
        const recentUrls = cacheManager.getRecentUrls();
        if (!recentUrls || recentUrls.length === 0) return;

        const sitemapUrl = `https://${host}/sitemap.html`;
        const rssUrl = `https://${host}/rss.xml`;
        const atomUrl = `https://${host}/atom.xml`;

        // Continuous high-frequency pings so search bots stay attached
        await Promise.allSettled([
            fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`),
            fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(rssUrl)}`),
            fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(atomUrl)}`),
            fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
        ]);
    }

    /**
     * Handles Server-Sent Events (SSE) Stream Connection for Real-Time Crawlers
     */
    handleSseStream(req, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        res.write(`data: ${JSON.stringify({ status: 'resident_crawler_connected', timestamp: new Date().toISOString() })}\n\n`);

        this.connectedClients.push(res);

        req.on('close', () => {
            this.connectedClients = this.connectedClients.filter(client => client !== res);
        });
    }

    /**
     * Broadcasts newly submitted URL to all connected crawler streams
     */
    broadcastUrlToResidentCrawlers(url) {
        const payload = JSON.stringify({ url, timestamp: new Date().toISOString(), priority: 'URGENT' });
        this.connectedClients.forEach(res => {
            try {
                res.write(`data: ${payload}\n\n`);
            } catch (e) {
                // Ignore closed streams
            }
        });
    }
}

module.exports = new ResidentCrawlerDaemon();
