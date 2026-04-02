import uuid
from datetime import datetime, timezone


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

from sqlalchemy import Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class EloHistory(Base):
    """Historique complet des mouvements ELO — permet de rejouer le classement."""
    __tablename__ = "elo_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    submission_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True
    )

    elo_before: Mapped[int] = mapped_column(Integer, nullable=False)
    elo_after: Mapped[int] = mapped_column(Integer, nullable=False)
    delta: Mapped[int] = mapped_column(Integer, nullable=False)  # peut être négatif

    # Contexte de l'évènement
    reason: Mapped[str] = mapped_column(String(100), nullable=False)
    # Exemples: "challenge_solved", "daily_bonus", "streak_bonus", "penalty_inactive"

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False, index=True
    )

    # Relations
    user: Mapped["User"] = relationship(back_populates="elo_history")
    submission: Mapped["Submission | None"] = relationship(back_populates="elo_record")

    def __repr__(self) -> str:
        return f"<EloHistory user={self.user_id} {self.elo_before}→{self.elo_after} ({self.delta:+d})>"
