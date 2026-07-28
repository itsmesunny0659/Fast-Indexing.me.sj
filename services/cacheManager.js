const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/db.json');

class CacheManager {
    constructor() {
        this.data = {
            credits: 1000,
            jobs: [],
            recentUrls: [],
            urlCache: {},
            serviceAccount: null
        };
        this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf-8');
                this.data = { ...this.data, ...JSON.parse(raw) };
            }
        } catch (e) {
            console.warn('Using in-memory cache storage');
        }
    }

    saveData() {
        try {
            const dir = path.dirname(DATA_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
        } catch (e) {
            // Memory mode on Vercel read-only filesystem
        }
    }

    getCredits() {
        return this.data.credits || 1000;
    }

    addCredits(amount) {
        this.data.credits = (this.data.credits || 1000) + amount;
        this.saveData();
        return this.data.credits;
    }

    deductCredits(amount) {
        this.data.credits = Math.max(0, (this.data.credits || 1000) - amount);
        this.saveData();
        return true;
    }

    getCachedUrlStatus(url) {
        return this.data.urlCache[url] || null;
    }

    setCachedUrlStatus(url, statusObj) {
        this.data.urlCache[url] = {
            ...statusObj,
            updatedAt: new Date().toISOString()
        };

        // Add to recent RSS URLs list
        if (!this.data.recentUrls.includes(url)) {
            this.data.recentUrls.unshift(url);
            if (this.data.recentUrls.length > 200) {
                this.data.recentUrls = this.data.recentUrls.slice(0, 200);
            }
        }

        this.saveData();
    }

    getRecentUrls() {
        return this.data.recentUrls || [];
    }

    saveJobResult(jobId, resultsSummary) {
        this.data.jobs.unshift({
            jobId,
            timestamp: new Date().toISOString(),
            ...resultsSummary
        });
        if (this.data.jobs.length > 50) {
            this.data.jobs = this.data.jobs.slice(0, 50);
        }
        this.saveData();
    }

    getRecentJobs() {
        return this.data.jobs || [];
    }

    setServiceAccount(jsonObj) {
        this.data.serviceAccount = jsonObj;
        this.saveData();
    }

    getServiceAccount() {
        return this.data.serviceAccount || null;
    }
}

module.exports = new CacheManager();
