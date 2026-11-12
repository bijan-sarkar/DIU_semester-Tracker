import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    student_id = Column(String(50), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    current_semester = Column(String(50), default="Level 1 Term 1")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
