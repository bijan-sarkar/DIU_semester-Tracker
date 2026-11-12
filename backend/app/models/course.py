import uuid
from sqlalchemy import Column, String, Numeric
from app.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    credits = Column(Numeric(3, 1), default=3.0)
    semester_level = Column(String(50), nullable=False, index=True)  # e.g., 'Level 1 Term 1' or 'L1T1'
    department = Column(String(50), default="CSE")
