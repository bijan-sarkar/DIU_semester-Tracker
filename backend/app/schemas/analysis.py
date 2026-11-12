from pydantic import BaseModel
from typing import List, Optional

class TopicInsight(BaseModel):
    topic: str
    probability: int  # 0 to 100 rating
    reason: str

class ExtraTopicInsight(BaseModel):
    topic: str
    reason: str

class GlobalStandardTopic(BaseModel):
    topic: str
    industry_relevance: str

class CourseAnalysisResponse(BaseModel):
    course_id: str
    important_topics: List[TopicInsight]
    extra_topics: List[ExtraTopicInsight]
    global_standard_topics: List[GlobalStandardTopic]
    generated_at: str

class AIAnalysisRequest(BaseModel):
    # You might want to pass options in the future
    pass
