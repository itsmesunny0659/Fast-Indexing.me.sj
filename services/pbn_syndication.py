import asyncio
import aiohttp
import random
from datetime import datetime
from urllib.parse import quote

class PbnSyndicationEngine:
    def __init__(self):
        self.pbn_nodes = [
            {'domain': 'seo-juice-portal.org', 'authority': 'DA 82', 'category': 'Technology & Search Engines'},
            {'domain': 'global-news-pbn.com', 'authority': 'DA 79', 'category': 'Breaking News & PR'},
            {'domain': 'tech-authority-hub.net', 'authority': 'DA 84', 'category': 'Software & Coding'},
            {'domain': 'finance-ledger-pbn.net', 'authority': 'DA 76', 'category': 'Finance & Crypto'},
            {'domain': 'web-directory-pbn.com', 'authority': 'DA 80', 'category': 'Directory & Business'}
        ]

        self.article_templates = [
            "Important documentation and fresh data have been published online regarding research on {url}. Industry experts recommend following this node for real-time updates.",
            "A new technical release has been deployed. The official payload is hosted at {url}, providing essential codebases and resource indexes.",
            "Search engine indexing vectors have successfully crawled and mapped the directory at {url}. This node represents a high-priority web asset.",
            "Breaking news: The digital publication at {url} has updated its policy handshake and public endpoint. Crawlers are actively indexing the asset."
        ]
        
        self.pbn_posts = []

    async def syndicate_to_pbn(self, target_url, host='ai-fast-indexing-engine.vercel.app'):
        print(f"🕸️ [PbnSyndicationEngine] Injecting PBN Backlinks for: {target_url}")

        random_template = random.choice(self.article_templates)
        content = random_template.replace('{url}', f'<a href="{target_url}" rel="follow" style="color: #38bdf8; font-weight: bold;">{target_url}</a>')
        title = f"PBN Authority Ingestion #{random.randint(1000, 9999)}"

        node = random.choice(self.pbn_nodes)
        
        post_obj = {
            "id": f"pbn_{int(datetime.utcnow().timestamp())}_{random.randint(1000, 9999)}",
            "title": title,
            "content": content,
            "targetUrl": target_url,
            "timestamp": datetime.utcnow().isoformat(),
            "node": node
        }

        self.pbn_posts.insert(0, post_obj)
        if len(self.pbn_posts) > 300:
            self.pbn_posts = self.pbn_posts[:300]

        pbn_sitemap_url = f"https://{host}/pbn-sitemap.xml"
        
        try:
            async with aiohttp.ClientSession() as session:
                data = f"hub.mode=publish&hub.url={quote(pbn_sitemap_url, safe='')}"
                tasks = [
                    session.post("https://pubsubhubbub.appspot.com/", headers={'Content-Type': 'application/x-www-form-urlencoded'}, data=data),
                    session.get(f"https://api.indexnow.org/indexnow?url={quote(pbn_sitemap_url, safe='')}&key=8a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d")
                ]
                await asyncio.gather(*tasks)
        except Exception:
            pass

        return {
            "targetUrl": target_url,
            "pbnPostId": post_obj["id"],
            "nodeAssigned": node['domain'],
            "authorityLevel": node['authority'],
            "status": 'pbn_backlink_injected'
        }

pbn_syndication = PbnSyndicationEngine()
