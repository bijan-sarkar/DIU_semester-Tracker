import os
import json
import httpx
from datetime import datetime
from google import genai
from google.genai import types
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.course import Course
from app.models.paper import PastQuestionPaper
from app.models.analysis import CourseAnalysis

def get_gemini_client():
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in configuration")
    return genai.Client(api_key=api_key)

SYSTEM_INSTRUCTION = """
You are an expert AI professor and academic advisor for Computer Science students at DIU (Daffodil International University).
You are given past examination question papers for a specific course.
Analyze these papers and provide insights based strictly on the JSON schema below.

JSON Schema Requirement:
{
  "important_topics": [
    {
      "topic": "Name of the topic (e.g. Normalization)",
      "probability": 85, 
      "reason": "Why it's important based on past frequency"
    }
  ],
  "extra_topics": [
    {
      "topic": "Name of topic to maximize marks",
      "reason": "Why a top student should study this"
    }
  ],
  "global_standard_topics": [
    {
      "topic": "Topic not typically in these exams but critical in industry/top univs",
      "industry_relevance": "How it applies to real-world software engineering"
    }
  ]
}

Ensure the response is raw JSON matching the schema above, without any markdown formatting like ```json ... ```.
"""

async def download_pdf(url: str) -> bytes:
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=30.0)
        response.raise_for_status()
        return response.content

async def analyze_course_papers(course_id: str, db: AsyncSession) -> CourseAnalysis:
    # Check if analysis already exists
    existing_analysis = await db.get(CourseAnalysis, course_id)
    if existing_analysis:
        return existing_analysis

    # Fetch course
    course = await db.get(Course, course_id)
    if not course:
        raise ValueError(f"Course {course_id} not found")

    # Fetch papers for course
    papers_result = await db.execute(
        select(PastQuestionPaper).where(PastQuestionPaper.course_id == course_id).limit(5)
    )
    papers = papers_result.scalars().all()

    if not papers:
        raise ValueError(f"No past papers found for course {course_id}")

    contents = []
    
    # Download PDFs and prepare for Gemini
    for paper in papers:
        if paper.pdf_url:
            try:
                pdf_bytes = await download_pdf(paper.pdf_url)
                contents.append(
                    types.Part.from_bytes(
                        data=pdf_bytes,
                        mime_type='application/pdf',
                    )
                )
            except Exception as e:
                print(f"Failed to download or attach {paper.pdf_url}: {e}")

    if not contents:
        raise ValueError("Could not fetch any PDF contents for analysis")

    # Add text prompt
    contents.append(f"Analyze these past papers for {course.code} - {course.title} and generate the JSON insights.")

    client = get_gemini_client()
    
    # We use gemini-2.5-flash for fast and cost-effective multi-modal analysis
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.2,
            response_mime_type="application/json"
        )
    )

    try:
        data = json.loads(response.text)
        
        # Create and save analysis
        analysis = CourseAnalysis(
            course_id=course_id,
            generated_at=datetime.utcnow().isoformat()
        )
        analysis.set_important_topics(data.get("important_topics", []))
        analysis.set_extra_topics(data.get("extra_topics", []))
        analysis.set_global_standard_topics(data.get("global_standard_topics", []))
        
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)
        
        return analysis
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON from Gemini: {response.text}")
        raise ValueError("AI generated invalid JSON") from e
