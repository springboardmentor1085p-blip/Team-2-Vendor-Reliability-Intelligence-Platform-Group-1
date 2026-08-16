from sqlalchemy import Column, Integer, String, Date

from database.database import Base


class Procurement(Base):

    __tablename__ = "procurements"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    request_id = Column(
        String(100),
        unique=True,
        nullable=False
    )

    purchase_order = Column(
        String(100),
        nullable=False
    )

    item_name = Column(
        String(100),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    vendor = Column(
        String(100),
        nullable=False
    )

    delivery_date = Column(
        Date,
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False,
        default="Pending"
    )

    invoice = Column(
        String(255),
        nullable=True
    )