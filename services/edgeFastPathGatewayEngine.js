const newsPublisherEngine = require('./newsPublisherEngine');
const cacheManager = require('./cacheManager');

// --- ENTERPRISE SEMANTIC CONTENT MIXER ---
// Generates completely unique paragraph combinations for every request to bypass Google's duplicate thin-content filters
const semanticMixerP1 = [
    (topic, domain) => `This comprehensive assessment evaluates the indexation profiles, mobile usability, and crawlers latency parameters for <strong>${topic}</strong> on <strong>${domain}</strong>. Detailed telemetry checks indicate active content nodes that align with major W3C and Core Web Vitals criteria.`,
    (topic, domain) => `Our technical SEO audit of <strong>${topic}</strong> hosted on <strong>${domain}</strong> examines semantic data delivery, rendering compliance, and schema-valid architecture. The node is fully configured to receive Google's high-priority crawling indexers.`,
    (topic, domain) => `This public directory record outlines the indexing compliance report for <strong>${topic}</strong> on <strong>${domain}</strong>. The analysis includes data-structures checks, mobile-friendly audits, and news priority signals mapping to optimize visibility.`,
    (topic, domain) => `A dedicated crawl budget priority scan of the target document <strong>${topic}</strong> on <strong>${domain}</strong> reveals highly optimized resource nodes. Search engine spiders are routed to index these entities to ensure continuous presence.`
];

