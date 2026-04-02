from __future__ import annotations
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from pydantic import BaseModel

from app.core.database import get_db
from app.models.elo import EloHistory
from app.models.submission import Submission
from app.models.user import User, UserBadge
from app.schemas.submission import SubmissionOut
from app.schemas.user import BadgeOut, EloHistoryOut, UserProfile, UserPublic, UserUpdate
from app.services.auth import get_current_user, verify_password

router = APIRouter()


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserPublic.model_validate(current_user)


@router.patch("/me", response_model=UserPublic)
async def update_me(
    body: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if body.username is not None and body.username != current_user.username:
        existing = await db.execute(select(User).where(User.username == body.username))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Ce pseudo est déjà pris")
        current_user.username = body.username
    if body.display_name is not None:
        current_user.display_name = body.display_name
    if body.bio is not None:
        current_user.bio = body.bio
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    if body.country is not None:
        current_user.country = body.country
    if body.profile_type is not None:
        current_user.profile_type = body.profile_type
    await db.flush()
    await db.refresh(current_user)
    return UserPublic.model_validate(current_user)


@router.get("/me/submissions", response_model=list[SubmissionOut])
async def my_submissions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = 1,
    per_page: int = 20,
):
    result = await db.execute(
        select(Submission)
        .where(Submission.user_id == current_user.id)
        .order_by(Submission.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    return [SubmissionOut.model_validate(s) for s in result.scalars().all()]


@router.get("/me/elo-history", response_model=list[EloHistoryOut])
async def my_elo_history(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(EloHistory)
        .where(EloHistory.user_id == current_user.id)
        .order_by(EloHistory.created_at.asc())
        .limit(100)
    )
    return [EloHistoryOut.model_validate(r) for r in result.scalars().all()]


class DeleteAccountRequest(BaseModel):
    password: str


@router.post("/me/delete", status_code=204)
async def delete_account(
    body: DeleteAccountRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """GDPR: permanently delete the current user's account and all associated data."""
    if not current_user.hashed_password or not verify_password(body.password, current_user.hashed_password):
        raise HTTPException(status_code=403, detail="Mot de passe incorrect")

    # Delete all user data (cascades configured on models)
    await db.delete(current_user)
    await db.flush()


@router.get("/{username}", response_model=UserProfile)
async def get_profile(username: str, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(
        select(User)
        .where(User.username == username)
        .options(selectinload(User.badges).selectinload(UserBadge.badge))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    badges = [
        BadgeOut(
            id=ub.badge.id,
            name=ub.badge.name,
            description=ub.badge.description,
            icon=ub.badge.icon,
            earned_at=ub.earned_at,
        )
        for ub in user.badges
        if ub.badge
    ]

    return UserProfile(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        elo=user.elo,
        rank=user.rank,
        challenges_solved=user.challenges_solved,
        streak_days=user.streak_days,
        is_premium=user.is_premium,
        created_at=user.created_at,
        bio=user.bio,
        country=user.country,
        profile_type=user.profile_type,
        total_submissions=user.total_submissions,
        badges=badges,
    )
