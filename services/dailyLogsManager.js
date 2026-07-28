const fs = require('fs');
const path = require('path');

const os = require('os');

// Use the OS temp directory (usually /tmp on Vercel) which is writable
const LOG_FILE_PATH = path.join(os.tmpdir(), 'daily_urls.json');

class DailyLogsManager {
    constructor() {
        this.ensureFileExists();
    }

    ensureFileExists() {
        const dir = path.dirname(LOG_FILE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(LOG_FILE_PATH)) {
            fs.writeFileSync(LOG_FILE_PATH, JSON.stringify([]));
        }
    }

    readLogs() {
        try {
            this.ensureFileExists();
            const data = fs.readFileSync(LOG_FILE_PATH, 'utf8');
            return JSON.parse(data || '[]');
        } catch (e) {
            console.error('Error reading daily logs:', e);
            return [];
        }
    }

    writeLogs(logs) {
        try {
            fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2));
        } catch (e) {
            console.error('Error writing daily logs:', e);
        }
    }

    /**
     * Add new URLs and automatically wipe out anything older than 24 hours
     */
    logUrls(urls) {
        let logs = this.readLogs();
        const now = Date.now();
        const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours ago

        // Filter out URLs older than 24 hours
        logs = logs.filter(item => item.timestamp > cutoff);

        // Add new URLs
        urls.forEach(url => {
            logs.push({
                url,
                timestamp: now
            });
        });

        this.writeLogs(logs);
    }

    /**
     * Get active URLs submitted in the last 24 hours
     */
    getRecentUrls() {
        const logs = this.readLogs();
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        
        // Return only URLs within last 24 hours, cleaned
        return logs
            .filter(item => item.timestamp > cutoff)
            .map(item => item.url);
    }

    /**
     * Clear expired entries on demand
     */
    cleanExpired() {
        const logs = this.readLogs();
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const freshLogs = logs.filter(item => item.timestamp > cutoff);
        if (freshLogs.length !== logs.length) {
            this.writeLogs(freshLogs);
        }
    }
}

module.exports = new DailyLogsManager();
