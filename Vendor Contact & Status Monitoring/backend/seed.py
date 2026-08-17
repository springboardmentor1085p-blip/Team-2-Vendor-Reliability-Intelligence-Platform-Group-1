from app.database import SessionLocal, engine
from app.models import Base, Vendor

Base.metadata.create_all(bind=engine)


def seed_vendor():
    db = SessionLocal()
    try:
        existing = db.query(Vendor).first()
        if existing:
            return
        vendor = Vendor(
            id=1,
            name="Global Supplies Ltd",
            code="V-1001",
            category="Manufacturing",
            status="Active",
            reliability_score=92,
        )
        db.add(vendor)
        db.commit()
        print("Seeded vendor")
    finally:
        db.close()


if __name__ == "__main__":
    seed_vendor()
