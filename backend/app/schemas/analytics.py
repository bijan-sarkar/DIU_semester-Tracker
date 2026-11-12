from pydantic import BaseModel
from typing import Optional, List

class StageReadiness(BaseModel):
    total_topics: int
    completed_topics: int
    in_progress_topics: int
    review_topics: int
    raw_completion_pct: float
    weighted_readiness_pct: float
    high_yield_mastered: int
    high_yield_total: int

class CourseReadinessAnalytics(BaseModel):
    course_id: str
    course_code: str
    course_title: str
    overall_progress_pct: float
    midterm: StageReadiness
    final: StageReadiness
    global_depth_pct: float
    industry_mastered: int
    industry_total: int

class SemesterSummaryAnalytics(BaseModel):
    enrolled_courses_count: int
    total_topics: int
    completed_topics: int
    average_midterm_readiness_pct: float
    average_final_readiness_pct: float
    overall_semester_progress_pct: float
