"""allow pending analyses without timestamps

Revision ID: d82ce5f4a113
Revises: f4d3e2c1b0a9
Create Date: 2026-10-28
"""

import sqlalchemy as sa
from alembic import op


revision = "d82ce5f4a113"
down_revision = "f4d3e2c1b0a9"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "user_analyses",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
        server_default=None,
    )
    op.alter_column(
        "user_analyses",
        "expires_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
    )


def downgrade():
    op.execute(
        "UPDATE user_analyses SET created_at = NOW() WHERE created_at IS NULL"
    )
    op.execute(
        "UPDATE user_analyses SET expires_at = NOW() WHERE expires_at IS NULL"
    )
    op.alter_column(
        "user_analyses",
        "expires_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
    )
    op.alter_column(
        "user_analyses",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.text("now()"),
    )
