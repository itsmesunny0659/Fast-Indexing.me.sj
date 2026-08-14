const axios = require('axios');
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
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'max-age=0',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1'
                },
                timeout: 8000, // Fast timeout, we don't want to block the submit flow
                maxRedirects: 3
            });

            if (response.status !== 200) {
                console.warn(`[StealthScraper] Non-200 status for ${url}: ${response.status}`);
                return null;
            }

            const html = response.data;
            const $ = cheerio.load(html);

            // Extract core semantic elements
            let title = $('title').text().trim();
            if (!title) title = $('h1').first().text().trim();
            if (!title) title = 'High Authority Indexing Target';

            let description = $('meta[name="description"]').attr('content') || '';
            if (!description) description = $('meta[property="og:description"]').attr('content') || '';
            
            // Extract the first few paragraphs for the content snippet (to make it look real)
            let contentSnippet = '';
            $('p').slice(0, 3).each((i, el) => {
                const text = $(el).text().trim();
                if (text.length > 20) {
                    contentSnippet += text + ' ';
                }
            });

            // Clean up the snippet
            contentSnippet = contentSnippet.trim().substring(0, 600); // Keep it concise but substantial
            
            if (!description) {
                description = contentSnippet.substring(0, 150) + (contentSnippet.length > 150 ? '...' : '');
            }

            const snapshot = {
                title,
                description,
                contentSnippet: contentSnippet || `Detailed analysis and semantic information regarding ${title}.`,
                scrapedAt: new Date().toISOString()
            };

            console.log(`[StealthScraper] Successfully scraped snapshot for: ${url}`);
            return snapshot;

        } catch (error) {
            console.warn(`[StealthScraper] Failed to fetch ${url}: ${error.message}`);
            return null; // Silent fail, we will fallback to generic data
        }
    }
}

module.exports = new StealthScraperEngine();
