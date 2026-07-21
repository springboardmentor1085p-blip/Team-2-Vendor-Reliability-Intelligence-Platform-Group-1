from sqlalchemy import Boolean, Column, String

from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    full_name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, index=True, nullable=False)

    password = Column(String(255), nullable=False)

    role = Column(String(50), nullable=False)

    is_active = Column(Boolean, default=True)