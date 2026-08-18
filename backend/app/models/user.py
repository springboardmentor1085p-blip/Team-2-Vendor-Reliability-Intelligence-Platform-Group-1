from typing import Optional

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        "password_hash",
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="User",
    )

    provider: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="local",
    )

    google_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
    )

    profile_picture: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )