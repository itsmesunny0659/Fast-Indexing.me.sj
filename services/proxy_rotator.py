import os
import json
import random
import time
import asyncio
import aiohttp
from typing import Optional, Dict, Any

class ProxyPoolManager:
    def __init__(self):
        self.proxy_pool = []
        self.last_fetch = 0
        self.is_fetching = False
        self.api_endpoints = [
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
            'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=elite',
            'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt'
        ]

    async def refresh_pool(self):
        if self.is_fetching or (time.time() - self.last_fetch < 3600):
            return
        
        self.is_fetching = True
        try:
            print("[ProxyPoolManager] 🔄 Scraping fresh Elite Proxies...")
            new_proxies = []
            
            async with aiohttp.ClientSession() as session:
                for api in self.api_endpoints:
                    try:
                        async with session.get(api, timeout=5) as res:
                            if res.status == 200:
                                text = await res.text()
                                proxies = [p.strip() for p in text.split('\n') if ':' in p]
                                new_proxies.extend(proxies)
                    except Exception:
                        pass
                        
            # Deduplicate and shuffle
            self.proxy_pool = list(set(new_proxies))
            random.shuffle(self.proxy_pool)
            self.last_fetch = time.time()
            print(f"[ProxyPoolManager] ✅ Successfully loaded {len(self.proxy_pool)} elite proxies into memory.")
        finally:
            self.is_fetching = False

    def get_random_proxy(self) -> Optional[str]:
        if not self.proxy_pool:
            # Fire and forget refresh
            asyncio.create_task(self.refresh_pool())
            return None
        return random.choice(self.proxy_pool)

class ProxyRotatorEngine:
    def __init__(self):
        self.gas_proxy_url = os.environ.get('GAS_PROXY_URL')
        self.cf_proxy_url = os.environ.get('CF_PROXY_URL')
        self.pool_manager = ProxyPoolManager()
        # Ensure loop is running before scheduling
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self.pool_manager.refresh_pool())
        except RuntimeError:
            pass # No loop running yet

    def inject_carrier_headers(self, base_headers: Dict[str, str] = None) -> Dict[str, str]:
        if base_headers is None:
            base_headers = {}
            
        carriers = [
            {'via': '1.1 Vodafone-UK', 'profile': 'http://wap.samsungmobile.com/uaprof/SM-G920F.xml'},
            {'via': '1.1 att.net', 'profile': 'http://www.htc.com/us/profile/HTC_One.xml'},
            {'via': '1.1 jio.com', 'profile': 'http://wap.samsungmobile.com/uaprof/SM-G900F.xml'},
            {'via': '1.1 t-mobile.com', 'profile': 'http://www.apple.com/iphone/uaprof.xml'}
        ]
        carrier = random.choice(carriers)
        fake_ip = f"192.0.2.{random.randint(0, 255)}"
        
        headers = dict(base_headers)
        headers.update({
            'Via': carrier['via'],
            'X-Wap-Profile': carrier['profile'],
            'Forwarded': f"for={fake_ip};proto=http;by=203.0.113.{random.randint(0, 255)}"
        })
        return headers

    async def fetch_via_gas(self, url: str, options: Dict[str, Any], timeout: int) -> Optional[aiohttp.ClientResponse]:
        if not self.gas_proxy_url:
            raise ValueError("GAS Proxy Not Configured")
            
        print("[EliteProxy] 🟡 Layer 1: Routing via GAS")
        payload = {
            "url": url,
            "method": options.get('method', 'GET'),
            "headers": options.get('headers', {}),
            "body": options.get('body')
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.gas_proxy_url, json=payload, headers={'X-Proxy-Bypass': 'true'}, timeout=timeout) as res:
                if res.status != 200:
                    raise Exception(f"GAS Error: {res.status}")
                print("[EliteProxy] ✅ Layer 1 (GAS) Success")
                return await res.text()

    # Similar conversions for CF, Phantom, Elite, Tor...
    # For brevity in this setup phase, I am porting the main flow and fallback
    
    async def execute_safe_request(self, url: str, options: Dict[str, Any] = None, timeout: int = 3, max_retries: int = 2):
        if options is None: options = {}
        
        attempts = 0
        while attempts < max_retries:
            attempts += 1
            print(f"[EliteProxy] 🔄 Cycle {attempts}/{max_retries} for {url}")
            
            try:
                # Direct fallback for now until all layers are fully ported
                headers = self.inject_carrier_headers(options.get('headers', {}))
                headers['X-Proxy-Bypass'] = 'true'
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, headers=headers, timeout=timeout) as res:
                        return await res.text()
            except Exception as e:
                print(f"[EliteProxy] 🚨 Cycle failed: {e}")
                
        return None

proxy_rotator = ProxyRotatorEngine()
