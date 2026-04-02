"""
Badge Service — Attribution automatique de badges après chaque soumission.

Badges supportés :
- first_solve       : Premier challenge résolu
- streak            : X jours consécutifs d'activité (7, 30, 100)
- category_master   : N challenges résolus dans une catégorie (5, 10, 25)
- elo_milestone     : Atteindre un palier ELO (1200, 1500, 1800, 2200)
- speed_solve       : Résoudre en < X ms (ex: < 1000ms)
- perfect_score     : Score de 100 sur un challenge ML
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.badge import Badge, BadgeTrigger
from app.models.submission import Submission, SubmissionStatus
from app.models.user import User, UserBadge
from app.models.challenge import Challenge


async def _already_has_badge(user_id: uuid.UUID, badge_id: uuid.UUID, db: AsyncSession) -> bool:
    result = await db.execute(
        select(UserBadge).where(
            UserBadge.user_id == user_id,
            UserBadge.badge_id == badge_id,
        )
    )
    return result.scalar_one_or_none() is not None


async def _award(user: User, badge: Badge, db: AsyncSession) -> UserBadge | None:
    if await _already_has_badge(user.id, badge.id, db):
        return None
    ub = UserBadge(user_id=user.id, badge_id=badge.id, earned_at=datetime.now(timezone.utc))
    db.add(ub)
    return ub


async def check_and_award_badges(
    user: User,
    submission: Submission,
    challenge: Challenge,
    db: AsyncSession,
) -> list[Badge]:
    """
    Vérifie tous les critères de badge après une soumission.
    Retourne la liste des badges nouvellement obtenus.
    """
    awarded: list[Badge] = []
    is_accepted = submission.status == SubmissionStatus.ACCEPTED

    # Récupérer tous les badges disponibles
    result = await db.execute(select(Badge))
    all_badges = result.scalars().all()

    for badge in all_badges:
        new_badge = None

        if badge.trigger == BadgeTrigger.FIRST_SOLVE and is_accepted:
            # Premier challenge résolu de toute la plateforme pour cet user
            if user.challenges_solved == 1:  # vient juste d'être incrémenté
                new_badge = await _award(user, badge, db)

        elif badge.trigger == BadgeTrigger.ELO_MILESTONE:
            # Atteindre un certain palier ELO
            if user.elo >= badge.trigger_value:
                # Vérifier qu'on vient de le passer (elo_before < threshold <= elo_after)
                elo_before = submission.elo_before or 0
                if elo_before < badge.trigger_value:
                    new_badge = await _award(user, badge, db)

        elif badge.trigger == BadgeTrigger.STREAK and is_accepted:
            if user.streak_days >= badge.trigger_value:
                new_badge = await _award(user, badge, db)

        elif badge.trigger == BadgeTrigger.CATEGORY_MASTER and is_accepted:
            # Compter les challenges résolus dans cette catégorie
            count_result = await db.execute(
                select(func.count(Submission.id)).where(
                    Submission.user_id == user.id,
                    Submission.status == SubmissionStatus.ACCEPTED,
                    Submission.is_first_solve == True,
                ).join(Challenge, Submission.challenge_id == Challenge.id).where(
                    Challenge.category == challenge.category
                )
            )
            category_solves = count_result.scalar() or 0
            if category_solves >= badge.trigger_value:
                new_badge = await _award(user, badge, db)

        elif badge.trigger == BadgeTrigger.SPEED_SOLVE and is_accepted:
            exec_time = submission.execution_time_ms or 999999
            if exec_time <= badge.trigger_value:
                new_badge = await _award(user, badge, db)

        elif badge.trigger == BadgeTrigger.PERFECT_SCORE and is_accepted:
            score = submission.score or 0
            if score >= 100:
                new_badge = await _award(user, badge, db)

        if new_badge is not None:
            awarded.append(badge)

    return awarded


async def update_streak(user: User, db: AsyncSession) -> None:
    """Met à jour le streak de l'utilisateur."""
    now = datetime.now(timezone.utc)
    last = user.last_active_at

    if last is None:
        user.streak_days = 1
    else:
        # Make last timezone-aware if needed
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        delta_days = (now.date() - last.date()).days
        if delta_days == 0:
            pass  # Already active today
        elif delta_days == 1:
            user.streak_days += 1
        else:
            user.streak_days = 1  # Streak broken

    user.last_active_at = now