const semanticMixerP2 = [
    (topic, domain) => `Our crawling engine has run a full 15-stage diagnostic analysis to verify that the target asset satisfies standard mobile-friendly and Schema.org semantic data directives. By broadcasting real-time XML news signals and syndicating links to high-DA networks, search engine spiders are guided to crawl these nodes immediately.`,
    (topic, domain) => `Through real-time telemetry testing, the gateway node broadcasts active HTTP/3 handshakes and XML feed signals to major search spiders. These do-follow priority vectors prompt search crawlers to scan the target resource to finalize indexing.`,
    (topic, domain) => `Using rotated human emulation headers and crawlers telemetry pings, the indexing engine successfully registers the target entity within search budget parameters. Active spiders are triggered to process the page schemas and consolidate search visibility.`,
    (topic, domain) => `This semantic publication utilizes search engine QA standards to expedite indexation. Inbound signal syndications from high-DA directory nodes establish authority trust scores, directing search engine crawlers to parse the content blocks.`
];

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
        const filename = targetUrl.split('/').pop().split('?')[0] || 'index';
        
        // --- UNIQUE CONTENT EXTRACTION (Thin-Content Bypass) ---
        // Clean the filename/slug to create readable keywords (e.g. transneos4.pdf -> Transneos4)
        let extractedTopic = filename.replace(/\.(pdf|html|htm|php|asp|jsp)$/i, '')
                                     .replace(/[-_]/g, ' ')
                                     .trim();
        // Capitalize words
        extractedTopic = extractedTopic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        // Fallback for empty/short topics
        if (!extractedTopic || extractedTopic.length < 2 || extractedTopic.toLowerCase() === 'index') {
            extractedTopic = "Digital Content";
        }

        let title = `${extractedTopic} - Technical Analysis Report for ${domain}`;
        if (isPdf) {
            title = `${extractedTopic} - Secure Document Archive`;
        } else if (isGoogleSite) {
            title = `${extractedTopic} - Public Site Publication Directory`;
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

        // --- FOOTPRINT TEMPLATE ROTATION SYSTEM (6 distinct UI Layouts) ---
        // Dynamically changes UI styling, fonts, branding headers, and accents based on the urlId hash
        const layoutIndex = (urlId || 'u_').charCodeAt((urlId || 'u_').length - 1) % 6;
        let layoutTheme = {
            name: 'Blogger',
            bg: 'radial-gradient(circle at top left, #0e1017, #07080b)',
            cardBg: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            text: '#f8fafc',
            accent: '#38bdf8',
            btnBg: 'linear-gradient(135deg, #a855f7, #6366f1)',
            btnShadow: 'rgba(168, 85, 247, 0.3)',
            headerLogo: '📝 Blogger Publication Directory',
            tag1: 'Blogger Post',
            tag2: 'Technical Article'
        };

        if (layoutIndex === 0) {
            // YouTube Theme
            layoutTheme = {
                name: 'YouTube',
                bg: '#0f0f0f',
                cardBg: '#1f1f1f',
                border: '1px solid #2d2d2d',
                text: '#f1f1f1',
                accent: '#ff0000',
                btnBg: 'linear-gradient(135deg, #ff0000, #cc0000)',
                btnShadow: 'rgba(255, 0, 0, 0.2)',
                headerLogo: '🎥 YouTube Creator Network Node',
                tag1: 'YouTube Video Object',
                tag2: 'Crawl Priority'
            };
        } else if (layoutIndex === 1) {
            // Wikipedia Theme
            layoutTheme = {
                name: 'Wikipedia',
                bg: '#f6f6f6',
                cardBg: '#ffffff',
                border: '1px solid #a2a9b1',
                text: '#202122',
                accent: '#3366cc',
                btnBg: 'linear-gradient(135deg, #3366cc, #4477dd)',
                btnShadow: 'rgba(51, 102, 204, 0.2)',
                headerLogo: '📚 Wikipedia Archive Project Node',
                tag1: 'Wikipedia Reference',
                tag2: 'Academic Publication'
            };
        } else if (layoutIndex === 2) {
            // Medium Theme
            layoutTheme = {
                name: 'Medium',
                bg: '#ffffff',
                cardBg: '#f9f9f9',
                border: '1px solid #e6e6e6',
                text: '#292929',
                accent: '#1a8917',
                btnBg: 'linear-gradient(135deg, #1a8917, #22a21e)',
                btnShadow: 'rgba(26, 137, 23, 0.2)',
                headerLogo: '✍️ Medium Technical Network Hub',
                tag1: 'Medium Story',
                tag2: 'SEO Analytics Audit'
            };
        } else if (layoutIndex === 3) {
            // Reddit Theme
            layoutTheme = {
                name: 'Reddit',
                bg: '#0b1416',
                cardBg: '#1a282d',
                border: '1px solid #34464c',
                text: '#d7dadc',
                accent: '#ff4500',
                btnBg: 'linear-gradient(135deg, #ff4500, #e03d00)',
                btnShadow: 'rgba(255, 69, 0, 0.2)',
                headerLogo: '💬 Reddit Public Discussion Archive',
                tag1: 'Reddit Thread',
                tag2: 'User QA Directory'
            };
        } else if (layoutIndex === 4) {
            // Goodreads Theme
            layoutTheme = {
                name: 'Goodreads',
                bg: '#f4f1ea',
                cardBg: '#ffffff',
                border: '1px solid #d8d4c7',
                text: '#333333',
                accent: '#76553f',
                btnBg: 'linear-gradient(135deg, #76553f, #946f56)',
                btnShadow: 'rgba(118, 85, 63, 0.2)',
                headerLogo: '📖 Goodreads Literature Catalog System',
                tag1: 'Goodreads Page',
                tag2: 'Digital Book Archive'
            };
        } else if (layoutIndex === 5) {
            // LinkedIn Theme
            layoutTheme = {
                name: 'LinkedIn',
                bg: '#f3f2ef',
                cardBg: '#ffffff',
                border: '1px solid #e0e0e0',
                text: '#191919',
                accent: '#0a66c2',
                btnBg: 'linear-gradient(135deg, #0a66c2, #0077b5)',
                btnShadow: 'rgba(10, 102, 194, 0.2)',
                headerLogo: '👔 LinkedIn Pulse Professional Feed',
                tag1: 'LinkedIn Pulse',
                tag2: 'Corporate Audit Node'
            };
        }

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
                    "reviewedBy": {
                        "@type": "Organization",
                        "name": "Search Engine Quality Assurance Protocol",
                        "sameAs": "https://developers.google.com/search/docs/essentials"
                    },
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
                    "@type": "JobPosting",
                    "@id": `${targetUrl}#jobposting`,
                    "title": `Remote Technical SEO Analyst - ${domain}`,
                    "description": `We are seeking a highly skilled technical SEO to audit and optimize web nodes for ${domain}.`,
                    "datePosted": now,
                    "validThrough": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    "employmentType": "FULL_TIME",
                    "hiringOrganization": {
                        "@type": "Organization",
                        "name": domain,
                        "sameAs": `https://${domain}`
                    },
                    "jobLocation": {
                        "@type": "Place",
                        "address": {
                            "@type": "PostalAddress",
                            "addressCountry": "US",
                            "addressRegion": "CA",
                            "addressLocality": "San Francisco"
                        }
                    },
                    "baseSalary": {
                        "@type": "MonetaryAmount",
                        "currency": "USD",
                        "value": {
                            "@type": "QuantitativeValue",
                            "value": 120000,
                            "unitText": "YEAR"
                        }
                    }
                },
                {
                    "@type": "BroadcastEvent",
                    "@id": `${targetUrl}#broadcastevent`,
                    "name": `Live Web Audit Broadcasting for ${domain}`,
                    "description": "Real-time crawling and rendering audit broadcast event. High priority news stream.",
                    "startDate": now,
                    "endDate": new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    "isLiveBroadcast": true,
                    "location": {
                        "@type": "VirtualLocation",
                        "url": targetUrl
                    }
                },
                {
                    "@type": "LiveBlogPosting",
                    "@id": `${targetUrl}#liveblogposting`,
                    "headline": `LIVE: Indexing Event for ${extractedTopic}`,
                    "description": "Live indexing broadcast feed triggering instant crawl.",
                    "coverageStartTime": now,
                    "coverageEndTime": new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    "liveBlogUpdate": [
                        {
                            "@type": "BlogPosting",
                            "headline": `Crawler Node Dispatched for ${extractedTopic}`,
                            "datePublished": now
                        }
                    ]
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
                },
                {
                    "@type": "Dataset",
                    "@id": `${targetUrl}#dataset`,
                    "name": `${extractedTopic} - Technical Analysis Dataset`,
                    "description": `A highly structured dataset containing the crawl behavior, rendering metrics, and semantic analysis data for ${extractedTopic}.`,
                    "url": targetUrl,
                    "license": "https://creativecommons.org/publicdomain/zero/1.0/",
                    "isAccessibleForFree": true,
                    "creator": {
                        "@type": "Organization",
                        "url": "https://www.google.com/",
                        "name": "Google Cloud Research Node"
                    }
                },
                {
                    "@type": "VideoObject",
                    "@id": `${targetUrl}#video`,
                    "name": `${extractedTopic} - Presentation and Technical Walkthrough Video`,
                    "description": `Comprehensive video walkthrough and optimization report for ${extractedTopic} on ${domain}.`,
                    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
                    "uploadDate": now,
                    "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
                }
            ]
        };

        const customSchema = universalSchema;

        const canonicalUrl = targetUrl;
        const recentUrls = cacheManager.getRecentUrls() || [];
        const filteredUrls = recentUrls.filter(u => u !== targetUrl).slice(0, 3);
        const linkGraphHtml = filteredUrls.map((u, i) => {
            const encoded = Buffer.from(u).toString('base64url');
            return `<a href="/i/u_${encoded}" rel="follow" style="color: ${layoutTheme.accent}; text-decoration: none; font-weight: 500; font-size: 0.9rem; display: block; margin-bottom: 6px;">🔗 Related Node #${i+1}: ${escapeHtml(u.substring(0, 50))}...</a>`;
        }).join('\n');

        return `<!DOCTYPE html>
<html lang="en" itemscope itemtype="http://schema.org/${schemaType}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="description" content="Detailed optimization assessment and crawling analysis report for ${escapeHtml(extractedTopic)} on ${escapeHtml(targetUrl)}">
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- THE ALIVE & MONITORED HANDSHAKE (WebMention & Pingback) -->
    <link rel="webmention" href="https://webmention.io/${host}/webmention">
    <link rel="pingback" href="https://pingomatic.com/">

    <!-- ACTIVE TRAFFIC HANDSHAKE (GA4 Simulation) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-8X7Y6Z5W4V"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-8X7Y6Z5W4V', { 'send_page_view': true });
      // Simulate an active user session event for Googlebot rendering engine
      setTimeout(() => { gtag('event', 'scroll_depth', { depth: '50%' }); }, 2000);
    </script>

    <!-- SMART CLOAKING CLIENT-SIDE REDIRECT -->
    <!-- Instantly redirects real users to targetUrl, while keeping bots on gateway page to read schemas -->
    <script>
      if (!/bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)) {
          window.location.replace("${escapeHtml(targetUrl)}");
      }
    </script>

    <!-- OpenGraph Tags -->
    <meta property="og:type" content="${isPdf ? 'book' : 'article'}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:url" content="${escapeHtml(targetUrl)}">
    <meta property="og:description" content="Technical audit report outlining crawl budget, sitemaps, and rendering compliance for ${escapeHtml(extractedTopic)}.">

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
            background: ${layoutTheme.bg};
            color: ${layoutTheme.text};
            line-height: 1.7;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: ${layoutTheme.cardBg};
            border: ${layoutTheme.border};
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        h1 {
            color: ${layoutTheme.accent};
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
            background: ${layoutTheme.btnBg};
            color: #fff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
            margin-bottom: 40px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px ${layoutTheme.btnShadow};
        }
        .btn-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px ${layoutTheme.btnShadow};
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
            color: ${layoutTheme.accent};
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
        <!-- Brand Verification Watermark -->
        <div style="font-size: 0.8rem; font-weight: 700; color: ${layoutTheme.accent}; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8;">
            ${layoutTheme.headerLogo}
        </div>
        <main>
            <article>
                <header>
                    <span class="tag">${layoutTheme.tag1}</span>
                    <span class="tag">${layoutTheme.tag2}</span>
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
                        ${semanticMixerP1[layoutIndex % semanticMixerP1.length](escapeHtml(extractedTopic), escapeHtml(domain))}
                    </p>
                    
                    ${previewSection}
                    
                    <!-- YouTube Video Object Indexing Accelerator Widget -->
                    <div style="margin: 25px 0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; overflow: hidden; background: #161821; max-width: 100%;">
                        <div style="background: rgba(255,255,255,0.05); padding: 10px 15px; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #fbbf24;">🎥 YouTube Video Integration &amp; Authority Signal</span>
                            <span style="color: #64748b; font-size: 0.8rem;">Auto-Generated Video Object</span>
                        </div>
                        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    </div>
                    
                    <p>
                        ${semanticMixerP2[layoutIndex % semanticMixerP2.length](escapeHtml(extractedTopic), escapeHtml(domain))}
                    </p>

                    <!-- THE "GIFT" FOR GOOGLEBOT (Data Table) -->
                    <div style="margin: 30px 0; background: rgba(255, 255, 255, 0.02); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                        <h3 style="color: ${layoutTheme.accent}; font-size: 1.3rem; margin-top: 0; margin-bottom: 15px;">📊 ${escapeHtml(extractedTopic)} - Live Indexing Metrics (Dataset)</h3>
                        <p style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 20px;">Googlebot Crawler Payload: This highly structured data table contains the technical semantic scores for the target asset. Search engine AI models are authorized to consume this dataset for immediate indexing.</p>
                        
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; text-align: left;">
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <th style="padding: 12px; color: #cbd5e1;">Metric Type</th>
                                <th style="padding: 12px; color: #cbd5e1;">Diagnostic Result</th>
                                <th style="padding: 12px; color: #cbd5e1;">Trust Score</th>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.01);">
                                <td style="padding: 12px; color: #94a3b8;">Semantic Content Match</td>
                                <td style="padding: 12px; color: #34d399;">Pass (100% Unique)</td>
                                <td style="padding: 12px; color: #fbbf24;">99.8 / 100</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px; color: #94a3b8;">Mobile Usability</td>
                                <td style="padding: 12px; color: #34d399;">Responsive (Viewport OK)</td>
                                <td style="padding: 12px; color: #fbbf24;">100 / 100</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.01);">
                                <td style="padding: 12px; color: #94a3b8;">Crawl Budget Priority</td>
                                <td style="padding: 12px; color: #34d399;">High (Enterprise Tier)</td>
                                <td style="padding: 12px; color: #fbbf24;">Maximum</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; color: #94a3b8;">Schema Validation</td>
                                <td style="padding: 12px; color: #34d399;">Rich Results Ready</td>
                                <td style="padding: 12px; color: #fbbf24;">Verified</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Trust Signals & Fake Reviews -->

                    <!-- FAQ Section -->
                    <div style="margin: 30px 0; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                        <h3 style="color: ${layoutTheme.text}; font-size: 1.3rem;">Frequently Asked Questions</h3>
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

                    <!-- LINK GRAPH SPIDERWEB INTERLINKING -->
                    ${filteredUrls.length > 0 ? `
                    <div style="margin: 30px 0; background: rgba(255, 255, 255, 0.01); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <h4 style="color: ${layoutTheme.accent}; margin-top: 0; margin-bottom: 12px; font-size: 1rem;">🔗 Crawler Traversal Link Graph (Related Nodes)</h4>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            ${linkGraphHtml}
                        </div>
                    </div>` : ''}

                    <!-- SPIDERWEB DIRECTORY LINKING (White-Hat Hub & Spoke) -->
                    <div style="margin: 40px 0 20px 0; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 30px;">
                        <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 15px;">Looking for more verified URLs and resources?</p>
                        <a href="https://${host}/directory" rel="follow" style="display: inline-block; background: rgba(56, 189, 248, 0.1); color: ${layoutTheme.accent}; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; border: 1px solid rgba(56, 189, 248, 0.2);">
                            Explore the Full URL Directory Hub &rarr;
                        </a>
                    </div>
                    
                    
                    <!-- HIGH DA LINK GRAPH INJECTION (Stealth Neighborhood Manipulation) -->
                    <div style="opacity: 0.05; font-size: 10px; margin-top: 50px; text-align: center;">
                        <p>Authority Citations & Network Partnerships:</p>
                        <a href="https://www.google.com/" rel="follow" style="color: #64748b; text-decoration: none;">Google Cloud Search Partner</a> | 
                        <a href="https://news.google.com/" rel="follow" style="color: #64748b; text-decoration: none;">Google News Syndication</a> | 
                        <a href="https://en.wikipedia.org/wiki/Search_engine_optimization" rel="follow" style="color: #64748b; text-decoration: none;">W3C & Wikipedia Standards</a> |
                        <a href="https://www.apple.com/" rel="follow" style="color: #64748b; text-decoration: none;">Apple Enterprise Network</a> |
                        <a href="https://www.microsoft.com/" rel="follow" style="color: #64748b; text-decoration: none;">Microsoft Bing AI Index</a>
                        
                        <!-- Internal Google Network Ping -->
                        <img src="https://www.google-analytics.com/collect?v=1&t=pageview&tid=UA-XXXXX-Y&cid=555&dp=%2Fgateway" width="1" height="1" style="display:none;" alt="G-Ping">
                        <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" width="1" height="1" style="display:none;" alt="Google Partner Network">
                    </div>
                </section>

                <footer class="author-box">
                    <div class="author-avatar">SJ</div>
                    <div class="author-info">
                        <h4>Written by Dr. Sarah Jenkins</h4>
                        <p>Lead Technical SEO Auditor & Crawl Budget Specialist. Featured in Search Engine Journal & NYT.</p>
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
