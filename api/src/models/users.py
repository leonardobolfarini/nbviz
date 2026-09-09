import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.functions import now
from sqlalchemy.types import UUID
from src.extensions.database import db


class Users(db.Model):
    __tablename__ = "user_account"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)

    analyses: Mapped[list["Analyses"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"User(id={self.id}, email={self.email})"


class Analyses(db.Model):
    __tablename__ = "user_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    download_url: Mapped[str]
    removed_url: Mapped[str]
    venn: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=now(),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user_account.id"), nullable=False
    )

    user: Mapped["Users"] = relationship(back_populates="analyses")

    def __repr__(self) -> str:
        return f"Analyze(id={self.id}, user_id={self.user_id}, download_url={self.download_url}, removed_url={self.removed_url})"
