const express = require('express');
const path = require('path');
const { startLoadTest, stopLoadTest, getStatus } = require('./trafficEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/start', (req, res) => {
    const { url, proxies } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    
    // Parse proxies if provided
    let proxyList = [];
    if (proxies) {
        proxyList = proxies.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    }

    try {
        startLoadTest(url, proxyList);
        res.json({ message: 'Load test started successfully', status: 'running' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/stop', (req, res) => {
    stopLoadTest();
    res.json({ message: 'Load test stopped', status: 'stopped' });
});

app.get('/api/status', (req, res) => {
    res.json(getStatus());
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
