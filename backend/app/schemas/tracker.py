from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class EnrollmentCreate(BaseModel):
    course_id: str

class EnrollmentOut(BaseModel):
    id: str
    user_id: str
    course_id: str
    enrolled_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProgressUpdate(BaseModel):
    topic_id: str
    status: str = Field(..., pattern="^(not_started|completed|in_progress|review)$")
    notes: Optional[str] = None

class ProgressOut(BaseModel):
    id: str
    user_id: str
    topic_id: str
    status: str
    notes: Optional[str] = None
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
