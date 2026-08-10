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

        // High-DA & Reputed Crawler User-Agents
        this.reputedBotUserAgents = [
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Googlebot-News',
            'Googlebot-Image/1.0',
            'Googlebot-Video/1.0',
            'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
            'Mozilla/5.0 (compatible; Applebot/1.0; +http://www.apple.com/go/applebot)',
            'Mozilla/5.0 (compatible; DuckDuckGo-Favicons-Bot/1.0; +http://duckduckgo.com)',
            'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            'LinkedInBot/1.0 (compatible; Mozilla/5.0; +http://www.linkedin.com/robots)',
            'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
            'Pinterestbot/1.0 (compatible; Pinterestbot/1.0; +http://www.pinterest.com/bot.html)',
            'Mozilla/5.0 (compatible; Twitterbot/1.0)',
            'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
            'Mozilla/5.0 (compatible; SeznamBot/3.2; +http://napoveda.seznam.cz/en/seznambot-intro/)',
            'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
            'Mozilla/5.0 (compatible; Qwantify/2.4rc5; +https://www.qwant.com/)',
            'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
            'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
            'Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)',
            'Mozilla/5.0 (compatible; DotBot/1.2; +https://opensiteexplorer.org/dotbot; help@moz.com)',
            'Mozilla/5.0 (compatible; Rogerbot/1.2; +http://moz.com/help/pro/mozbot-rd)',
            'Mozilla/5.0 (compatible; Screaming Frog SEO Spider/19.0)',
            'Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)',
            'Mozilla/5.0 (compatible; Mail.RU_Bot/2.0; +http://www.go.mail.ru/help/robots)',
            'Exabot/3.0; +http://www.exabot.com/go/robot',
            'Mozilla/5.0 (compatible; CocCocBot/3.2; +http://coccoc.com/bot.html)'
        ];

        this.referrers = [
            'https://www.google.com/',
            'https://news.google.com/',
            'https://t.co/',
            'https://www.reddit.com/',
            'https://www.bing.com/',
            'https://l.facebook.com/'
        ];
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
     * Registers new URLs into the continuous 5-second High-DA ping loop
     */
    registerUrls(urls) {
        urls.forEach(u => this.activeUrls.add(u));
        console.log(`🤖 [RealHumanBotDaemon] Total active URLs in 5-second High-DA Ping Loop: ${this.activeUrls.size}`);
        this.startDaemon();
    }

    /**
     * Starts the 5-Second High-DA Re-Ping Loop Daemon
     */
    startDaemon() {
        if (this.isDaemonRunning) return;
        this.isDaemonRunning = true;
        console.log('⚡ [RealHumanBotDaemon] Continuous 5-Second High-DA Re-Ping Loop Activated!');

        this.intervalId = setInterval(() => {
            this.execute5SecondTrafficPulse().catch(() => null);
        }, 5000);
        if (this.intervalId && typeof this.intervalId.unref === 'function') {
            this.intervalId.unref();
        }

        this.execute5SecondTrafficPulse().catch(() => null);
    }

    /**
     * Executes single 5-second pulse for active URLs with High-DA bot headers, unique Bot IDs, and Rotated Server IPs
     */
    async execute5SecondTrafficPulse() {
        if (this.activeUrls.size === 0) return;

        const urlList = Array.from(this.activeUrls).slice(-20); // Focus on top 20 recent URLs

        const trafficPromises = urlList.flatMap(targetUrl => {
            const botUa = this.getRandomItem(this.reputedBotUserAgents);
            const ref = this.getRandomItem(this.referrers);
            const rotatedIp = this.getProxyIP();
            const uniqueBotId = `bot_node_${Math.random().toString(36).substring(2, 10)}`;
            const encodedUrl = encodeURIComponent(targetUrl);

            return [
                // Signal 1: High-DA Reputed Bot Visit with Proxy Rotator & Rate-Limit Crash Safety
                proxyRotatorEngine.executeSafeRequest(targetUrl, {
                    headers: {
                        'User-Agent': botUa,
                        'Referer': ref,
                        'X-Forwarded-For': rotatedIp,
                        'X-Real-IP': rotatedIp,
                        'Client-IP': rotatedIp,
                        'X-Bot-Node-ID': uniqueBotId,
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'cross-site',
                        'X-News-Priority': 'urgent'
                    }
                }, 1200),

                // Signal 2: Continuous Google Webmaster Force Ping with Rotated IP & Backoff Safety
                proxyRotatorEngine.executeSafeRequest(`https://www.google.com/ping?sitemap=${encodedUrl}`, {
                    headers: {
                        'X-Forwarded-For': rotatedIp,
                        'User-Agent': botUa
                    }
                }, 1200)
            ];
        });

        await Promise.allSettled(trafficPromises);
    }
}

module.exports = new RealHumanBotDaemon();
