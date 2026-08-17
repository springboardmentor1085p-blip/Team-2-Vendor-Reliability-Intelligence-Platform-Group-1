from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base


class VendorCategory(Base):
    __tablename__ = "vendor_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)


class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category_id = Column(Integer, ForeignKey("vendor_categories.id"), nullable=True)
    reliability_score = Column(Float, default=0.0)
    avg_delivery_time = Column(Float, default=0.0)
    contact_email = Column(String(150), nullable=True)
    active = Column(Integer, default=1)
    category = relationship("VendorCategory")


class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True)


class ProcurementCategory(Base):
    __tablename__ = "procurement_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True)


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), nullable=False, unique=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("procurement_categories.id"), nullable=False)
    order_date = Column(Date, nullable=False)
    status = Column(String(30), nullable=False)
    amount = Column(Float, nullable=False)
    approved = Column(Integer, default=0)
    completed = Column(Integer, default=0)
    vendor = relationship("Vendor")
    department = relationship("Department")
    category = relationship("ProcurementCategory")


class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String(50), nullable=False, unique=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    value = Column(Float, nullable=False)
    status = Column(String(30), nullable=False)
    vendor = relationship("Vendor")
    department = relationship("Department")


class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    fiscal_year = Column(String(10), nullable=False)
    allocated_amount = Column(Float, nullable=False)
    utilized_amount = Column(Float, nullable=False)
    department = relationship("Department")


class CostSaving(Base):
    __tablename__ = "cost_savings"
    id = Column(Integer, primary_key=True, index=True)
    month = Column(String(20), nullable=False)
    negotiated_savings = Column(Float, nullable=False)
    budget_savings = Column(Float, nullable=False)
    procurement_savings = Column(Float, nullable=False)
    savings_percentage = Column(Float, nullable=False)
