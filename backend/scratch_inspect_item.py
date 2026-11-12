import urllib.request
import json

headers = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
}

url = 'https://api.diuqbank.com/questions?perPage=5'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    print("Total Questions in DIUQBank:", res['meta']['total'])
    sample = res['data'][0]
    print("\nSample Question Item from list:")
    print(json.dumps(sample, indent=2))

    sample_id = sample['id']
    detail_url = f"https://api.diuqbank.com/questions/{sample_id}"
    req2 = urllib.request.Request(detail_url, headers=headers)
    with urllib.request.urlopen(req2) as resp2:
        detail = json.loads(resp2.read().decode('utf-8'))
        print(f"\nSample Question Detail for #{sample_id}:")
        print(json.dumps(detail, indent=2)[:800])
