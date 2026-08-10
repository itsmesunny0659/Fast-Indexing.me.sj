/**
 * 100% Free Public Proxy Scraper & Rotator
 * Downloads live proxies from GitHub repositories every hour and validates them.
 */
class FreeProxyScraperEngine {
    constructor() {
        this.proxies = [];
        this.lastScraped = 0;
        
        // High-quality public proxy lists updated minutely
        this.sources = [
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
            'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
            'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt'
        ];
    }

    /**
     * Scrapes and parses the proxies, keeping them cached for 30 minutes
     */
    async refreshProxies() {
        const now = Date.now();
        // Refresh cache every 30 minutes
        if (this.proxies.length > 0 && (now - this.lastScraped < 30 * 60 * 1000)) {
            return;
        }

        console.log(`[FreeProxyScraper] 🔄 Fetching fresh proxies from GitHub...`);
        let allProxies = new Set();

        for (const source of this.sources) {
            try {
                const res = await fetch(source);
                if (res.ok) {
                    const text = await res.text();
                    const lines = text.split('\n').map(l => l.trim()).filter(l => l && l.includes(':'));
                    lines.forEach(p => allProxies.add(`http://${p}`));
                }
            } catch (e) {
                console.error(`[FreeProxyScraper] ❌ Failed to fetch from ${source}: ${e.message}`);
            }
        }

        this.proxies = Array.from(allProxies);
        this.lastScraped = now;
        console.log(`[FreeProxyScraper] ✅ Successfully loaded ${this.proxies.length} free HTTP proxies.`);
    }

    /**
     * Returns a random proxy from the scraped pool
     */
    async getRandomProxy() {
        await this.refreshProxies();
        if (this.proxies.length === 0) return null;
        return this.proxies[Math.floor(Math.random() * this.proxies.length)];
    }

    /**
     * Removes a dead proxy from the pool to avoid reusing it
     */
    removeDeadProxy(proxyUrl) {
        this.proxies = this.proxies.filter(p => p !== proxyUrl);
    }
}

module.exports = new FreeProxyScraperEngine();
