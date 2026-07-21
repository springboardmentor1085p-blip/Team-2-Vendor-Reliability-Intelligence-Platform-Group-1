from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.contract import (
    get_contract_by_id,
    get_contract_by_number,
    get_all_contracts,
    create_contract,
    update_contract,
    delete_contract,
)

from app.crud.vendor import get_vendor_by_id

from app.models.contract import Contract

from app.schemas.contract import (
    ContractCreate,
    ContractUpdate,
)


def create_contract_service(
    db: Session,
    contract: ContractCreate,
):
    existing = get_contract_by_number(
        db,
        contract.contract_number,
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contract already exists",
        )

    vendor = get_vendor_by_id(db, contract.vendor_id)

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found",
        )

    new_contract = Contract(**contract.model_dump())

    return create_contract(db, new_contract)


def get_all_contracts_service(db: Session):
    return get_all_contracts(db)


def get_contract_by_id_service(
    db: Session,
    contract_id: int,
):
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found",
        )

    return contract


def update_contract_service(
    db: Session,
    contract_id: int,
    contract_data: ContractUpdate,
):
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found",
        )

    update_data = contract_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(contract, key, value)

    return update_contract(db, contract)


def delete_contract_service(
    db: Session,
    contract_id: int,
):
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found",
        )

    delete_contract(db, contract)

    return {
        "message": "Contract deleted successfully"
    }