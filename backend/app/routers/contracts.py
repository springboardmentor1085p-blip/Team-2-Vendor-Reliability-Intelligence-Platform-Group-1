from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.database import SessionLocal
from app.models import Contract, Notification
from app.schemas import ContractCreate

router = APIRouter(prefix="/contracts", tags=["Contracts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_contract(data: ContractCreate, db: Session = Depends(get_db)):

    contract = Contract(
        vendor_name=data.vendor_name,
        expiry_date=data.expiry_date
    )

    db.add(contract)
    db.commit()
    db.refresh(contract)

    if contract.expiry_date <= date.today() + timedelta(days=30):

        notification = Notification(
    user_id=1,
    purchase_order_id=None,
    title="Contract Expiring",
    message=f"{contract.vendor_name} contract expires on {contract.expiry_date}",
    is_read=False
)

        db.add(notification)
        db.commit()

    return contract