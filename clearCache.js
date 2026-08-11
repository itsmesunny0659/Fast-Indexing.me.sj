const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data/db.json');

if (fs.existsSync(dbPath)) {
    try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        const db = JSON.parse(raw);
        db.jobs = [];
        db.urlCache = {};
        db.recentUrls = [];
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        console.log("✅ Successfully cleared all local jobs, cache, and pending queue data in db.json!");
    } catch (e) {
        console.error("❌ Failed to clear cache:", e);
    }
} else {
    console.log("❓ db.json does not exist. Nothing to clear.");
}
