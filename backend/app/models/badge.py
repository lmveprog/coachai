import uuid
from datetime import datetime, timezone


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

from sqlalchemy import String, DateTime, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.core.database import Base


class BadgeTrigger(str, enum.Enum):
    FIRST_SOLVE = "first_solve"
    STREAK = "streak"               # X jours consécutifs
    CATEGORY_MASTER = "category_master"  # Résoudre N challenges d'une catégorie
    ELO_MILESTONE = "elo_milestone"
    SPEED_SOLVE = "speed_solve"     # Résoudre en moins de X secondes
    PERFECT_SCORE = "perfect_score"


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(200), nullable=False)  # emoji ou URL SVG
    trigger: Mapped[BadgeTrigger] = mapped_column(Enum(BadgeTrigger, values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    trigger_value: Mapped[int] = mapped_column(default=1)  # Ex: streak=7 pour "7 jours"

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    user_badges: Mapped[list["UserBadge"]] = relationship(back_populates="badge")

    def __repr__(self) -> str:
        return f"<Badge {self.name}>"
