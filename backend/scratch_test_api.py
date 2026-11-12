import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
}

test_urls = [
    'https://api.diuqbank.com/questions',
    'https://api.diuqbank.com/api/questions',
    'https://api.diuqbank.com/api/v1/questions',
    'https://api.diuqbank.com/courses',
    'https://api.diuqbank.com/api/courses',
]

for url in test_urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read().decode('utf-8')
            print(f"SUCCESS {url}: Status {resp.status} - Length {len(data)}")
            try:
                parsed = json.loads(data)
                if isinstance(parsed, list):
                    print(f"  List with {len(parsed)} items. Sample: {parsed[0] if parsed else 'empty'}")
                elif isinstance(parsed, dict):
                    print(f"  Dict keys: {list(parsed.keys())}")
                    for k in list(parsed.keys())[:3]:
                        print(f"    {k}: {str(parsed[k])[:100]}")
            except Exception:
                print(f"  Preview: {data[:200]}")
    except Exception as e:
        print(f"FAILED {url}: {e}")
