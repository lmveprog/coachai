import uuid
from datetime import datetime, timezone


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.core.database import Base


class SubmissionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    ACCEPTED = "accepted"       # Résolu correctement
    WRONG_ANSWER = "wrong_answer"
    TIME_LIMIT = "time_limit"
    MEMORY_LIMIT = "memory_limit"
    RUNTIME_ERROR = "runtime_error"
    COMPILATION_ERROR = "compilation_error"
    SCORE_BELOW_THRESHOLD = "score_below_threshold"  # Pour les challenges ML avec seuil


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("challenges.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # Ce que l'user soumet (selon le type de challenge)
    code: Mapped[str | None] = mapped_column(Text, nullable=True)           # Pour CODE
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True) # Pour MODEL/NOTEBOOK

    language: Mapped[str | None] = mapped_column(String(20), nullable=True)  # python, sql, r

    # Résultat
    status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus, values_callable=lambda obj: [e.value for e in obj]), default=SubmissionStatus.PENDING, nullable=False, index=True
    )
    score: Mapped[float | None] = mapped_column(Float, nullable=True)        # 0-100 ou métrique ML
    execution_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    memory_used_mb: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Feedback détaillé (résultats par test case, stderr, etc.)
    result_detail: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ELO impact
    elo_before: Mapped[int | None] = mapped_column(Integer, nullable=True)
    elo_after: Mapped[int | None] = mapped_column(Integer, nullable=True)
    elo_delta: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Est-ce la première fois que cet user résout ce challenge ?
    is_first_solve: Mapped[bool] = mapped_column(default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False, index=True
    )

    # Relations
    user: Mapped["User"] = relationship(back_populates="submissions")
    challenge: Mapped["Challenge"] = relationship(back_populates="submissions")
    elo_record: Mapped["EloHistory | None"] = relationship(back_populates="submission", uselist=False)

    def __repr__(self) -> str:
        return f"<Submission {self.id} [{self.status}] user={self.user_id}>"
