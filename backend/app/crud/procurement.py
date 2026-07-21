from sqlalchemy.orm import Session

from app.models.procurement import Procurement


def get_procurement_by_id(db: Session, procurement_id: int):
    return (
        db.query(Procurement)
        .filter(Procurement.id == procurement_id)
        .first()
    )


def get_procurement_by_request_number(db: Session, request_number: str):
    return (
        db.query(Procurement)
        .filter(Procurement.request_number == request_number)
        .first()
    )


def get_all_procurements(db: Session):
    return db.query(Procurement).all()


def create_procurement(db: Session, procurement: Procurement):
    db.add(procurement)
    db.commit()
    db.refresh(procurement)
    return procurement


def update_procurement(db: Session, procurement: Procurement):
    db.commit()
    db.refresh(procurement)
    return procurement


def delete_procurement(db: Session, procurement: Procurement):
    db.delete(procurement)
    db.commit()