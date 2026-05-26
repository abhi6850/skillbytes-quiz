from fastapi import APIRouter, HTTPException
from database.connection import get_db
from models.schemas import StartQuizRequest, SubmitAnswerRequest, CreateUserRequest
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api", tags=["quiz"])


def _id(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


# ── User ──────────────────────────────────────────────────────────────────────

@router.post("/users")
async def create_or_get_user(req: CreateUserRequest):
    """Create user if device_id not seen before, else return existing."""
    db = get_db()
    existing = await db.users.find_one({"device_id": req.device_id})
    if existing:
        return _id(existing)
    doc = {"name": req.name, "device_id": req.device_id, "created_at": datetime.utcnow()}
    res = await db.users.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc


@router.get("/users/{device_id}/by-device")
async def get_user_by_device(device_id: str):
    db = get_db()
    user = await db.users.find_one({"device_id": device_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _id(user)


# ── Start Quiz ────────────────────────────────────────────────────────────────

@router.post("/quiz/start")
async def start_quiz(req: StartQuizRequest):
    db = get_db()

    chapter = await db.chapters.find_one({"_id": ObjectId(req.chapter_id)})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    questions = await db.questions.find({"chapter_id": req.chapter_id}).to_list(50)
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this chapter")

    session_doc = {
        "user_id": req.user_id,
        "exam_id": chapter["exam_id"],
        "subject_id": chapter["subject_id"],
        "chapter_id": req.chapter_id,
        "started_at": datetime.utcnow(),
        "completed_at": None,
        "is_completed": False,
        "total_questions": len(questions),
        "answered_questions": 0,
        "correct_answers": 0,
        "score_percent": 0.0,
        "responses": [],
    }
    res = await db.quiz_sessions.insert_one(session_doc)
    session_id = str(res.inserted_id)

    # Return first question (no answers revealed)
    q = questions[0]
    q["_id"] = str(q["_id"])
    q.pop("correct_option", None)
    q.pop("explanation", None)

    return {
        "session_id": session_id,
        "total_questions": len(questions),
        "current_index": 0,
        "question": q,
    }


# ── Submit Answer & Get Next ──────────────────────────────────────────────────

@router.post("/quiz/answer")
async def submit_answer(req: SubmitAnswerRequest):
    db = get_db()

    session = await db.quiz_sessions.find_one({"_id": ObjectId(req.session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["is_completed"]:
        raise HTTPException(status_code=400, detail="Quiz already completed")

    question = await db.questions.find_one({"_id": ObjectId(req.question_id)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = question["correct_option"] == req.selected_option
    duration_ms = int((req.answered_at - req.shown_at).total_seconds() * 1000)

    response_entry = {
        "question_id": req.question_id,
        "shown_at": req.shown_at,
        "answered_at": req.answered_at,
        "selected_option": req.selected_option,
        "is_correct": is_correct,
        "response_duration_ms": max(0, duration_ms),
    }

    # Figure out next question
    all_questions = await db.questions.find({"chapter_id": session["chapter_id"]}).to_list(50)
    q_ids = [str(q["_id"]) for q in all_questions]
    current_index = q_ids.index(req.question_id)
    next_index = current_index + 1
    answered_count = session["answered_questions"] + 1
    correct_count = session["correct_answers"] + (1 if is_correct else 0)

    is_last = next_index >= len(q_ids)

    update_data = {
        "$push": {"responses": response_entry},
        "$inc": {"answered_questions": 1, "correct_answers": 1 if is_correct else 0},
    }

    if is_last:
        score_pct = round((correct_count / len(q_ids)) * 100, 1)
        update_data["$set"] = {
            "is_completed": True,
            "completed_at": datetime.utcnow(),
            "score_percent": score_pct,
        }

    await db.quiz_sessions.update_one({"_id": ObjectId(req.session_id)}, update_data)

    result = {
        "is_correct": is_correct,
        "correct_option": question["correct_option"],
        "explanation": question.get("explanation"),
        "is_last": is_last,
        "answered_count": answered_count,
        "correct_count": correct_count,
    }

    if not is_last:
        nq = all_questions[next_index]
        nq["_id"] = str(nq["_id"])
        nq.pop("correct_option", None)
        nq.pop("explanation", None)
        result["next_question"] = nq
        result["current_index"] = next_index

    return result


# ── Get Session Result ────────────────────────────────────────────────────────

@router.get("/quiz/session/{session_id}")
async def get_session(session_id: str):
    db = get_db()
    session = await db.quiz_sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return _id(session)


# ── User's Past Sessions ──────────────────────────────────────────────────────

@router.get("/users/{user_id}/sessions")
async def user_sessions(user_id: str):
    db = get_db()
    sessions = await db.quiz_sessions.find({"user_id": user_id}).sort("started_at", -1).to_list(20)
    return [_id(s) for s in sessions]
