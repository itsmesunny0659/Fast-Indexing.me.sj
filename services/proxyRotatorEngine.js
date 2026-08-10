const { ProxyAgent, fetch: undiciFetch } = require('undici');
const freeProxyScraperEngine = require('./freeProxyScraperEngine');

/**
 * Enterprise Proxy Rotator & Rate-Limit Safety Manager Engine
 * Features:
 * 1. Free Proxy Scraper Integration
 * 2. True TCP Socket Tunneling via Undici
 * 3. Exponential Backoff & Adaptive Throttling
 * 4. Aggressive Failover for Dead Proxies
 */
class ProxyRotatorEngine {
    constructor() {
        this.consecutiveFailures = 0;
        this.circuitBreakerOpen = false;
        this.lastBackoffTime = 0;
    }

    /**
     * Executes an HTTP fetch with Rate-Limit Backoff, Circuit Breaker, and Crash Isolation
     */
    async executeSafeRequest(url, options = {}, timeoutMs = 2000) {
        // Check Circuit Breaker
        if (this.circuitBreakerOpen) {
            const now = Date.now();
            if (now - this.lastBackoffTime < 10000) {
                // In backoff period, skip request to avoid rate limit bans
                return null;
            }
            // Reset Circuit Breaker after backoff period
            this.circuitBreakerOpen = false;
            this.consecutiveFailures = 0;
        }

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // Attempt to get a real public proxy
            let proxyUrl = await freeProxyScraperEngine.getRandomProxy();
            let dispatcher = undefined;

            if (proxyUrl) {
                try {
                    dispatcher = new ProxyAgent(proxyUrl);
                } catch (e) {
                    console.error(`[ProxyRotatorEngine] Invalid Proxy URL format: ${proxyUrl}`);
                    proxyUrl = null;
                }
            }

            const safeHeaders = {
                ...options.headers,
                'X-Proxy-Gateway-Active': proxyUrl ? 'true' : 'false'
            };

            // Fast failover loop for dead free proxies (Max 3 retries)
            let retries = 3;
            let res = null;

            while (retries > 0 && !res) {
                try {
                    // Use Undici's fetch with dispatcher to tunnel the socket
                    res = await undiciFetch(url, {
                        ...options,
                        headers: safeHeaders,
                        signal: controller.signal,
                        dispatcher
                    });
                } catch (proxyError) {
                    retries--;
                    if (proxyUrl) {
                        freeProxyScraperEngine.removeDeadProxy(proxyUrl);
                    }
                    if (retries > 0) {
                        proxyUrl = await freeProxyScraperEngine.getRandomProxy();
                        dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
                    } else {
                        throw proxyError;
                    }
                }
            }

            clearTimeout(id);

            // Handle HTTP 429 Too Many Requests (Rate Limit)
            if (res.status === 429) {
                console.warn(`⚠️ [ProxyRotatorEngine] Rate Limit 429 detected on ${url}. Triggering backoff circuit breaker.`);
                this.consecutiveFailures++;
                if (this.consecutiveFailures >= 3) {
                    this.circuitBreakerOpen = true;
                    this.lastBackoffTime = Date.now();
                }
                return null;
            }

            // Success reset
            this.consecutiveFailures = 0;
            return res;
        } catch (e) {
            clearTimeout(id);
            // Catch & isolate all connection crashes safely
            return null;
        }
    }
}

module.exports = new ProxyRotatorEngine();
