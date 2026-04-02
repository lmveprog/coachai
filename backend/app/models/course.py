import uuid
from datetime import datetime, timezone


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, Enum, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.core.database import Base


class CourseCategory(str, enum.Enum):
    SQL = "sql"
    MACHINE_LEARNING = "machine_learning"
    DEEP_LEARNING = "deep_learning"
    NLP = "nlp"
    COMPUTER_VISION = "computer_vision"
    VISUALIZATION = "visualization"
    DATA_ENGINEERING = "data_engineering"
    STATISTICS = "statistics"


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    category: Mapped[CourseCategory] = mapped_column(Enum(CourseCategory, values_callable=lambda obj: [e.value for e in obj]), nullable=False, index=True)
    level: Mapped[str] = mapped_column(String(20), default="beginner")  # beginner, intermediate, advanced

    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)

    # Ordre dans la liste des cours
    order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Lesson.order",
    )

    def __repr__(self) -> str:
        return f"<Course {self.slug}>"


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)  # Markdown / MDX
    order: Mapped[int] = mapped_column(Integer, default=0)

    # Une leçon peut avoir un challenge associé (pratique après théorie)
    linked_challenge_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("challenges.id", ondelete="SET NULL"), nullable=True
    )

    duration_minutes: Mapped[int] = mapped_column(Integer, default=10)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    course: Mapped["Course"] = relationship(back_populates="lessons")
    progress_records: Mapped[list["UserLessonProgress"]] = relationship(back_populates="lesson")

    def __repr__(self) -> str:
        return f"<Lesson {self.title} (course={self.course_id})>"


class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False
    )
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    user: Mapped["User"] = relationship(back_populates="lesson_progress")
    lesson: Mapped["Lesson"] = relationship(back_populates="progress_records")
