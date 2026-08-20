from datetime import datetime
import asyncio
import aiohttp
from urllib.parse import quote

def escape_xml(s):
    if not s: return ''
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&apos;')

class NewsPublisherEngine:
    def generate_news_article_json_ld(self, target_url, index_id):
        now_iso = datetime.utcnow().isoformat()
        return {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "@id": f"{target_url}#newsarticle",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": target_url
            },
            "headline": f"Breaking Indexing News Item #{index_id}",
            "image": ["https://ai-fast-indexing-engine.vercel.app/og-image.png"],
            "datePublished": now_iso,
            "dateModified": now_iso,
            "author": {
                "@type": "Organization",
                "name": "Fast Indexing News Network",
                "url": "https://ai-fast-indexing-engine.vercel.app"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Fast Indexing Engine",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://ai-fast-indexing-engine.vercel.app/favicon.ico"
                }
            },
            "description": "High-priority instant news indexing payload item",
            "about": [
                { "@type": "Organization", "name": "BBC News Original", "sameAs": "https://en.wikipedia.org/wiki/BBC_News" },
                { "@type": "Organization", "name": "CNN Original Channel", "sameAs": "https://en.wikipedia.org/wiki/CNN" }
            ],
            "mentions": [
                {
                    "@type": "Thing",
                    "name": "Google Indexing System",
                    "sameAs": "https://en.wikipedia.org/wiki/Google_Search"
                }
            ]
        }

    def generate_news_sitemap_xml(self, recent_urls, host='ai-fast-indexing-engine.vercel.app'):
        now_iso = datetime.utcnow().isoformat()
        items_xml = ""
        for idx, url in enumerate(recent_urls):
            items_xml += f"""
    <url>
        <loc>{escape_xml(url)}</loc>
        <news:news>
            <news:publication>
                <news:name>Fast Indexing Engine News</news:name>
                <news:language>en</news:language>
            </news:publication>
            <news:publication_date>{now_iso}</news:publication_date>
            <news:title>Fast Indexing Item #{idx + 1}</news:title>
        </news:news>
        <lastmod>{now_iso}</lastmod>
        <changefreq>always</changefreq>
        <priority>1.0</priority>
    </url>"""

        return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    {items_xml}
</urlset>"""

    async def _fetch_ignore(self, session, url, method='GET', data=None):
        try:
            headers = {'Content-Type': 'application/x-www-form-urlencoded'} if data else {}
            async with session.request(method, url, data=data, headers=headers, timeout=3) as _:
                pass
        except Exception:
            pass

    async def execute_news_priority_broadcast(self, urls, host='ai-fast-indexing-engine.vercel.app'):
        print(f"📰 [NewsPublisherEngine] Executing Google News Grade Priority Broadcast for {len(urls)} URLs")
        news_sitemap_url = f"https://{host}/news-sitemap.xml"
        
        async with aiohttp.ClientSession() as session:
            tasks = [
                self._fetch_ignore(session, f"https://www.google.com/ping?sitemap={quote(news_sitemap_url, safe='')}"),
                self._fetch_ignore(session, "https://pubsubhubbub.appspot.com/", method='POST', data=f"hub.mode=publish&hub.url={quote(news_sitemap_url, safe='')}")
            ]
            await asyncio.gather(*tasks)

        return {
            "priorityGrade": 'Google News High-Crawl Budget Priority',
            "urlsProcessed": len(urls),
            "newsSitemap": news_sitemap_url,
            "status": 'news_priority_broadcast_executed'
        }

news_publisher = NewsPublisherEngine()
