const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

/**
 * Enterprise Google Indexing API Rotator
 * Handles multiple GCP Service Account JSON keys to bypass the 200 URLs/day quota per account.
 * Automatically rotates accounts when quotas are hit.
 */
class GoogleIndexingApiRotator {
    constructor() {
        this.serviceAccounts = [];
        this.currentIndex = 0;
        this.quotaExhaustedAccounts = new Set();
        this.loadServiceAccounts();
    }

    /**
     * Loads all .json service account keys from the service_accounts/ directory
     */
    loadServiceAccounts() {
        const keysDir = path.join(process.cwd(), 'service_accounts');
        if (!fs.existsSync(keysDir)) {
            console.log(`[IndexingAPI] ⚠️ service_accounts folder not found.`);
            return;
        }

        const files = fs.readdirSync(keysDir).filter(f => f.endsWith('.json'));
        if (files.length === 0) {
            console.log(`[IndexingAPI] ⚠️ No JSON keys found in service_accounts/. Upload Google Cloud Service Accounts for instant indexing.`);
            return;
        }

        for (const file of files) {
            try {
                const filePath = path.join(keysDir, file);
                const keyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (keyData.client_email && keyData.private_key) {
                    this.serviceAccounts.push({
                        id: file,
                        email: keyData.client_email,
                        key: keyData.private_key,
                        authClient: new google.auth.JWT(
                            keyData.client_email,
                            null,
                            keyData.private_key,
                            ['https://www.googleapis.com/auth/indexing'],
                            null
                        )
                    });
                }
            } catch (e) {
                console.error(`[IndexingAPI] ❌ Failed to load key ${file}:`, e.message);
            }
        }

        console.log(`[IndexingAPI] ✅ Successfully loaded ${this.serviceAccounts.length} Google Service Accounts.`);
    }

    /**
     * Gets the next available Service Account that hasn't hit its daily quota
     */
    getNextAvailableAccount() {
        if (this.serviceAccounts.length === 0) return null;

        let attempts = 0;
        while (attempts < this.serviceAccounts.length) {
            const account = this.serviceAccounts[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.serviceAccounts.length;

            if (!this.quotaExhaustedAccounts.has(account.id)) {
                return account;
            }
            attempts++;
        }
        
        console.warn(`[IndexingAPI] 🛑 All loaded Service Accounts have exhausted their quotas today!`);
        return null;
    }

    /**
     * Submits a URL to the Google Indexing API
     * Type can be 'URL_UPDATED' or 'URL_DELETED'
     */
    async submitUrl(url, type = 'URL_UPDATED') {
        const account = this.getNextAvailableAccount();
        if (!account) {
            return { success: false, error: 'No available service accounts (or all quotas exhausted)' };
        }

        try {
            console.log(`[IndexingAPI] 🚀 Submitting ${url} via ${account.email}`);
            
            // Generate OAuth token
            await account.authClient.authorize();

            const indexing = google.indexing({
                version: 'v3',
                auth: account.authClient
            });

            const res = await indexing.urlNotifications.publish({
                requestBody: {
                    url: url,
                    type: type
                }
            });

            console.log(`[IndexingAPI] ✅ Google API Success: ${url} | Status: ${res.status}`);
            return { success: true, status: res.status, data: res.data };

        } catch (error) {
            console.error(`[IndexingAPI] ❌ Submission failed for ${url} via ${account.email}:`, error.message);
            
            // Handle Quota Exhaustion (Status 429)
            if (error.code === 429 || error.message.includes('Quota exceeded')) {
                console.log(`[IndexingAPI] ⚠️ Account ${account.email} hit daily quota. Removing from rotation for today.`);
                this.quotaExhaustedAccounts.add(account.id);
                // Retry with the next account immediately
                return this.submitUrl(url, type);
            }

            return { success: false, error: error.message };
        }
    }
}

module.exports = new GoogleIndexingApiRotator();
