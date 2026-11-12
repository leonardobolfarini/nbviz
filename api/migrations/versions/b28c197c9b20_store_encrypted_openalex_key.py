"""Store recoverable OpenAlex keys separately from legacy hashes."""

from alembic import op
import sqlalchemy as sa

revision = "b28c197c9b20"
down_revision = "81ca22594c74"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("user_account", sa.Column("openalex_api_key_encrypted", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("user_account", "openalex_api_key_encrypted")
