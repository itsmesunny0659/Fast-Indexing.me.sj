/**
 * Gateway Indexing Engine
 * 
 * Creates a unique gateway page URL on our own Vercel domain for any submitted URL
 * (third-party or own). Then submits THAT gateway URL directly to Google Indexing API.
 * 
 * This works because:
 * 1. The gateway page is on OUR domain (verified in Search Console)
 * 2. Google crawls the gateway page (which it can verify ownership of)
 * 3. The gateway page has do-follow links to the original URL
 * 4. Google follows the link and indexes the original target
 */

const { google } = require('googleapis');
const cacheManager = require('./cacheManager');

class GatewayIndexingEngine {
    /**
     * Creates a gateway URL and submits it to Google Indexing API
     * @param {string} originalUrl - The original URL to index (can be any domain)
     * @param {string} urlId - The unique ID for the gateway page
     * @param {string} host - The host of our server (Vercel domain)
     */
    async submitGatewayUrl(originalUrl, urlId, host) {
        const gatewayUrl = `https://${host}/i/${urlId}`;

        const sa = cacheManager.getServiceAccount() || this.getFallbackServiceAccount();

        if (!sa || !sa.client_email || !sa.private_key) {
            return { status: 'skipped', message: 'No service account configured' };
        }

        try {
            const jwtClient = new google.auth.JWT(
                sa.client_email,
                null,
                sa.private_key,
                ['https://www.googleapis.com/auth/indexing'],
                null
            );

            await jwtClient.authorize();

            const indexing = google.indexing({ version: 'v3', auth: jwtClient });

            // Submit the GATEWAY URL (on our verified domain) to Google Indexing API
            const res = await indexing.urlNotifications.publish({
                requestBody: {
                    url: gatewayUrl,
                    type: 'URL_UPDATED'
                }
            });

            console.log(`✅ Gateway indexed: ${gatewayUrl} -> ${originalUrl}`);

            return {
                status: 'success',
                gatewayUrl,
                originalUrl,
                message: 'Gateway URL submitted to Google Indexing API',
                apiResponse: res.data
            };

        } catch (error) {
            const msg = error.message || '';
            
            // 403 = not verified in Search Console (need to add service account as Owner)
            if (msg.includes('403') || msg.includes('Permission denied')) {
                console.warn(`⚠️  GSC Owner not set for ${host}. Add service account as Owner in Search Console.`);
                return { status: 'permission_denied', message: 'Add service account as Owner in Search Console for: ' + host };
            }

            console.error(`Gateway indexing error for ${gatewayUrl}:`, msg);
            return { status: 'error', message: msg };
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

module.exports = new GatewayIndexingEngine();
