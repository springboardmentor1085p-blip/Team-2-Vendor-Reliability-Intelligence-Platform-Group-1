"""
Seed script — populates demo data for dashboard testing.
Run: python -m app.seed
"""
import random
from datetime import date, timedelta
from app.database import SessionLocal, Base, engine
from app.auth.security import hash_password
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorCategory, VendorStatus
from app.models.procurement import PurchaseOrder, ProcurementStatus
from app.models.performance import VendorPerformance, DeliveryRecord
from app.models.contract import Contract, ContractStatus

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Users
admin = User(email="admin@vrip.com", full_name="Admin User",
             hashed_password=hash_password("Admin@123"), role=UserRole.ADMINISTRATOR,
             is_active=True, is_verified=True)
pm = User(email="pm@vrip.com", full_name="Procurement Manager",
          hashed_password=hash_password("Admin@123"), role=UserRole.PROCUREMENT_MANAGER,
          is_active=True, is_verified=True)
db.add_all([admin, pm])
db.commit()

VENDOR_NAMES = [
    ("Apex Steel Ltd", VendorCategory.RAW_MATERIAL),
    ("TechSupply Co", VendorCategory.IT),
    ("FastFreight Logistics", VendorCategory.LOGISTICS),
    ("BuildRight Equipment", VendorCategory.EQUIPMENT),
    ("CleanServe Maintenance", VendorCategory.MAINTENANCE),
    ("SoftEdge Solutions", VendorCategory.IT),
    ("Prime Materials Inc", VendorCategory.RAW_MATERIAL),
    ("SwiftShip Partners", VendorCategory.LOGISTICS),
    ("MediServ Healthcare", VendorCategory.SERVICE),
    ("IronCore Supplies", VendorCategory.RAW_MATERIAL),
    ("NetWork Systems", VendorCategory.IT),
    ("GreenField Farms", VendorCategory.SERVICE),
]

vendors = []
for i, (name, cat) in enumerate(VENDOR_NAMES):
    v = Vendor(
        name=name,
        email=f"vendor{i+1}@example.com",
        phone=f"+1-555-{1000+i}",
        category=cat,
        status=VendorStatus.APPROVED if i < 10 else VendorStatus.PENDING,
        contact_person=f"Contact {i+1}",
        reliability_score=round(random.uniform(45, 98), 2),
    )
    vendors.append(v)
db.add_all(vendors)
db.commit()

# Purchase Orders
statuses = list(ProcurementStatus)
today = date.today()
pos = []
for i in range(80):
    order_date = today - timedelta(days=random.randint(0, 365))
    exp_del = order_date + timedelta(days=random.randint(7, 60))
    actual = exp_del + timedelta(days=random.randint(-5, 15))
    st = random.choice(statuses)
    po = PurchaseOrder(
        po_number=f"PO-{today.year}-{i+1:05d}",
        vendor_id=random.choice(vendors).id,
        created_by=pm.id,
        status=st,
        total_amount=round(random.uniform(1000, 150000), 2),
        order_date=order_date,
        expected_delivery=exp_del,
        actual_delivery=actual if st in [ProcurementStatus.DELIVERED, ProcurementStatus.COMPLETED] else None,
    )
    pos.append(po)
db.add_all(pos)
db.commit()

# Performance records
for v in vendors:
    for month in range(1, 13):
        total = random.randint(5, 30)
        on_time = random.randint(0, total)
        perf = VendorPerformance(
            vendor_id=v.id,
            period_month=month,
            period_year=today.year,
            on_time_deliveries=on_time,
            delayed_deliveries=total - on_time,
            total_orders=total,
            quality_rating=round(random.uniform(2.5, 5.0), 2),
            response_time_hours=round(random.uniform(1, 48), 1),
            issue_resolution_days=round(random.uniform(0.5, 14), 1),
            order_completion_rate=round(on_time / total * 100, 2),
            communication_score=round(random.uniform(2.5, 5.0), 2),
            reliability_score=round(random.uniform(40, 98), 2),
        )
        db.add(perf)

# Delivery records
for v in vendors:
    for _ in range(random.randint(10, 25)):
        exp = today - timedelta(days=random.randint(1, 300))
        delay = random.randint(-3, 10)
        actual = exp + timedelta(days=delay)
        is_on_time = delay <= 0
        dr = DeliveryRecord(
            vendor_id=v.id,
            expected_date=exp,
            actual_date=actual,
            is_on_time=is_on_time,
            delay_days=max(delay, 0),
            quality_score=round(random.uniform(2.5, 5.0), 2),
        )
        db.add(dr)

# Contracts
for i, v in enumerate(vendors[:8]):
    start = today - timedelta(days=random.randint(30, 500))
    end = start + timedelta(days=random.randint(90, 730))
    c = Contract(
        contract_number=f"CNT-{today.year}-{i+1:04d}",
        vendor_id=v.id,
        title=f"Contract with {v.name}",
        status=ContractStatus.ACTIVE if end > today else ContractStatus.EXPIRED,
        start_date=start,
        end_date=end,
        value=round(random.uniform(10000, 500000), 2),
        is_compliant=random.choice([True, True, True, False]),
        created_by=admin.id,
    )
    db.add(c)

db.commit()
db.close()
print("✅  Seed data created successfully.")
print("    Admin:   admin@vrip.com  / Admin@123")
print("    Manager: pm@vrip.com     / Admin@123")
