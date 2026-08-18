from sqlalchemy.orm import Session

from app.models.vendor import Vendor


def get_vendor_by_email(db: Session, email: str):
    return db.query(Vendor).filter(Vendor.email == email).first()


def get_vendor_by_id(db: Session, vendor_id: int):
    return db.query(Vendor).filter(Vendor.id == vendor_id).first()


def get_all_vendors(db: Session):
    return db.query(Vendor).all()


def create_vendor(db: Session, vendor: Vendor):
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def update_vendor(db: Session, vendor: Vendor):
    db.commit()
    db.refresh(vendor)
    return vendor


def delete_vendor(db: Session, vendor: Vendor):
    db.delete(vendor)
    db.commit()