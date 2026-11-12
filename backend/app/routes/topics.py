from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.database import get_db
from app.models.topic import Topic
from app.models.course import Course
from app.models.user import User
from app.schemas.topic import TopicCreate, TopicUpdate, TopicOut
from app.auth import get_current_user

router = APIRouter(prefix="/topics", tags=["Topics"])

@router.post("", response_model=TopicOut, status_code=status.HTTP_201_CREATED)
async def create_topic(
    topic_in: TopicCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    c_res = await db.execute(select(Course).where(Course.id == topic_in.course_id))
    if not c_res.scalars().first():
        raise HTTPException(status_code=404, detail="Course not found")

    topic = Topic(
        course_id=topic_in.course_id,
        title=topic_in.title,
        description=topic_in.description,
        exam_stage=topic_in.exam_stage,
        priority=topic_in.priority,
        probability_score=topic_in.probability_score,
        is_industry_essential=topic_in.is_industry_essential,
        global_benchmarks=topic_in.global_benchmarks,
        resources=topic_in.resources,
    )
    db.add(topic)
    await db.commit()
    await db.refresh(topic)
    return TopicOut.model_validate(topic)

@router.patch("/{topic_id}", response_model=TopicOut)
async def update_topic(
    topic_id: str,
    topic_update: TopicUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    t_res = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = t_res.scalars().first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    update_data = topic_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(topic, key, value)

    await db.commit()
    await db.refresh(topic)
    return TopicOut.model_validate(topic)

@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    t_res = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = t_res.scalars().first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    await db.delete(topic)
    await db.commit()
    return None

@router.get("/high-yield", response_model=List[TopicOut])
async def get_high_yield_topics(
    min_probability: int = Query(85, ge=50, le=100),
    course_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Topic).where(Topic.probability_score >= min_probability)
    if course_id:
        query = query.where(Topic.course_id == course_id)
    result = await db.execute(query.order_by(Topic.probability_score.desc()))
    topics = result.scalars().all()
    return [TopicOut.model_validate(t) for t in topics]
