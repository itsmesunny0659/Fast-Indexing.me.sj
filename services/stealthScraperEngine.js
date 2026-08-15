const cheerio = require('cheerio');

class StealthScraperEngine {
    constructor() {
        // High authority rotating user agents to bypass WAFs
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
        ];
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async fetchSemanticSnapshot(url) {
        if (!url || !url.startsWith('http')) return null;

        try {
            console.log(`[StealthScraper] Initiating fetch for: ${url}`);
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'max-age=0'
                },
                signal: AbortSignal.timeout(8000)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            let title = $('title').text().trim() || $('h1').first().text().trim() || 'High Authority Indexing Target';
            
            let description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

            let paragraphs = [];
            $('p').each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 20) {
                    paragraphs.push(text);
                }
            });
            
            let contentSnippet = paragraphs.slice(0, 3).join(' ').substring(0, 600);
            
            if (!description) {
                description = contentSnippet.substring(0, 150) + (contentSnippet.length > 150 ? '...' : '');
            }

            const snapshotData = { title, description, contentSnippet };

            const snapshot = {
                ...snapshotData,
                contentSnippet: snapshotData.contentSnippet || `Detailed analysis and semantic information regarding ${snapshotData.title}.`,
                scrapedAt: new Date().toISOString()
            };

            console.log(`[StealthScraper] ✅ Successfully scraped snapshot via Cheerio for: ${url}`);
            return snapshot;

        } catch (error) {
            console.warn(`[StealthScraper] ⚠️ Failed to fetch ${url} via Cheerio: ${error.message}`);
            return null;
        }
    }
}

module.exports = new StealthScraperEngine();
