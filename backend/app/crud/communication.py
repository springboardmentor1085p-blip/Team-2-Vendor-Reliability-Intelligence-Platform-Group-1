from sqlalchemy.orm import Session

from app.models.communication import Communication


def get_communication_by_id(db: Session, communication_id: int):
    return (
        db.query(Communication)
        .filter(Communication.id == communication_id)
        .first()
    )


def get_all_communications(db: Session):
    return db.query(Communication).all()


def create_communication(db: Session, communication: Communication):
    db.add(communication)
    db.commit()
    db.refresh(communication)
    return communication


def update_communication(db: Session, communication: Communication):
    db.commit()
    db.refresh(communication)
    return communication


def delete_communication(db: Session, communication: Communication):
    db.delete(communication)
    db.commit()