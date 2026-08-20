import os
import aiohttp

class SpeedyIndexEngine:
    def __init__(self):
        # SpeedyIndex API key (Should be stored in environment variables)
        self.api_key = os.environ.get('SPEEDYINDEX_API_KEY', 'YOUR_API_KEY_HERE')
        self.endpoint = 'https://speedyindex.com/api/v2/links'

    async def submit_batch(self, urls):
        if not self.api_key or self.api_key == 'YOUR_API_KEY_HERE':
            print('[SpeedyIndexEngine] Skipped: API Key not configured.')
            return {"success": False, "message": 'SpeedyIndex API key missing.'}

        try:
            print(f"[SpeedyIndexEngine] Submitting {len(urls)} URLs to SpeedyIndex...")
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}'
            }
            payload = {
                "links": urls
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.endpoint, json=payload, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        raise Exception(f"SpeedyIndex API responded with status {response.status}")
                    
                    data = await response.json()
                    return {
                        "success": True,
                        "message": 'Successfully submitted to SpeedyIndex API',
                        "data": data
                    }
        except Exception as e:
            print(f'[SpeedyIndexEngine] API Error: {str(e)}')
            return {"success": False, "message": str(e)}

speedy_index_engine = SpeedyIndexEngine()
