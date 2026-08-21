const fs = require('fs');
const path = require('path');
const https = require('https');

class TrustEngine {
    constructor() {
        this.githubToken = process.env.GITHUB_ACCESS_TOKEN || null;
        this.wpSiteUrl = process.env.WP_SITE_URL || null;
        this.wpUser = process.env.WP_USERNAME || null;
        this.wpPass = process.env.WP_APP_PASSWORD || null;
        this.bloggerKey = process.env.BLOGGER_API_KEY || null;
        this.bloggerId = process.env.BLOGGER_BLOG_ID || null;
        
        // Define path for dynamic RSS feed storage
        this.rssPath = path.join(__dirname, '..', 'public', 'trust-feed.xml');
    }

    /**
     * Entry point to fire off all tiered backlink operations asynchronously
     */
    async syndicateUrl(url) {
        console.log(`[TrustEngine] 🚀 Starting asynchronous tiered backlink syndication for: ${url}`);
        
        // Run all these concurrently in the background
        Promise.allSettled([
            this.createGithubGist(url),
            this.publishToWordPress(url),
            this.publishToBlogger(url),
            this.updateRssAndPing(url)
        ]).then(results => {
            console.log(`[TrustEngine] ✅ Syndication cycle complete for ${url}`);
            results.forEach((res, i) => {
                if(res.status === 'rejected') {
                    console.error(`[TrustEngine] ⚠️ Module ${i} failed:`, res.reason.message);
                }
            });
        });
    }

    /**
     * 1. GitHub Gist Backlink Creation
     */
    async createGithubGist(url) {
        if (!this.githubToken) {
            console.log(`[TrustEngine] ⏭️ Skipping GitHub Gist: No GITHUB_ACCESS_TOKEN provided.`);
            return;
        }

        const data = JSON.stringify({
            description: `Automated Indexing Signal for ${url}`,
            public: true,
            files: {
                "indexing_signal.md": {
                    content: `### Indexing Signal Generated\n\nTarget URL: [${url}](${url})\n\nThis is an automated signal generated to encourage crawler discovery.`
                }
            }
        });

        const options = {
            hostname: 'api.github.com',
            path: '/gists',
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${this.githubToken}`,
                'User-Agent': 'NodeJS Trust Engine',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        return this._makeRequest(options, data, 'GitHub Gist');
    }

    /**
     * 2. WordPress API Auto-Publish
     */
    async publishToWordPress(url) {
        if (!this.wpSiteUrl || !this.wpUser || !this.wpPass) {
            console.log(`[TrustEngine] ⏭️ Skipping WordPress: Missing WP_SITE_URL, WP_USERNAME, or WP_APP_PASSWORD.`);
            return;
        }

        const auth = Buffer.from(`${this.wpUser}:${this.wpPass}`).toString('base64');
        const data = JSON.stringify({
            title: `Index Signal Update - ${new Date().toISOString()}`,
            content: `A new update has been detected. Please visit the main resource here: <a href="${url}">${url}</a>.`,
            status: 'publish'
        });

        const target = new URL(`${this.wpSiteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`);
        const options = {
            hostname: target.hostname,
            path: target.pathname,
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        return this._makeRequest(options, data, 'WordPress Publish');
    }

    /**
     * 3. Blogger API Auto-Publish
     */
    async publishToBlogger(url) {
        if (!this.bloggerKey || !this.bloggerId) {
            console.log(`[TrustEngine] ⏭️ Skipping Blogger: Missing BLOGGER_API_KEY or BLOGGER_BLOG_ID.`);
            return;
        }

        // Blogger API requires OAuth2 for creating posts. 
        // As a fallback, this represents the structure. In practice, a Service Account or OAuth flow is needed for Blogger POSTs.
        console.log(`[TrustEngine] ⚠️ Blogger API requires OAuth2 token to publish. To fully automate this, we need an OAuth refresh token flow.`);
        return Promise.resolve(); 
    }

    /**
     * 4. RSS Generator & Pinging Aggregators
     */
    async updateRssAndPing(url) {
        console.log(`[TrustEngine] 📡 Updating local RSS Feed with URL: ${url}`);
        
        let existingXml = '';
        if (fs.existsSync(this.rssPath)) {
            existingXml = fs.readFileSync(this.rssPath, 'utf8');
        } else {
            // Ensure public directory exists
            const pubDir = path.dirname(this.rssPath);
            if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
            
            existingXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Trust Engine Dynamic Indexing Feed</title>
  <link>https://your-domain.com/</link>
  <description>Automated syndication feed for faster indexing.</description>
</channel>
</rss>`;
        }

        // Insert new item right after <channel>
        const newItem = `
  <item>
    <title>New Signal: ${url}</title>
    <link>${url}</link>
    <description>Discovered at ${new Date().toUTCString()}</description>
    <pubDate>${new Date().toUTCString()}</pubDate>
  </item>`;
        
        const updatedXml = existingXml.replace('<channel>', `<channel>${newItem}`);
        fs.writeFileSync(this.rssPath, updatedXml);
        
        console.log(`[TrustEngine] 📡 Pinging Feed Aggregators (Ping-O-Matic style)`);
        
        // Example Ping to FeedBurner/Google/Weblogs
        // Realistically, aggregators like Feedly will auto-poll this if the RSS URL is submitted to them once manually.
        // We can ping standard weblog endpoints:
        const rpcPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value>Trust Engine Feed</value></param>
    <param><value>https://your-domain.com/trust-feed.xml</value></param>
  </params>
</methodCall>`;
        
        const options = {
            hostname: 'rpc.pingomatic.com',
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'Content-Length': Buffer.byteLength(rpcPayload)
            }
        };

        return this._makeRequest(options, rpcPayload, 'RSS Pingomatic Ping');
    }

    _makeRequest(options, data, serviceName) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let responseBody = '';
                res.on('data', chunk => responseBody += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`[TrustEngine] ✅ ${serviceName} succeeded.`);
                        resolve(responseBody);
                    } else {
                        reject(new Error(`Status ${res.statusCode} - ${responseBody}`));
                    }
                });
            });
            req.on('error', (e) => reject(e));
            if (data) req.write(data);
            req.end();
        });
    }
}

module.exports = new TrustEngine();
