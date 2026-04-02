"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def _create_enum(name: str, values: str) -> None:
    """Create a PostgreSQL enum idempotently (no IF NOT EXISTS support in pg for types)."""
    op.execute(
        f"DO $$ BEGIN CREATE TYPE {name} AS ENUM ({values}); "
        f"EXCEPTION WHEN duplicate_object THEN NULL; END $$;"
    )


def upgrade() -> None:
    # --- Create enums explicitly first (idempotent via DO blocks) ---
    _create_enum("challengecategory", "'sql','machine_learning','deep_learning','nlp','computer_vision','visualization','data_engineering'")
    _create_enum("challengedifficulty", "'easy','medium','hard','expert'")
    _create_enum("challengetype", "'code','model','notebook','quiz'")
    _create_enum("submissionstatus", "'pending','running','accepted','wrong_answer','time_limit','memory_limit','runtime_error','compilation_error','score_below_threshold'")
    _create_enum("badgetrigger", "'first_solve','streak','category_master','elo_milestone','speed_solve','perfect_score'")
    _create_enum("coursecategory", "'sql','machine_learning','deep_learning','nlp','computer_vision','visualization','data_engineering','statistics'")

    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("bio", sa.Text, nullable=True),
        sa.Column("country", sa.String(2), nullable=True),
        sa.Column("elo", sa.Integer, nullable=False, server_default="1000"),
        sa.Column("rank", sa.String(50), nullable=False, server_default="Rookie"),
        sa.Column("challenges_solved", sa.Integer, nullable=False, server_default="0"),
        sa.Column("total_submissions", sa.Integer, nullable=False, server_default="0"),
        sa.Column("streak_days", sa.Integer, nullable=False, server_default="0"),
        sa.Column("last_active_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_premium", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("premium_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("oauth_provider", sa.String(50), nullable=True),
        sa.Column("oauth_provider_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])

    # --- badges ---
    op.create_table(
        "badges",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("icon", sa.String(200), nullable=False),
        sa.Column("trigger", postgresql.ENUM("first_solve", "streak", "category_master", "elo_milestone", "speed_solve", "perfect_score", name="badgetrigger", create_type=False), nullable=False),
        sa.Column("trigger_value", sa.Integer, nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )

    # --- user_badges ---
    op.create_table(
        "user_badges",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("badge_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("badges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("earned_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_user_badges_user_id", "user_badges", ["user_id"])

    # --- challenges ---
    op.create_table(
        "challenges",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("category", postgresql.ENUM("sql", "machine_learning", "deep_learning", "nlp", "computer_vision", "visualization", "data_engineering", name="challengecategory", create_type=False), nullable=False),
        sa.Column("difficulty", postgresql.ENUM("easy", "medium", "hard", "expert", name="challengedifficulty", create_type=False), nullable=False),
        sa.Column("challenge_type", postgresql.ENUM("code", "model", "notebook", "quiz", name="challengetype", create_type=False), nullable=False),
        sa.Column("base_points", sa.Integer, nullable=False, server_default="100"),
        sa.Column("elo_reward", sa.Integer, nullable=False, server_default="25"),
        sa.Column("starter_code", sa.Text, nullable=True),
        sa.Column("dataset_url", sa.String(500), nullable=True),
        sa.Column("evaluation_config", postgresql.JSON, nullable=False, server_default="{}"),
        sa.Column("time_limit_seconds", sa.Integer, nullable=False, server_default="30"),
        sa.Column("memory_limit_mb", sa.Integer, nullable=False, server_default="512"),
        sa.Column("is_published", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("is_premium", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("total_attempts", sa.Integer, nullable=False, server_default="0"),
        sa.Column("total_solves", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_challenges_slug", "challenges", ["slug"])
    op.create_index("ix_challenges_category", "challenges", ["category"])
    op.create_index("ix_challenges_difficulty", "challenges", ["difficulty"])

    # --- challenge_tags ---
    op.create_table(
        "challenge_tags",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
    )
    op.create_index("ix_challenge_tags_challenge_id", "challenge_tags", ["challenge_id"])

    # --- challenge_test_cases ---
    op.create_table(
        "challenge_test_cases",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("input_data", sa.Text, nullable=True),
        sa.Column("expected_output", sa.Text, nullable=True),
        sa.Column("is_hidden", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("points", sa.Integer, nullable=False, server_default="10"),
        sa.Column("order", sa.Integer, nullable=False, server_default="0"),
    )
    op.create_index("ix_challenge_test_cases_challenge_id", "challenge_test_cases", ["challenge_id"])

    # --- courses ---
    op.create_table(
        "courses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("thumbnail_url", sa.String(500), nullable=True),
        sa.Column("category", postgresql.ENUM("sql", "machine_learning", "deep_learning", "nlp", "computer_vision", "visualization", "data_engineering", "statistics", name="coursecategory", create_type=False), nullable=False),
        sa.Column("level", sa.String(20), nullable=False, server_default="beginner"),
        sa.Column("is_published", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("is_premium", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_courses_slug", "courses", ["slug"])

    # --- lessons ---
    op.create_table(
        "lessons",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("linked_challenge_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("challenges.id", ondelete="SET NULL"), nullable=True),
        sa.Column("duration_minutes", sa.Integer, nullable=False, server_default="10"),
        sa.Column("is_premium", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_lessons_course_id", "lessons", ["course_id"])

    # --- submissions ---
    op.create_table(
        "submissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code", sa.Text, nullable=True),
        sa.Column("file_path", sa.String(500), nullable=True),
        sa.Column("language", sa.String(20), nullable=True),
        sa.Column("status", postgresql.ENUM("pending", "running", "accepted", "wrong_answer", "time_limit", "memory_limit", "runtime_error", "compilation_error", "score_below_threshold", name="submissionstatus", create_type=False), nullable=False, server_default="pending"),
        sa.Column("score", sa.Float, nullable=True),
        sa.Column("execution_time_ms", sa.Integer, nullable=True),
        sa.Column("memory_used_mb", sa.Float, nullable=True),
        sa.Column("result_detail", postgresql.JSON, nullable=True),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("elo_before", sa.Integer, nullable=True),
        sa.Column("elo_after", sa.Integer, nullable=True),
        sa.Column("elo_delta", sa.Integer, nullable=True),
        sa.Column("is_first_solve", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_submissions_user_id", "submissions", ["user_id"])
    op.create_index("ix_submissions_challenge_id", "submissions", ["challenge_id"])
    op.create_index("ix_submissions_status", "submissions", ["status"])
    op.create_index("ix_submissions_created_at", "submissions", ["created_at"])

    # --- elo_history ---
    op.create_table(
        "elo_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("submission_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("elo_before", sa.Integer, nullable=False),
        sa.Column("elo_after", sa.Integer, nullable=False),
        sa.Column("delta", sa.Integer, nullable=False),
        sa.Column("reason", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_elo_history_user_id", "elo_history", ["user_id"])
    op.create_index("ix_elo_history_created_at", "elo_history", ["created_at"])

    # --- user_lesson_progress ---
    op.create_table(
        "user_lesson_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_user_lesson_progress_user_id", "user_lesson_progress", ["user_id"])
    op.create_index("ix_user_lesson_progress_lesson_id", "user_lesson_progress", ["lesson_id"])


def downgrade() -> None:
    op.drop_table("user_lesson_progress")
    op.drop_table("elo_history")
    op.drop_table("submissions")
    op.drop_table("lessons")
    op.drop_table("courses")
    op.drop_table("challenge_test_cases")
    op.drop_table("challenge_tags")
    op.drop_table("challenges")
    op.drop_table("user_badges")
    op.drop_table("badges")
    op.drop_table("users")

    for enum_name in [
        "challengecategory", "challengedifficulty", "challengetype",
        "submissionstatus", "badgetrigger", "coursecategory"
    ]:
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
