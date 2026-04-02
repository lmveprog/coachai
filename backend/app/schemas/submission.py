from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.submission import SubmissionStatus


class SubmitCodeRequest(BaseModel):
    challenge_id: uuid.UUID
    code: str
    language: str = "python"


class SubmissionOut(BaseModel):
    id: uuid.UUID
    challenge_id: uuid.UUID
    user_id: uuid.UUID
    code: str | None
    language: str | None
    status: SubmissionStatus
    score: float | None
    execution_time_ms: int | None
    memory_used_mb: float | None
    result_detail: dict | None
    error_message: str | None
    elo_before: int | None
    elo_after: int | None
    elo_delta: int | None
    is_first_solve: bool
    created_at: datetime
    challenge_title: str | None = None
    username: str | None = None

    model_config = {"from_attributes": True}