from __future__ import annotations
import uuid
from pydantic import BaseModel
from app.models.challenge import ChallengeCategory, ChallengeDifficulty, ChallengeType


class ChallengeCard(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    category: ChallengeCategory
    difficulty: ChallengeDifficulty
    challenge_type: ChallengeType
    base_points: int
    elo_reward: int
    total_attempts: int
    total_solves: int
    solve_rate: float
    is_premium: bool
    tags: list[str] = []

    model_config = {"from_attributes": True}


class ChallengeDetail(ChallengeCard):
    description: str
    starter_code: str | None
    dataset_url: str | None
    evaluation_config: dict
    time_limit_seconds: int
    memory_limit_mb: int


class ChallengeListResponse(BaseModel):
    items: list[ChallengeCard]
    total: int
    page: int
    per_page: int
    pages: int