const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const indexingRoutes = require('./routes/indexingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiter: Unlimited / Enterprise High-Volume Limit (500 requests per 60 seconds)
const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 500, // 500 requests per minute limit
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.setHeader('Ratelimit', 'limit=500, remaining=0, reset=60');
        res.setHeader('Ratelimit-Policy', '500;w=60');
        res.status(429).json({
            error: 'Too Many Requests. Rate limit exceeded.',
            limit: 500,
            windowSeconds: 60
        });
    }
});

// Custom Middleware to set RateLimit response headers
app.use('/fui-api/', (req, res, next) => {
    res.setHeader('Ratelimit', 'limit=500, remaining=499, reset=60');
    res.setHeader('Ratelimit-Policy', '500;w=60');
    res.setHeader('Server', 'Google Frontend / FastIndexingEngine');
    next();
});

// Mount fui-api indexing routes
app.use('/fui-api/api/indexing', apiRateLimiter, indexingRoutes);

// High-DA HTML Indexing Wrapper Gateway, RSS/Sitemap & PBN Routes
app.use('/', indexingRoutes);

// Fallback route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Fast Indexing Engine is running on port ${PORT}`);
    console.log(`🌐 Dashboard UI: http://localhost:${PORT}`);
    console.log(`⚡ FUI API Endpoint: http://localhost:${PORT}/fui-api/api/indexing/submit`);
    console.log(`====================================================`);
});

module.exports = app;
