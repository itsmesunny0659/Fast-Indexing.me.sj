// Native fetch is used

class IndexabilityChecker {
    /**
     * Checks if a given URL is indexable (not blocked by robots meta tag or X-Robots-Tag header)
     * @param {string} url 
     * @returns {Promise<{isIndexable: boolean, reason?: string}>}
     */
    async checkIndexability(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            // 1. Check HTTP Headers
            const xRobotsTag = res.headers.get('x-robots-tag');
            if (xRobotsTag && xRobotsTag.toLowerCase().includes('noindex')) {
                return { isIndexable: false, reason: 'Blocked by X-Robots-Tag HTTP header' };
            }

            // 2. Check HTML Meta Tags
            if (res.ok) {
                const html = await res.text();
                // Regex to find <meta name="robots" content="noindex">
                const noindexMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["']/i) || 
                                     html.match(/<meta[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i);
                
                if (noindexMatch) {
                    return { isIndexable: false, reason: 'Blocked by <meta name="robots" content="noindex">' };
                }
            }

            return { isIndexable: true };
        } catch (error) {
            // If we can't fetch it, we assume it's indexable or the target site is temporarily down.
            // We don't want to block submission just because of a temporary network timeout on our end.
            console.warn(`[IndexabilityChecker] Could not verify ${url}: ${error.message}`);
            return { isIndexable: true };
        }
    }
}

module.exports = new IndexabilityChecker();
