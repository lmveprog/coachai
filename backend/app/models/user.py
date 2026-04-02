import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.core.rank import compute_rank


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)  # nullable pour OAuth

    # Profile
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    country: Mapped[str | None] = mapped_column(String(2), nullable=True)  # ISO 3166-1 alpha-2
    profile_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # student | junior | senior | ml_engineer | researcher | other

    # ELO & Ranking
    elo: Mapped[int] = mapped_column(Integer, default=1000, nullable=False)
    rank: Mapped[str] = mapped_column(String(50), default="Rookie", nullable=False)
    # Ranks: Rookie → Analyst → Expert → Master → Grand Master

    # Stats
    challenges_solved: Mapped[int] = mapped_column(Integer, default=0)
    total_submissions: Mapped[int] = mapped_column(Integer, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Subscription
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    premium_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    # Auth
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)  # email verification
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)  # admin privileges (separate from email verification)
    oauth_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)  # google, github
    oauth_provider_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # Relations
    submissions: Mapped[list["Submission"]] = relationship(back_populates="user")
    elo_history: Mapped[list["EloHistory"]] = relationship(back_populates="user")
    badges: Mapped[list["UserBadge"]] = relationship(back_populates="user")
    lesson_progress: Mapped[list["UserLessonProgress"]] = relationship(back_populates="user")

    def __repr__(self) -> str:
        return f"<User {self.username} elo={self.elo}>"

    @property
    def computed_rank(self) -> str:
        return compute_rank(self.elo)


class UserBadge(Base):
    __tablename__ = "user_badges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    badge_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("badges.id", ondelete="CASCADE"), index=True)
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    user: Mapped["User"] = relationship(back_populates="badges")
    badge: Mapped["Badge"] = relationship(back_populates="user_badges")
