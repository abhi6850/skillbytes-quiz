from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.connection import connect_db, close_db
from routers import catalog, quiz, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="SkillBytes Quiz API",
    description="WhatsApp-style quiz platform with analytics",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router)
app.include_router(quiz.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    return {"message": "SkillBytes Quiz API is running 🚀", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
