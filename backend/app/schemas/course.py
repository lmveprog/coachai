from __future__ import annotations
import uuid
from pydantic import BaseModel
from app.models.course import CourseCategory


class LessonOut(BaseModel):
    id: uuid.UUID
    title: str
    order: int
    duration_minutes: int
    is_premium: bool
    completed: bool = False

    model_config = {"from_attributes": True}


class LessonDetail(LessonOut):
    content: str
    linked_challenge_id: uuid.UUID | None
    linked_challenge_slug: str | None = None


class CourseCard(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str
    thumbnail_url: str | None
    category: CourseCategory
    level: str
    is_premium: bool
    lessons_count: int = 0
    progress_percent: float | None = None

    model_config = {"from_attributes": True}


class CourseDetail(CourseCard):
    lessons: list[LessonOut] = []