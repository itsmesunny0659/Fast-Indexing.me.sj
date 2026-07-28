/**
 * Verified Gateway Delegation & SERP Indexing Engine
 * Implements Commercial Verified Gateway Architecture:
 * 1. Creates High-DA Gateway Page on verified domain (/i/:urlId)
 * 2. Pushes Gateway URL directly to Google Indexing API via Service Account
 * 3. Injects target URL as Canonical & Do-Follow Anchor
 * 4. Triggers Google WebSub Hub (pubsubhubbub.appspot.com) Push
 * 5. Syncs with W3C Atom Feed, News Sitemap, and HTML Gateway Index
 */
const cacheManager = require('./cacheManager');
const googleIndexing = require('./googleIndexing');
const keyPoolManager = require('./keyPoolManager');

class VerifiedGatewayDelegationEngine {
    async fetchWithTimeout(url, options = {}, timeoutMs = 2000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            return res;
        } catch (e) {
            clearTimeout(id);
            return null;
        }
    }

    /**
     * Executes Commercial Verified Gateway Indexing Delegation Pipeline
     */
    async executeVerifiedGatewayIndexing(targetUrl, urlId, host = 'ai-fast-indexing-engine.vercel.app') {
        console.log(`🏛️ [VerifiedGatewayDelegationEngine] Executing Verified Gateway Delegation for: ${targetUrl}`);

        const gatewayUrl = `https://${host}/i/${urlId}`;
        const sitemapUrl = `https://${host}/sitemap.html`;
        const atomUrl = `https://${host}/atom.xml`;

        // Step 1: Submit Verified Gateway URL directly to Google Indexing API
        const apiResult = await googleIndexing.submitUrl(gatewayUrl, 'URL_UPDATED').catch(() => null);
        const poolResult = await keyPoolManager.publishWithRotatedPool(gatewayUrl).catch(() => null);

        // Step 2: Trigger Google WebSub Hub (PubSubHubbub) Instant Push Notification
        const webSubParams = new URLSearchParams();
        webSubParams.append('hub.mode', 'publish');
        webSubParams.append('hub.url', atomUrl);

        const webSubPromise = this.fetchWithTimeout('https://pubsubhubbub.appspot.com/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: webSubParams.toString()
        });

        // Step 3: Trigger High-Velocity Webmaster Sitemap & Headless Chrome Pings
        const pingPromises = [
            this.fetchWithTimeout(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`),
            this.fetchWithTimeout(`https://www.google.com/ping?sitemap=${encodeURIComponent(atomUrl)}`),
            this.fetchWithTimeout(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(gatewayUrl)}&strategy=mobile`)
        ];

        await Promise.allSettled([webSubPromise, ...pingPromises]);

        return {
            targetUrl,
            gatewayUrl,
            status: 'verified_gateway_indexing_executed',
            googleApiDirectSubmitted: !!apiResult,
            webSubPushDispatched: true,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new VerifiedGatewayDelegationEngine();
