from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.database import get_db
from app.models.course import Course
from app.models.topic import Topic
from app.models.progress import UserTopicProgress
from app.models.enrollment import UserCourseEnrollment
from app.models.user import User
from app.schemas.analytics import StageReadiness, CourseReadinessAnalytics, SemesterSummaryAnalytics
from app.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def calculate_stage_readiness(topics: List[Topic], progress_map: dict) -> StageReadiness:
    total = len(topics)
    if total == 0:
        return StageReadiness(
            total_topics=0,
            completed_topics=0,
            in_progress_topics=0,
            review_topics=0,
            raw_completion_pct=0.0,
            weighted_readiness_pct=0.0,
            high_yield_mastered=0,
            high_yield_total=0
        )

    completed = 0
    in_progress = 0
    review = 0
    high_yield_total = 0
    high_yield_mastered = 0

    total_weight = 0.0
    achieved_weight = 0.0

    for t in topics:
        score = float(t.probability_score or 50)
        total_weight += score
        status = progress_map.get(t.id, "not_started")

        if score >= 85:
            high_yield_total += 1
            if status == "completed":
                high_yield_mastered += 1

        if status == "completed":
            completed += 1
            achieved_weight += score * 1.0
        elif status == "review":
            review += 1
            achieved_weight += score * 0.7
        elif status == "in_progress":
            in_progress += 1
            achieved_weight += score * 0.4

    raw_pct = round((completed / total) * 100, 1)
    weighted_pct = round((achieved_weight / total_weight) * 100, 1) if total_weight > 0 else 0.0

    return StageReadiness(
        total_topics=total,
        completed_topics=completed,
        in_progress_topics=in_progress,
        review_topics=review,
        raw_completion_pct=raw_pct,
        weighted_readiness_pct=min(100.0, weighted_pct),
        high_yield_mastered=high_yield_mastered,
        high_yield_total=high_yield_total
    )

@router.get("/course/{course_id}", response_model=CourseReadinessAnalytics)
async def get_course_readiness(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    c_res = await db.execute(select(Course).where(Course.id == course_id))
    course = c_res.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Fetch topics
    t_res = await db.execute(select(Topic).where(Topic.course_id == course_id))
    all_topics = t_res.scalars().all()

    # Fetch user progress for these topics
    topic_ids = [t.id for t in all_topics]
    prog_res = await db.execute(
        select(UserTopicProgress).where(
            UserTopicProgress.user_id == current_user.id,
            UserTopicProgress.topic_id.in_(topic_ids)
        )
    )
    progress_map = {p.topic_id: p.status for p in prog_res.scalars().all()}

    # Split into midterm & final
    midterm_topics = [t for t in all_topics if t.exam_stage in ("midterm", "both")]
    final_topics = [t for t in all_topics if t.exam_stage in ("final", "both")]
    industry_topics = [t for t in all_topics if t.is_industry_essential]

    midterm_metrics = calculate_stage_readiness(midterm_topics, progress_map)
    final_metrics = calculate_stage_readiness(final_topics, progress_map)

    # Industry & Global depth
    industry_mastered = sum(1 for t in industry_topics if progress_map.get(t.id) == "completed")
    global_depth_pct = round((industry_mastered / len(industry_topics)) * 100, 1) if industry_topics else 0.0

    completed_total = sum(1 for t in all_topics if progress_map.get(t.id) == "completed")
    overall_progress = round((completed_total / len(all_topics)) * 100, 1) if all_topics else 0.0

    return CourseReadinessAnalytics(
        course_id=course.id,
        course_code=course.code,
        course_title=course.title,
        overall_progress_pct=overall_progress,
        midterm=midterm_metrics,
        final=final_metrics,
        global_depth_pct=global_depth_pct,
        industry_mastered=industry_mastered,
        industry_total=len(industry_topics)
    )

@router.get("/semester-summary", response_model=SemesterSummaryAnalytics)
async def get_semester_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    enr_res = await db.execute(
        select(UserCourseEnrollment.course_id).where(UserCourseEnrollment.user_id == current_user.id)
    )
    enrolled_course_ids = enr_res.scalars().all()

    if not enrolled_course_ids:
        return SemesterSummaryAnalytics(
            enrolled_courses_count=0,
            total_topics=0,
            completed_topics=0,
            average_midterm_readiness_pct=0.0,
            average_final_readiness_pct=0.0,
            overall_semester_progress_pct=0.0
        )

    t_res = await db.execute(select(Topic).where(Topic.course_id.in_(enrolled_course_ids)))
    topics = t_res.scalars().all()

    prog_res = await db.execute(
        select(UserTopicProgress).where(UserTopicProgress.user_id == current_user.id)
    )
    prog_map = {p.topic_id: p.status for p in prog_res.scalars().all()}

    midterm_topics = [t for t in topics if t.exam_stage in ("midterm", "both")]
    final_topics = [t for t in topics if t.exam_stage in ("final", "both")]

    midterm_metrics = calculate_stage_readiness(midterm_topics, prog_map)
    final_metrics = calculate_stage_readiness(final_topics, prog_map)

    completed_total = sum(1 for t in topics if prog_map.get(t.id) == "completed")
    overall_progress = round((completed_total / len(topics)) * 100, 1) if topics else 0.0

    return SemesterSummaryAnalytics(
        enrolled_courses_count=len(enrolled_course_ids),
        total_topics=len(topics),
        completed_topics=completed_total,
        average_midterm_readiness_pct=midterm_metrics.weighted_readiness_pct,
        average_final_readiness_pct=final_metrics.weighted_readiness_pct,
        overall_semester_progress_pct=overall_progress
    )
