"""
Admin Router — Endpoints protégés pour créer et gérer les challenges/cours.

Accès requis : utilisateur avec is_admin=True.
"""
from __future__ import annotations
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.challenge import (
    Challenge, ChallengeCategory, ChallengeDifficulty, ChallengeType,
    ChallengeTag, ChallengeTestCase
)
from app.models.course import Course, Lesson, CourseCategory
from app.models.user import User
from app.schemas.challenge import ChallengeDetail
from app.services.auth import get_current_user

router = APIRouter()


def _require_admin(user: User) -> User:
    """Admin check — requires is_admin=True (separate from email verification)."""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ── Challenge Admin ────────────────────────────────────────────────────────────

class TestCaseIn(BaseModel):
    input_data: str | None = None
    expected_output: str | None = None
    is_hidden: bool = True
    points: int = 10
    order: int = 0


class ChallengeCreateIn(BaseModel):
    slug: str = Field(..., min_length=3, max_length=100)
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: ChallengeCategory
    difficulty: ChallengeDifficulty
    challenge_type: ChallengeType = ChallengeType.CODE
    base_points: int = 100
    elo_reward: int = 25
    starter_code: str | None = None
    dataset_url: str | None = None
    evaluation_config: dict = {}
    time_limit_seconds: int = 30
    memory_limit_mb: int = 512
    is_published: bool = False
    is_premium: bool = False
    tags: list[str] = []
    test_cases: list[TestCaseIn] = []


class ChallengeUpdateIn(BaseModel):
    title: str | None = None
    description: str | None = None
    starter_code: str | None = None
    dataset_url: str | None = None
    evaluation_config: dict | None = None
    is_published: bool | None = None
    is_premium: bool | None = None
    elo_reward: int | None = None
    time_limit_seconds: int | None = None
    memory_limit_mb: int | None = None


