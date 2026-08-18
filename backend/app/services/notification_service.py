from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.notification import (
    create_notification,
    get_all_notifications,
    get_notification_by_id,
    update_notification,
    delete_notification,
)

from app.models.notification import Notification

from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
)


def create_notification_service(
    db: Session,
    notification: NotificationCreate,
):
    new_notification = Notification(
        **notification.model_dump()
    )

    return create_notification(
        db,
        new_notification,
    )


def get_all_notifications_service(
    db: Session,
):
    return get_all_notifications(db)


def get_notification_by_id_service(
    db: Session,
    notification_id: int,
):
    notification = get_notification_by_id(
        db,
        notification_id,
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    return notification


def update_notification_service(
    db: Session,
    notification_id: int,
    notification: NotificationUpdate,
):
    db_notification = get_notification_by_id(
        db,
        notification_id,
    )

    if not db_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    update_data = notification.model_dump(
        exclude_unset=True,
    )

    for key, value in update_data.items():
        setattr(db_notification, key, value)

    return update_notification(
        db,
        db_notification,
    )


def delete_notification_service(
    db: Session,
    notification_id: int,
):
    db_notification = get_notification_by_id(
        db,
        notification_id,
    )

    if not db_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    delete_notification(
        db,
        db_notification,
    )

    return {
        "message": "Notification deleted successfully"
    }