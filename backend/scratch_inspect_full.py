import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
}

url = 'https://api.diuqbank.com/questions/1742'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    detail = json.loads(resp.read().decode('utf-8'))
    print("Full keys of #1742:", list(detail.keys()))
    print("Detail contents:")
    for k, v in detail.items():
        print(f"  {k}: {str(v)[:150]}")
