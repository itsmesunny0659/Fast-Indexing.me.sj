/**
 * Persistent Gateway Store
 * 
 * Solves the #1 indexing failure cause:
 * wrapperStore (Map) is RAM-only → server restart = 404 on all gateway URLs.
 * 
 * This module persists gateway entries to db.json so they survive:
 * - Vercel cold starts
 * - Server restarts
 * - Deployments
 * 
 * Any URL submitted creates a PERMANENT gateway that Google can always crawl.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_FILE = path.join(__dirname, '../data/db.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'fast_indexing_db.json');

class PersistentGatewayStore {
    constructor() {
        this._store = new Map();
        this._hubStore = new Map();
        this._loaded = false;
    }

    /** Helper to load JSON safely */
    _loadFromFile(filepath) {
        try {
            if (fs.existsSync(filepath)) {
                const raw = fs.readFileSync(filepath, 'utf-8');
                return JSON.parse(raw);
            }
        } catch (e) {}
        return null;
    }

    /** Lazy-load from disk & /tmp on first access */
    _ensureLoaded() {
        if (this._loaded) return;
        this._loaded = true;
        
        const data = this._loadFromFile(DATA_FILE) || this._loadFromFile(TMP_DATA_FILE);
        if (data) {
            if (data.gatewayPages && typeof data.gatewayPages === 'object') {
                for (const [id, entry] of Object.entries(data.gatewayPages)) {
                    this._store.set(id, entry);
                }
            }
            if (data.hubPages && typeof data.hubPages === 'object') {
                for (const [id, entry] of Object.entries(data.hubPages)) {
                    this._hubStore.set(id, entry);
                }
            }
        }
    }

    /** Save current state to disk & /tmp */
    _persist() {
        const payload = {
            gatewayPages: Object.fromEntries(this._store),
            hubPages: Object.fromEntries(this._hubStore)
        };
        const str = JSON.stringify(payload, null, 2);
        
        try {
            fs.writeFileSync(TMP_DATA_FILE, str);
        } catch (e) {}

        try {
            fs.writeFileSync(DATA_FILE, str);
        } catch (e) {}
    }

    // ========== GATEWAY STORE METHODS ==========

    setGateway(urlId, entry) {
        this._ensureLoaded();
        this._store.set(urlId, entry);
        this._persist();
    }

    getGateway(urlId) {
        this._ensureLoaded();
        if (this._store.has(urlId)) {
            return this._store.get(urlId);
        }

        // Fallback 1: Deterministic Base64 Decoding (Guarantees zero 404s on Vercel cold starts)
        try {
            let encodedStr = urlId;
            if (urlId.startsWith('u_')) {
                encodedStr = urlId.slice(2);
            } else if (urlId.startsWith('idx_')) {
                // E.g. idx_22556_ms7dnh7b or custom urlId formats
                encodedStr = urlId.split('_').pop();
            }

            const decodedUrl = Buffer.from(encodedStr, 'base64url').toString('utf-8');
            if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
                const entry = { url: decodedUrl, timestamp: new Date().toISOString() };
                this._store.set(urlId, entry);
                return entry;
            }
        } catch (e) {}

        return null;
    }

    hasGateway(urlId) {
        this._ensureLoaded();
        return this.getGateway(urlId) !== null;
    }

    getAllGateways() {
        this._ensureLoaded();
        return Array.from(this._store.entries());
    }

    getGatewayCount() {
        this._ensureLoaded();
        return this._store.size;
    }

    // ========== HUB STORE METHODS ==========

    setHub(hubId, hubData) {
        this._ensureLoaded();
        this._hubStore.set(hubId, hubData);
        this._persist();
    }

    getHub(hubId) {
        this._ensureLoaded();
        if (this._hubStore.has(hubId)) {
            return this._hubStore.get(hubId);
        }

        // Fallback 1: Deterministic Base64 JSON decoding for Hubs
        try {
            let encodedStr = hubId;
            if (hubId.startsWith('h_')) {
                encodedStr = hubId.slice(2);
            }
            const decodedJson = Buffer.from(encodedStr, 'base64url').toString('utf-8');
            const hubObj = JSON.parse(decodedJson);
            if (hubObj && Array.isArray(hubObj.urls)) {
                this._hubStore.set(hubId, hubObj);
                return hubObj;
            }
        } catch (e) {}

        return null;
    }

    hasHub(hubId) {
        this._ensureLoaded();
        return this.getHub(hubId) !== null;
    }

    getAllHubs() {
        this._ensureLoaded();
        return Array.from(this._hubStore.entries());
    }

    getHubCount() {
        this._ensureLoaded();
        return this._hubStore.size;
    }
}

module.exports = new PersistentGatewayStore();
