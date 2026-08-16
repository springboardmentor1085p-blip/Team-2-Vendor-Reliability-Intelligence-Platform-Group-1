from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from models.procurement import Procurement
from schemas.procurement import (
    ProcurementCreate,
    ProcurementResponse
)

router = APIRouter(
    prefix="/procurements",
    tags=["Procurement"]
)


@router.post(
    "/",
    response_model=ProcurementResponse
)
def create_procurement(
    procurement: ProcurementCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Procurement).filter(
        Procurement.request_id == procurement.request_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Request ID already exists"
        )

    new_procurement = Procurement(
        request_id=procurement.request_id,
        purchase_order=procurement.purchase_order,
        item_name=procurement.item_name,
        quantity=procurement.quantity,
        vendor=procurement.vendor,
        delivery_date=procurement.delivery_date,
        status=procurement.status,
        invoice=procurement.invoice
    )

    db.add(new_procurement)
    db.commit()
    db.refresh(new_procurement)

    return new_procurement


@router.get(
    "/",
    response_model=list[ProcurementResponse]
)
def get_procurements(
    db: Session = Depends(get_db)
):

    return db.query(Procurement).all()


@router.get(
    "/{procurement_id}",
    response_model=ProcurementResponse
)
def get_procurement(
    procurement_id: int,
    db: Session = Depends(get_db)
):

    procurement = db.query(Procurement).filter(
        Procurement.id == procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement not found"
        )

    return procurement


@router.put(
    "/{procurement_id}",
    response_model=ProcurementResponse
)
def update_procurement(
    procurement_id: int,
    procurement_data: ProcurementCreate,
    db: Session = Depends(get_db)
):

    procurement = db.query(Procurement).filter(
        Procurement.id == procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement not found"
        )

    if procurement_data.request_id != procurement.request_id:

        existing = db.query(Procurement).filter(
            Procurement.request_id == procurement_data.request_id,
            Procurement.id != procurement_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Request ID already exists"
            )

    procurement.request_id = procurement_data.request_id
    procurement.purchase_order = procurement_data.purchase_order
    procurement.item_name = procurement_data.item_name
    procurement.quantity = procurement_data.quantity
    procurement.vendor = procurement_data.vendor
    procurement.delivery_date = procurement_data.delivery_date
    procurement.status = procurement_data.status
    procurement.invoice = procurement_data.invoice

    db.commit()
    db.refresh(procurement)

    return procurement


@router.delete("/{procurement_id}")
def delete_procurement(
    procurement_id: int,
    db: Session = Depends(get_db)
):

    procurement = db.query(Procurement).filter(
        Procurement.id == procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement not found"
        )

    db.delete(procurement)
    db.commit()

    return {
        "message": "Procurement deleted successfully"
    }