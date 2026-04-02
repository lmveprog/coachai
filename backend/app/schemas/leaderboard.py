from __future__ import annotations
import uuid
from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    position: int
    user_id: uuid.UUID
    username: str
    avatar_url: str | None
    elo: int
    rank_name: str
    challenges_solved: int

    model_config = {"from_attributes": True}


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    total: int
    page: int
    per_page: int