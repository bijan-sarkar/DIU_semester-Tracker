import asyncio
import urllib.request
import json
from sqlalchemy.future import select

from app.database import AsyncSessionLocal, init_db
from app.models.course import Course
from app.models.paper import PastQuestionPaper

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json',
}

# Mapping all DIUQBank CSE course variants to our official DIU course codes
COURSE_NAME_MAP = {
    "algorithm": "CSE-213",
    "algorithms": "CSE-213",
    "art of living": "AOL-101",
    "artificial intelligence": "CSE-316",
    "bangladesh studies": "BDS-101",
    "basic electronics": "CSE-215",
    "basic functional english and english spoken": "ENG-101",
    "compiler design": "CSE-313",
    "computer architecture": "CSE-317",
    "computer architecture and organization": "CSE-317",
    "computer organization and architecture": "CSE-317",
    "computer fundamentals": "CSE-112",
    "computer graphics": "CSE-411",
    "computer networks": "CSE-321",
    "data communication": "CSE-225",
    "data mining and machine learning": "CSE-E01",
    "machine learning": "CSE-E01",
    "data structure": "CSE-123",
    "data structures": "CSE-123",
    "database management system": "CSE-311",
    "digital electronics": "CSE-223",
    "digital image processing": "CSE-E02",
    "digital logic design": "CSE-223",
    "discrete mathematics": "CSE-212",
    "economics": "ECO-426",
    "engineering economics": "ECO-426",
    "electrical circuits": "CSE-121",
    "electronic devices and circuits": "CSE-215",
    "embedded systems and iot": "CSE-E03",
    "engineering mathematics": "MAT-211",
    "math for computer science": "MAT-211",
    "financial and managerial accounting": "ACT-327",
    "information security": "CSE-E04",
    "instrumentation and control": "CSE-325",
    "mathematics i": "MAT-101",
    "mathematics ii": "MAT-102",
    "microprocessor and micro-controller": "CSE-317",
    "microprocessor and microcontroller": "CSE-317",
    "microprocessor, embedded systems and iot": "CSE-317",
    "mobile application design": "CSE-E05",
    "natural language processing": "CSE-E06",
    "numerical methods": "CSE-226",
    "object oriented programming": "CSE-221",
    "object oriented programming ii": "CSE-221",
    "operating systems": "CSE-323",
    "physics i": "PHY-101",
    "physics-i": "PHY-101",
    "physics ii": "PHY-102",
    "programming and problem solving": "CSE-113",
    "social and professional issues in computing": "CSE-326",
    "software engineering": "CSE-315",
    "software project management and documentation": "CSE-E02",
    "statistics and probability": "STA-101",
    "system analysis and design": "CSE-227",
    "systems analysis and design": "CSE-227",
    "theory of computation": "CSE-228",
    "web engineering": "CSE-E01",
    "writing and comprehension": "ENG-102"
}

def get_submission_pdf(question_id: int):
    try:
        url = f"https://api.diuqbank.com/questions/{question_id}/submissions"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            subs = data.get('data', [])
            if subs:
                return subs[0].get('pdfUrl'), subs[0].get('fileSize', 0)
    except Exception:
        pass
    return None, 0

async def sync_papers(max_pages=20):
    await init_db()
    print("Starting complete DIUQBank archive sync...")

    async with AsyncSessionLocal() as session:
        # Load course codes map
        c_res = await session.execute(select(Course))
        courses = c_res.scalars().all()
        code_to_id = {c.code: c.id for c in courses}

        existing_res = await session.execute(select(PastQuestionPaper.diuqb_id))
        existing_diuqb_ids = set(existing_res.scalars().all())

        synced_count = 0

        for page in range(1, max_pages + 1):
            url = f"https://api.diuqbank.com/questions?perPage=100&page={page}"
            try:
                req = urllib.request.Request(url, headers=HEADERS)
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    items = data.get('data', [])

                    for item in items:
                        qid = item['id']
                        if qid in existing_diuqb_ids:
                            continue

                        dept = item.get('department', {}).get('shortName')
                        if dept != 'CSE':
                            continue

                        c_name_raw = item.get('course', {}).get('name', '').lower().strip()
                        course_code = COURSE_NAME_MAP.get(c_name_raw)
                        if not course_code:
                            for k, v in COURSE_NAME_MAP.items():
                                if k in c_name_raw or c_name_raw in k:
                                    course_code = v
                                    break

                        if not course_code or course_code not in code_to_id:
                            continue

                        course_id = code_to_id[course_code]
                        exam_type = item.get('examType', {}).get('name', 'Exam')
                        semester_name = item.get('semester', {}).get('name', '')
                        title = item.get('title', '')
                        view_count = item.get('viewCount', 0)

                        # Fetch direct PDF URL from R2
                        pdf_url, file_size = get_submission_pdf(qid)

                        paper = PastQuestionPaper(
                            course_id=course_id,
                            diuqb_id=qid,
                            title=title,
                            semester_name=semester_name,
                            exam_type=exam_type,
                            pdf_url=pdf_url,
                            file_size=file_size,
                            view_count=view_count
                        )
                        session.add(paper)
                        existing_diuqb_ids.add(qid)
                        synced_count += 1
                        print(f"[{course_code}] Synced: {title} -> {pdf_url is not None}")

                    await session.commit()
            except Exception as e:
                print(f"Error on page {page}: {e}")

        print(f"\nSuccessfully synced {synced_count} real DIU question papers with PDF download links into database!")

if __name__ == "__main__":
    asyncio.run(sync_papers(max_pages=20))
