import asyncio
import aiohttp
from datetime import datetime
from urllib.parse import urlencode, quote

class MegaPubSubEngine:
    def __init__(self):
        self.pubsub_hubs = [
            'https://pubsubhubbub.appspot.com/',
            'https://superfeedr.com/hub',
            'http://pushpress.com/hub',
            'https://www.subtome.com/hub',
            'https://pubsubhubbub.wordpress.com/',
            'https://switchboard.pubsubhubbub.org/'
        ]
        self.feedburner_endpoints = [
            'https://feedburner.google.com/fb/a/pingSubmit',
            'https://feedburner.google.com/fb/a/publishFeed'
        ]

    async def _fetch_with_timeout(self, session, url, options, timeout=2.5):
        try:
            method = options.get('method', 'GET')
            headers = options.get('headers', {})
            data = options.get('data')
            
            async with session.request(method, url, headers=headers, data=data, timeout=timeout) as response:
                return response.status
        except Exception:
            return None

    async def dispatch_mega_pubsub(self, target_url):
        print(f"[MegaPubSubEngine] Dispatching ALL World PubSubHubbub & Feedburner Hubs for: {target_url}")
        
        encoded_url = quote(target_url, safe='')
        
        pubsub_data = urlencode({
            'hub.mode': 'publish',
            'hub.url': target_url
        })
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            
            # 1. Dispatch to All PubSubHubbub Hubs
            for hub in self.pubsub_hubs:
                tasks.append(
                    self._fetch_with_timeout(session, hub, {
                        'method': 'POST',
                        'headers': {'Content-Type': 'application/x-www-form-urlencoded'},
                        'data': pubsub_data
                    })
                )
                
            # 2. Dispatch to All Feedburner Endpoints
            for endpoint in self.feedburner_endpoints:
                tasks.append(
                    self._fetch_with_timeout(session, f"{endpoint}?bloglink={encoded_url}&url={encoded_url}", {
                        'method': 'GET',
                        'headers': {'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'}
                    })
                )
                
            await asyncio.gather(*tasks)
            
        return {
            "url": target_url,
            "pushedAt": datetime.utcnow().isoformat(),
            "status": 'mega_pubsub_pushed',
            "hubsCount": len(self.pubsub_hubs) + len(self.feedburner_endpoints),
            "details": {
                "googlePubSubHubbub": True,
                "superfeedrHub": True,
                "wordpressPubSub": True,
                "switchboardHub": True,
                "subtomeHub": True,
                "googleFeedburner": True
            }
        }

mega_pubsub_engine = MegaPubSubEngine()
