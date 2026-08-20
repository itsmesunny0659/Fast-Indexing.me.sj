import requests
import xml.etree.ElementTree as ET

class SitemapParser:
    def extract_urls(self, sitemap_url: str):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (FastIndexingEngineBot/1.0)'
            }
            response = requests.get(sitemap_url, headers=headers, timeout=10)
            response.raise_for_status()

            # Parse XML
            root = ET.fromstring(response.content)
            
            urls = []
            
            # ElementTree tags include namespace (e.g., {http://www.sitemaps.org/schemas/sitemap/0.9}url)
            # A simple way is to strip namespaces or just search with namespaces
            namespace = ""
            if "}" in root.tag:
                namespace = root.tag.split("}")[0] + "}"

            # Standard <urlset><url><loc> format
            if 'urlset' in root.tag:
                for url_elem in root.findall(f".//{namespace}url"):
                    loc = url_elem.find(f"{namespace}loc")
                    if loc is not None and loc.text:
                        urls.append(loc.text.strip())
            
            # Sitemap Index <sitemapindex><sitemap><loc> format
            elif 'sitemapindex' in root.tag:
                for sitemap_elem in root.findall(f".//{namespace}sitemap"):
                    loc = sitemap_elem.find(f"{namespace}loc")
                    if loc is not None and loc.text:
                        urls.append(loc.text.strip())

            return {
                "success": True,
                "count": len(urls),
                "urls": urls
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }

sitemap_parser = SitemapParser()
