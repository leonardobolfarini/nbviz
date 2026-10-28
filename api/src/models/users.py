import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import UUID
from src.extensions.database import db


class Users(db.Model):
    __tablename__ = "user_account"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)

    password_reset_token_hash: Mapped[str | None] = mapped_column(nullable=True)
    password_reset_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    analyses: Mapped[list["Analyses"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"User(id={self.id}, email={self.email})"

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "analyses": [analysis.to_dict() for analysis in self.analyses],
        }


class Analyses(db.Model):
    __tablename__ = "user_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str]
    used_bases: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("pending", "finished", "processing", "error", name="status"),
        nullable=False,
        server_default="pending",
    )
    download_url: Mapped[str | None] = mapped_column(nullable=True)
    removed_url: Mapped[str | None] = mapped_column(nullable=True)
    venn: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user_account.id"), nullable=False
    )

    user: Mapped["Users"] = relationship(back_populates="analyses")

    def __repr__(self) -> str:
        return f"Analyze(id={self.id}, user_id={self.user_id}, download_url={self.download_url}, removed_url={self.removed_url})"

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "used_bases": self.used_bases,
            "status": self.status,
            "download_url": self.download_url,
            "removed_url": self.removed_url,
            "venn": self.venn,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }
