import requests
from datetime import datetime
import asyncio
import aiohttp

class IndexNowProtocolEngine:
    def __init__(self):
        self.api_key = '8a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
        self.endpoints = [
            'https://api.indexnow.org/indexnow',
            'https://www.bing.com/indexnow',
            'https://yandex.com/indexnow'
        ]

    async def _post_endpoint(self, session, url, payload):
        try:
            async with session.post(url, json=payload, timeout=3) as response:
                return response.status
        except Exception:
            return None

    async def submit_indexnow_batch(self, urls, host='ai-fast-indexing-engine.vercel.app'):
        print(f"⚡ [IndexNowProtocolEngine] Submitting {len(urls)} URLs to IndexNow Protocol Network...")
        
        payload = {
            "host": host,
            "key": self.api_key,
            "keyLocation": f"https://{host}/{self.api_key}.txt",
            "urlList": urls
        }
        
        success_count = 0
        async with aiohttp.ClientSession() as session:
            tasks = [self._post_endpoint(session, endpoint, payload) for endpoint in self.endpoints]
            results = await asyncio.gather(*tasks)
            
            for status in results:
                if status in [200, 202]:
                    success_count += 1
                    
        return {
            "urlsSubmitted": len(urls),
            "endpointsPinged": len(self.endpoints),
            "successfulResponses": success_count,
            "status": "indexnow_protocol_dispatched",
            "timestamp": datetime.utcnow().isoformat()
        }

indexnow_engine = IndexNowProtocolEngine()
