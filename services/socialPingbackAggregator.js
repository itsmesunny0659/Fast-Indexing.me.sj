const proxyRotatorEngine = require('./proxyRotatorEngine');

class SocialPingbackAggregator {
    constructor() {
        this.pingbackEndpoints = [
            'https://pingomatic.com/ping/',
            'https://www.pingler.com/',
            'https://pingback.me/api/ping',
            'https://pingback.link/ping'
        ];
    }

    /**
     * Sends micro-signals representing simulated social sharing & pingbacks
     */
    async triggerSocialPingbacks(gatewayUrl) {
        console.log(`📣 [SocialPingbackAggregator] Dispatching Web 2.0 Pingbacks for: ${gatewayUrl}`);

        const promises = this.pingbackEndpoints.map(endpoint => {
            const body = new URLSearchParams({
                url: gatewayUrl,
                title: 'Instant Indexing Request Node',
                format: 'json'
            }).toString();

            return proxyRotatorEngine.executeSafeRequest(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body
            }, 3000, 2).catch(() => null);
        });

        await Promise.allSettled(promises);

        return {
            gatewayUrl,
            endpointsFired: this.pingbackEndpoints.length,
            status: 'social_pingbacks_dispatched',
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new SocialPingbackAggregator();
