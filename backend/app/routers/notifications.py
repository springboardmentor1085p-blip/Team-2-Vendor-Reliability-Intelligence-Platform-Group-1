from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
)

from app.services.notification_service import (
    create_notification_service,
    get_all_notifications_service,
    get_notification_by_id_service,
    update_notification_service,
    delete_notification_service,
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.post(
    "",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_notification_service(
        db,
        notification,
    )


@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_notifications_service(db)


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_notification_by_id_service(
        db,
        notification_id,
    )


@router.put(
    "/{notification_id}",
    response_model=NotificationResponse,
)
def update_notification(
    notification_id: int,
    notification: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_notification_service(
        db,
        notification_id,
        notification,
    )


@router.delete(
    "/{notification_id}",
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_notification_service(
        db,
        notification_id,
    )