from fastapi import APIRouter
from services.email_service import send_email
from services.notification_queue import (
    add_notification,
    get_notifications,
    process_notification
)
router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/")
def get_notifications():
    return {
        "email_notifications": True,
        "sms_notifications": False,
        "push_notifications": True
    }
@router.post("/send-email")
def send_notification_email():

    return send_email(
        "vendor@test.com",
        "Procurement Notification",
        "Your notification has been sent successfully."
    )
@router.post("/queue")
def add_to_queue(notification: dict):
    return add_notification(notification)


@router.get("/queue")
def view_queue():
    return get_notifications()


@router.post("/queue/process")
def process_queue():
    return process_notification()