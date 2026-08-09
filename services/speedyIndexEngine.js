const fetch = require('node-fetch'); // Assuming node-fetch is available, or use global fetch if Node 18+

class SpeedyIndexEngine {
    constructor() {
        // SpeedyIndex API key (Should be stored in environment variables)
        this.apiKey = process.env.SPEEDYINDEX_API_KEY || 'YOUR_API_KEY_HERE';
        this.endpoint = 'https://speedyindex.com/api/v2/links'; // Example endpoint, adjust based on actual documentation
    }

    /**
     * Submits a batch of URLs to the SpeedyIndex service.
     */
    async submitBatch(urls) {
        if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
            console.log('[SpeedyIndexEngine] Skipped: API Key not configured.');
            return { success: false, message: 'SpeedyIndex API key missing.' };
        }

        try {
            console.log(`[SpeedyIndexEngine] Submitting ${urls.length} URLs to SpeedyIndex...`);
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    links: urls
                })
            });

            if (!response.ok) {
                throw new Error(`SpeedyIndex API responded with status ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                message: 'Successfully submitted to SpeedyIndex API',
                data: data
            };
        } catch (error) {
            console.error('[SpeedyIndexEngine] API Error:', error.message);
            return { success: false, message: error.message };
        }
    }
}

module.exports = new SpeedyIndexEngine();
