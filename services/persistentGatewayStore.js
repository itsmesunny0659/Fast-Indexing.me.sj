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

const DATA_FILE = path.join(__dirname, '../data/db.json');

class PersistentGatewayStore {
    constructor() {
        this._store = new Map();
        this._hubStore = new Map();
        this._loaded = false;
    }

    /** Lazy-load from disk on first access */
    _ensureLoaded() {
        if (this._loaded) return;
        this._loaded = true;
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf-8');
                const data = JSON.parse(raw);

                // Restore gateway pages
                if (data.gatewayPages && typeof data.gatewayPages === 'object') {
                    for (const [id, entry] of Object.entries(data.gatewayPages)) {
                        this._store.set(id, entry);
                    }
                    console.log(`✅ [PersistentGatewayStore] Restored ${this._store.size} gateway pages from disk.`);
                }

                // Restore hub pages
                if (data.hubPages && typeof data.hubPages === 'object') {
                    for (const [id, entry] of Object.entries(data.hubPages)) {
                        this._hubStore.set(id, entry);
                    }
                    console.log(`✅ [PersistentGatewayStore] Restored ${this._hubStore.size} hub pages from disk.`);
                }
            }
        } catch (e) {
            console.warn('[PersistentGatewayStore] Could not load from disk:', e.message);
        }
    }

    /** Save current state to disk */
    _persist() {
        try {
            let data = {};
            if (fs.existsSync(DATA_FILE)) {
                data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
            }
            data.gatewayPages = Object.fromEntries(this._store);
            data.hubPages = Object.fromEntries(this._hubStore);
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        } catch (e) {
            // Vercel read-only filesystem - memory mode only
        }
    }

    // ========== GATEWAY STORE METHODS ==========

    setGateway(urlId, entry) {
        this._ensureLoaded();
        this._store.set(urlId, entry);
        this._persist();
    }

    getGateway(urlId) {
        this._ensureLoaded();
        return this._store.get(urlId);
    }

    hasGateway(urlId) {
        this._ensureLoaded();
        return this._store.has(urlId);
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
        return this._hubStore.get(hubId);
    }

    hasHub(hubId) {
        this._ensureLoaded();
        return this._hubStore.has(hubId);
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
