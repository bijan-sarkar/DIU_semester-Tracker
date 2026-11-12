from sqlalchemy import Column, String, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
import json

from app.database import Base

class CourseAnalysis(Base):
    __tablename__ = "course_analysis"

    course_id = Column(String, ForeignKey("courses.id"), primary_key=True, index=True)
    important_topics = Column(Text, nullable=False, default="[]")
    extra_topics = Column(Text, nullable=False, default="[]")
    global_standard_topics = Column(Text, nullable=False, default="[]")
    
    # Store when it was last generated
    generated_at = Column(String, nullable=True)

    course = relationship("Course")

    def set_important_topics(self, data):
        self.important_topics = json.dumps(data)

    def get_important_topics(self):
        return json.loads(self.important_topics) if self.important_topics else []

    def set_extra_topics(self, data):
        self.extra_topics = json.dumps(data)

    def get_extra_topics(self):
        return json.loads(self.extra_topics) if self.extra_topics else []

    def set_global_standard_topics(self, data):
        self.global_standard_topics = json.dumps(data)

    def get_global_standard_topics(self):
        return json.loads(self.global_standard_topics) if self.global_standard_topics else []
