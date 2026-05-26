# ⚡ SkillBytes — WhatsApp-style Quiz Platform

A full-stack quiz application with a WhatsApp-inspired chat UI, analytics dashboard, and zero login friction.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Recharts |
| Backend | FastAPI (Python) |
| Database | MongoDB (via Motor async driver) |

---

## Project Structure

```
skillbytes/
├── backend/
│   ├── main.py              # FastAPI app + lifespan hooks
│   ├── .env                 # MongoDB connection string
│   ├── requirements.txt
│   ├── database/
│   │   └── connection.py    # Motor async client
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── routers/
│   │   ├── catalog.py       # Exams / Subjects / Chapters APIs
│   │   ├── quiz.py          # Quiz session APIs
│   │   └── analytics.py     # 10 analytics endpoints
│   └── utils/
│       └── seed.py          # Dummy data generator
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css         # Design system (CSS variables)
        ├── api/client.js     # Axios API layer
        ├── hooks/useUser.jsx # Device-fingerprint user context
        ├── components/
        │   ├── Navbar.jsx
        │   └── NameModal.jsx
        └── pages/
            ├── HomePage.jsx      # Exam selection
            ├── SubjectsPage.jsx  # Subject selection
            ├── ChaptersPage.jsx  # Chapter selection
            ├── QuizPage.jsx      # Chat-style quiz
            └── AnalyticsPage.jsx # Full dashboard
```

---

## Setup & Running

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally on port 27017 (or update `.env`)

---

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure MongoDB (edit if needed)
# Default: mongodb://localhost:27017

# Seed the database with dummy data
python utils/seed.py

# Start the API server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 2. Frontend

```bash
cd frontend

npm install
npm run dev
```

App runs at: http://localhost:5173

The Vite dev server proxies `/api` → `http://localhost:8000` automatically.

---

## API Endpoints

### Catalog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams` | List all exams |
| GET | `/api/exams/{id}/subjects` | Subjects for an exam |
| GET | `/api/subjects/{id}/chapters` | Chapters for a subject |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create or get user by device ID |
| POST | `/api/quiz/start` | Start a quiz session, returns first question |
| POST | `/api/quiz/answer` | Submit answer, returns result + next question |
| GET | `/api/quiz/session/{id}` | Fetch session details |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | KPI summary dashboard |
| GET | `/api/analytics/daily-active-users` | DAU (last N days) |
| GET | `/api/analytics/weekly-active-users` | WAU (last N weeks) |
| GET | `/api/analytics/questions-stats` | Total served / answered / correct |
| GET | `/api/analytics/avg-response-time` | Avg, min, max response time |
| GET | `/api/analytics/completion-rate` | % of sessions completed |
| GET | `/api/analytics/dropoff-analysis` | Where users drop off |
| GET | `/api/analytics/peak-hours` | Sessions by hour of day |
| GET | `/api/analytics/avg-questions-per-session` | Average engagement depth |
| GET | `/api/analytics/score-distribution` | Score range buckets |

---

## Data Model

```
User          → device_id (fingerprint), name, created_at
Exam          → name, description, icon
Subject       → exam_id, name, description, icon
Chapter       → subject_id, exam_id, name, description, question_count
Question      → chapter_id, text, options[{key,text}], correct_option, explanation, difficulty
QuizSession   → user_id, exam_id, chapter_id, started_at, completed_at, responses[]
  └─ Response → question_id, shown_at, answered_at, selected_option, is_correct, response_duration_ms
```

---

## Features

- **No login/signup** — device fingerprint identifies users
- **WhatsApp chat UI** — questions appear as bubbles, answers sent as messages
- **One question at a time** with instant feedback
- **Explanation shown** after each answer
- **Score ring** on quiz completion
- **Analytics dashboard** with 8 charts (area, bar, pie, horizontal bar)
- **Responsive** — works on mobile and desktop
- **Dummy data** — 5 exams, 20 subjects, 40 chapters, 200+ questions, 300 historical sessions

---

## Dummy Data Included

| Entity | Count |
|--------|-------|
| Exams | 5 (UPSC, JEE, NEET, CAT, GATE CS) |
| Subjects | 10 |
| Chapters | 20 |
| Questions | 100 |
| Users | 20 |
| Quiz Sessions | 300 (historical, for analytics) |
