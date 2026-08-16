from sqlalchemy import Column, Integer, String, Date

from database.database import Base


class PurchaseOrder(Base):

    __tablename__ = "purchase_orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    po_number = Column(
        String(100),
        unique=True,
        nullable=False
    )

    vendor = Column(
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

    order_date = Column(
        Date,
        nullable=False
    )

    expected_delivery = Column(
        Date,
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False,
        default="Pending"
    )