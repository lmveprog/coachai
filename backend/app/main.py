import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import get_logger, setup_logging
from app.core.redis import close_redis
from app.routers import health, auth, users, challenges, submissions, leaderboard, courses, admin, billing, chat

setup_logging("DEBUG" if settings.environment == "development" else "INFO")
logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CoachAI API starting — env=%s", settings.environment)
    yield
    logger.info("CoachAI API shutting down")
    await close_redis()


app = FastAPI(
    title="CoachAI API",
    description="Plateforme data/IA gamifiée — challenges, ELO, formation",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.environment == "development" else None,
    redoc_url="/api/redoc" if settings.environment == "development" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    if ms > 500 or response.status_code >= 400:
        logger.info(
            "%s %s → %d (%.0fms)",
            request.method,
            request.url.path,
            response.status_code,
            ms,
        )
    return response


# Routers
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["challenges"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["leaderboard"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(billing.router, prefix="/api/billing", tags=["billing"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
