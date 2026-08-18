from sqlalchemy.orm import Session

from app.models.vendor_performance import VendorPerformance


def get_vendor_performance_by_id(
    db: Session,
    performance_id: int,
):
    return (
        db.query(VendorPerformance)
        .filter(VendorPerformance.id == performance_id)
        .first()
    )


def get_vendor_performance_by_vendor_id(
    db: Session,
    vendor_id: int,
):
    return (
        db.query(VendorPerformance)
        .filter(VendorPerformance.vendor_id == vendor_id)
        .first()
    )


def get_all_vendor_performance(
    db: Session,
):
    return db.query(VendorPerformance).all()


def create_vendor_performance(
    db: Session,
    vendor_performance: VendorPerformance,
):
    db.add(vendor_performance)
    db.commit()
    db.refresh(vendor_performance)
    return vendor_performance


def update_vendor_performance(
    db: Session,
    vendor_performance: VendorPerformance,
):
    db.commit()
    db.refresh(vendor_performance)
    return vendor_performance


def delete_vendor_performance(
    db: Session,
    vendor_performance: VendorPerformance,
):
    db.delete(vendor_performance)
    db.commit()