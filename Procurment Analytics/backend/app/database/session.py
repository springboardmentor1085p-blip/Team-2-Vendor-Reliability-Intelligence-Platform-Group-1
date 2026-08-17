from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    from app.models import VendorCategory, Vendor, Department, ProcurementCategory, PurchaseOrder, Contract, Budget, CostSaving  # noqa: F401
    Base.metadata.create_all(bind=engine)
