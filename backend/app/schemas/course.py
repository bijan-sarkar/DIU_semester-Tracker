from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from app.schemas.topic import TopicWithProgress

class CourseBase(BaseModel):
    code: str
    title: str
    credits: float = 3.0
    semester_level: str
    department: str = "CSE"

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: str
    topic_count: Optional[int] = 0
    is_enrolled: Optional[bool] = False
    model_config = ConfigDict(from_attributes=True)

class CourseDetailOut(CourseOut):
    topics: List[TopicWithProgress] = []
