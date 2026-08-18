from sqlalchemy.orm import Session

from app.models.communication import Communication
from app.schemas.communication import CommunicationCreate, CommunicationUpdate


class CommunicationRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Communication).all()

    def get_by_id(self, communication_id: int):
        return (
            self.db.query(Communication)
            .filter(Communication.id == communication_id)
            .first()
        )

    def create(self, communication: CommunicationCreate):
        db_communication = Communication(**communication.model_dump())

        self.db.add(db_communication)
        self.db.commit()
        self.db.refresh(db_communication)

        return db_communication

    def update(
        self,
        communication_id: int,
        communication: CommunicationUpdate,
    ):

        db_communication = self.get_by_id(communication_id)

        if not db_communication:
            return None

        update_data = communication.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(db_communication, key, value)

        self.db.commit()
        self.db.refresh(db_communication)

        return db_communication

    def delete(self, communication_id: int):

        db_communication = self.get_by_id(communication_id)

        if not db_communication:
            return None

        self.db.delete(db_communication)
        self.db.commit()

        return db_communication