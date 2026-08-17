import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from datetime import datetime
import models

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM")


def send_email(to_email: str, subject: str, body: str) -> bool:
    """Send a single email via Gmail SMTP. Returns True/False for success."""
    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_FROM
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False


def process_pending_queue(db: Session, user_email: str):
    """
    Fetch all 'pending' notifications from notification_queue,
    send them via email, and update status accordingly.
    """
    pending_items = db.query(models.NotificationQueue).filter(
        models.NotificationQueue.status == "pending",
        models.NotificationQueue.channel == "email"
    ).all()

    results = []

    for item in pending_items:
        # Check notification preferences before sending.
        # Default to email enabled if no preference row exists for this user.
        pref = (
            db.query(models.NotificationPreference)
            .filter(models.NotificationPreference.user_id == item.user_id)
            .first()
        )
        email_enabled = pref.email_enabled if pref is not None else True

        if not email_enabled:
            item.status = "skipped"
            db.commit()
            db.refresh(item)
            results.append({"id": item.id, "status": item.status})
            continue

        success = send_email(
            to_email=user_email,
            subject="VendorIQ Notification",
            body=item.message
        )

        if success:
            item.status = "sent"
            item.sent_at = datetime.utcnow()
        else:
            item.status = "failed"

        db.commit()
        db.refresh(item)
        results.append({"id": item.id, "status": item.status})

    return results
