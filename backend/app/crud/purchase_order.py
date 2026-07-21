from sqlalchemy.orm import Session

from app.models.purchase_order import PurchaseOrder


def get_purchase_order_by_id(db: Session, po_id: int):
    return db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()


def get_purchase_order_by_number(db: Session, po_number: str):
    return (
        db.query(PurchaseOrder)
        .filter(PurchaseOrder.po_number == po_number)
        .first()
    )


def get_all_purchase_orders(db: Session):
    return db.query(PurchaseOrder).all()


def create_purchase_order(db: Session, purchase_order: PurchaseOrder):
    db.add(purchase_order)
    db.commit()
    db.refresh(purchase_order)
    return purchase_order


def update_purchase_order(db: Session, purchase_order: PurchaseOrder):
    db.commit()
    db.refresh(purchase_order)
    return purchase_order


def delete_purchase_order(db: Session, purchase_order: PurchaseOrder):
    db.delete(purchase_order)
    db.commit()