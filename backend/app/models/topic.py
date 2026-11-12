import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, JSON
from app.database import Base

class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    exam_stage = Column(String(20), nullable=False, default="midterm")  # 'midterm' | 'final' | 'both'
    priority = Column(String(20), default="medium")  # 'high' | 'medium' | 'low'
    probability_score = Column(Integer, default=50)  # 0 to 100
    is_industry_essential = Column(Boolean, default=False)
    global_benchmarks = Column(JSON, nullable=True)  # { code: "MIT 6.006", notes: "..." }
    resources = Column(JSON, nullable=True)  # [ { title: "", url: "", type: "" } ]
