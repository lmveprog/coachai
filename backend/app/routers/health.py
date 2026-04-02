from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

import httpx

from app.core.config import settings
from app.core.database import get_db
from app.core.redis import get_redis

router = APIRouter()


@router.get("/health", tags=["health"])
async def health_check(db: AsyncSession = Depends(get_db)):
    checks: dict[str, str] = {}

    # Database
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    # Redis
    try:
        redis = await get_redis()
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    # Judge service
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.judge_url}/health")
            checks["judge"] = "ok" if resp.status_code == 200 else f"status:{resp.status_code}"
    except Exception:
        checks["judge"] = "unreachable"

    all_ok = all(v == "ok" for v in checks.values())
    status_code = 200 if all_ok else 503

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ok" if all_ok else "degraded",
            **checks,
        },
    )
