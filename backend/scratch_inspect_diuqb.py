import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0'}

req = urllib.request.Request('https://diuqbank.com/assets/form-D0DdCDbq.js', headers=headers)
js = urllib.request.urlopen(req).read().decode('utf-8')

# Find occurrences of api.diuqbank.com
print("Matches for api.diuqbank.com:")
for m in re.finditer(r'api\.diuqbank\.com[a-zA-Z0-9_\-\.\/]+', js):
    print(" ", m.group(0))

# Search for endpoints
print("\nEndpoints:")
for m in re.finditer(r'["\'`](/[a-zA-Z0-9_\-\.\/]+)["\'`]', js):
    s = m.group(1)
    if any(k in s for k in ['question', 'course', 'department', 'semester', 'exam', 'paper']):
        print(" ", s)
