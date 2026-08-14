const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

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

        let browser = null;
        try {
            console.log(`[StealthScraper] Initiating Puppeteer fetch for: ${url}`);
            
            // Serverless Puppeteer Config using Sparticuz Chromium
            browser = await puppeteer.launch({
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });

            const page = await browser.newPage();
            await page.setUserAgent(this.getRandomUserAgent());
            
            // Block heavy resources for speed
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Navigate and wait for DOM
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });

            // Extract semantic data directly from the DOM
            const snapshotData = await page.evaluate(() => {
                let title = document.querySelector('title')?.innerText.trim() || document.querySelector('h1')?.innerText.trim() || 'High Authority Indexing Target';
                
                let descMeta = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
                let description = descMeta ? descMeta.getAttribute('content') : '';

                let paragraphs = Array.from(document.querySelectorAll('p'))
                                      .map(p => p.innerText.trim())
                                      .filter(text => text.length > 20)
                                      .slice(0, 3)
                                      .join(' ');
                
                let contentSnippet = paragraphs.substring(0, 600);
                if (!description) {
                    description = contentSnippet.substring(0, 150) + (contentSnippet.length > 150 ? '...' : '');
                }

                return { title, description, contentSnippet };
            });

            const snapshot = {
                ...snapshotData,
                contentSnippet: snapshotData.contentSnippet || `Detailed analysis and semantic information regarding ${snapshotData.title}.`,
                scrapedAt: new Date().toISOString()
            };

            console.log(`[StealthScraper] ✅ Successfully scraped snapshot via Puppeteer for: ${url}`);
            return snapshot;

        } catch (error) {
            console.warn(`[StealthScraper] ⚠️ Failed to fetch ${url} via Puppeteer: ${error.message}`);
            return null;
        } finally {
            if (browser !== null) {
                await browser.close();
            }
        }
    }
}

module.exports = new StealthScraperEngine();
