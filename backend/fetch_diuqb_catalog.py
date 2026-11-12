import urllib.request
import json
from collections import defaultdict

headers = {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}

print("Querying DIUQBank API...")
url = "https://api.diuqbank.com/questions?perPage=100&page=1"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode('utf-8'))

total_questions = res['meta']['total']
total_pages = res['meta']['totalPages']
print(f"Total Questions in Archive: {total_questions} across {total_pages} pages")

# Let's inspect pages 1 to 5 to see CSE courses coverage
course_counts = defaultdict(lambda: {'midterm': 0, 'final': 0, 'sample_papers': []})

for page in range(1, 6):
    p_url = f"https://api.diuqbank.com/questions?perPage=100&page={page}"
    p_req = urllib.request.Request(p_url, headers=headers)
    with urllib.request.urlopen(p_req) as p_resp:
        p_res = json.loads(p_resp.read().decode('utf-8'))
        for q in p_res.get('data', []):
            dept = q.get('department', {}).get('shortName')
            if dept == 'CSE':
                c_name = q.get('course', {}).get('name')
                exam_type = (q.get('examType', {}).get('name') or 'Exam').lower()
                if 'mid' in exam_type:
                    course_counts[c_name]['midterm'] += 1
                else:
                    course_counts[c_name]['final'] += 1
                if len(course_counts[c_name]['sample_papers']) < 2:
                    course_counts[c_name]['sample_papers'].append({
                        'id': q['id'],
                        'title': q['title'],
                        'semester': q.get('semester', {}).get('name')
                    })

print("\n--- DIU CSE Question Papers by Course (Sample from first 500 records) ---")
for course, stats in sorted(course_counts.items(), key=lambda x: x[1]['midterm'] + x[1]['final'], reverse=True):
    total = stats['midterm'] + stats['final']
    print(f"{course:<35} Total: {total:<3} (Mid: {stats['midterm']}, Final: {stats['final']})")
    for sp in stats['sample_papers']:
        print(f"   -> [{sp['id']}] {sp['title']}")
