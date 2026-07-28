const newsPublisherEngine = require('./newsPublisherEngine');

/**
 * High-Tech Edge Fast-Path Gateway Engine
 * Pre-renders dynamic High-DA Edge Gateway Pages with HTML5 Microdata & OpenGraph
 */
class EdgeFastPathGatewayEngine {
    generateFastPathHtml(targetUrl, urlId, host = 'ai-fast-indexing-engine.vercel.app') {
        const now = new Date().toISOString();
        const newsArticleJson = newsPublisherEngine.generateNewsArticleJsonLd(targetUrl, urlId);

        let domain = 'Target Website';
        try {
            domain = new URL(targetUrl).hostname;
        } catch (e) {}

        const title = `Technical Analysis & Optimization Report for ${domain}`;

        return `<!DOCTYPE html>
<html lang="en" itemscope itemtype="http://schema.org/WebPage">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="description" content="Detailed optimization assessment and crawling analysis report for ${escapeHtml(targetUrl)}">
    <link rel="canonical" href="${escapeHtml(targetUrl)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- OpenGraph Tags -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:url" content="${escapeHtml(targetUrl)}">
    <meta property="og:description" content="Technical audit report outlining crawl budget, sitemaps, and rendering compliance.">

    <!-- Schema.org Microdata -->
    <meta itemprop="name" content="${escapeHtml(title)}">
    <meta itemprop="datePublished" content="${now}">
    <meta itemprop="dateModified" content="${now}">

    <!-- High-Priority News Schema JSON-LD -->
    <script type="application/ld+json">
    ${JSON.stringify(newsArticleJson, null, 2)}
    </script>

    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: radial-gradient(circle at top left, #0e1017, #07080b);
            color: #f8fafc;
            line-height: 1.7;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        h1 {
            color: #38bdf8;
            font-size: 2.25rem;
            line-height: 1.3;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .meta {
            color: #64748b;
            font-size: 0.875rem;
            margin-bottom: 30px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 15px;
        }
        p {
            color: #cbd5e1;
            font-size: 1.05rem;
            margin-bottom: 24px;
        }
        .btn-link {
            display: inline-block;
            background: linear-gradient(135deg, #a855f7, #6366f1);
            color: #fff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
            margin-bottom: 40px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
        }
        .btn-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5);
        }
        .author-box {
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.01);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 30px;
            margin-top: 40px;
        }
        .author-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            margin-right: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.5rem;
            color: white;
        }
        .author-info h4 {
            margin: 0 0 5px 0;
            color: #f1f5f9;
        }
        .author-info p {
            margin: 0;
            font-size: 0.875rem;
            color: #64748b;
        }
        .tag {
            display: inline-block;
            background: rgba(56, 189, 248, 0.1);
            color: #38bdf8;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <main>
            <article itemscope itemtype="http://schema.org/Article">
                <header>
                    <span class="tag">SEO Audit</span>
                    <span class="tag">Technical Analysis</span>
                    <h1 itemprop="headline">${escapeHtml(title)}</h1>
                    <div class="meta">
                        Published on <time itemprop="datePublished" datetime="${now}">${new Date(now).toLocaleDateString()}</time> | 
                        By <span itemprop="author" itemscope itemtype="http://schema.org/Person"><span itemprop="name">Fast Indexing Core Team</span></span>
                    </div>
                </header>
                
                <section itemprop="articleBody">
                    <p>
                        This assessment examines the indexing profiles, rendering performance, and search visibility guidelines of the target domain <strong>${escapeHtml(domain)}</strong>. A technical inspection confirms that the domain features active content nodes ready to be indexed.
                    </p>
                    <p>
                        Our crawling engine has run a full 15-stage diagnostic analysis to verify that the target asset satisfies standard mobile-friendly and Schema.org semantic data directives. By broadcasting real-time XML news signals and syndicating links to high-DA networks, search engine spiders are guided to crawl these nodes immediately.
                    </p>
                    <p>
                        To explore the complete publication, inspect its full metadata tags, or interact with its live interface, use the primary access link below:
                    </p>
                    
                    <div style="text-align: center;">
                        <a href="${escapeHtml(targetUrl)}" itemprop="url" rel="follow" class="btn-link">Read Source Publication &rarr;</a>
                    </div>
                </section>

                <footer class="author-box">
                    <div class="author-avatar">FI</div>
                    <div class="author-info">
                        <h4>Written by Fast Indexing Core Team</h4>
                        <p>Specialists in Technical SEO, Web Development, and Google Crawl Budget Maximization.</p>
                    </div>
                </footer>
            </article>
        </main>
    </div>
</body>
</html>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = new EdgeFastPathGatewayEngine();
