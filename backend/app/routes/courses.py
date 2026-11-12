from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models.course import Course
from app.models.topic import Topic
from app.models.enrollment import UserCourseEnrollment
from app.models.progress import UserTopicProgress
from app.models.user import User
from app.schemas.course import CourseOut, CourseDetailOut, CourseCreate
from app.schemas.topic import TopicWithProgress
from app.auth import get_optional_current_user, get_current_user

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=List[CourseOut])
async def list_courses(
    semester_level: Optional[str] = Query(None, description="Filter by semester e.g. 'Level 2 Term 1'"),
    search: Optional[str] = Query(None, description="Search by code or title"),
    enrolled_only: Optional[bool] = Query(False, description="Show only enrolled courses"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Course)

    if semester_level:
        query = query.where(Course.semester_level == semester_level)
    if search:
        query = query.where(
            (Course.code.ilike(f"%{search}%")) | (Course.title.ilike(f"%{search}%"))
        )

    result = await db.execute(query.order_by(Course.code))
    courses = result.scalars().all()

    # Get enrolled course IDs for current user if logged in
    enrolled_ids = set()
    if current_user:
        enr_res = await db.execute(
            select(UserCourseEnrollment.course_id).where(UserCourseEnrollment.user_id == current_user.id)
        )
        enrolled_ids = set(enr_res.scalars().all())

    # Get topic counts for each course
    counts_res = await db.execute(
        select(Topic.course_id, func.count(Topic.id)).group_by(Topic.course_id)
    )
    topic_counts = dict(counts_res.all())

    course_list = []
    for c in courses:
        is_enr = c.id in enrolled_ids
        if enrolled_only and not is_enr:
            continue
        c_out = CourseOut(
            id=c.id,
            code=c.code,
            title=c.title,
            credits=float(c.credits) if c.credits else 3.0,
            semester_level=c.semester_level,
            department=c.department,
            topic_count=topic_counts.get(c.id, 0),
            is_enrolled=is_enr
        )
        course_list.append(c_out)

    return course_list

@router.get("/{course_id}", response_model=CourseDetailOut)
async def get_course_detail(
    course_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    c_res = await db.execute(select(Course).where(Course.id == course_id))
    course = c_res.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    is_enrolled = False
    user_progress_map = {}
    if current_user:
        enr_res = await db.execute(
            select(UserCourseEnrollment).where(
                UserCourseEnrollment.user_id == current_user.id,
                UserCourseEnrollment.course_id == course_id
            )
        )
        is_enrolled = enr_res.scalars().first() is not None

        prog_res = await db.execute(
            select(UserTopicProgress).where(UserTopicProgress.user_id == current_user.id)
        )
        for p in prog_res.scalars().all():
            user_progress_map[p.topic_id] = p

    # Fetch topics for course
    topics_res = await db.execute(
        select(Topic).where(Topic.course_id == course_id).order_by(Topic.probability_score.desc())
    )
    topics = topics_res.scalars().all()

    topics_with_progress = []
    for t in topics:
        p = user_progress_map.get(t.id)
        topics_with_progress.append(
            TopicWithProgress(
                id=t.id,
                course_id=t.course_id,
                title=t.title,
                description=t.description,
                exam_stage=t.exam_stage,
                priority=t.priority,
                probability_score=t.probability_score,
                is_industry_essential=t.is_industry_essential,
                global_benchmarks=t.global_benchmarks,
                resources=t.resources,
                status=p.status if p else "not_started",
                notes=p.notes if p else None,
                updated_at=p.updated_at if p else None
            )
        )

    return CourseDetailOut(
        id=course.id,
        code=course.code,
        title=course.title,
        credits=float(course.credits) if course.credits else 3.0,
        semester_level=course.semester_level,
        department=course.department,
        topic_count=len(topics),
        is_enrolled=is_enrolled,
        topics=topics_with_progress
    )

@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_in: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    exists = await db.execute(select(Course).where(Course.code == course_in.code.upper()))
    if exists.scalars().first():
        raise HTTPException(status_code=400, detail="Course with this code already exists")

    course = Course(
        code=course_in.code.upper(),
        title=course_in.title,
        credits=course_in.credits,
        semester_level=course_in.semester_level,
        department=course_in.department
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)

    return CourseOut(
        id=course.id,
        code=course.code,
        title=course.title,
        credits=float(course.credits),
        semester_level=course.semester_level,
        department=course.department,
        topic_count=0,
        is_enrolled=False
    )
