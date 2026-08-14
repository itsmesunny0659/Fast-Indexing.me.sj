/**
 * Service Account Key Pooler & Round-Robin Rotator Engine
 * Allows pooling multiple Google Cloud Service Account JSON Keys to scale daily API quotas seamlessly.
 * Features a dynamic 24-hour cooldown tracker for keys that return 429 Quota limits.
 */
const { google } = require('googleapis');

class KeyPoolManager {
    constructor() {
        this.keyPool = [];
        this.currentIndex = 0;
        // Cooldown Map stores client_email -> timestamp of cooldown expiry
        this.cooldowns = new Map();
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
     * Checks if a key is in cooldown
     */
    isKeyInCooldown(email) {
        const expiry = this.cooldowns.get(email);
        if (!expiry) return false;
        if (Date.now() > expiry) {
            this.cooldowns.delete(email); // Cooldown expired, clean up
            return false;
        }
        return true;
    }

    /**
     * Gets the next active Service Account key in Round-Robin order, skipping cooldown keys
     */
    getNextKey() {
        try {
            const cacheManager = require('./cacheManager');
            const pool = cacheManager.getServiceAccountPool();
            
            if (pool && pool.length > 0) {
                // Filter out keys currently in cooldown
                const activePool = pool.filter(key => !this.isKeyInCooldown(key.client_email));
                
                if (activePool.length > 0) {
                    const key = activePool[this.currentIndex % activePool.length];
                    this.currentIndex = (this.currentIndex + 1) % activePool.length;
                    return key;
                }
            }

            // Fallback to single service account if pool is empty or all pool keys are in cooldown
            const sa = cacheManager.getServiceAccount() || (process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) : null);
            if (sa && sa.client_email && sa.private_key && !this.isKeyInCooldown(sa.client_email)) {
                return sa;
            }
        } catch (e) {
            // Ignore load error
        }

        // Check if there are keys added directly via addKeyToPool
        const directActivePool = this.keyPool.filter(key => !this.isKeyInCooldown(key.client_email));
        if (directActivePool.length > 0) {
            const key = directActivePool[this.currentIndex % directActivePool.length];
            this.currentIndex = (this.currentIndex + 1) % directActivePool.length;
            return key;
        }

        return null;
    }

    /**
     * Publishes URL notification using the rotated Key Pool.
     * Auto-detects 429 quota exhaustion, places the key in 24h cooldown, and retries with a fresh key.
     */
    async publishWithRotatedPool(targetUrl, attempt = 1) {
        const key = this.getNextKey();
        if (!key) {
            return { success: false, note: 'No active/fresh Service Account keys available in pool (All keys in cooldown)' };
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
            const msg = e.message || '';
            // Auto-detect quota error or disabled/permission issues
            const isQuotaError = msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('tooManyRequests');
            const isDeadKey = msg.includes('has not been used') || msg.includes('disabled');
            const isPermissionError = msg.includes('Permission denied');
            
            if (isQuotaError || isDeadKey || isPermissionError) {
                if (isQuotaError) {
                    console.warn(`⚠️ [KeyPoolManager] Key ${key.client_email} hit daily quota. Placing in 24h cooldown.`);
                    this.cooldowns.set(key.client_email, Date.now() + 24 * 60 * 60 * 1000); // 24 hours cooldown
                } else if (isDeadKey) {
                    console.warn(`🚨 [KeyPoolManager] Key ${key.client_email} is disabled/dead. Placing in 36h cooldown.`);
                    this.cooldowns.set(key.client_email, Date.now() + 1.5 * 24 * 60 * 60 * 1000); // 36 hours cooldown
                } else if (isPermissionError) {
                    console.warn(`🛑 [KeyPoolManager] Domain not verified for key ${key.client_email}: ${msg}. Skipping retry to protect pool.`);
                    // DO NOT put key on cooldown - it is perfectly fine for other verified domains!
                    // DO NOT retry with another key - it will just fail again and waste time.
                    return { success: false, clientEmail: key.client_email, error: 'Domain not verified in GSC for this Service Account.' };
                }
                
                // Retry with a different key ONLY if it was a quota error or dead key
                if (attempt < 5) {
                    console.log(`🔄 [KeyPoolManager] Retrying URL publish with a fresh key (Attempt ${attempt + 1})...`);
                    return this.publishWithRotatedPool(targetUrl, attempt + 1);
                }
            }
            return { success: false, clientEmail: key.client_email, error: e.message };
        }
    }

    getPoolStats() {
        const cacheManager = require('./cacheManager');
        const totalKeys = (cacheManager.getServiceAccountPool() || []).length || this.keyPool.length;
        const cooldownKeysCount = Array.from(this.cooldowns.keys()).filter(email => this.isKeyInCooldown(email)).length;
        
        return {
            totalKeys,
            activeKeys: Math.max(0, totalKeys - cooldownKeysCount),
            cooldownKeys: cooldownKeysCount,
            dailyQuotaCapacity: Math.max(0, (totalKeys - cooldownKeysCount) * 200),
            rotationIndex: this.currentIndex
        };
    }
}

module.exports = new KeyPoolManager();
