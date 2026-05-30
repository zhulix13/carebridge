"""initial schema

Revision ID: 20260517_0001
Revises:
Create Date: 2026-05-17
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260517_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("preferred_language", sa.String(length=8), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "departments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_departments_name"), "departments", ["name"], unique=True)

    op.create_table(
        "doctor_profiles",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("department_id", sa.String(length=36), nullable=False),
        sa.Column("specialization", sa.String(length=160), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("consultation_fee", sa.Float(), nullable=True),
        sa.Column("is_available", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "language_detection_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("input_text", sa.Text(), nullable=False),
        sa.Column("detected_language", sa.String(length=20), nullable=False),
        sa.Column("i18n_code", sa.String(length=8), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("source_page", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "doctor_schedules",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("doctor_id", sa.String(length=36), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("slot_minutes", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["doctor_id"], ["doctor_profiles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "appointments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("patient_id", sa.String(length=36), nullable=False),
        sa.Column("doctor_id", sa.String(length=36), nullable=False),
        sa.Column("department_id", sa.String(length=36), nullable=False),
        sa.Column("appointment_date", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("reason", sa.String(length=255), nullable=True),
        sa.Column("symptoms", sa.Text(), nullable=True),
        sa.Column("detected_language", sa.String(length=20), nullable=True),
        sa.Column("language_source", sa.String(length=20), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"]),
        sa.ForeignKeyConstraint(["doctor_id"], ["doctor_profiles.id"]),
        sa.ForeignKeyConstraint(["patient_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("appointments")
    op.drop_table("doctor_schedules")
    op.drop_table("language_detection_logs")
    op.drop_table("doctor_profiles")
    op.drop_index(op.f("ix_departments_name"), table_name="departments")
    op.drop_table("departments")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
