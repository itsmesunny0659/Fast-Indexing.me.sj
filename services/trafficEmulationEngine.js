const puppeteer = require('puppeteer-core');
const { addExtra } = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const puppeteerExtra = addExtra(puppeteer);
puppeteerExtra.use(StealthPlugin());

class TrafficEmulationEngine {
    constructor() {
        // Use the Browserless.io API Key provided by the user
        this.browserlessApiKey = process.env.BROWSERLESS_API_KEY || '2V73xUyFhENuzUY0702bd47da455ac0793f24bb4a75c107d1';
        
        // Emulated "Residential" Carriers/Networks as requested by user
        this.residentialNetworks = [
            { name: 'Jio 4G', ua: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36', headers: { 'Via': '1.1 jio.com', 'X-Forwarded-For': this._randomJioIp() } },
            { name: 'Airtel Broadband', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', headers: { 'Via': '1.1 airtel.in', 'X-Forwarded-For': this._randomAirtelIp() } },
            { name: 'Facebook/Meta In-App', ua: 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36 [FBAN/EMA;FBAV/346.0.0.7.76;]', headers: { 'X-Requested-With': 'com.facebook.katana', 'X-Forwarded-For': this._randomGenericIp() } },
            { name: 'Google Network Library', ua: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36 GSA/14.28.14.28', headers: { 'X-Requested-With': 'com.google.android.googlequicksearchbox', 'X-Forwarded-For': this._randomGenericIp() } },
            { name: 'Public WiFi (Coffee Shop)', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15', headers: { 'X-Forwarded-For': this._randomGenericIp() } }
        ];
    }

    _randomJioIp() { return `49.43.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`; }
    _randomAirtelIp() { return `122.161.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`; }
    _randomGenericIp() { return `${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`; }

    /**
     * Executes the Headless Emulation Flow via Browserless Cloud
     */
    async emulateOrganicTraffic(targetUrl) {
        console.log(`[TrafficEmulation] 🚀 Starting Headless Chrome Emulation for: ${targetUrl}`);
        
        let browser = null;
        try {
            // Connect to Browserless using the API key
            const wsEndpoint = `wss://chrome.browserless.io?token=${this.browserlessApiKey}`;
            
            console.log(`[TrafficEmulation] 🔗 Connecting to Browserless Cluster...`);
            browser = await puppeteerExtra.connect({ 
                browserWSEndpoint: wsEndpoint,
                defaultViewport: null 
            });

            const page = await browser.newPage();
            
            // 1. Spoof Residential Network Profile
            const profile = this.residentialNetworks[Math.floor(Math.random() * this.residentialNetworks.length)];
            console.log(`[TrafficEmulation] 🎭 Spoofing Network Profile: ${profile.name}`);
            
            await page.setUserAgent(profile.ua);
            await page.setExtraHTTPHeaders(profile.headers);

            // 2. Navigate to Google organically
            console.log(`[TrafficEmulation] 🔍 Navigating to Google...`);
            await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });

            // 3. Type search query (URL or related term) to simulate human typing
            const searchBox = await page.$('input[name="q"], textarea[name="q"]');
            if (searchBox) {
                const query = `info:${targetUrl}`;
                await searchBox.type(query, { delay: Math.random() * 100 + 50 });
                await Promise.all([
                    page.keyboard.press('Enter'),
                    page.waitForNavigation({ waitUntil: 'networkidle2' })
                ]);
            } else {
                console.log(`[TrafficEmulation] ⚠️ Could not find Google search box, jumping direct to URL.`);
                await page.goto(targetUrl, { waitUntil: 'networkidle2' });
            }

            // 4. Click the target link in SERP
            const targetHostname = new URL(targetUrl).hostname;
            console.log(`[TrafficEmulation] 🖱️ Looking for organic link to click (${targetHostname})...`);
            
            const linkHandlers = await page.$$('a');
            let clicked = false;
            for (const handler of linkHandlers) {
                const href = await page.evaluate(el => el.href, handler);
                if (href && href.includes(targetHostname) && !href.includes('google.com')) {
                    await Promise.all([
                        handler.click(),
                        page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => null)
                    ]);
                    clicked = true;
                    console.log(`[TrafficEmulation] ✅ Clicked organic SERP link successfully.`);
                    break;
                }
            }
            
            if (!clicked) {
                console.log(`[TrafficEmulation] ⚠️ Link not in SERP yet. Falling back to direct navigation for dwell time.`);
                await page.goto(targetUrl, { waitUntil: 'networkidle2' });
            }

            // 5. Emulate Human Dwell Time (Scroll, Read)
            console.log(`[TrafficEmulation] 📜 Emulating human reading behavior...`);
            for (let i = 0; i < 3; i++) {
                await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
                await new Promise(r => setTimeout(r, Math.random() * 2000 + 1000));
            }

            console.log(`[TrafficEmulation] 🎉 Headless Emulation Complete for: ${targetUrl}`);

        } catch (error) {
            console.error(`[TrafficEmulation] ❌ Error during emulation:`, error.message);
        } finally {
            if (browser) {
                await browser.close();
                console.log(`[TrafficEmulation] 🔌 Disconnected from Browserless.`);
            }
        }
    }
}

module.exports = new TrafficEmulationEngine();
