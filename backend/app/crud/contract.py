from sqlalchemy.orm import Session

from app.models.contract import Contract


def get_contract_by_id(db: Session, contract_id: int):
    return db.query(Contract).filter(Contract.id == contract_id).first()


def get_contract_by_number(db: Session, contract_number: str):
    return (
        db.query(Contract)
        .filter(Contract.contract_number == contract_number)
        .first()
    )


def get_all_contracts(db: Session):
    return db.query(Contract).all()


def create_contract(db: Session, contract: Contract):
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract


def update_contract(db: Session, contract: Contract):
    db.commit()
    db.refresh(contract)
    return contract


def delete_contract(db: Session, contract: Contract):
    db.delete(contract)
    db.commit()