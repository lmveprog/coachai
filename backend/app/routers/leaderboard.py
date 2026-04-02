from __future__ import annotations
import json
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.redis import get_redis
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry, LeaderboardResponse
from app.services.auth import get_current_user_optional

router = APIRouter()

CACHE_TTL = 60  # seconds


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
):
    cache_key = f"leaderboard:global:{page}:{per_page}"
    redis = await get_redis()
    cached = await redis.get(cache_key)
    if cached:
        return LeaderboardResponse(**json.loads(cached))

    count_result = await db.execute(select(func.count(User.id)).where(User.is_active == True))  # noqa: E712
    total = count_result.scalar_one()

    result = await db.execute(
        select(User)
        .where(User.is_active == True)  # noqa: E712
        .order_by(User.elo.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    users = result.scalars().all()

    offset = (page - 1) * per_page
    entries = [
        LeaderboardEntry(
            position=offset + i + 1,
            user_id=u.id,
            username=u.username,
            avatar_url=u.avatar_url,
            elo=u.elo,
            rank_name=u.rank,
            challenges_solved=u.challenges_solved,
        )
        for i, u in enumerate(users)
    ]

    response = LeaderboardResponse(entries=entries, total=total, page=page, per_page=per_page)
    await redis.setex(cache_key, CACHE_TTL, response.model_dump_json())
    return response


@router.get("/me", response_model=dict)
async def my_rank(
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if not current_user:
        return {"position": None, "elo": None}

    count_result = await db.execute(
        select(func.count(User.id)).where(User.elo > current_user.elo, User.is_active == True)  # noqa: E712
    )
    users_above = count_result.scalar_one()
    return {
        "position": users_above + 1,
        "elo": current_user.elo,
        "rank": current_user.rank,
    }
