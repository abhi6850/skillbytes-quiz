from fastapi import APIRouter, HTTPException
from database.connection import get_db
from bson import ObjectId

router = APIRouter(prefix="/api", tags=["catalog"])


def _id(doc):
    """Convert ObjectId _id to string."""
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


def _ids(docs):
    return [_id(d) for d in docs]


# ── Exams ──────────────────────────────────────────────────────────────────────

@router.get("/exams")
async def list_exams():
    db = get_db()
    exams = await db.exams.find().to_list(100)
    return _ids(exams)


@router.get("/exams/{exam_id}")
async def get_exam(exam_id: str):
    db = get_db()
    exam = await db.exams.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return _id(exam)


# ── Subjects ──────────────────────────────────────────────────────────────────

@router.get("/exams/{exam_id}/subjects")
async def list_subjects(exam_id: str):
    db = get_db()
    subjects = await db.subjects.find({"exam_id": exam_id}).to_list(100)
    return _ids(subjects)


@router.get("/subjects/{subject_id}")
async def get_subject(subject_id: str):
    db = get_db()
    subject = await db.subjects.find_one({"_id": ObjectId(subject_id)})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return _id(subject)


# ── Chapters ──────────────────────────────────────────────────────────────────

@router.get("/subjects/{subject_id}/chapters")
async def list_chapters(subject_id: str):
    db = get_db()
    chapters = await db.chapters.find({"subject_id": subject_id}).to_list(100)
    return _ids(chapters)


@router.get("/chapters/{chapter_id}")
async def get_chapter(chapter_id: str):
    db = get_db()
    chapter = await db.chapters.find_one({"_id": ObjectId(chapter_id)})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return _id(chapter)
