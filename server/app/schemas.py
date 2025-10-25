from pydantic import BaseModel
from typing import Optional, Any


class StudentCreate(BaseModel):
    uuid: str


class SubmissionCreate(BaseModel):
    student_id: int
    problem_id: str
    filename: str
    result_json: Optional[str]


class SubmissionOut(BaseModel):
    id: int
    problem_id: str
    filename: str
    result: Optional[Any]
    status: str

    class Config:
        orm_mode = True
