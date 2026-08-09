const puppeteer = require('puppeteer');
const useProxy = require('puppeteer-page-proxy');
const UserAgent = require('user-agents');

let isRunning = false;
let testInterval = null;
let currentUrl = '';
let currentProxies = [];
let totalVisits = 0;
let successfulVisits = 0;
let failedVisits = 0;

async function simulateHumanInteraction(page) {
    try {
        console.log("   -> Simulating human scroll...");
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                let distance = 100;
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 2000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        await new Promise(r => setTimeout(r, Math.random() * 2000 + 1000));
        console.log("   -> Attempting to click elements...");
        
        const clickTargets = ['play', 'video', 'read more', 'next', 'contact us'];
        const clicked = await page.evaluate((targets) => {
            // Try playing HTML5 videos first
            const videos = document.querySelectorAll('video');
            let videoPlayed = false;
            for (let v of videos) {
                try {
                    v.scrollIntoView();
                    v.play();
                    videoPlayed = true;
                } catch(e) {}
            }
            if (videoPlayed) return "video";

            const elements = Array.from(document.querySelectorAll('a, button, div, span'));
            for (let el of elements) {
                const text = (el.innerText || '').toLowerCase();
                const className = (el.className || '').toLowerCase();
                const id = (el.id || '').toLowerCase();
                
                for (let target of targets) {
                    if (text.includes(target) || className.includes(target) || id.includes(target)) {
                        el.scrollIntoView();
                        el.click();
                        return true;
                    }
                }
            }
            
            // Optionally click an image
            const images = Array.from(document.querySelectorAll('img'));
            if (images.length > 0 && Math.random() > 0.5) {
                const randomImg = images[Math.floor(Math.random() * images.length)];
                randomImg.scrollIntoView();
                randomImg.click();
                return true;
            }
            
            return false;
        }, clickTargets);

        if (clicked === "video") {
            console.log("   -> Video playing! Watching for 30-40 seconds to test load...");
            await new Promise(r => setTimeout(r, Math.random() * 10000 + 30000));
        } else if (clicked) {
            console.log("   -> Click successful! Waiting for action to complete...");
            await new Promise(r => setTimeout(r, Math.random() * 3000 + 2000));
        } else {
            console.log("   -> No target elements found to click.");
        }
    } catch (error) {
        console.log("   -> Interaction simulation skipped or failed:", error.message);
    }
}

async function visitWebsite(targetUrl, proxyUrl) {
    let browser;
    try {
        const userAgent = new UserAgent();
        browser = await puppeteer.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
        });

        const page = await browser.newPage();
        await page.setUserAgent(userAgent.toString());

        if (proxyUrl) {
            await useProxy(page, proxyUrl);
        }

        console.log(`[Visit] URL: ${targetUrl} | Proxy: ${proxyUrl || 'Direct'} | UA: ${userAgent.data.browser}`);
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 });
        
        // --- Simulate human interactions ---
        await simulateHumanInteraction(page);
        
        const waitTime = Math.floor(Math.random() * 5000) + 3000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        successfulVisits++;
        console.log(`[Success] Visit recorded.`);
    } catch (error) {
        failedVisits++;
        console.error(`[Error] Visit failed:`, error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

function startLoadTest(url, proxies) {
    if (isRunning) return;
    
    isRunning = true;
    currentUrl = url;
    currentProxies = proxies;
    totalVisits = 0;
    successfulVisits = 0;
    failedVisits = 0;

    console.log(`🚀 Starting load test for ${url}`);
    
    // Trigger immediately
    triggerVisit();
    
    // Then every 60 seconds (to prevent system overload)
    testInterval = setInterval(triggerVisit, 60000);
}

function triggerVisit() {
    if (!isRunning) return;
    totalVisits++;
    const randomProxy = currentProxies.length > 0 ? currentProxies[Math.floor(Math.random() * currentProxies.length)] : null;
    visitWebsite(currentUrl, randomProxy);
}

function stopLoadTest() {
    isRunning = false;
    if (testInterval) {
        clearInterval(testInterval);
        testInterval = null;
    }
    console.log("🛑 Load test stopped.");
}

function getStatus() {
    return {
        isRunning,
        url: currentUrl,
        stats: {
            total: totalVisits,
            success: successfulVisits,
            failed: failedVisits
        }
    };
}

module.exports = {
    startLoadTest,
    stopLoadTest,
    getStatus
};
