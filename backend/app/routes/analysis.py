from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.analysis import CourseAnalysisResponse
from app.services.ai_analyzer import analyze_course_papers
from app.models.analysis import CourseAnalysis

router = APIRouter(prefix="/analysis", tags=["AI Analysis"])

@router.post("/course/{course_id}", response_model=CourseAnalysisResponse)
async def generate_course_analysis(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        # This might take a few seconds since it calls Gemini API
        analysis = await analyze_course_papers(course_id, db)
        
        return CourseAnalysisResponse(
            course_id=analysis.course_id,
            important_topics=analysis.get_important_topics(),
            extra_topics=analysis.get_extra_topics(),
            global_standard_topics=analysis.get_global_standard_topics(),
            generated_at=analysis.generated_at
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/course/{course_id}", response_model=CourseAnalysisResponse)
async def get_course_analysis(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    analysis = await db.get(CourseAnalysis, course_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this course")
        
    return CourseAnalysisResponse(
        course_id=analysis.course_id,
        important_topics=analysis.get_important_topics(),
        extra_topics=analysis.get_extra_topics(),
        global_standard_topics=analysis.get_global_standard_topics(),
        generated_at=analysis.generated_at
    )
