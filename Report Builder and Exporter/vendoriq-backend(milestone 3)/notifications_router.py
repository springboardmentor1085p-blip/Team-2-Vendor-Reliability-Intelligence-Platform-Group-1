from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone

import models
import schemas
from database import SessionLocal
from email_service import process_pending_queue


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# ── Dependency ────────────────────────────────────────────────────────────────

def get_db():
    """Yield a database session and ensure it is closed after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_preference_or_404(user_id: int, db: Session) -> models.NotificationPreference:
    """Return the notification preference row for the given user_id, or raise 404."""
    pref = (
        db.query(models.NotificationPreference)
        .filter(models.NotificationPreference.user_id == user_id)
        .first()
    )
    if not pref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification preferences for user_id {user_id} not found.",
        )
    return pref


# ── Notification Preference endpoints ────────────────────────────────────────

@router.get(
    "/preferences/{user_id}",
    response_model=schemas.NotificationPreferenceResponse,
    summary="Get notification preferences for a user",
)
def get_notification_preferences(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve the notification channel preferences for a specific user.

    - Returns **200 OK** with the preference record on success.
    - Returns **404 Not Found** if no preferences exist for that user.
    """
    return get_preference_or_404(user_id, db)


@router.post(
    "/preferences",
    response_model=schemas.NotificationPreferenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create notification preferences for a user",
)
def create_notification_preferences(
    payload: schemas.NotificationPreferenceCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new notification preference record for a user.

    - Returns **201 Created** on success.
    - Returns **409 Conflict** if preferences already exist for that user_id
      (each user may only have one preference row).
    - Returns **422 Unprocessable Entity** if validation fails.
    """
    new_pref = models.NotificationPreference(
        user_id        = payload.user_id,
        email_enabled  = payload.email_enabled,
        in_app_enabled = payload.in_app_enabled,
    )
    db.add(new_pref)
    try:
        db.commit()
        db.refresh(new_pref)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Notification preferences for user_id {payload.user_id} already exist.",
        )
    return new_pref


@router.put(
    "/preferences/{user_id}",
    response_model=schemas.NotificationPreferenceResponse,
    summary="Update notification preferences for a user",
)
def update_notification_preferences(
    user_id: int,
    payload: schemas.NotificationPreferenceUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an existing notification preference record.

    Only the fields included in the request body are changed —
    omitted fields keep their current value.

    - Returns **200 OK** with the updated record on success.
    - Returns **404 Not Found** if no preferences exist for that user.
    - Returns **422 Unprocessable Entity** if validation fails.
    """
    pref = get_preference_or_404(user_id, db)

    update_fields = payload.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(pref, field, value)

    db.commit()
    db.refresh(pref)
    return pref


# ── Notification Queue helpers ────────────────────────────────────────────────

def get_queue_entry_or_404(entry_id: int, db: Session) -> models.NotificationQueue:
    """Return the notification queue entry with the given id, or raise 404."""
    entry = (
        db.query(models.NotificationQueue)
        .filter(models.NotificationQueue.id == entry_id)
        .first()
    )
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification queue entry with id {entry_id} not found.",
        )
    return entry


# ── Notification Queue endpoints ──────────────────────────────────────────────

@router.get(
    "/queue/{user_id}",
    response_model=list[schemas.NotificationQueueResponse],
    summary="Get all queued notifications for a user",
)
def get_notification_queue(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all notification queue entries for a specific user,
    ordered by creation time (newest first).

    - Returns **200 OK** with a list of queue entries (empty list if none exist).
    """
    entries = (
        db.query(models.NotificationQueue)
        .filter(models.NotificationQueue.user_id == user_id)
        .order_by(models.NotificationQueue.created_at.desc())
        .all()
    )
    return entries


@router.post(
    "/queue",
    response_model=schemas.NotificationQueueResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new notification queue entry",
)
def create_notification_queue_entry(
    payload: schemas.NotificationQueueCreate,
    db: Session = Depends(get_db),
):
    """
    Enqueue a new notification for delivery to a user on the specified channel.
    The entry is created with status **pending**.

    - Returns **201 Created** on success.
    - Returns **422 Unprocessable Entity** if validation fails (blank message, invalid channel, etc.).
    """
    new_entry = models.NotificationQueue(
        user_id = payload.user_id,
        message = payload.message,
        channel = payload.channel,
        status  = models.NotificationStatusEnum.pending,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@router.put(
    "/queue/{id}/status",
    response_model=schemas.NotificationQueueResponse,
    summary="Update the delivery status of a notification queue entry",
)
def update_notification_queue_status(
    id: int,
    payload: schemas.NotificationQueueStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Update the **status** of a queue entry (pending → sent | failed).

    When status is set to `sent` and `sent_at` is not provided in the request body,
    `sent_at` is automatically set to the current UTC time.

    - Returns **200 OK** with the updated entry on success.
    - Returns **404 Not Found** if no entry with that id exists.
    - Returns **422 Unprocessable Entity** if the status value is invalid.
    """
    entry = get_queue_entry_or_404(id, db)

    entry.status = payload.status

    if payload.status == models.NotificationStatusEnum.sent:
        # Use the explicitly provided timestamp, or default to now
        entry.sent_at = payload.sent_at or datetime.now(tz=timezone.utc)
    else:
        # For pending/failed, respect explicit sent_at if given, else leave unchanged
        if payload.sent_at is not None:
            entry.sent_at = payload.sent_at

    db.commit()
    db.refresh(entry)
    return entry


@router.post(
    "/queue/send/{user_id}",
    summary="Send all pending notifications for a user via email",
)
def send_queued_notifications(user_id: int, user_email: str, db: Session = Depends(get_db)):
    """
    Process pending email notifications from the queue for a given user_id,
    send them via email_service.process_pending_queue, and update their status
    to 'sent' or 'failed' accordingly.
    """
    results = process_pending_queue(db, user_email)
    return {
        "message": f"Processed {len(results)} pending notifications",
        "results": results
    }
