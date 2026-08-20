import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime

SCOPES = [
    'https://www.googleapis.com/auth/indexing',
    'https://www.googleapis.com/auth/webmasters'
]

class GscInspectionEngine:
    def get_fallback_service_account(self):
        sa_json = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
        if sa_json:
            try:
                return json.loads(sa_json)
            except Exception:
                return None
        return None
        
    def get_service_account(self):
        # TODO: Implement CacheManager logic for key rotation
        return self.get_fallback_service_account()

    def get_jwt_client(self, sa):
        creds = service_account.Credentials.from_service_account_info(
            sa, scopes=SCOPES
        )
        return creds

    async def request_indexing(self, gateway_url):
        sa = self.get_service_account()
        if not sa:
            return {"success": False, "message": 'No service account'}
            
        try:
            creds = self.get_jwt_client(sa)
            service = build('indexing', 'v3', credentials=creds, cache_discovery=False)
            
            body = {
                "url": gateway_url,
                "type": "URL_UPDATED"
            }
            
            request = service.urlNotifications().publish(body=body)
            response = request.execute()
            
            return {
                "success": True,
                "message": 'Request Indexing submitted to Google ✓',
                "urlNotifyResult": response
            }
        except Exception as e:
            msg = str(e)
            if '403' in msg or 'Permission denied' in msg:
                return {
                    "success": False,
                    "message": 'Add service account as Owner in Search Console for this domain'
                }
            return {"success": False, "message": msg}

    async def check_index_status(self, gateway_url, site_url):
        sa = self.get_service_account()
        if not sa:
            return {"status": 'UNKNOWN', "message": 'No service account'}
            
        try:
            creds = self.get_jwt_client(sa)
            service = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)
            
            body = {
                "inspectionUrl": gateway_url,
                "siteUrl": site_url
            }
            
            request = service.urlInspection().index().inspect(body=body)
            res = request.execute()
            
            result = res.get('inspectionResult', {})
            status_result = result.get('indexStatusResult', {})
            
            verdict = status_result.get('verdict', 'UNKNOWN')
            coverage_state = status_result.get('coverageState', '')
            last_crawl_time = status_result.get('lastCrawlTime', None)
            
            return {
                "status": verdict,
                "coverageState": coverage_state,
                "lastCrawlTime": last_crawl_time,
                "message": self.get_status_message(verdict, coverage_state)
            }
        except Exception as e:
            return {"status": 'UNKNOWN', "message": str(e)}

    def get_status_message(self, verdict, coverage_state):
        if verdict == 'PASS': return '✅ Indexed by Google'
        if verdict == 'NEUTRAL': return '⏳ Crawled - awaiting indexing'
        if 'Submitted' in coverage_state: return '📤 Submitted & in queue'
        return '⏳ Indexing request sent - Google will crawl soon'

    async def process_url(self, gateway_url, original_url, host):
        # Step 1: Submit "Request Indexing" via Indexing API
        index_result = await self.request_indexing(gateway_url)
        
        if index_result.get('success'):
            status_message = '📤 Request Indexing submitted to Google Search Console ✓'
        else:
            status_message = f"⚠️ {index_result.get('message')}"
            
        return {
            "gatewayUrl": gateway_url,
            "originalUrl": original_url,
            "indexingApiSubmitted": index_result.get('success'),
            "gscStatus": status_message,
            "submittedAt": datetime.utcnow().isoformat(),
            "note": 'Google typically indexes within 1-24 hours. Gateway page created on verified domain.'
        }

gsc_inspection_engine = GscInspectionEngine()
