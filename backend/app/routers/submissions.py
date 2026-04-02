from __future__ import annotations
import uuid
import json
from datetime import date, datetime, timezone
from typing import Annotated

import anthropic
import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.core.logging import get_logger
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.challenge import Challenge, ChallengeTestCase
from app.models.submission import Submission, SubmissionStatus
from app.models.user import User
from app.schemas.submission import SubmitCodeRequest, SubmissionOut
from app.services.auth import get_current_user
from app.services.badges import check_and_award_badges, update_streak
from app.services.elo import apply_elo_change, calculate_elo_change

logger = get_logger("submissions")
router = APIRouter()


@router.post("", response_model=SubmissionOut, status_code=201)
async def submit(
    body: SubmitCodeRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Challenge).where(Challenge.id == body.challenge_id))
    challenge = result.scalar_one_or_none()
    if not challenge or not challenge.is_published:
        raise HTTPException(status_code=404, detail="Challenge not found")
    if challenge.is_premium and not current_user.is_premium:
        raise HTTPException(status_code=403, detail="Premium challenge")

    # Daily limit: free users can attempt 3 distinct challenges per day
    if not current_user.is_premium:
        today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
        already_today_q = await db.execute(
            select(func.count(Submission.id)).where(
                Submission.user_id == current_user.id,
                Submission.challenge_id == challenge.id,
                Submission.created_at >= today_start,
            )
        )
        already_tried_today = (already_today_q.scalar() or 0) > 0
        if not already_tried_today:
            distinct_q = await db.execute(
                select(func.count(func.distinct(Submission.challenge_id))).where(
                    Submission.user_id == current_user.id,
                    Submission.created_at >= today_start,
                )
            )
            if (distinct_q.scalar() or 0) >= 3:
                raise HTTPException(status_code=429, detail="daily_limit_reached")

    # Check if already solved (no ELO for repeat solves)
    already_solved_result = await db.execute(
        select(Submission).where(
            Submission.user_id == current_user.id,
            Submission.challenge_id == challenge.id,
            Submission.status == SubmissionStatus.ACCEPTED,
        )
    )
    already_solved = already_solved_result.scalar_one_or_none() is not None

    # Fetch test cases ordered by display order
    tc_result = await db.execute(
        select(ChallengeTestCase)
        .where(ChallengeTestCase.challenge_id == challenge.id)
        .order_by(ChallengeTestCase.order)
    )
    test_cases = tc_result.scalars().all()

    submission = Submission(
        user_id=current_user.id,
        challenge_id=challenge.id,
        code=body.code,
        language=body.language,
        status=SubmissionStatus.RUNNING,
        elo_before=current_user.elo,
    )
    db.add(submission)
    await db.flush()

    # Build judge payload
    judge_payload = {
        "submission_id": str(submission.id),
        "code": body.code,
        "language": body.language,
        "challenge_id": str(challenge.id),
        "time_limit_seconds": challenge.time_limit_seconds,
        "memory_limit_mb": challenge.memory_limit_mb,
        "evaluation_config": challenge.evaluation_config or {},
        "test_cases": [
            {
                "input_data": tc.input_data,
                "expected_output": tc.expected_output,
                "points": tc.points,
            }
            for tc in test_cases
        ],
    }

    # Call judge service
    judge_result: dict = {}
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{settings.judge_url}/judge",
                json=judge_payload,
                headers={"X-Judge-Secret": settings.judge_secret},
            )
            resp.raise_for_status()
            judge_result = resp.json()
    except Exception as e:
        logger.error("Judge service error for submission %s: %s", submission.id, str(e)[:300])
        submission.status = SubmissionStatus.RUNTIME_ERROR
        submission.error_message = "Judge service unavailable"
        await db.commit()
        await db.refresh(submission)
        return SubmissionOut.model_validate(submission)

    # Map result to submission
    status_map = {
        "accepted": SubmissionStatus.ACCEPTED,
        "wrong_answer": SubmissionStatus.WRONG_ANSWER,
        "time_limit": SubmissionStatus.TIME_LIMIT,
        "memory_limit": SubmissionStatus.MEMORY_LIMIT,
        "runtime_error": SubmissionStatus.RUNTIME_ERROR,
        "compilation_error": SubmissionStatus.COMPILATION_ERROR,
        "score_below_threshold": SubmissionStatus.SCORE_BELOW_THRESHOLD,
    }

    submission.status = status_map.get(judge_result.get("status", ""), SubmissionStatus.RUNTIME_ERROR)
    submission.score = judge_result.get("score")
    submission.execution_time_ms = judge_result.get("execution_time_ms")
    submission.memory_used_mb = judge_result.get("memory_used_mb")
    submission.error_message = judge_result.get("stderr") or None
    submission.result_detail = {
        "stdout": judge_result.get("stdout", ""),
        "test_case_results": judge_result.get("test_case_results", []),
    }

    challenge.total_attempts += 1
    is_accepted = submission.status == SubmissionStatus.ACCEPTED

    # Update daily streak
    await update_streak(current_user, db)

    if is_accepted and not already_solved:
        submission.is_first_solve = True
        challenge.total_solves += 1
        current_user.challenges_solved += 1
        current_user.total_submissions += 1

        delta = calculate_elo_change(current_user.elo, challenge.difficulty.value, solved=True)
        await apply_elo_change(
            user=current_user,
            delta=delta,
            reason="challenge_solved",
            db=db,
            submission_id=submission.id,
        )
        submission.elo_after = current_user.elo
        submission.elo_delta = delta

        # Auto-award badges
        await check_and_award_badges(current_user, submission, challenge, db)
    else:
        current_user.total_submissions += 1
        if not already_solved and not is_accepted:
            delta = calculate_elo_change(current_user.elo, challenge.difficulty.value, solved=False)
            await apply_elo_change(
                user=current_user,
                delta=delta,
                reason="challenge_failed",
                db=db,
                submission_id=submission.id,
            )
            submission.elo_after = current_user.elo
            submission.elo_delta = delta

    await db.commit()
    await db.refresh(submission)
    return SubmissionOut.model_validate(submission)


