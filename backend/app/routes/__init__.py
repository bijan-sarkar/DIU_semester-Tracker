from app.routes.auth import router as auth_router
from app.routes.courses import router as courses_router
from app.routes.topics import router as topics_router
from app.routes.tracker import router as tracker_router
from app.routes.analytics import router as analytics_router
from app.routes.papers import router as papers_router
from app.routes.analysis import router as analysis_router

__all__ = ["auth_router", "courses_router", "topics_router", "tracker_router", "analytics_router", "papers_router", "analysis_router"]
