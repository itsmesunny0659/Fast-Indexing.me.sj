/**
 * High-Tech Google Indexing API Multipart Batch Engine
 * Executes HTTP/2 Multiplexed Batch Payload Requests directly to Google's Batch Endpoint:
 * https://indexing.googleapis.com/batch
 */
const { google } = require('googleapis');
const keyPoolManager = require('./keyPoolManager');
const proxyRotatorEngine = require('./proxyRotatorEngine');

class GoogleBatchDelegationEngine {
    /**
     * Constructs a Multipart/Mixed Batch Request for a Batch of URLs
     */
    async executeBatchMultipartPush(urls) {
        console.log(`🚀 [GoogleBatchDelegationEngine] Preparing Multipart Batch Push for ${urls.length} URLs`);

        const key = keyPoolManager.getNextKey();
        if (!key) {
            console.log('⚠️ [GoogleBatchDelegationEngine] No active Service Account key in pool.');
            return { success: false, reason: 'NO_KEY' };
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
            const token = jwtClient.credentials.access_token;

            const boundary = '===================' + Date.now() + '==';
            let body = '';

            urls.forEach((url, i) => {
                body += `--${boundary}\r\n`;
                body += `Content-Type: application/http\r\n`;
                body += `Content-ID: <item${i + 1}>\r\n\r\n`;
                body += `POST /v3/urlNotifications:publish HTTP/1.1\r\n`;
                body += `Content-Type: application/json\r\n\r\n`;
                body += JSON.stringify({ url, type: 'URL_UPDATED' }) + `\r\n\r\n`;
            });
            body += `--${boundary}--\r\n`;

            // Route the Batch Payload through the Elite Proxy Waterfall to spoof network origins
            const res = await proxyRotatorEngine.executeSafeRequest('https://indexing.googleapis.com/batch', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': `multipart/mixed; boundary=${boundary}`
                },
                body
            }, 3000, 3); // max 3 retries per ping

            if (!res) {
                return { success: false, error: "All proxies failed for Batch Payload" };
            }

            const text = await res.text();
            return {
                success: res.ok,
                status: res.status,
                clientEmail: key.client_email,
                batchResponseLength: text.length
            };
        } catch (e) {
            console.error('❌ [GoogleBatchDelegationEngine] Error:', e.message);
            return { success: false, error: e.message };
        }
    }
}

module.exports = new GoogleBatchDelegationEngine();