@router.get("/{submission_id}", response_model=SubmissionOut)
async def get_submission(
    submission_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your submission")
    return SubmissionOut.model_validate(submission)


@router.get("/daily-status")
async def daily_status(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if current_user.is_premium:
        return {"is_premium": True, "limit": None, "used": None, "remaining": None}
    today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
    result = await db.execute(
        select(func.count(func.distinct(Submission.challenge_id))).where(
            Submission.user_id == current_user.id,
            Submission.created_at >= today_start,
        )
    )
    used = result.scalar() or 0
    remaining = max(0, 3 - used)
    return {"is_premium": False, "limit": 3, "used": used, "remaining": remaining}


@router.post("/upload", response_model=SubmissionOut, status_code=201)
async def submit_file(
    challenge_id: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Submit a file (CSV, notebook, Python script, etc.) for LLM-based evaluation."""
    from app.core.config import settings as _settings

    if not _settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="LLM evaluation not configured")

    # Validate challenge
    try:
        cid = uuid.UUID(challenge_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid challenge_id")

    result = await db.execute(select(Challenge).where(Challenge.id == cid))
    challenge = result.scalar_one_or_none()
    if not challenge or not challenge.is_published:
        raise HTTPException(status_code=404, detail="Challenge not found")
    if challenge.is_premium and not current_user.is_premium:
        raise HTTPException(status_code=403, detail="Premium challenge")

    # Daily limit (same as regular submit)
    if not current_user.is_premium:
        today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
        already_today_q = await db.execute(
            select(func.count(Submission.id)).where(
                Submission.user_id == current_user.id,
                Submission.challenge_id == challenge.id,
                Submission.created_at >= today_start,
            )
        )
        already_tried_today = (already_today_q.scalar() or 0) > 0
        if not already_tried_today:
            distinct_q = await db.execute(
                select(func.count(func.distinct(Submission.challenge_id))).where(
                    Submission.user_id == current_user.id,
                    Submission.created_at >= today_start,
                )
            )
            if (distinct_q.scalar() or 0) >= 3:
                raise HTTPException(status_code=429, detail="daily_limit_reached")

    # Read file (limit 10 MB)
    MAX_SIZE = 10 * 1024 * 1024
    content_bytes = await file.read(MAX_SIZE + 1)
    if len(content_bytes) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    filename = file.filename or "submission"
    try:
        file_text = content_bytes.decode("utf-8", errors="replace")
    except Exception:
        file_text = content_bytes.hex()[:5000]

    # Truncate for LLM
    file_excerpt = file_text[:8000]

    # LLM evaluation
    client = anthropic.Anthropic(api_key=_settings.anthropic_api_key)
    eval_prompt = f"""Tu es un évaluateur expert pour la plateforme CoachAI.

Challenge : **{challenge.title}**
Description : {(challenge.description or '')[:1000]}

Fichier soumis : `{filename}`
Contenu (extrait) :
```
{file_excerpt}
```

Évalue cette soumission de façon structurée :
1. **Score** : donne un score de 0 à 100
2. **Verdict** : accepted / wrong_answer / incomplete
3. **Points forts** : ce qui est bien fait
4. **Points faibles / erreurs** : ce qui est manquant ou incorrect
5. **Conseils** : comment améliorer

Réponds en JSON strict avec ces champs :
{{
  "score": <int 0-100>,
  "verdict": "<accepted|wrong_answer|incomplete>",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "advice": "...",
  "summary": "<1 phrase>"
}}"""

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[{"role": "user", "content": eval_prompt}],
        )
        raw = response.content[0].text.strip()
        # Extract JSON from potential markdown code block
        if "```" in raw:
            raw = raw.split("```")[1].lstrip("json").strip()
        eval_data = json.loads(raw)
    except Exception as e:
        eval_data = {
            "score": 0,
            "verdict": "runtime_error",
            "strengths": [],
            "weaknesses": ["Erreur d'évaluation LLM"],
            "advice": str(e)[:200],
            "summary": "Erreur lors de l'évaluation automatique",
        }

    verdict = eval_data.get("verdict", "wrong_answer")
    score = float(eval_data.get("score", 0))

    status_map_llm = {
        "accepted": SubmissionStatus.ACCEPTED,
        "wrong_answer": SubmissionStatus.WRONG_ANSWER,
        "incomplete": SubmissionStatus.SCORE_BELOW_THRESHOLD,
        "runtime_error": SubmissionStatus.RUNTIME_ERROR,
    }
    sub_status = status_map_llm.get(verdict, SubmissionStatus.WRONG_ANSWER)

    already_solved_result = await db.execute(
        select(Submission).where(
            Submission.user_id == current_user.id,
            Submission.challenge_id == challenge.id,
            Submission.status == SubmissionStatus.ACCEPTED,
        )
    )
    already_solved = already_solved_result.scalar_one_or_none() is not None

    submission = Submission(
        user_id=current_user.id,
        challenge_id=challenge.id,
        code=f"# Fichier: {filename}\n\n{file_text[:5000]}",
        language="python",
        status=sub_status,
        score=score,
        elo_before=current_user.elo,
        result_detail={
            "llm_evaluation": eval_data,
            "filename": filename,
        },
    )
    db.add(submission)
    await db.flush()

    challenge.total_attempts += 1
    await update_streak(current_user, db)

    if sub_status == SubmissionStatus.ACCEPTED and not already_solved:
        submission.is_first_solve = True
        challenge.total_solves += 1
        current_user.challenges_solved += 1
        current_user.total_submissions += 1
        delta = calculate_elo_change(current_user.elo, challenge.difficulty.value, solved=True)
        await apply_elo_change(
            user=current_user, delta=delta, reason="challenge_solved",
            db=db, submission_id=submission.id,
        )
        submission.elo_after = current_user.elo
        submission.elo_delta = delta
        await check_and_award_badges(current_user, submission, challenge, db)
    else:
        current_user.total_submissions += 1
        if not already_solved and sub_status != SubmissionStatus.ACCEPTED:
            delta = calculate_elo_change(current_user.elo, challenge.difficulty.value, solved=False)
            await apply_elo_change(
                user=current_user, delta=delta, reason="challenge_failed",
                db=db, submission_id=submission.id,
            )
            submission.elo_after = current_user.elo
            submission.elo_delta = delta

    await db.commit()
    await db.refresh(submission)
    return SubmissionOut.model_validate(submission)


@router.get("/challenge/{challenge_id}", response_model=list[SubmissionOut])
async def get_challenge_submissions(
    challenge_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = 1,
    per_page: int = 20,
):
    result = await db.execute(
        select(Submission)
        .where(
            Submission.user_id == current_user.id,
            Submission.challenge_id == challenge_id,
        )
        .order_by(Submission.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    return [SubmissionOut.model_validate(s) for s in result.scalars().all()]
