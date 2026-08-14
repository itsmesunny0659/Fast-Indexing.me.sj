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
            serviceAccount: null,
            serviceAccountPool: []
        };
        this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf-8');
                this.data = { ...this.data, ...JSON.parse(raw) };
            }
            
            // Permanently load hardcoded keys from keys.json if exists (Safe for Vercel)
            const keysFile = path.join(__dirname, '../data/keys.json');
            if (fs.existsSync(keysFile)) {
                const rawKeys = fs.readFileSync(keysFile, 'utf-8');
                const keysArray = JSON.parse(rawKeys);
                if (Array.isArray(keysArray)) {
                    this.data.serviceAccountPool = keysArray;
                    if (keysArray.length > 0) {
                        this.data.serviceAccount = keysArray[0];
                    }
                }
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
            // MERGE FIX: Read existing file first to preserve gatewayPages/hubPages
            // written by persistentGatewayStore — do NOT blindly overwrite them
            let existingData = {};
            try {
                if (fs.existsSync(DATA_FILE)) {
                    existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
                }
            } catch (e) { /* ignore parse errors */ }

            const merged = {
                ...existingData,          // preserve gatewayPages, hubPages etc.
                credits: this.data.credits,
                jobs: this.data.jobs,
                recentUrls: this.data.recentUrls,
                urlCache: this.data.urlCache,
                serviceAccount: this.data.serviceAccount,
                serviceAccountPool: this.data.serviceAccountPool
            };
            fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));
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

    updateJobResult(jobId, updates) {
        const jobIndex = this.data.jobs.findIndex(j => j.jobId === jobId);
        if (jobIndex !== -1) {
            this.data.jobs[jobIndex] = {
                ...this.data.jobs[jobIndex],
                ...updates
            };
            this.saveData();
        }
    }

    setServiceAccount(jsonObj) {
        this.data.serviceAccount = jsonObj;
        this.saveData();
    }

    addServiceAccountsToPool(keysArray) {
        if (!Array.isArray(keysArray)) return false;
        
        // Filter valid keys
        const validKeys = keysArray.filter(k => k && k.client_email && k.private_key);
        if (validKeys.length === 0) return false;

        // Append to existing pool, filtering duplicates by email
        if (!this.data.serviceAccountPool) this.data.serviceAccountPool = [];
        
        for (const k of validKeys) {
            const exists = this.data.serviceAccountPool.find(existing => existing.client_email === k.client_email);
            if (!exists) {
                this.data.serviceAccountPool.push(k);
            }
        }
        
        // Also set the first key as the main service account if not set
        if (!this.data.serviceAccount && this.data.serviceAccountPool.length > 0) {
            this.data.serviceAccount = this.data.serviceAccountPool[0];
        }

        this.saveData();
        return true;
    }

    getServiceAccountPool() {
        return this.data.serviceAccountPool || [];
    }

    getServiceAccount() {
        if (this.data.serviceAccount && this.data.serviceAccount.client_email) {
            return this.data.serviceAccount;
        }
        if (this.data.serviceAccountPool && this.data.serviceAccountPool.length > 0) {
            return this.data.serviceAccountPool[0];
        }
        // DEFAULT OFFICIAL GOOGLE SERVICE ACCOUNT KEY FROM ai-fast-indexer PROJECT
        return {
            "type": "service_account",
            "project_id": "ai-fast-indexer",
            "private_key_id": "9316229acf2c9c5e48cd7b106eaf30c016966931",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3731wfudPQSuT\nnzr3fVltNzKfgn+i+Br8CMte8q01VzWN/6v8YnUb3QP3E4p454jPsMFOVpeg63nE\nEdMkSoNUDAb2NeuNQkl5k4GMQUSOf6ELk0dIIfAUFmS/tFto/PlwsDiKmG7rYsQF\nWDyiNlIp5IfpzTc7FZ5E5khwiYhv5DpCBWci2jkUvbW7OhX3wKHH8ja3Nl2V49AJ\n8JlAqmAwzY36rIePhj/EyQOsHTyuCjqvYdO8TJFchmhNBuJfTaNFWWZD50vrYdr1\ni8gnXEKxT0hBgQdq2pg1WAmTyIrudURvYP9Wfdf6XIGqY8P4z8/rOujSiKUS+/9Y\nRFvJr/NJAgMBAAECggEAA60ZLuI9Fu6WA4rMqmf1HW4w0v2lixPLXPCDZAqUn1Ah\nZWJP79OQmfXLtP330rJ0n7YIKbEoXFJ91LHd1vKtokSP77l505EYwoHKC+FoEIhe\nJyA9Q09OVZBxrgqEQy+/KoXoc2NYNYMmqMwFK4wguJlKhXKRC9ttljHwuQhpU4HN\nt7ViVpSDBWqOZqMJK4f6sGHHhD1lK4N7CaiOusIOC1nP9dXQa06gqfCVq6Mnz34t\nCAK5YfNLIqpzsGjQL34vhzjo+hKCrSo+P5c5tDS+Tzpdl+FGbRfzrS6sL3bglK4a\nYCwXeqmnk+WumU/sbFea8LvpKOOO2AxZcOjt0mucKwKBgQDee1v3JBT7DBRqKlZ9\nkq1LAGHNZ+hhRgtJ4M4dK7zAsVfu3VMqttfh8f7WEWb6echW8dB608ispFjuLmg1\nrTMK65vpdRIkfi+PRky5h49ZqRa6gw9t5L3OoQcTmm6ZZcAeQ+4YJyMJtu5Y/RwO\nAqdUWzalb/17iAlBN67zD9myhwKBgQDTpXtFVICWv0oNNsTRYu3V8YaYBG8ZORRi\noLIX4yHHvs/CKwqt1aSAkRq2X0xWeAOiwFG35JJnnDZEj/HZr5aZxOvNNE2x3WW/\nQeZuNcgvGslZFrZ3eh3PQOxl1uAsMFSnVmNNlLMAg+BU+pL55E1NJK5zgOSIYLoZ\nL7kx/48PrwKBgG2XwK6WJIuh4LCHWIGU7i5C6up+49Z+5XKn/YAbGmilM1ajyaMB\n3IgdZ9XVTq/Vq51AktzeVDzO3Eu/qm++eKVJeEzg8WXujsj57TN7Fl8pTtvjUYdl\npSYS5mR+rzp7B88g0TkuljDj3rcRP2+bWQfRwrJt3ySp1z08C78JsMgjAoGBAMgH\nur4H45CWMnLStKoBCjAOGdtLNYVtQSsGHcwdyytx2AH3lBw/sz4f5lM/NnLy8ty7\nT4Cx8v0h0thyA25uWbPzPbmwGU5lpWhh7Ft1UUHT20DsCoBZVhsvjT2jHDQnaZrO\nNwR36cYu3bLzMD4l3Dlw1cAsrdGHOdvcEviCRL/ZAoGBAMYVM7SAbBEuElTwsIDO\nd4NdobUtsihfNMvG4UZdVsRaTmPSa3B5BB18oUyctIV610fmg7aJWdulfvCMY2Ic\+Nh+pxv0LI0jaBidhWUWiKioDJzXfCF2G7pryG7twrB0CFqezVPUN4ExJ3FpWSyg\nu6Bc70U+2Sxc8RG05D7F0WrY\n-----END PRIVATE KEY-----\n",
            "client_email": "instant-indexing@ai-fast-indexer.iam.gserviceaccount.com"
        };
    }
}

module.exports = new CacheManager();
