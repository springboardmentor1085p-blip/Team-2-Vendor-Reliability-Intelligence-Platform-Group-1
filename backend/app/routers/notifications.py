from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Notification, NotificationPreference
from app.schemas import (
    NotificationCreate,
    NotificationPreferenceCreate
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE NOTIFICATION
@router.post("/")
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db)
):

    new_notification = Notification(
        user_id=notification.user_id,
        purchase_order_id=notification.purchase_order_id,
        title=notification.title,
        message=notification.message,
        is_read=False
    )

    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    return new_notification


# GET LATEST NOTIFICATIONS
@router.get("/")
def get_notifications(db: Session = Depends(get_db)):

    notifications = (

        db.query(Notification)

        .order_by(Notification.id.desc())

        .all()

    )

    return notifications

# MARK AS READ
@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db)
):

    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()

    return {
        "message": "Notification marked as read"
    }


# DELETE NOTIFICATION
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):

    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    db.delete(notification)
    db.commit()

    return {
        "message": "Notification deleted"
    }


# SAVE PREFERENCES
@router.post("/preferences")
def save_preferences(
    pref: NotificationPreferenceCreate,
    db: Session = Depends(get_db)
):

    preference = NotificationPreference(
        user_id=pref.user_id,
        email_notifications=pref.email_notifications,
        system_notifications=pref.system_notifications
    )

    db.add(preference)
    db.commit()

    return {
        "message": "Preferences Saved"
    }


# GET UNREAD
@router.get("/unread")
def unread_notifications(db: Session = Depends(get_db)):

    return db.query(Notification).filter(
        Notification.is_read == False
    ).all()


# UNREAD COUNT
@router.get("/count")
def notification_count(db: Session = Depends(get_db)):

    count = db.query(Notification).filter(
        Notification.is_read == False
    ).count()

    return {
        "unread_notifications": count
    }