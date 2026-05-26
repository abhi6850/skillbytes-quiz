from fastapi import APIRouter, Query
from database.connection import get_db
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def start_of_day(dt: datetime) -> datetime:
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


async def _active_users(db, since: datetime) -> int:
    result = await db.quiz_sessions.distinct("user_id", {"started_at": {"$gte": since}})
    return len(result)


# ── 1. Daily Active Users ─────────────────────────────────────────────────────

@router.get("/daily-active-users")
async def daily_active_users(days: int = Query(default=30, ge=1, le=90)):
    db = get_db()
    result = []
    for i in range(days - 1, -1, -1):
        day_start = start_of_day(datetime.utcnow() - timedelta(days=i))
        day_end = day_start + timedelta(days=1)
        users = await db.quiz_sessions.distinct("user_id", {"started_at": {"$gte": day_start, "$lt": day_end}})
        result.append({"date": day_start.strftime("%Y-%m-%d"), "count": len(users)})
    return result


# ── 2. Weekly Active Users ────────────────────────────────────────────────────

@router.get("/weekly-active-users")
async def weekly_active_users(weeks: int = Query(default=12, ge=1, le=52)):
    db = get_db()
    result = []
    for i in range(weeks - 1, -1, -1):
        week_start = start_of_day(datetime.utcnow() - timedelta(weeks=i, days=datetime.utcnow().weekday()))
        week_end = week_start + timedelta(weeks=1)
        users = await db.quiz_sessions.distinct("user_id", {"started_at": {"$gte": week_start, "$lt": week_end}})
        result.append({"week_start": week_start.strftime("%Y-%m-%d"), "count": len(users)})
    return result


# ── 3. Questions Served & Answered ────────────────────────────────────────────

@router.get("/questions-stats")
async def questions_stats():
    db = get_db()
    pipeline = [
        {"$group": {
            "_id": None,
            "total_served": {"$sum": "$total_questions"},
            "total_answered": {"$sum": "$answered_questions"},
            "total_correct": {"$sum": "$correct_answers"},
            "total_sessions": {"$sum": 1},
        }}
    ]
    res = await db.quiz_sessions.aggregate(pipeline).to_list(1)
    data = res[0] if res else {"total_served": 0, "total_answered": 0, "total_correct": 0, "total_sessions": 0}
    data.pop("_id", None)
    return data


# ── 4. Average Response Time ──────────────────────────────────────────────────

@router.get("/avg-response-time")
async def avg_response_time():
    db = get_db()
    pipeline = [
        {"$unwind": "$responses"},
        {"$match": {"responses.response_duration_ms": {"$exists": True, "$gt": 0}}},
        {"$group": {
            "_id": None,
            "avg_ms": {"$avg": "$responses.response_duration_ms"},
            "min_ms": {"$min": "$responses.response_duration_ms"},
            "max_ms": {"$max": "$responses.response_duration_ms"},
            "total_responses": {"$sum": 1},
        }}
    ]
    res = await db.quiz_sessions.aggregate(pipeline).to_list(1)
    data = res[0] if res else {"avg_ms": 0, "min_ms": 0, "max_ms": 0, "total_responses": 0}
    data.pop("_id", None)
    if data.get("avg_ms"):
        data["avg_seconds"] = round(data["avg_ms"] / 1000, 2)
    return data


# ── 5. Quiz Completion Rate ───────────────────────────────────────────────────

@router.get("/completion-rate")
async def completion_rate():
    db = get_db()
    total = await db.quiz_sessions.count_documents({})
    completed = await db.quiz_sessions.count_documents({"is_completed": True})
    rate = round((completed / total) * 100, 2) if total else 0
    return {"total_sessions": total, "completed_sessions": completed, "completion_rate_percent": rate}


# ── 6. Drop-off Analysis ──────────────────────────────────────────────────────

@router.get("/dropoff-analysis")
async def dropoff_analysis():
    db = get_db()
    pipeline = [
        {"$match": {"is_completed": False, "total_questions": {"$gt": 0}}},
        {"$addFields": {"dropoff_at": {"$divide": ["$answered_questions", "$total_questions"]}}},
        {"$bucket": {
            "groupBy": "$dropoff_at",
            "boundaries": [0, 0.25, 0.5, 0.75, 1.0],
            "default": "completed",
            "output": {"count": {"$sum": 1}}
        }}
    ]
    res = await db.quiz_sessions.aggregate(pipeline).to_list(10)
    labels = {0: "0–25%", 0.25: "25–50%", 0.5: "50–75%", 0.75: "75–100%", "completed": "Completed"}
    return [{"range": labels.get(r["_id"], str(r["_id"])), "dropped": r["count"]} for r in res]


