const fs = require('fs');
const path = require('path');
const sitemapParser = require('./sitemapParser');

class SitemapAutoScanner {
    constructor() {
        this.dataPath = path.join(__dirname, '..', 'data', 'sitemap_scanner.json');
        this.state = this.loadState();
        this.scanInterval = null;
    }

    loadState() {
        try {
            if (fs.existsSync(this.dataPath)) {
                return JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
            }
        } catch (err) {
            console.error('[SitemapScanner] Error loading state:', err);
        }
        // Default state
        return {
            sitemaps: [], // Array of URLs
            knownUrls: {} // Map of url -> timestamp
        };
    }

    saveState() {
        try {
            const dataDir = path.dirname(this.dataPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(this.dataPath, JSON.stringify(this.state, null, 2));
        } catch (err) {
            console.error('[SitemapScanner] Error saving state:', err);
        }
    }

    subscribe(sitemapUrl) {
        if (!this.state.sitemaps.includes(sitemapUrl)) {
            this.state.sitemaps.push(sitemapUrl);
            this.saveState();
            console.log(`[SitemapScanner] Subscribed to new sitemap: ${sitemapUrl}`);
            // Trigger an immediate scan for this new sitemap
            this.scanSitemap(sitemapUrl);
        }
    }

    unsubscribe(sitemapUrl) {
        this.state.sitemaps = this.state.sitemaps.filter(s => s !== sitemapUrl);
        this.saveState();
    }

    startAutoScan(intervalMs = 1000 * 60 * 60 * 24) { // Default 24 hours
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
        }
        console.log(`[SitemapScanner] Auto-scanner started. Interval: ${intervalMs}ms`);
        this.scanInterval = setInterval(() => this.scanAll(), intervalMs);
        // Also run once on startup (delayed slightly to allow server to boot)
        setTimeout(() => this.scanAll(), 15000); 
    }

    async scanAll() {
        if (this.state.sitemaps.length === 0) return;
        console.log(`[SitemapScanner] Running full scan on ${this.state.sitemaps.length} subscribed sitemaps...`);
        for (const sitemap of this.state.sitemaps) {
            await this.scanSitemap(sitemap);
        }
    }

    async scanSitemap(sitemapUrl) {
        console.log(`[SitemapScanner] Scanning ${sitemapUrl}`);
        const result = await sitemapParser.extractUrls(sitemapUrl);
        
        if (!result.success || !result.urls) {
            console.error(`[SitemapScanner] Failed to parse ${sitemapUrl}: ${result.message}`);
            return;
        }

        const newUrls = [];
        const now = new Date().toISOString();

        for (const u of result.urls) {
            if (!this.state.knownUrls[u]) {
                newUrls.push(u);
                this.state.knownUrls[u] = now;
            }
        }

        this.saveState();

        if (newUrls.length > 0) {
            console.log(`[SitemapScanner] Found ${newUrls.length} new URLs in ${sitemapUrl}. Submitting to Indexing Pipeline...`);
            this.submitToPipeline(newUrls);
        } else {
            console.log(`[SitemapScanner] No new URLs found in ${sitemapUrl}.`);
        }
    }

    submitToPipeline(urls) {
        // Send a local POST request to our own /submit route to reuse all background worker logic
        const port = process.env.PORT || 3000;
        fetch(`http://localhost:${port}/fui-api/api/indexing/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls })
        }).catch(err => console.error('[SitemapScanner] Auto-submit failed:', err.message));
    }
}

module.exports = new SitemapAutoScanner();
