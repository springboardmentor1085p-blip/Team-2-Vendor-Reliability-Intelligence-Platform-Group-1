from sqlalchemy.orm import Session

from app.crud.vendor_performance import (
    create_vendor_performance,
    delete_vendor_performance,
    get_all_vendor_performance,
    get_vendor_performance_by_id,
    get_vendor_performance_by_vendor_id,
    update_vendor_performance,
)
from app.models.vendor_performance import VendorPerformance


def create_vendor_performance_repository(
    db: Session,
    performance: VendorPerformance,
):
    return create_vendor_performance(db, performance)


def get_all_vendor_performance_repository(
    db: Session,
):
    return get_all_vendor_performance(db)


def get_vendor_performance_by_id_repository(
    db: Session,
    performance_id: int,
):
    return get_vendor_performance_by_id(db, performance_id)


def get_vendor_performance_by_vendor_id_repository(
    db: Session,
    vendor_id: int,
):
    return get_vendor_performance_by_vendor_id(db, vendor_id)


def update_vendor_performance_repository(
    db: Session,
    performance: VendorPerformance,
):
    return update_vendor_performance(db, performance)


def delete_vendor_performance_repository(
    db: Session,
    performance: VendorPerformance,
):
    return delete_vendor_performance(db, performance)