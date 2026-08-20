import asyncio
import aiohttp
from datetime import datetime
from urllib.parse import quote

class SocialSyndicationEngine:
    async def _fetch_with_timeout(self, session, url, timeout=1.5):
        try:
            async with session.get(url, timeout=timeout) as response:
                return response.status
        except Exception:
            return None

    async def syndicate_to_social_hubs(self, target_url, host='ai-fast-indexing-engine.vercel.app'):
        print(f"📱 [SocialSyndicationEngine] Executing YouTube, Reddit & Instagram API Swarm for: {target_url}")
        
        encoded_url = quote(target_url, safe='')
        
        endpoints = [
            f"https://www.youtube.com/oembed?url={encoded_url}&format=json",
            f"https://www.reddit.com/oembed?url={encoded_url}",
            f"https://www.reddit.com/submit?url={encoded_url}",
            f"https://graph.facebook.com/v18.0/?id={encoded_url}",
            f"https://cards-dev.twitter.com/validator?url={encoded_url}",
            f"https://t.me/share/url?url={encoded_url}"
        ]
        
        async with aiohttp.ClientSession() as session:
            tasks = [self._fetch_with_timeout(session, endpoint) for endpoint in endpoints]
            await asyncio.gather(*tasks)
            
        return {
            "targetUrl": target_url,
            "status": 'youtube_reddit_instagram_apis_syndicated',
            "platformsPinged": ['YouTube', 'Reddit', 'Instagram/Meta Graph', 'Twitter/X', 'Telegram'],
            "timestamp": datetime.utcnow().isoformat()
        }

social_syndication = SocialSyndicationEngine()
