import asyncio
import os
import random
from services.proxy_rotator import proxy_rotator

class RealHumanBotDaemon:
    def __init__(self):
        self.active_urls = set()
        self.is_daemon_running = False

        self.reputed_bot_user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
            'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
        ]

        self.referrers = [
            'https://www.google.com/search?q=breaking+news',
            'https://news.google.com/',
            'https://www.google.com/search?q=latest+updates&tbm=nws',
            'https://www.google.com/',
            'https://t.co/',
            'https://www.reddit.com/r/news/',
            'https://l.facebook.com/',
            'https://www.bing.com/search?q=news'
        ]

        self.ga4_measurement_id = os.environ.get('GA4_MEASUREMENT_ID')
        self.ga4_api_secret = os.environ.get('GA4_API_SECRET')

        self.global_ip_blocks = [
            {'prefix': '24.', 'range': [0, 255], 'country': 'US', 'lang': 'en-US'},
            {'prefix': '86.', 'range': [0, 255], 'country': 'GB', 'lang': 'en-GB'},
            {'prefix': '49.', 'range': [32, 47], 'country': 'IN', 'lang': 'hi-IN,en-IN'},
            {'prefix': '79.', 'range': [192, 255], 'country': 'DE', 'lang': 'de-DE'},
            {'prefix': '90.', 'range': [0, 63], 'country': 'FR', 'lang': 'fr-FR'},
        ]

    def get_global_ip_profile(self):
        block = random.choice(self.global_ip_blocks)
        oct2 = random.randint(block['range'][0], block['range'][1])
        oct3 = random.randint(0, 255)
        oct4 = random.randint(1, 254)
        ip = f"{block['prefix']}{oct2}.{oct3}.{oct4}"
        return {'ip': ip, 'country': block['country'], 'lang': block['lang']}

    def build_geo_headers(self, base_headers=None):
        if base_headers is None: base_headers = {}
        geo = self.get_global_ip_profile()
        headers = dict(base_headers)
        headers.update({
            'X-Forwarded-For': geo['ip'],
            'X-Real-IP': geo['ip'],
            'Client-IP': geo['ip'],
            'True-Client-IP': geo['ip'],
            'CF-Connecting-IP': geo['ip'],
            'X-Country-Code': geo['country'],
            'Accept-Language': f"{geo['lang']},en;q=0.8",
        })
        return headers

    async def register_urls(self, urls):
        for u in urls:
            self.active_urls.add(u)
        print(f"🤖 [RealHumanBotDaemon] Total active URLs in High-DA Ping Loop: {len(self.active_urls)}")
        
        try:
            await self.execute_5_second_traffic_pulse()
            await asyncio.sleep(0.3)
            await self.execute_5_second_traffic_pulse()
            await asyncio.sleep(0.3)
            await self.execute_5_second_traffic_pulse()
        except Exception as e:
            print('RealHumanBotDaemon Immediate Pulse Error:', str(e))

        self.start_daemon()

    def start_daemon(self):
        if self.is_daemon_running: return
        self.is_daemon_running = True
        print('⚡ [RealHumanBotDaemon] Continuous Re-Ping Loop Activated!')
        
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._daemon_loop())
        except RuntimeError:
            pass

    async def _daemon_loop(self):
        while True:
            await asyncio.sleep(5)
            try:
                await self.execute_5_second_traffic_pulse()
            except Exception:
                pass

    async def execute_5_second_traffic_pulse(self):
        if not self.active_urls: return
        url_list = list(self.active_urls)[-20:]
        
        tasks = []
        for target_url in url_list:
            ua = random.choice(self.reputed_bot_user_agents)
            ref = random.choice(self.referrers)
            
            headers = self.build_geo_headers({
                'User-Agent': ua,
                'Referer': ref,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            })
            
            tasks.append(proxy_rotator.execute_safe_request(target_url, {'headers': headers}, timeout=2))
            tasks.append(proxy_rotator.execute_safe_request(f"https://www.google.com/ping?sitemap={target_url}", {'headers': self.build_geo_headers({'User-Agent': ua})}, timeout=2))
            tasks.append(proxy_rotator.execute_safe_request(f"https://www.bing.com/ping?sitemap={target_url}", {'headers': self.build_geo_headers({'User-Agent': ua})}, timeout=2))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
            
        print(f"[RealHumanBotDaemon] ✅ Pulse complete. URLs: {len(url_list)}")

real_human_bot = RealHumanBotDaemon()
