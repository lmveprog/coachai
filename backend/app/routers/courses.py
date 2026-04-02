from __future__ import annotations
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.challenge import Challenge
from app.models.course import Course, Lesson, UserLessonProgress
from app.models.user import User
from app.schemas.course import CourseCard, CourseDetail, LessonDetail, LessonOut
from app.services.auth import get_current_user, get_current_user_optional

router = APIRouter()


async def _get_completed_ids(user_id: uuid.UUID, db: AsyncSession) -> set[uuid.UUID]:
    result = await db.execute(
        select(UserLessonProgress.lesson_id).where(UserLessonProgress.user_id == user_id)
    )
    return {row[0] for row in result.all()}


@router.get("", response_model=list[CourseCard])
async def list_courses(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
):
    result = await db.execute(
        select(Course)
        .where(Course.is_published == True)  # noqa: E712
        .options(selectinload(Course.lessons))
        .order_by(Course.order, Course.created_at)
    )
    courses = result.scalars().all()

    completed_ids: set[uuid.UUID] = set()
    if current_user:
        completed_ids = await _get_completed_ids(current_user.id, db)

    cards = []
    for c in courses:
        lessons_count = len(c.lessons)
        progress = None
        if current_user and lessons_count > 0:
            done = sum(1 for l in c.lessons if l.id in completed_ids)
            progress = round(done / lessons_count * 100, 1)
        cards.append(CourseCard(
            id=c.id,
            slug=c.slug,
            title=c.title,
            description=c.description,
            thumbnail_url=c.thumbnail_url,
            category=c.category,
            level=c.level,
            is_premium=c.is_premium,
            lessons_count=lessons_count,
            progress_percent=progress,
        ))
    return cards


@router.get("/{slug}", response_model=CourseDetail)
async def get_course(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
):
    result = await db.execute(
        select(Course)
        .where(Course.slug == slug, Course.is_published == True)  # noqa: E712
        .options(selectinload(Course.lessons))
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.is_premium and (not current_user or not current_user.is_premium):
        raise HTTPException(status_code=403, detail="Premium course")

    completed_ids: set[uuid.UUID] = set()
    if current_user:
        completed_ids = await _get_completed_ids(current_user.id, db)

    lessons = [
        LessonOut(
            id=l.id,
            title=l.title,
            order=l.order,
            duration_minutes=l.duration_minutes,
            is_premium=l.is_premium,
            completed=l.id in completed_ids,
        )
        for l in sorted(course.lessons, key=lambda x: x.order)
    ]

    return CourseDetail(
        id=course.id,
        slug=course.slug,
        title=course.title,
        description=course.description,
        thumbnail_url=course.thumbnail_url,
        category=course.category,
        level=course.level,
        is_premium=course.is_premium,
        lessons_count=len(lessons),
        lessons=lessons,
    )


@router.get("/{slug}/lessons/{lesson_id}", response_model=LessonDetail)
async def get_lesson(
    slug: str,
    lesson_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
):
    result = await db.execute(
        select(Lesson)
        .join(Course)
        .where(Course.slug == slug, Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if lesson.is_premium and (not current_user or not current_user.is_premium):
        raise HTTPException(status_code=403, detail="Premium lesson")

    completed = False
    if current_user:
        prog = await db.execute(
            select(UserLessonProgress).where(
                UserLessonProgress.user_id == current_user.id,
                UserLessonProgress.lesson_id == lesson.id,
            )
        )
        completed = prog.scalar_one_or_none() is not None

    linked_challenge_slug: str | None = None
    if lesson.linked_challenge_id:
        ch_result = await db.execute(
            select(Challenge.slug).where(Challenge.id == lesson.linked_challenge_id)
        )
        linked_challenge_slug = ch_result.scalar_one_or_none()

    return LessonDetail(
        id=lesson.id,
        title=lesson.title,
        order=lesson.order,
        duration_minutes=lesson.duration_minutes,
        is_premium=lesson.is_premium,
        completed=completed,
        content=lesson.content,
        linked_challenge_id=lesson.linked_challenge_id,
        linked_challenge_slug=linked_challenge_slug,
    )


@router.post("/{slug}/lessons/{lesson_id}/complete")
async def complete_lesson(
    slug: str,
    lesson_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Lesson).join(Course).where(Course.slug == slug, Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    existing = await db.execute(
        select(UserLessonProgress).where(
            UserLessonProgress.user_id == current_user.id,
            UserLessonProgress.lesson_id == lesson.id,
        )
    )
    if not existing.scalar_one_or_none():
        db.add(UserLessonProgress(user_id=current_user.id, lesson_id=lesson.id))
        await db.flush()

    return {"completed": True}
