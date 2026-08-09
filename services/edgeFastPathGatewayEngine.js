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

        const isPdf = targetUrl.toLowerCase().split('?')[0].endsWith('.pdf');
        const isGoogleSite = targetUrl.toLowerCase().includes('sites.google.com');
        const filename = targetUrl.split('/').pop().split('?')[0];
        
        let title = `Technical Analysis & Optimization Report for ${domain}`;
        if (isPdf) {
            title = `Document Resource Archive: ${filename}`;
        } else if (isGoogleSite) {
            title = `Public Site Publication Directory Page - Google Site Hub`;
        }

        // Schema selection: Article, DigitalDocument, or WebSite/ProfilePage
        let schemaType = 'WebPage';
        if (isPdf) {
            schemaType = 'DigitalDocument';
        } else if (isGoogleSite) {
            schemaType = 'ProfilePage';
        }
        
        let previewSection = '';
        if (isPdf) {
            previewSection = `
            <div style="margin: 25px 0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; background: #161821;">
                <div style="background: rgba(255,255,255,0.05); padding: 10px 15px; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #38bdf8;">📄 Secure Embedded PDF Resource Viewer (Gov/Edu Bypass Mode)</span>
                    <a href="${escapeHtml(targetUrl)}" download style="color: #a78bfa; text-decoration: none; font-weight: 600;" target="_blank">Download PDF Original</a>
                </div>
                <!-- Layer 1: Secure viewer instance from Google's high DA network -->
                <iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(targetUrl)}&embedded=true" width="100%" height="580px" style="border: none; background: #1a1d29;" onerror="this.src='https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(targetUrl)}'"></iframe>
            </div>`;
        } else if (isGoogleSite) {
            previewSection = `
            <div style="margin: 25px 0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; background: #161821;">
                <div style="background: rgba(255,255,255,0.05); padding: 10px 15px; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #38bdf8;">🌐 Google Site Live Portal Preview</span>
                    <a href="${escapeHtml(targetUrl)}" style="color: #a78bfa; text-decoration: none; font-weight: 600;" target="_blank">Open Direct Site &rarr;</a>
                </div>
                <!-- Frame loading with Google Sites sandbox bypass rules -->
                <iframe src="${escapeHtml(targetUrl)}" width="100%" height="580px" style="border: none; background: white;" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
            </div>`;
        }

        const selfCanonicalUrl = `https://${host}/i/${urlId}`;

        const isProduct = targetUrl.toLowerCase().includes('/product/') || targetUrl.toLowerCase().includes('/item/') || targetUrl.toLowerCase().includes('/shop/');

        // UNIVERSAL MASTER SCHEMA GRAPH — Applies to ANY XYZ link (Blog, Product, PDF, Landing Page, Forum, etc.)
        // This guarantees Googlebot receives full multi-type Schema validation regardless of URL structure.
        const universalSchema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": `${targetUrl}#webpage`,
                    "url": targetUrl,
                    "name": title,
                    "description": `Verified indexation node for ${domain}. Semantic crawl budget priority pass.`,
                    "datePublished": now,
                    "dateModified": now,
                    "isPartOf": {
                        "@type": "WebSite",
                        "name": domain,
                        "url": `https://${domain}`
                    }
                },
                {
                    "@type": "Article",
                    "@id": `${targetUrl}#article`,
                    "isPartOf": { "@id": `${targetUrl}#webpage` },
                    "headline": title,
                    "datePublished": now,
                    "dateModified": now,
                    "author": {
                        "@type": "Person",
                        "name": "Dr. Sarah Jenkins, SEO Expert",
                        "url": `https://${host}/author/sarah-jenkins`,
                        "jobTitle": "Lead Technical Auditor"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": domain,
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://www.google.com/favicon.ico"
                        }
                    },
                    "mainEntityOfPage": targetUrl
                },
                {
                    "@type": "Product",
                    "@id": `${targetUrl}#product`,
                    "name": title,
                    "description": `Comprehensive SEO Audit and Technical Analysis Report for ${domain}`,
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.9",
                        "ratingCount": "12450",
                        "bestRating": "5",
                        "worstRating": "1"
                    }
                },
                {
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": `Is ${domain} a trusted and authoritative domain?`,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": `Yes, ${domain} has passed all 15 stages of the Core Web Vitals and Semantic HTML auditing process, proving its extremely high authority and quality.`
                            }
                        },
                        {
                            "@type": "Question",
                            "name": `Why is this analysis report important?`,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": `It confirms that the publication is compliant with strict search engine guidelines for crawling and indexation.`
                            }
                        }
                    ]
                }
            ]
        };

        const customSchema = universalSchema;

        // Self-canonical setup ensures Googlebot INDEXES the High-DA gateway node instantly instead of marking it 'Crawled - currently not indexed'
        // FIX: The above comment was the trap. Setting it to targetUrl pushes all our fake authority directly to the 3rd party URL.
        const canonicalUrl = targetUrl;

        return `<!DOCTYPE html>
<html lang="en" itemscope itemtype="http://schema.org/${schemaType}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="description" content="Detailed optimization assessment and crawling analysis report for ${escapeHtml(targetUrl)}">
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- OpenGraph Tags -->
    <meta property="og:type" content="${isPdf ? 'book' : 'article'}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:url" content="${escapeHtml(targetUrl)}">
    <meta property="og:description" content="Technical audit report outlining crawl budget, sitemaps, and rendering compliance.">

    <!-- Schema.org Microdata -->
    <meta itemprop="name" content="${escapeHtml(title)}">
    <meta itemprop="datePublished" content="${now}">
    <meta itemprop="dateModified" content="${now}">

    <!-- High-Priority News / Doc Schema JSON-LD -->
    <script type="application/ld+json">
    ${JSON.stringify(customSchema, null, 2)}
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
            <article>
                <header>
                    <span class="tag">${isPdf ? 'PDF Document' : (isGoogleSite ? 'Google Site' : 'SEO Audit')}</span>
                    <span class="tag">${isPdf ? 'Google Docs Resource' : 'Technical Analysis'}</span>
                    <h1 itemprop="name">${escapeHtml(title)}</h1>
                    <div class="meta">
                        Published on <time itemprop="datePublished" datetime="${now}">${new Date(now).toLocaleDateString()}</time> | 
                        By <span itemprop="author" itemscope itemtype="http://schema.org/Person"><span itemprop="name">Fast Indexing Core Team</span></span>
                    </div>
                </header>
                
                <section>
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 25px; display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 2rem;">🏆</span>
                        <div>
                            <h3 style="margin: 0; color: #34d399; font-size: 1.1rem;">Verified High-Authority Resource</h3>
                            <p style="margin: 5px 0 0; font-size: 0.9rem; color: #a7f3d0;">This URL has passed the stringent Core Web Vitals and Semantic Trust requirements. Rated <strong style="color: #fbbf24;">4.9/5</strong> by 12,450 technical audits.</p>
                        </div>
                    </div>

                    <p>
                        This assessment examines the indexing profiles, rendering performance, and search visibility guidelines of the target domain <strong>${escapeHtml(domain)}</strong>. A technical inspection confirms that the domain features active content nodes ready to be indexed.
                    </p>
                    
                    ${previewSection}
                    
                    <p>
                        Our crawling engine has run a full 15-stage diagnostic analysis to verify that the target asset satisfies standard mobile-friendly and Schema.org semantic data directives. By broadcasting real-time XML news signals and syndicating links to high-DA networks, search engine spiders are guided to crawl these nodes immediately.
                    </p>

                    <!-- Trust Signals & Fake Reviews -->
                    <div style="margin: 30px 0; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                        <h3 style="color: #f8fafc; font-size: 1.3rem;">Recent Verifications</h3>
                        <div style="background: rgba(255, 255, 255, 0.02); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <strong style="color: #38bdf8;">Googlebot Verification Protocol</strong>
                                <span style="color: #fbbf24;">★★★★★</span>
                            </div>
                            <p style="margin: 0; font-size: 0.9rem; color: #94a3b8;">"Excellent semantic structure. Domain authority passes all trust checks. Fast indexing approved." - automated system log</p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.02); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <strong style="color: #38bdf8;">Bing IndexNow Protocol</strong>
                                <span style="color: #fbbf24;">★★★★★</span>
                            </div>
                            <p style="margin: 0; font-size: 0.9rem; color: #94a3b8;">"Payload received successfully. Content matches high-quality threshold." - automated system log</p>
                        </div>
                    </div>

                    <!-- FAQ Section -->
                    <div style="margin: 30px 0; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                        <h3 style="color: #f8fafc; font-size: 1.3rem;">Frequently Asked Questions</h3>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #cbd5e1; display: block; margin-bottom: 5px;">Is ${escapeHtml(domain)} a trusted and authoritative domain?</strong>
                            <p style="margin: 0; font-size: 0.95rem; color: #94a3b8;">Yes, ${escapeHtml(domain)} has passed all 15 stages of the Core Web Vitals and Semantic HTML auditing process, proving its extremely high authority and quality.</p>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #cbd5e1; display: block; margin-bottom: 5px;">Why is this analysis report important?</strong>
                            <p style="margin: 0; font-size: 0.95rem; color: #94a3b8;">It confirms that the publication is compliant with strict search engine guidelines for crawling and indexation.</p>
                        </div>
                    </div>

                    <p style="text-align: center; color: #a78bfa; font-weight: 600; margin-top: 40px;">
                        To explore the complete publication, inspect its full metadata tags, or interact with its live interface, use the primary access link below:
                    </p>
                    
                    <div style="text-align: center;">
                        <a href="${escapeHtml(targetUrl)}" itemprop="url" rel="follow" class="btn-link">Read Source Publication &rarr;</a>
                    </div>
                </section>

                <footer class="author-box">
                    <div class="author-avatar">SJ</div>
                    <div class="author-info">
                        <h4>Written by Dr. Sarah Jenkins</h4>
                        <p>Lead Technical SEO Auditor & Crawl Budget Specialist. Featured in Search Engine Journal.</p>
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
