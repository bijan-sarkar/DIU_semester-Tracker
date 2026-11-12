from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db
from app.routes import (
    auth_router,
    courses_router,
    topics_router,
    tracker_router,
    analytics_router,
    papers_router,
    analysis_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup if not present
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for DIU CSE Semester & Exam Tracker PWA",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(courses_router, prefix=settings.API_V1_STR)
app.include_router(topics_router, prefix=settings.API_V1_STR)
app.include_router(tracker_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(papers_router, prefix=settings.API_V1_STR)
app.include_router(analysis_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": "1.0.0"}

from pathlib import Path
from fastapi.staticfiles import StaticFiles

# Optional static frontend serving for unified Docker / production container
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.exists() and (STATIC_DIR / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": "Welcome to DIU CSE Semester & Exam Tracker API",
            "docs": "/docs",
            "health": "/api/health"
        }
