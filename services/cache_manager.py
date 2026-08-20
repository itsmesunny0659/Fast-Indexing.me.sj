import os
import json
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'db.json')
KEYS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'keys.json')

class CacheManager:
    def __init__(self):
        self.data = {
            "credits": 1000,
            "jobs": [],
            "recentUrls": [],
            "urlCache": {},
            "serviceAccount": None,
            "serviceAccountPool": []
        }
        self.load_data()

    def load_data(self):
        try:
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    raw = f.read()
                self.data.update(json.loads(raw))
            
            if os.path.exists(KEYS_FILE):
                with open(KEYS_FILE, 'r', encoding='utf-8') as f:
                    keys_array = json.loads(f.read())
                if isinstance(keys_array, list):
                    self.data["serviceAccountPool"] = keys_array
                    if len(keys_array) > 0:
                        self.data["serviceAccount"] = keys_array[0]
        except Exception:
            print('Using in-memory cache storage')

    def save_data(self):
        try:
            os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
            existing_data = {}
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        existing_data = json.loads(f.read())
                except Exception:
                    pass
            
            merged = {**existing_data, **self.data}
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(merged, f, indent=2)
        except Exception:
            # Memory mode on Vercel read-only filesystem
            pass

    def get_service_account(self):
        if self.data.get("serviceAccount") and self.data["serviceAccount"].get("client_email"):
            return self.data["serviceAccount"]
        if self.data.get("serviceAccountPool") and len(self.data["serviceAccountPool"]) > 0:
            return self.data["serviceAccountPool"][0]
        return {
            "type": "service_account",
            "project_id": "ai-fast-indexer",
            "private_key_id": "9316229acf2c9c5e48cd7b106eaf30c016966931",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3731wfudPQSuT\nnzr3fVltNzKfgn+i+Br8CMte8q01VzWN/6v8YnUb3QP3E4p454jPsMFOVpeg63nE\nEdMkSoNUDAb2NeuNQkl5k4GMQUSOf6ELk0dIIfAUFmS/tFto/PlwsDiKmG7rYsQF\nWDyiNlIp5IfpzTc7FZ5E5khwiYhv5DpCBWci2jkUvbW7OhX3wKHH8ja3Nl2V49AJ\n8JlAqmAwzY36rIePhj/EyQOsHTyuCjqvYdO8TJFchmhNBuJfTaNFWWZD50vrYdr1\ni8gnXEKxT0hBgQdq2pg1WAmTyIrudURvYP9Wfdf6XIGqY8P4z8/rOujSiKUS+/9Y\nRFvJr/NJAgMBAAECggEAA60ZLuI9Fu6WA4rMqmf1HW4w0v2lixPLXPCDZAqUn1Ah\nZWJP79OQmfXLtP330rJ0n7YIKbEoXFJ91LHd1vKtokSP77l505EYwoHKC+FoEIhe\nJyA9Q09OVZBxrgqEQy+/KoXoc2NYNYMmqMwFK4wguJlKhXKRC9ttljHwuQhpU4HN\nt7ViVpSDBWqOZqMJK4f6sGHHhD1lK4N7CaiOusIOC1nP9dXQa06gqfCVq6Mnz34t\nCAK5YfNLIqpzsGjQL34vhzjo+hKCrSo+P5c5tDS+Tzpdl+FGbRfzrS6sL3bglK4a\nYCwXeqmnk+WumU/sbFea8LvpKOOO2AxZcOjt0mucKwKBgQDee1v3JBT7DBRqKlZ9\nkq1LAGHNZ+hhRgtJ4M4dK7zAsVfu3VMqttfh8f7WEWb6echW8dB608ispFjuLmg1\nrTMK65vpdRIkfi+PRky5h49ZqRa6gw9t5L3OoQcTmm6ZZcAeQ+4YJyMJtu5Y/RwO\nAqdUWzalb/17iAlBN67zD9myhwKBgQDTpXtFVICWv0oNNsTRYu3V8YaYBG8ZORRi\noLIX4yHHvs/CKwqt1aSAkRq2X0xWeAOiwFG35JJnnDZEj/HZr5aZxOvNNE2x3WW/\nQeZuNcgvGslZFrZ3eh3PQOxl1uAsMFSnVmNNlLMAg+BU+pL55E1NJK5zgOSIYLoZ\nL7kx/48PrwKBgG2XwK6WJIuh4LCHWIGU7i5C6up+49Z+5XKn/YAbGmilM1ajyaMB\n3IgdZ9XVTq/Vq51AktzeVDzO3Eu/qm++eKVJeEzg8WXujsj57TN7Fl8pTtvjUYdl\npSYS5mR+rzp7B88g0TkuljDj3rcRP2+bWQfRwrJt3ySp1z08C78JsMgjAoGBAMgH\nur4H45CWMnLStKoBCjAOGdtLNYVtQSsGHcwdyytx2AH3lBw/sz4f5lM/NnLy8ty7\nT4Cx8v0h0thyA25uWbPzPbmwGU5lpWhh7Ft1UUHT20DsCoBZVhsvjT2jHDQnaZrO\nNwR36cYu3bLzMD4l3Dlw1cAsrdGHOdvcEviCRL/ZAoGBAMYVM7SAbBEuElTwsIDO\nd4NdobUtsihfNMvG4UZdVsRaTmPSa3B5BB18oUyctIV610fmg7aJWdulfvCMY2Ic\+Nh+pxv0LI0jaBidhWUWiKioDJzXfCF2G7pryG7twrB0CFqezVPUN4ExJ3FpWSyg\nu6Bc70U+2Sxc8RG05D7F0WrY\n-----END PRIVATE KEY-----\n",
199:             "client_email": "instant-indexing@ai-fast-indexer.iam.gserviceaccount.com"
200:         }

cache_manager = CacheManager()
