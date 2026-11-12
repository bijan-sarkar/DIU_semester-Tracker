import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from app.database import Base

class PastQuestionPaper(Base):
    __tablename__ = "past_question_papers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    diuqb_id = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    semester_name = Column(String(100), nullable=True)
    exam_type = Column(String(50), nullable=True)  # 'Midterm' | 'Final' | 'Quiz'
    pdf_url = Column(String(500), nullable=True)
    file_size = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
