const xml2js = require('xml2js');

class SitemapParser {
    async extractUrls(sitemapUrl) {
        try {
            const response = await fetch(sitemapUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (FastIndexingEngineBot/1.0)'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch sitemap. HTTP Status: ${response.status}`);
            }

            const xmlText = await response.text();
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(xmlText);

            const urls = [];

            // Standard <urlset><url><loc> format
            if (result.urlset && result.urlset.url) {
                for (const item of result.urlset.url) {
                    if (item.loc && item.loc[0]) {
                        urls.push(item.loc[0].trim());
                    }
                }
            } 
            // Sitemap Index <sitemapindex><sitemap><loc> format
            else if (result.sitemapindex && result.sitemapindex.sitemap) {
                for (const item of result.sitemapindex.sitemap) {
                    if (item.loc && item.loc[0]) {
                        urls.push(item.loc[0].trim());
                    }
                }
            }

            return {
                success: true,
                count: urls.length,
                urls: urls
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to parse sitemap XML'
            };
        }
    }
}

module.exports = new SitemapParser();
