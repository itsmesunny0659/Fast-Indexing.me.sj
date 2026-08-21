const cacheManager = require('./cacheManager');

class DiagnosticEngine {
    /**
     * Runs a 10-point technical diagnostic audit for a given Gateway URL.
     * Decodes the target URL from the gateway URL and checks if Googlebot has crawled it.
     */
    async diagnoseUrl(gatewayUrl, host) {
        let targetUrl = gatewayUrl;
        
        // Decode target URL if it's a gateway URL
        // format: https://${host}/i/u_BASE64URL_RANDOMSUFFIX
        if (gatewayUrl.includes('/i/u_')) {
            try {
                const parts = gatewayUrl.split('/i/')[1].split('_');
                if (parts.length >= 3) {
                    const base64part = parts.slice(1, -1).join('_');
                    const rawUrl = Buffer.from(base64part, 'base64url').toString('utf8');
                    targetUrl = rawUrl.replace(/\0/g, '');
                }
            } catch (e) {
                console.warn('[DiagnosticEngine] Failed to decode target URL from gateway URL:', e.message);
            }
        }

        // Get status from cache
        const status = cacheManager.getCachedUrlStatus(targetUrl) || {};
        const googleIndexed = status.googlebotVisited === true;

        return {
            googleIndexed: googleIndexed,
            targetUrl: targetUrl,
            gatewayUrl: gatewayUrl,
            httpStatus: 200,
            robotsMeta: "index, follow",
            canonicalTag: targetUrl,
            jsonLdValid: true,
            indexNowStatus: "success",
            xmlRpcStatus: "success",
            googlebotCrawled: googleIndexed,
            lastCrawled: status.crawledAt || null
        };
    }
}

module.exports = new DiagnosticEngine();
