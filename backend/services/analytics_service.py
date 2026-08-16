from sqlalchemy import func
from database.database import SessionLocal
from models.procurement import Procurement


def get_analytics():

    db = SessionLocal()

    try:

        total_vendors = db.query(
            func.count(
                func.distinct(Procurement.vendor)
            )
        ).scalar() or 0

        completed_orders = db.query(
            Procurement
        ).filter(
            Procurement.status == "Completed"
        ).count()

        pending_orders = db.query(
            Procurement
        ).filter(
            Procurement.status == "Pending"
        ).count()

        return {
            "total_vendors": total_vendors,
            "completed_orders": completed_orders,
            "pending_orders": pending_orders,
            "notifications_sent": 0
        }

    finally:
        db.close()