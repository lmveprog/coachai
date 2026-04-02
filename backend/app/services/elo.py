from __future__ import annotations
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.elo import EloHistory
from app.models.user import User
from app.core.rank import compute_rank, RANK_THRESHOLDS  # noqa: F401 – re-exported for callers

K_FACTOR = 32

DIFFICULTY_MULTIPLIERS = {
    "easy": 1.0,
    "medium": 1.5,
    "hard": 2.0,
    "expert": 3.0,
}


def calculate_elo_change(user_elo: int, difficulty: str, solved: bool) -> int:
    multiplier = DIFFICULTY_MULTIPLIERS.get(difficulty, 1.0)
    if solved:
        delta = int(K_FACTOR * multiplier)
    else:
        delta = -max(5, int(K_FACTOR * 0.5 * multiplier))
    return delta


async def apply_elo_change(
    user: User,
    delta: int,
    reason: str,
    db: AsyncSession,
    submission_id: uuid.UUID | None = None,
) -> EloHistory:
    elo_before = user.elo
    elo_after = max(0, elo_before + delta)

    user.elo = elo_after
    user.rank = compute_rank(elo_after)

    record = EloHistory(
        user_id=user.id,
        submission_id=submission_id,
        elo_before=elo_before,
        elo_after=elo_after,
        delta=delta,
        reason=reason,
    )
    db.add(record)
    return record