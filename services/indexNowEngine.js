const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

class IndexNowEngine {
    constructor() {
        this.key = this.getOrGenerateKey();
        this.host = ''; 
    }

    getOrGenerateKey() {
        const keyPath = path.join(process.cwd(), 'data', 'indexnow_key.txt');
        let newKey;
        if (fs.existsSync(keyPath)) {
            newKey = fs.readFileSync(keyPath, 'utf8').trim();
        } else {
            const crypto = require('crypto');
            newKey = crypto.randomBytes(16).toString('hex');
            fs.writeFileSync(keyPath, newKey);
            console.log(`🔑 [IndexNowEngine] Generated new IndexNow key: ${newKey}`);
        }
        
        // Ensure the key file is available in the public folder for search engines to verify
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        fs.writeFileSync(path.join(publicDir, `${newKey}.txt`), newKey);
        
        return newKey;
    }

    async submitUrl(gatewayUrl, host) {
        this.host = host;
        const endpoints = [
            'https://api.indexnow.org/indexnow',
            'https://www.bing.com/indexnow',
            'https://yandex.com/indexnow'
        ];

        console.log(`🚀 [IndexNowEngine] Submitting ${gatewayUrl} to IndexNow Network...`);

        const payload = {
            host: this.host,
            key: this.key,
            keyLocation: `https://${this.host}/${this.key}.txt`,
            urlList: [gatewayUrl]
        };

        const promises = endpoints.map(async (endpoint) => {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: JSON.stringify(payload)
                });
                return { endpoint, status: res.status, ok: res.ok };
            } catch (e) {
                return { endpoint, status: 500, ok: false, error: e.message };
            }
        });

        const results = await Promise.allSettled(promises);
        let successCount = 0;
        
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value.ok) {
                successCount++;
            }
        });

        if (successCount > 0) {
            console.log(`✅ [IndexNowEngine] Successfully pinged ${successCount}/${endpoints.length} IndexNow endpoints.`);
        } else {
            console.warn(`⚠️ [IndexNowEngine] Failed to ping IndexNow endpoints.`);
        }

        return successCount > 0;
    }
}

module.exports = new IndexNowEngine();
