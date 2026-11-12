from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

class ResourceItem(BaseModel):
    title: str
    url: str
    type: str  # "youtube" | "documentation" | "article" | "problem_set"

class GlobalBenchmark(BaseModel):
    code: Optional[str] = None  # e.g., "MIT 6.006", "Stanford CS106B", "NeetCode 150"
    notes: Optional[str] = None

class TopicBase(BaseModel):
    title: str
    description: Optional[str] = None
    exam_stage: str = Field(default="midterm", pattern="^(midterm|final|both)$")
    priority: str = Field(default="medium", pattern="^(high|medium|low)$")
    probability_score: int = Field(default=50, ge=0, le=100)
    is_industry_essential: bool = False
    global_benchmarks: Optional[Dict[str, Any]] = None
    resources: Optional[List[Dict[str, Any]]] = None

class TopicCreate(TopicBase):
    course_id: str

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    exam_stage: Optional[str] = None
    priority: Optional[str] = None
    probability_score: Optional[int] = None
    is_industry_essential: Optional[bool] = None
    global_benchmarks: Optional[Dict[str, Any]] = None
    resources: Optional[List[Dict[str, Any]]] = None

class TopicOut(TopicBase):
    id: str
    course_id: str
    model_config = ConfigDict(from_attributes=True)

class TopicWithProgress(TopicOut):
    status: str = "not_started"  # 'not_started' | 'completed' | 'in_progress' | 'review'
    notes: Optional[str] = None
    updated_at: Optional[datetime] = None
