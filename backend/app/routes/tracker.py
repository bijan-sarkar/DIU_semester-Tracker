from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.course import Course
from app.models.enrollment import UserCourseEnrollment
from app.models.progress import UserTopicProgress
from app.models.topic import Topic
from app.models.user import User
from app.schemas.tracker import EnrollmentCreate, EnrollmentOut, ProgressUpdate, ProgressOut
from app.schemas.course import CourseOut
from app.auth import get_current_user

router = APIRouter(prefix="/tracker", tags=["Tracker"])

@router.post("/enroll", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED)
async def enroll_course(
    enroll_in: EnrollmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    c_res = await db.execute(select(Course).where(Course.id == enroll_in.course_id))
    if not c_res.scalars().first():
        raise HTTPException(status_code=404, detail="Course not found")

    existing = await db.execute(
        select(UserCourseEnrollment).where(
            UserCourseEnrollment.user_id == current_user.id,
            UserCourseEnrollment.course_id == enroll_in.course_id
        )
    )
    if existing.scalars().first():
        return existing.scalars().first()

    enrollment = UserCourseEnrollment(
        user_id=current_user.id,
        course_id=enroll_in.course_id
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return EnrollmentOut.model_validate(enrollment)

@router.delete("/enroll/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unenroll_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(UserCourseEnrollment).where(
            UserCourseEnrollment.user_id == current_user.id,
            UserCourseEnrollment.course_id == course_id
        )
    )
    enrollment = res.scalars().first()
    if enrollment:
        await db.delete(enrollment)
        await db.commit()
    return None

@router.post("/progress", response_model=ProgressOut)
async def update_topic_progress(
    progress_in: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    t_res = await db.execute(select(Topic).where(Topic.id == progress_in.topic_id))
    topic = t_res.scalars().first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    prog_res = await db.execute(
        select(UserTopicProgress).where(
            UserTopicProgress.user_id == current_user.id,
            UserTopicProgress.topic_id == progress_in.topic_id
        )
    )
    progress = prog_res.scalars().first()

    if not progress:
        progress = UserTopicProgress(
            user_id=current_user.id,
            topic_id=progress_in.topic_id,
            status=progress_in.status,
            notes=progress_in.notes
        )
        db.add(progress)
    else:
        progress.status = progress_in.status
        if progress_in.notes is not None:
            progress.notes = progress_in.notes

    await db.commit()
    await db.refresh(progress)
    return ProgressOut.model_validate(progress)

@router.get("/my-courses", response_model=List[CourseOut])
async def get_my_enrolled_courses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Course)
        .join(UserCourseEnrollment, UserCourseEnrollment.course_id == Course.id)
        .where(UserCourseEnrollment.user_id == current_user.id)
        .order_by(Course.code)
    )
    courses = res.scalars().all()

    # topic counts
    counts_res = await db.execute(select(Topic.course_id))
    topic_ids = counts_res.scalars().all()
    count_map = {}
    for cid in topic_ids:
        count_map[cid] = count_map.get(cid, 0) + 1

    return [
        CourseOut(
            id=c.id,
            code=c.code,
            title=c.title,
            credits=float(c.credits) if c.credits else 3.0,
            semester_level=c.semester_level,
            department=c.department,
            topic_count=count_map.get(c.id, 0),
            is_enrolled=True
        )
        for c in courses
    ]
