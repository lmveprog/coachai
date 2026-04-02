from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, field_validator


class BadgeOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    icon: str
    earned_at: datetime

    model_config = {"from_attributes": True}


class UserPublic(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    display_name: str | None
    avatar_url: str | None
    elo: int
    rank: str
    challenges_solved: int
    total_submissions: int
    streak_days: int
    is_premium: bool
    is_verified: bool
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfile(UserPublic):
    bio: str | None
    country: str | None
    profile_type: str | None
    total_submissions: int
    badges: list[BadgeOut] = []


class UserUpdate(BaseModel):
    bio: str | None = None
    avatar_url: str | None = None
    country: str | None = None
    display_name: str | None = None
    profile_type: str | None = None
    username: str | None = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not (3 <= len(v) <= 20):
            raise ValueError("Le pseudo doit contenir entre 3 et 20 caractères")
        import re
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Le pseudo ne peut contenir que des lettres, chiffres et underscores")
        return v


class EloHistoryOut(BaseModel):
    id: uuid.UUID
    elo_before: int
    elo_after: int
    delta: int
    reason: str
    created_at: datetime

    model_config = {"from_attributes": True}
