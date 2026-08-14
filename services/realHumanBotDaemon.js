/**
 * Continuous High-DA Reputed Bot Traffic, Rotating Server IP & Google Re-Ping Daemon
 * Continuously pings Google Webmaster endpoints and sends High-DA Reputed Crawler Signals
 * (Googlebot, Bingbot, Applebot, DuckDuckBot, FacebookExternalHit, LinkedInBot)
 * with Unique Bot IDs, Rotated Proxy IP Headers (X-Forwarded-For, Client-IP), and Server Node Emulation every 5 seconds.
 */
const proxyRotatorEngine = require('./proxyRotatorEngine');

class RealHumanBotDaemon {
    constructor() {
        this.activeUrls = new Set();
        this.intervalId = null;
        this.isDaemonRunning = false;

        // ✅ REAL browser UAs — not fake bot spoofing
        // Real UAs pass server bot-detection and register in access logs as human traffic
        this.reputedBotUserAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
            'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36'
        ];

        // ✅ Real Google search referrers — make traffic look organic in server logs
        this.referrers = [
            'https://www.google.com/search?q=breaking+news',
            'https://news.google.com/',
            'https://www.google.com/search?q=latest+updates&tbm=nws',
            'https://www.google.com/',
            'https://t.co/',
            'https://www.reddit.com/r/news/',
            'https://l.facebook.com/',
            'https://www.bing.com/search?q=news'
        ];

        // GA4 config
        this.ga4MeasurementId = process.env.GA4_MEASUREMENT_ID || null;
        this.ga4ApiSecret     = process.env.GA4_API_SECRET || null;
    }

    getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Generates a random IP address to simulate global rotating proxy
     */
    getProxyIP() {
        // Elite Residential & 5G Mobile ISP IP Blocks (AT&T, Verizon, T-Mobile, Comcast, Spectrum)
        const firstOctets = [24, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 97, 98, 99, 104, 107, 108, 173, 174];
        const octet1 = firstOctets[Math.floor(Math.random() * firstOctets.length)];
        const octet2 = Math.floor(Math.random() * 256);
        const octet3 = Math.floor(Math.random() * 256);
        const octet4 = Math.floor(Math.random() * 254) + 1; // 1-254
        return `${octet1}.${octet2}.${octet3}.${octet4}`;
    }

    /**
     * Registers new URLs into the continuous High-DA ping loop and executes an intense immediate pulse
     */
    async registerUrls(urls) {
        urls.forEach(u => this.activeUrls.add(u));
        console.log(`🤖 [RealHumanBotDaemon] Total active URLs in High-DA Ping Loop: ${this.activeUrls.size}`);
        
        // Serverless Execution Guard: Execute 3 intense parallel pulses immediately
        // so they run within the Vercel execution window before the container is frozen
        try {
            await this.execute5SecondTrafficPulse();
            await new Promise(r => setTimeout(r, 300));
            await this.execute5SecondTrafficPulse();
            await new Promise(r => setTimeout(r, 300));
            await this.execute5SecondTrafficPulse();
        } catch (e) {
            console.error('RealHumanBotDaemon Immediate Pulse Error:', e.message);
        }

        this.startDaemon();
    }

    /**
     * Starts the 5-Second High-DA Re-Ping Loop Daemon (Best effort for serverless keep-alive)
     */
    startDaemon() {
        if (this.isDaemonRunning) return;
        this.isDaemonRunning = true;
        console.log('⚡ [RealHumanBotDaemon] Continuous Re-Ping Loop Activated!');

        this.intervalId = setInterval(() => {
            this.execute5SecondTrafficPulse().catch(() => null);
        }, 5000);
        if (this.intervalId && typeof this.intervalId.unref === 'function') {
            this.intervalId.unref();
        }
    }

    /**
     * 🔥 REAL 5-second traffic pulse:
     * 1. Sends real HTTP visits with proper browser UA + Google referrer
     * 2. Sends GA4 Measurement Protocol pageview (registers in Google Analytics)
     * 3. Pings Google/Bing with the target URL
     */
    async execute5SecondTrafficPulse() {
        if (this.activeUrls.size === 0) return;

        const urlList = Array.from(this.activeUrls).slice(-20);

        const trafficPromises = urlList.flatMap(targetUrl => {
            const ua  = this.getRandomItem(this.reputedBotUserAgents);
            const ref = this.getRandomItem(this.referrers);
            const encoded = encodeURIComponent(targetUrl);

            const tasks = [
                // ✅ Signal 1: Real browser HTTP visit with Google referrer
                proxyRotatorEngine.executeSafeRequest(targetUrl, {
                    headers: {
                        'User-Agent': ua,
                        'Referer': ref,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'cross-site',
                        'Upgrade-Insecure-Requests': '1'
                    }
                }, 2000),

                // ✅ Signal 2: Google sitemap ping
                fetch(`https://www.google.com/ping?sitemap=${encoded}`, {
                    headers: { 'User-Agent': ua, 'X-Proxy-Bypass': 'true' }
                }).catch(() => null),

                // ✅ Signal 3: Bing sitemap ping
                fetch(`https://www.bing.com/ping?sitemap=${encoded}`, {
                    headers: { 'User-Agent': ua, 'X-Proxy-Bypass': 'true' }
                }).catch(() => null)
            ];

            // ✅ Signal 4: GA4 Measurement Protocol pageview (if configured)
            if (this.ga4MeasurementId && this.ga4ApiSecret) {
                const clientId = `${Math.floor(Math.random() * 2147483647)}.${Math.floor(Date.now() / 1000)}`;
                const ga4Payload = {
                    client_id: clientId,
                    events: [{
                        name: 'page_view',
                        params: {
                            page_location: targetUrl,
                            page_referrer: ref,
                            engagement_time_msec: String(Math.floor(Math.random() * 30000) + 10000)
                        }
                    }]
                };
                tasks.push(
                    fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${this.ga4MeasurementId}&api_secret=${this.ga4ApiSecret}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Proxy-Bypass': 'true' },
                        body: JSON.stringify(ga4Payload)
                    }).catch(() => null)
                );
            }

            return tasks;
        });

        await Promise.allSettled(trafficPromises);
        console.log(`[RealHumanBotDaemon] ✅ Pulse complete. URLs: ${urlList.length} | GA4: ${this.ga4MeasurementId ? 'ON' : 'OFF (set GA4_MEASUREMENT_ID)'}`);
    }
}

module.exports = new RealHumanBotDaemon();
