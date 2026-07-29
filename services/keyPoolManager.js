/**
 * Service Account Key Pooler & Round-Robin Rotator Engine
 * Allows pooling multiple Google Cloud Service Account JSON Keys to scale daily API quotas seamlessly
 */
const { google } = require('googleapis');

class KeyPoolManager {
    constructor() {
        this.keyPool = [];
        this.currentIndex = 0;
    }

    /**
     * Adds a Service Account JSON Key to the rotation pool
     */
    addKeyToPool(jsonKeyObj) {
        if (jsonKeyObj && jsonKeyObj.client_email && jsonKeyObj.private_key) {
            this.keyPool.push(jsonKeyObj);
            console.log(`🔑 [KeyPoolManager] Key added to pool! Total active keys: ${this.keyPool.length}`);
            return true;
        }
        return false;
    }

    /**
     * Gets the next Service Account key in Round-Robin order
     */
    getNextKey() {
        if (this.keyPool.length === 0) {
            // Dynamically load fallback serviceAccount key from cacheManager db
            try {
                const cacheManager = require('./cacheManager');
                const sa = cacheManager.getServiceAccount() || (process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) : null);
                if (sa && sa.client_email && sa.private_key) {
                    return sa;
                }
            } catch (e) {
                // Ignore load error
            }
            return null;
        }
        const key = this.keyPool[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keyPool.length;
        return key;
    }

    /**
     * Publishes URL notification using the rotated Key Pool
     */
    async publishWithRotatedPool(targetUrl) {
        const key = this.getNextKey();
        if (!key) {
            return { success: false, note: 'No Service Account keys in pool' };
        }

        try {
            const jwtClient = new google.auth.JWT(
                key.client_email,
                null,
                key.private_key,
                ['https://www.googleapis.com/auth/indexing'],
                null
            );
            await jwtClient.authorize();
            const indexing = google.indexing({ version: 'v3', auth: jwtClient });

            const res = await indexing.urlNotifications.publish({
                requestBody: { url: targetUrl, type: 'URL_UPDATED' }
            });

            return { success: true, clientEmail: key.client_email, apiData: res.data };
        } catch (e) {
            return { success: false, clientEmail: key.client_email, error: e.message };
        }
    }

    getPoolStats() {
        return {
            totalActiveKeys: this.keyPool.length,
            dailyQuotaCapacity: this.keyPool.length * 200,
            rotationIndex: this.currentIndex
        };
    }
}

module.exports = new KeyPoolManager();
