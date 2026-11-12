from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.database import get_db
from app.models.paper import PastQuestionPaper
from app.models.course import Course
from app.schemas.paper import PastQuestionPaperOut

router = APIRouter(prefix="/papers", tags=["Past Question Papers"])

@router.get("", response_model=List[PastQuestionPaperOut])
async def list_papers(
    q: Optional[str] = Query(None, description="Search keyword across title, course, or semester"),
    course_code: Optional[str] = Query(None, description="Filter by course code like CSE-123"),
    exam_type: Optional[str] = Query(None, description="Filter by Midterm, Final, Quiz, etc."),
    semester_name: Optional[str] = Query(None, description="Filter by semester e.g. Summer 26"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    query = select(PastQuestionPaper, Course.code, Course.title).join(
        Course, PastQuestionPaper.course_id == Course.id, isouter=True
    )

    if course_code:
        query = query.where(Course.code.ilike(f"%{course_code.strip()}%"))
    if exam_type:
        query = query.where(PastQuestionPaper.exam_type.ilike(f"%{exam_type.strip()}%"))
    if semester_name:
        query = query.where(PastQuestionPaper.semester_name.ilike(f"%{semester_name.strip()}%"))
    if q:
        kw = f"%{q.strip()}%"
        query = query.where(
            PastQuestionPaper.title.ilike(kw) |
            PastQuestionPaper.semester_name.ilike(kw) |
            Course.title.ilike(kw) |
            Course.code.ilike(kw)
        )

    query = query.order_by(PastQuestionPaper.diuqb_id.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    output = []
    for paper, c_code, c_title in rows:
        p_out = PastQuestionPaperOut.model_validate(paper)
        p_out.course_code = c_code
        p_out.course_title = c_title
        output.append(p_out)

    return output

@router.get("/course/{course_id}", response_model=List[PastQuestionPaperOut])
async def get_course_papers(
    course_id: str,
    exam_type: Optional[str] = Query(None, description="Filter by 'Midterm' or 'Final'"),
    db: AsyncSession = Depends(get_db)
):
    query = select(PastQuestionPaper, Course.code, Course.title).join(
        Course, PastQuestionPaper.course_id == Course.id, isouter=True
    ).where(PastQuestionPaper.course_id == course_id)

    if exam_type:
        query = query.where(PastQuestionPaper.exam_type.ilike(f"%{exam_type}%"))
    
    result = await db.execute(query.order_by(PastQuestionPaper.diuqb_id.desc()))
    rows = result.all()

    output = []
    for paper, c_code, c_title in rows:
        p_out = PastQuestionPaperOut.model_validate(paper)
        p_out.course_code = c_code
        p_out.course_title = c_title
        output.append(p_out)

    return output

@router.get("/recent", response_model=List[PastQuestionPaperOut])
async def get_recent_papers(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(PastQuestionPaper, Course.code, Course.title).join(
        Course, PastQuestionPaper.course_id == Course.id, isouter=True
    ).order_by(PastQuestionPaper.diuqb_id.desc()).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    output = []
    for paper, c_code, c_title in rows:
        p_out = PastQuestionPaperOut.model_validate(paper)
        p_out.course_code = c_code
        p_out.course_title = c_title
        output.append(p_out)

    return output
