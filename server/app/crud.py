import json
from sqlalchemy.orm import Session
from app import models


def get_or_create_student(db: Session, uuid: str):
    s = db.query(models.Student).filter(models.Student.uuid == uuid).first()
    if s:
        return s
    s = models.Student(uuid=uuid)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


def create_submission(db: Session, student_id: int, problem_id: str, filename: str, result: dict):
    sub = models.Submission(
        student_id=student_id,
        problem_id=problem_id,
        filename=filename,
        result_json=json.dumps(result),
        status=result.get("status", "finished"),
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def get_student_by_uuid(db: Session, uuid: str):
    return db.query(models.Student).filter(models.Student.uuid == uuid).first()


def get_submissions_for_student(db: Session, student_id: int):
    return db.query(models.Submission).filter(models.Submission.student_id == student_id).order_by(models.Submission.created_at.desc()).all()


def list_students(db: Session):
    return db.query(models.Student).order_by(models.Student.id.desc()).all()


def delete_student(db: Session, uuid: str):
    s = get_student_by_uuid(db, uuid)
    if not s:
        return False
    # delete submissions
    db.query(models.Submission).filter(models.Submission.student_id == s.id).delete()
    db.delete(s)
    db.commit()
    return True
