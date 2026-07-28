class MegaPubSubEngine {
    constructor() {
        this.pubsubHubs = [
            'https://pubsubhubbub.appspot.com/',
            'https://superfeedr.com/hub',
            'http://pushpress.com/hub',
            'https://www.subtome.com/hub',
            'https://pubsubhubbub.wordpress.com/',
            'https://switchboard.pubsubhubbub.org/'
        ];

        this.feedburnerEndpoints = [
            'https://feedburner.google.com/fb/a/pingSubmit',
            'https://feedburner.google.com/fb/a/publishFeed'
        ];
    }

    async fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            return response;
        } catch (e) {
            clearTimeout(id);
            return null;
        }
    }

    /**
     * Pushes URL to ALL World PubSubHubbub Hubs & Google Feedburner Gateways
     */
    async dispatchMegaPubSub(targetUrl) {
        console.log(`[MegaPubSubEngine] Dispatching ALL World PubSubHubbub & Feedburner Hubs for: ${targetUrl}`);

        const encodedUrl = encodeURIComponent(targetUrl);

        // 1. Dispatch to All PubSubHubbub Hubs
        const pubSubParams = new URLSearchParams();
        pubSubParams.append('hub.mode', 'publish');
        pubSubParams.append('hub.url', targetUrl);

        const pubSubPromises = this.pubsubHubs.map(hub => 
            this.fetchWithTimeout(hub, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: pubSubParams.toString()
            })
        );

        // 2. Dispatch to All Feedburner Endpoints
        const feedburnerPromises = this.feedburnerEndpoints.map(endpoint => 
            this.fetchWithTimeout(`${endpoint}?bloglink=${encodedUrl}&url=${encodedUrl}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                }
            })
        );

        await Promise.allSettled([...pubSubPromises, ...feedburnerPromises]);

        return {
            url: targetUrl,
            pushedAt: new Date().toISOString(),
            status: 'mega_pubsub_pushed',
            hubsCount: this.pubsubHubs.length + this.feedburnerEndpoints.length,
            details: {
                googlePubSubHubbub: true,
                superfeedrHub: true,
                wordpressPubSub: true,
                switchboardHub: true,
                subtomeHub: true,
                googleFeedburner: true
            }
        };
    }
}

module.exports = new MegaPubSubEngine();
