from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True)


class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    problem_id = Column(String, index=True)
    filename = Column(String)
    result_json = Column(Text)
    status = Column(String, default="finished")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student")