@router.post("/challenges", status_code=201)
async def create_challenge(
    body: ChallengeCreateIn,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)

    # Check slug uniqueness
    existing = await db.execute(select(Challenge).where(Challenge.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Slug already exists")

    tags = body.tags
    test_cases = body.test_cases

    challenge = Challenge(
        id=uuid.uuid4(),
        slug=body.slug,
        title=body.title,
        description=body.description,
        category=body.category,
        difficulty=body.difficulty,
        challenge_type=body.challenge_type,
        base_points=body.base_points,
        elo_reward=body.elo_reward,
        starter_code=body.starter_code,
        dataset_url=body.dataset_url,
        evaluation_config=body.evaluation_config,
        time_limit_seconds=body.time_limit_seconds,
        memory_limit_mb=body.memory_limit_mb,
        is_published=body.is_published,
        is_premium=body.is_premium,
    )
    db.add(challenge)
    await db.flush()

    for tag_name in tags:
        db.add(ChallengeTag(id=uuid.uuid4(), challenge_id=challenge.id, name=tag_name))

    for tc in test_cases:
        db.add(ChallengeTestCase(id=uuid.uuid4(), challenge_id=challenge.id, **tc.model_dump()))

    await db.commit()
    await db.refresh(challenge)
    return {"id": str(challenge.id), "slug": challenge.slug, "message": "Challenge créé"}


@router.patch("/challenges/{slug}")
async def update_challenge(
    slug: str,
    body: ChallengeUpdateIn,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)

    result = await db.execute(select(Challenge).where(Challenge.slug == slug))
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(challenge, field, value)

    await db.commit()
    return {"message": "Challenge mis à jour"}


@router.post("/challenges/{slug}/publish")
async def publish_challenge(
    slug: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)

    result = await db.execute(select(Challenge).where(Challenge.slug == slug))
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    challenge.is_published = True
    await db.commit()
    return {"message": f"Challenge '{slug}' publié"}


@router.post("/challenges/{slug}/test-cases", status_code=201)
async def add_test_case(
    slug: str,
    body: TestCaseIn,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)

    result = await db.execute(select(Challenge).where(Challenge.slug == slug))
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    tc = ChallengeTestCase(id=uuid.uuid4(), challenge_id=challenge.id, **body.model_dump())
    db.add(tc)
    await db.commit()
    return {"id": str(tc.id), "message": "Test case ajouté"}


# ── Course Admin ───────────────────────────────────────────────────────────────

class LessonIn(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=10)
    order: int = 0
    duration_minutes: int = 10
    is_premium: bool = False
    linked_challenge_id: uuid.UUID | None = None


class CourseCreateIn(BaseModel):
    slug: str = Field(..., min_length=3, max_length=100)
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: CourseCategory
    level: str = "beginner"
    order: int = 0
    is_published: bool = False
    is_premium: bool = False
    lessons: list[LessonIn] = []


@router.post("/courses", status_code=201)
async def create_course(
    body: CourseCreateIn,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)

    existing = await db.execute(select(Course).where(Course.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Slug already exists")

    lessons = body.lessons
    course = Course(
        id=uuid.uuid4(),
        slug=body.slug,
        title=body.title,
        description=body.description,
        category=body.category,
        level=body.level,
        order=body.order,
        is_published=body.is_published,
        is_premium=body.is_premium,
    )
    db.add(course)
    await db.flush()

    for lesson_data in lessons:
        db.add(Lesson(id=uuid.uuid4(), course_id=course.id, **lesson_data.model_dump()))

    await db.commit()
    return {"id": str(course.id), "slug": course.slug, "message": "Cours créé"}


@router.post("/courses/{slug}/lessons", status_code=201)
async def add_lesson(
    slug: str,
    body: LessonIn,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)

    result = await db.execute(select(Course).where(Course.slug == slug))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lesson = Lesson(id=uuid.uuid4(), course_id=course.id, **body.model_dump())
    db.add(lesson)
    await db.commit()
    return {"id": str(lesson.id), "message": "Leçon ajoutée"}


@router.post("/courses/{slug}/publish")
async def publish_course(
    slug: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)

    result = await db.execute(select(Course).where(Course.slug == slug))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course.is_published = True
    await db.commit()
    return {"message": f"Cours '{slug}' publié"}


# ── List All (admin view) ──────────────────────────────────────────────────────

@router.get("/challenges")
async def list_all_challenges(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Challenge).options(selectinload(Challenge.tags)).order_by(Challenge.created_at.desc())
    )
    challenges = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "slug": c.slug,
            "title": c.title,
            "category": c.category,
            "difficulty": c.difficulty,
            "challenge_type": c.challenge_type,
            "is_published": c.is_published,
            "is_premium": c.is_premium,
            "elo_reward": c.elo_reward,
            "total_attempts": c.total_attempts,
            "total_solves": c.total_solves,
            "tags": [t.name for t in c.tags],
        }
        for c in challenges
    ]


@router.get("/courses")
async def list_all_courses(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Course).options(selectinload(Course.lessons)).order_by(Course.order, Course.created_at)
    )
    courses = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "slug": c.slug,
            "title": c.title,
            "category": c.category,
            "level": c.level,
            "is_published": c.is_published,
            "is_premium": c.is_premium,
            "lessons_count": len(c.lessons),
        }
        for c in courses
    ]


# ── Stats Admin ────────────────────────────────────────────────────────────────

@router.get("/stats")
async def admin_stats(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    _require_admin(current_user)
    from sqlalchemy import func
    from app.models.submission import Submission
    from app.models.user import User as UserModel

    users_count = (await db.execute(select(func.count(UserModel.id)))).scalar()
    challenges_count = (await db.execute(select(func.count(Challenge.id)))).scalar()
    submissions_count = (await db.execute(select(func.count(Submission.id)))).scalar()
    courses_count = (await db.execute(select(func.count(Course.id)))).scalar()

    return {
        "users": users_count,
        "challenges": challenges_count,
        "submissions": submissions_count,
        "courses": courses_count,
    }
