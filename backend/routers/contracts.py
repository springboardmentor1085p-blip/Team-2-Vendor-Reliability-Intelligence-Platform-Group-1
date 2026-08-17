from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.contract import Contract
from schemas.contract_schema import ContractCreate, ContractResponse

router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)

# Create Contract
@router.post("/", response_model=ContractResponse)
def create_contract(contract: ContractCreate, db: Session = Depends(get_db)):
    new_contract = Contract(**contract.model_dump())
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)
    return new_contract

# Get All Contracts
@router.get("/", response_model=list[ContractResponse])
def get_contracts(db: Session = Depends(get_db)):
    return db.query(Contract).all()

# Get Contract Status
@router.get("/{contract_id}/status")
def get_contract_status(contract_id: int, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return {
        "contract_id": contract.id,
        "contract_name": contract.contract_name,
        "status": contract.status
    }
@router.delete("/{contract_id}")
def delete_contract(
    contract_id: int,
    db: Session = Depends(get_db)
):
    contract = (
        db.query(Contract)
        .filter(Contract.id == contract_id)
        .first()
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    db.delete(contract)
    db.commit()

    return {
        "message": "Contract deleted successfully"
    }