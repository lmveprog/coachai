import uuid
from datetime import datetime, timezone


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

from sqlalchemy import (
    String, Integer, Float, DateTime, ForeignKey,
    Text, Enum, Boolean, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.core.database import Base


class ChallengeCategory(str, enum.Enum):
    SQL = "sql"
    MACHINE_LEARNING = "machine_learning"
    DEEP_LEARNING = "deep_learning"
    NLP = "nlp"
    COMPUTER_VISION = "computer_vision"
    VISUALIZATION = "visualization"
    DATA_ENGINEERING = "data_engineering"


class ChallengeDifficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


class ChallengeType(str, enum.Enum):
    CODE = "code"           # SQL, Python code classique
    MODEL = "model"         # Soumettre un modèle entraîné (.pkl, .pt)
    NOTEBOOK = "notebook"   # Soumettre un notebook Jupyter
    QUIZ = "quiz"           # QCM


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)  # Markdown

    category: Mapped[ChallengeCategory] = mapped_column(
        Enum(ChallengeCategory, values_callable=lambda obj: [e.value for e in obj]), nullable=False, index=True
    )
    difficulty: Mapped[ChallengeDifficulty] = mapped_column(
        Enum(ChallengeDifficulty, values_callable=lambda obj: [e.value for e in obj]), nullable=False, index=True
    )
    challenge_type: Mapped[ChallengeType] = mapped_column(
        Enum(ChallengeType, values_callable=lambda obj: [e.value for e in obj]), nullable=False
    )

    # Points de base & ELO
    base_points: Mapped[int] = mapped_column(Integer, default=100)
    elo_reward: Mapped[int] = mapped_column(Integer, default=25)  # ELO gagné si résolu

    # Starter code / dataset
    starter_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    dataset_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Evaluation config (JSON flexible selon le type)
    # Pour ML: {"metric": "f1_score", "threshold": 0.85, "dataset": "hidden_test.csv"}
    # Pour SQL: {"expected_schema": [...], "row_count": 42}
    evaluation_config: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Constraints
    time_limit_seconds: Mapped[int] = mapped_column(Integer, default=30)
    memory_limit_mb: Mapped[int] = mapped_column(Integer, default=512)

    # Meta
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    total_attempts: Mapped[int] = mapped_column(Integer, default=0)
    total_solves: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # Relations
    tags: Mapped[list["ChallengeTag"]] = relationship(back_populates="challenge", cascade="all, delete-orphan")
    test_cases: Mapped[list["ChallengeTestCase"]] = relationship(back_populates="challenge", cascade="all, delete-orphan")
    submissions: Mapped[list["Submission"]] = relationship(back_populates="challenge")

    @property
    def solve_rate(self) -> float:
        if self.total_attempts == 0:
            return 0.0
        return round(self.total_solves / self.total_attempts * 100, 1)

    def __repr__(self) -> str:
        return f"<Challenge {self.slug} [{self.category}/{self.difficulty}]>"


class ChallengeTag(Base):
    __tablename__ = "challenge_tags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("challenges.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)

    challenge: Mapped["Challenge"] = relationship(back_populates="tags")


class ChallengeTestCase(Base):
    """Cas de test cachés pour l'évaluation automatique."""
    __tablename__ = "challenge_test_cases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("challenges.id", ondelete="CASCADE"), index=True
    )
    input_data: Mapped[str | None] = mapped_column(Text, nullable=True)   # JSON string ou SQL
    expected_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=True)  # False = visible dans l'énoncé
    points: Mapped[int] = mapped_column(Integer, default=10)
    order: Mapped[int] = mapped_column(Integer, default=0)

    challenge: Mapped["Challenge"] = relationship(back_populates="test_cases")
