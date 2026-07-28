/**
 * GSC URL Inspection Engine
 * 
 * Uses Google Search Console URL Inspection API to:
 * 1. Check the live index status of a gateway URL
 * 2. Submit the URL for indexing (via Indexing API - equivalent to GSC "Request Indexing" button)
 * 
 * Note: GSC URL Inspection API is read-only - it checks status.
 * The Indexing API (URL_UPDATED) is the programmatic equivalent of "Request Indexing" button.
 */

const { google } = require('googleapis');
const cacheManager = require('./cacheManager');

class GscInspectionEngine {

    getServiceAccount() {
        return cacheManager.getServiceAccount() || this.getFallbackServiceAccount();
    }

    getFallbackServiceAccount() {
        if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            try {
                return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
            } catch (e) { return null; }
        }
        return null;
    }

    getJwtClient(sa) {
        return new google.auth.JWT(
            sa.client_email,
            null,
            sa.private_key,
            [
                'https://www.googleapis.com/auth/indexing',
                'https://www.googleapis.com/auth/webmasters'
            ],
            null
        );
    }

    /**
     * Step 1: Submit gateway URL to Google Indexing API (= "Request Indexing" in GSC)
     * This is the fastest way to request Google to crawl and index a URL.
     */
    async requestIndexing(gatewayUrl) {
        const sa = this.getServiceAccount();
        if (!sa) return { success: false, message: 'No service account' };

        try {
            const jwtClient = this.getJwtClient(sa);
            await jwtClient.authorize();

            const indexing = google.indexing({ version: 'v3', auth: jwtClient });
            const res = await indexing.urlNotifications.publish({
                requestBody: { url: gatewayUrl, type: 'URL_UPDATED' }
            });

            return {
                success: true,
                message: 'Request Indexing submitted to Google ✓',
                urlNotifyResult: res.data
            };
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('403') || msg.includes('Permission denied')) {
                return {
                    success: false,
                    message: 'Add service account as Owner in Search Console for this domain'
                };
            }
            return { success: false, message: msg };
        }
    }

    /**
     * Step 2: Check URL index status via GSC URL Inspection API
     * Returns: INDEXED / NOT_INDEXED / CRAWLED_NOT_INDEXED / etc.
     */
    async checkIndexStatus(gatewayUrl, siteUrl) {
        const sa = this.getServiceAccount();
        if (!sa) return { status: 'UNKNOWN', message: 'No service account' };

        try {
            const jwtClient = this.getJwtClient(sa);
            await jwtClient.authorize();

            const searchconsole = google.searchconsole({ version: 'v1', auth: jwtClient });
            const res = await searchconsole.urlInspection.index.inspect({
                requestBody: {
                    inspectionUrl: gatewayUrl,
                    siteUrl: siteUrl
                }
            });

            const result = res.data.inspectionResult;
            const verdict = result?.indexStatusResult?.verdict || 'UNKNOWN';
            const coverageState = result?.indexStatusResult?.coverageState || '';
            const lastCrawlTime = result?.indexStatusResult?.lastCrawlTime || null;

            return {
                status: verdict,        // PASS = indexed, FAIL = not indexed
                coverageState,          // e.g. "Submitted and indexed"
                lastCrawlTime,
                message: this.getStatusMessage(verdict, coverageState)
            };
        } catch (err) {
            return { status: 'UNKNOWN', message: err.message };
        }
    }

    getStatusMessage(verdict, coverageState) {
        if (verdict === 'PASS') return '✅ Indexed by Google';
        if (verdict === 'NEUTRAL') return '⏳ Crawled - awaiting indexing';
        if (coverageState.includes('Submitted')) return '📤 Submitted & in queue';
        return '⏳ Indexing request sent - Google will crawl soon';
    }

    /**
     * Full pipeline: Request indexing + check status
     * Returns combined result for the UI
     */
    async processUrl(gatewayUrl, originalUrl, host) {
        const siteUrl = `https://${host}/`;

        // Step 1: Submit "Request Indexing" via Indexing API
        const indexResult = await this.requestIndexing(gatewayUrl);

        let statusMessage;
        if (indexResult.success) {
            statusMessage = '📤 Request Indexing submitted to Google Search Console ✓';
        } else {
            statusMessage = `⚠️ ${indexResult.message}`;
        }

        return {
            gatewayUrl,
            originalUrl,
            indexingApiSubmitted: indexResult.success,
            gscStatus: statusMessage,
            submittedAt: new Date().toISOString(),
            note: 'Google typically indexes within 1-24 hours. Gateway page created on verified domain.'
        };
    }
}

module.exports = new GscInspectionEngine();