# ── 7. Peak Activity Hours ────────────────────────────────────────────────────

@router.get("/peak-hours")
async def peak_hours():
    db = get_db()
    pipeline = [
        {"$addFields": {"hour": {"$hour": "$started_at"}}},
        {"$group": {"_id": "$hour", "sessions": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    res = await db.quiz_sessions.aggregate(pipeline).to_list(24)
    hour_map = {r["_id"]: r["sessions"] for r in res}
    return [{"hour": h, "label": f"{h:02d}:00", "sessions": hour_map.get(h, 0)} for h in range(24)]


# ── 8. Average Questions Per Session ─────────────────────────────────────────

@router.get("/avg-questions-per-session")
async def avg_questions_per_session():
    db = get_db()
    pipeline = [
        {"$group": {"_id": None, "avg_answered": {"$avg": "$answered_questions"}, "avg_total": {"$avg": "$total_questions"}}}
    ]
    res = await db.quiz_sessions.aggregate(pipeline).to_list(1)
    data = res[0] if res else {"avg_answered": 0, "avg_total": 0}
    data.pop("_id", None)
    data["avg_answered"] = round(data.get("avg_answered", 0), 2)
    data["avg_total"] = round(data.get("avg_total", 0), 2)
    return data


# ── 9. Score Distribution ─────────────────────────────────────────────────────

@router.get("/score-distribution")
async def score_distribution():
    db = get_db()
    pipeline = [
        {"$match": {"is_completed": True}},
        {"$bucket": {
            "groupBy": "$score_percent",
            "boundaries": [0, 20, 40, 60, 80, 100],
            "default": "100",
            "output": {"count": {"$sum": 1}}
        }}
    ]
    res = await db.quiz_sessions.aggregate(pipeline).to_list(10)
    labels = {0: "0–20%", 20: "20–40%", 40: "40–60%", 60: "60–80%", 80: "80–100%", "100": "100%"}
    return [{"range": labels.get(r["_id"], str(r["_id"])), "count": r["count"]} for r in res]


# ── 10. Summary Dashboard ─────────────────────────────────────────────────────

@router.get("/summary")
async def analytics_summary():
    db = get_db()
    now = datetime.utcnow()
    today_start = start_of_day(now)
    week_start = today_start - timedelta(days=7)

    dau = len(await db.quiz_sessions.distinct("user_id", {"started_at": {"$gte": today_start}}))
    wau = len(await db.quiz_sessions.distinct("user_id", {"started_at": {"$gte": week_start}}))

    q_stats_pipeline = [{"$group": {"_id": None, "served": {"$sum": "$total_questions"}, "answered": {"$sum": "$answered_questions"}}}]
    q_res = await db.quiz_sessions.aggregate(q_stats_pipeline).to_list(1)
    q_data = q_res[0] if q_res else {"served": 0, "answered": 0}

    total = await db.quiz_sessions.count_documents({})
    completed = await db.quiz_sessions.count_documents({"is_completed": True})
    rate = round((completed / total) * 100, 1) if total else 0

    rt_pipeline = [
        {"$unwind": "$responses"},
        {"$match": {"responses.response_duration_ms": {"$gt": 0}}},
        {"$group": {"_id": None, "avg_ms": {"$avg": "$responses.response_duration_ms"}}}
    ]
    rt_res = await db.quiz_sessions.aggregate(rt_pipeline).to_list(1)
    avg_ms = rt_res[0]["avg_ms"] if rt_res else 0

    return {
        "daily_active_users": dau,
        "weekly_active_users": wau,
        "total_questions_served": q_data["served"],
        "total_questions_answered": q_data["answered"],
        "total_sessions": total,
        "completed_sessions": completed,
        "completion_rate_percent": rate,
        "avg_response_time_seconds": round(avg_ms / 1000, 2) if avg_ms else 0,
    }
