from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User


def create_user(
    db: Session,
    user: User,
):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(
    db: Session,
    user: User,
):
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(
    db: Session,
    email: str,
):
    return (
        db.query(User)
        .filter(
            func.lower(User.email) == email.strip().lower()
        )
        .first()
    )


def get_user_by_google_id(
    db: Session,
    google_id: str,
):
    return (
        db.query(User)
        .filter(
            User.google_id == google_id
        )
        .first()
    )