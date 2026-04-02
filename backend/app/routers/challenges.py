from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import math

from app.core.database import get_db
from app.models.challenge import Challenge, ChallengeCategory, ChallengeDifficulty, ChallengeType
from app.models.user import User
from app.schemas.challenge import ChallengeCard, ChallengeDetail, ChallengeListResponse
from app.services.auth import get_current_user_optional

router = APIRouter()


def _to_card(challenge: Challenge) -> ChallengeCard:
    tags = [t.name for t in challenge.tags] if challenge.tags else []
    return ChallengeCard(
        id=challenge.id,
        slug=challenge.slug,
        title=challenge.title,
        category=challenge.category,
        difficulty=challenge.difficulty,
        challenge_type=challenge.challenge_type,
        base_points=challenge.base_points,
        elo_reward=challenge.elo_reward,
        total_attempts=challenge.total_attempts,
        total_solves=challenge.total_solves,
        solve_rate=challenge.solve_rate,
        is_premium=challenge.is_premium,
        tags=tags,
    )


@router.get("", response_model=ChallengeListResponse)
async def list_challenges(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
    category: ChallengeCategory | None = Query(None),
    difficulty: ChallengeDifficulty | None = Query(None),
    challenge_type: ChallengeType | None = Query(None),
    search: str | None = Query(None, max_length=100),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    # Base filter
    filters = [Challenge.is_published == True]  # noqa: E712
    if category:
        filters.append(Challenge.category == category)
    if difficulty:
        filters.append(Challenge.difficulty == difficulty)
    if challenge_type:
        filters.append(Challenge.challenge_type == challenge_type)
    if search:
        filters.append(Challenge.title.ilike(f"%{search}%"))

    # Count total
    count_q = select(func.count(Challenge.id)).where(*filters)
    total = (await db.execute(count_q)).scalar() or 0

    # Fetch page
    q = (
        select(Challenge)
        .where(*filters)
        .options(selectinload(Challenge.tags))
        .order_by(Challenge.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    result = await db.execute(q)
    items = [_to_card(c) for c in result.scalars().all()]

    return ChallengeListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=max(1, math.ceil(total / per_page)),
    )


@router.get("/{slug}", response_model=ChallengeDetail)
async def get_challenge(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
):
    result = await db.execute(
        select(Challenge)
        .where(Challenge.slug == slug, Challenge.is_published == True)  # noqa: E712
        .options(selectinload(Challenge.tags))
    )
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    if challenge.is_premium and (not current_user or not current_user.is_premium):
        raise HTTPException(status_code=403, detail="Premium challenge — upgrade to access")

    tags = [t.name for t in challenge.tags] if challenge.tags else []
    return ChallengeDetail(
        id=challenge.id,
        slug=challenge.slug,
        title=challenge.title,
        category=challenge.category,
        difficulty=challenge.difficulty,
        challenge_type=challenge.challenge_type,
        base_points=challenge.base_points,
        elo_reward=challenge.elo_reward,
        total_attempts=challenge.total_attempts,
        total_solves=challenge.total_solves,
        solve_rate=challenge.solve_rate,
        is_premium=challenge.is_premium,
        tags=tags,
        description=challenge.description,
        starter_code=challenge.starter_code,
        dataset_url=challenge.dataset_url,
        evaluation_config=challenge.evaluation_config,
        time_limit_seconds=challenge.time_limit_seconds,
        memory_limit_mb=challenge.memory_limit_mb,
    )
