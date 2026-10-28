"""add used bases to analyses

Revision ID: f4d3e2c1b0a9
Revises: acf1fe490e32
Create Date: 2026-10-22 00:00:00.000000
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision = "f4d3e2c1b0a9"
down_revision = "acf1fe490e32"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("user_analyses") as batch_op:
        batch_op.add_column(
            sa.Column(
                "used_bases",
                postgresql.JSONB(astext_type=sa.Text()),
                nullable=False,
                server_default=sa.text("'[]'::jsonb"),
            )
        )


def downgrade():
    with op.batch_alter_table("user_analyses") as batch_op:
        batch_op.drop_column("used_bases")
