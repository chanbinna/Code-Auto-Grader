import os
import json
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app import models, schemas, crud, database, utils

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROBLEMS_DIR = os.path.join(BASE_DIR, "problems")
SUBMISSIONS_DIR = os.environ.get("SUBMISSIONS_DIR", os.path.join(BASE_DIR, "submissions"))

app = FastAPI(title="Code Auto Grader")

# Configure CORS dynamically from the ALLOWED_ORIGINS env var (comma-separated).
# If not provided, default to localhost dev origin. If ALLOWED_ORIGINS contains
# a single '*' entry we allow all origins but disable credentials because browsers
# disallow '*' with credentials.
allowed = os.environ.get("ALLOWED_ORIGINS")
if allowed:
    origins = [o.strip() for o in allowed.split(",") if o.strip()]
else:
    origins = ["http://localhost:5173"]

allow_credentials = True
if len(origins) == 1 and origins[0] == "*":
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    database.init_db()
    os.makedirs(SUBMISSIONS_DIR, exist_ok=True)


@app.get("/api/problems")
def list_problems():
    problems = []
    # Each folder under problems is a problem_id
    for name in os.listdir(PROBLEMS_DIR):
        p = os.path.join(PROBLEMS_DIR, name)
        if os.path.isdir(p):
            meta = {"id": name, "title": name.replace("_", " ")}
            # try reading description or test_cases
            tc_path = os.path.join(p, "test_cases.json")
            if os.path.exists(tc_path):
                try:
                    with open(tc_path, "r") as f:
                        cases = json.load(f)
                    meta["tests"] = len(cases)
                except Exception:
                    meta["tests"] = None
            # try to read problem.json for richer metadata
            pj = os.path.join(p, "problem.json")
            if os.path.exists(pj):
                try:
                    with open(pj, "r") as f:
                        pd = json.load(f)
                    meta["title"] = pd.get("title", meta.get("title"))
                    meta["difficulty"] = pd.get("difficulty")
                except Exception:
                    pass
            problems.append(meta)
    return problems


@app.get("/api/problems/{problem_id}")
def get_problem(problem_id: str):
    pdir = os.path.join(PROBLEMS_DIR, problem_id)
    if not os.path.isdir(pdir):
        raise HTTPException(status_code=404, detail="Problem not found")
    out = {}
    pj = os.path.join(pdir, "problem.json")
    if os.path.exists(pj):
        try:
            with open(pj, "r") as f:
                out.update(json.load(f))
        except Exception:
            pass
    tc_path = os.path.join(pdir, "test_cases.json")
    if os.path.exists(tc_path):
        try:
            with open(tc_path, "r") as f:
                out["test_cases"] = json.load(f)
        except Exception:
            out["test_cases"] = []
    return out


@app.post("/api/submit/{student_uuid}/{problem_id}")
async def submit(student_uuid: str, problem_id: str, file: UploadFile = File(...)):
    # Save uploaded file
    if not file.filename.endswith('.py'):
        raise HTTPException(status_code=400, detail="Only .py files are accepted")

    # ensure problem exists
    problem_path = os.path.join(PROBLEMS_DIR, problem_id)
    test_cases_file = os.path.join(problem_path, "test_cases.json")
    if not os.path.exists(test_cases_file):
        raise HTTPException(status_code=404, detail="Problem not found")

    # create/get student
    db: Session = database.SessionLocal()
    student = crud.get_or_create_student(db, student_uuid)

    # create submission dir
    stu_dir = os.path.join(SUBMISSIONS_DIR, student_uuid, problem_id)
    os.makedirs(stu_dir, exist_ok=True)

    # next index
    existing = [f for f in os.listdir(stu_dir) if f.endswith('.py')]
    idx = len(existing) + 1
    saved_name = f"submission_{idx}.py"
    saved_path = os.path.join(stu_dir, saved_name)

    content = await file.read()
    with open(saved_path, "wb") as f:
        f.write(content)

    # load test cases
    with open(test_cases_file, "r") as f:
        test_cases = json.load(f)

    # determine entry function name from problem metadata (fallback to 'solve')
    entry_name = 'solve'
    pj = os.path.join(problem_path, 'problem.json')
    if os.path.exists(pj):
        try:
            with open(pj, 'r') as pf:
                pd = json.load(pf)
            entry_name = pd.get('entry_point') or pd.get('function') or entry_name
        except Exception:
            pass

    # run tests
    result = utils.run_submission_tests(saved_path, test_cases, entry_name)

    # store submission
    submission = crud.create_submission(db, student.id, problem_id, saved_name, result)
    db.close()

    return JSONResponse(result)


@app.get("/api/history/{student_uuid}")
def history(student_uuid: str):
    db = database.SessionLocal()
    student = crud.get_student_by_uuid(db, student_uuid)
    if not student:
        db.close()
        raise HTTPException(status_code=404, detail="Student not found")
    rows = crud.get_submissions_for_student(db, student.id)
    out = []
    for r in rows:
        out.append({
            "id": r.id,
            "problem_id": r.problem_id,
            "filename": r.filename,
            "result": json.loads(r.result_json) if r.result_json else None,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        })
    db.close()
    return out


@app.get("/api/submission_file/{student_uuid}/{problem_id}/{filename}")
def get_submission_file(student_uuid: str, problem_id: str, filename: str):
    # serve the saved submission file content
    file_path = os.path.join(SUBMISSIONS_DIR, student_uuid, problem_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type='text/plain')


@app.get('/api/students')
def list_students():
    db = database.SessionLocal()
    rows = crud.list_students(db)
    out = [{'id': r.id, 'uuid': r.uuid} for r in rows]
    db.close()
    return out


@app.post('/api/students')
def create_student(payload: dict):
    uuid = payload.get('uuid') if isinstance(payload, dict) else None
    db = database.SessionLocal()
    # if uuid provided and exists, return 400
    if uuid and crud.get_student_by_uuid(db, uuid):
        db.close()
        raise HTTPException(status_code=400, detail='Student already exists')
    if not uuid:
        # generate one server-side
        try:
            import uuid as _uuid
            uuid = str(_uuid.uuid4())
        except Exception:
            uuid = f'user-{int(os.time())}'
    student = crud.get_or_create_student(db, uuid)
    out = {'id': student.id, 'uuid': student.uuid}
    db.close()
    return out


@app.delete('/api/students/{student_uuid}')
def delete_student(student_uuid: str):
    db = database.SessionLocal()
    ok = crud.delete_student(db, student_uuid)
    db.close()
    # remove files if exist
    try:
        stu_path = os.path.join(SUBMISSIONS_DIR, student_uuid)
        if os.path.exists(stu_path):
            shutil.rmtree(stu_path)
    except Exception:
        pass
    if not ok:
        raise HTTPException(status_code=404, detail='Student not found')
    return {'ok': True}
