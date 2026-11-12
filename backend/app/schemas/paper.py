from pydantic import BaseModel, ConfigDict
from typing import Optional

class PastQuestionPaperOut(BaseModel):
    id: str
    course_id: str
    course_code: Optional[str] = None
    course_title: Optional[str] = None
    diuqb_id: Optional[int] = None
    title: str
    semester_name: Optional[str] = None
    exam_type: Optional[str] = None
    pdf_url: Optional[str] = None
    file_size: Optional[int] = 0
    view_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
