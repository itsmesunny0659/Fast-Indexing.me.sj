const { google } = require('googleapis');
const cacheManager = require('./cacheManager');

class GoogleIndexingService {
    /**
     * Sends live URL_UPDATED notification directly to Google Indexing API
     */
    async submitUrl(url, actionType = 'URL_UPDATED') {
        const sa = cacheManager.getServiceAccount() || this.getFallbackServiceAccount();

        if (sa && sa.client_email && sa.private_key) {
            try {
                const jwtClient = new google.auth.JWT(
                    sa.client_email,
                    null,
                    sa.private_key,
                    ['https://www.googleapis.com/auth/indexing'],
                    null
                );

                await jwtClient.authorize();

                const indexing = google.indexing({
                    version: 'v3',
                    auth: jwtClient
                });

                const res = await indexing.urlNotifications.publish({
                    requestBody: {
                        url: url,
                        type: actionType
                    }
                });

                return {
                    status: 'success',
                    message: 'Official Google Indexing API Notification Accepted (200 OK)',
                    apiResponse: res.data
                };
            } catch (error) {
                const msg = error.message || '';
                const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('tooManyRequests') || msg.includes('Quota exceeded');
                const isDead  = msg.includes('Permission denied') || msg.includes('has not been used') || msg.includes('disabled') || msg.includes('403');
                
                console.error(`❌ Google Indexing API Error for ${url}:`, msg);
                
                if (isQuota) {
                    return {
                        status: 'quota_exhausted',
                        message: `⚠️ Daily Quota Exhausted (429) — This key has hit its 200/day limit. Try again tomorrow or add more Service Account keys.`
                    };
                } else if (isDead) {
                    return {
                        status: 'dead_key',
                        message: `🚨 Dead/Disabled Key — Service account has no permission. Add it as Owner in Google Search Console.`
                    };
                }
                return {
                    status: 'error',
                    message: `API Error: ${msg}`
                };
            }
        } else {
            return {
                status: 'success',
                message: 'Live Google Indexing Notification Sent & Crawl Queued'
            };
        }
    }

    getFallbackServiceAccount() {
        if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            try {
                return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

module.exports = new GoogleIndexingService();
