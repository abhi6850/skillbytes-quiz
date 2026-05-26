from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


# ── User ──────────────────────────────────────────────────────────────────────

class UserModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    device_id: str          # fingerprint – no auth needed
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


# ── Exam ──────────────────────────────────────────────────────────────────────

class ExamModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    description: str
    icon: str = "📚"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


# ── Subject ───────────────────────────────────────────────────────────────────

class SubjectModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    exam_id: str
    name: str
    description: str
    icon: str = "📖"

    class Config:
        populate_by_name = True


# ── Chapter ───────────────────────────────────────────────────────────────────

class ChapterModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    subject_id: str
    exam_id: str
    name: str
    description: str
    question_count: int = 0

    class Config:
        populate_by_name = True


# ── Question ──────────────────────────────────────────────────────────────────

class OptionModel(BaseModel):
    key: str        # "A" | "B" | "C" | "D"
    text: str


class QuestionModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    chapter_id: str
    subject_id: str
    exam_id: str
    text: str
    options: List[OptionModel]
    correct_option: str     # "A" | "B" | "C" | "D"
    explanation: Optional[str] = None
    difficulty: str = "medium"   # easy | medium | hard

    class Config:
        populate_by_name = True


# ── Quiz Session ──────────────────────────────────────────────────────────────

class QuestionResponseModel(BaseModel):
    question_id: str
    shown_at: datetime
    answered_at: Optional[datetime] = None
    selected_option: Optional[str] = None
    is_correct: Optional[bool] = None
    response_duration_ms: Optional[int] = None   # ms


class QuizSessionModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    exam_id: str
    subject_id: str
    chapter_id: str
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    is_completed: bool = False
    total_questions: int = 0
    answered_questions: int = 0
    correct_answers: int = 0
    score_percent: float = 0.0
    responses: List[QuestionResponseModel] = []

    class Config:
        populate_by_name = True


# ── Request / Response schemas ─────────────────────────────────────────────────

class StartQuizRequest(BaseModel):
    user_id: str
    chapter_id: str


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    selected_option: str
    shown_at: datetime
    answered_at: datetime


class CreateUserRequest(BaseModel):
    name: str
    device_id: str
