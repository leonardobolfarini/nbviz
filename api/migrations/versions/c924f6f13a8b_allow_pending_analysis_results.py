"""allow pending analyses without result fields

Revision ID: c924f6f13a8b
Revises: 1811208f4743
Create Date: 2026-09-25
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision = "c924f6f13a8b"
down_revision = "1811208f4743"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("user_analyses", "download_url", existing_type=sa.VARCHAR(), nullable=True)
    op.alter_column("user_analyses", "removed_url", existing_type=sa.VARCHAR(), nullable=True)
    op.alter_column("user_analyses", "venn", existing_type=postgresql.JSONB(), nullable=True)


def downgrade():
    op.alter_column("user_analyses", "venn", existing_type=postgresql.JSONB(), nullable=False)
    op.alter_column("user_analyses", "removed_url", existing_type=sa.VARCHAR(), nullable=False)
    op.alter_column("user_analyses", "download_url", existing_type=sa.VARCHAR(), nullable=False)
