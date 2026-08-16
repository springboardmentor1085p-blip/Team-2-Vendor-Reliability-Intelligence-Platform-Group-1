"""
Seed script — run once to populate demo data.
Usage:  venv\\Scripts\\python seed_data.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from decimal import Decimal
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorCategory, VendorStatus
from app.models.purchase_order import (
    PurchaseOrder, POItem, POStatusHistory, POStatus, POPriority
)
from app.services.auth_service import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()
print("🌱 Seeding database...")

# ── Users ──────────────────────────────────────────────────────
USERS = [
    {"full_name": "Admin User",    "email": "admin@vrplatform.com", "role": UserRole.ADMINISTRATOR},
    {"full_name": "Alice Johnson", "email": "alice@vrplatform.com", "role": UserRole.PROCUREMENT_MANAGER},
    {"full_name": "Bob Martinez",  "email": "bob@vrplatform.com",   "role": UserRole.SUPPLY_CHAIN_MANAGER},
    {"full_name": "Carol White",   "email": "carol@vrplatform.com", "role": UserRole.FINANCE_OFFICER},
]
users = {}
for ud in USERS:
    u = db.query(User).filter(User.email == ud["email"]).first()
    if not u:
        u = User(**ud, hashed_password=hash_password("Password123!"), is_active=True)
        db.add(u); db.flush()
        print(f"  ✅ User: {ud['email']}")
    else:
        print(f"  ⏭  User exists: {ud['email']}")
    users[ud["email"]] = u
db.commit()

# ── Vendors ─────────────────────────────────────────────────────
VENDORS = [
    {"company_name": "TechSupply Corp",   "email": "info@techsupply.com",
     "category": VendorCategory.IT,           "status": VendorStatus.APPROVED,
     "contact_person": "James Lee",   "phone": "+1-555-0101"},
    {"company_name": "Global Logistics",  "email": "ops@globallogistics.com",
     "category": VendorCategory.LOGISTICS,    "status": VendorStatus.APPROVED,
     "contact_person": "Sarah Kim",   "phone": "+1-555-0102"},
    {"company_name": "RawMat Industries", "email": "sales@rawmat.com",
     "category": VendorCategory.RAW_MATERIAL, "status": VendorStatus.APPROVED,
     "contact_person": "David Chen",  "phone": "+1-555-0103"},
    {"company_name": "OfficeEquip Ltd",   "email": "info@officeequip.com",
     "category": VendorCategory.EQUIPMENT,    "status": VendorStatus.PENDING,
     "contact_person": "Emma Brown",  "phone": "+1-555-0104"},
    {"company_name": "CleanServ Co",      "email": "contact@cleanserv.com",
     "category": VendorCategory.SERVICE,      "status": VendorStatus.APPROVED,
     "contact_person": "Mike Wilson", "phone": "+1-555-0105"},
]
vendors = {}
code = db.query(Vendor).count()
for vd in VENDORS:
    v = db.query(Vendor).filter(Vendor.email == vd["email"]).first()
    if not v:
        code += 1
        v = Vendor(vendor_code=f"VND-{code:06d}", **vd)
        db.add(v); db.flush()
        print(f"  ✅ Vendor: {vd['company_name']} [{v.vendor_code}] - {vd['status'].value}")
    else:
        print(f"  ⏭  Vendor exists: {vd['company_name']}")
    vendors[vd["company_name"]] = v
db.commit()

# ── Purchase Orders ──────────────────────────────────────────────
alice = users["alice@vrplatform.com"]
admin = users["admin@vrplatform.com"]

def make_po(po_num, vendor, title, priority, status, items_data,
            tax=10, currency="USD", created_by=None, approved_by=None):
    subtotal = sum(Decimal(str(qty)) * Decimal(str(price)) for _, qty, price in items_data)
    tax_amt  = (subtotal * Decimal(str(tax)) / 100).quantize(Decimal("0.01"))
    total    = subtotal + tax_amt

    po = PurchaseOrder(
        po_number=po_num, vendor_id=vendor.id,
        created_by=(created_by or alice).id,
        approved_by=(approved_by.id if approved_by else None),
        title=title, priority=priority, status=status,
        subtotal=subtotal, tax_rate=Decimal(str(tax)),
        tax_amount=tax_amt, discount_amount=Decimal("0"),
        total_amount=total, currency=currency,
    )
    db.add(po); db.flush()

    for name, qty, price in items_data:
        db.add(POItem(
            purchase_order_id=po.id, item_name=name,
            quantity=Decimal(str(qty)), unit="pcs",
            unit_price=Decimal(str(price)),
            total_price=Decimal(str(qty)) * Decimal(str(price)),
        ))

    db.add(POStatusHistory(
        purchase_order_id=po.id, changed_by=alice.id,
        previous_status=None, new_status=POStatus.PENDING,
        remarks="Purchase Order created",
    ))
    if status != POStatus.PENDING:
        db.add(POStatusHistory(
            purchase_order_id=po.id, changed_by=admin.id,
            previous_status=POStatus.PENDING, new_status=status,
            remarks="Status updated",
        ))
    print(f"  ✅ PO: {po_num} [{status.value}] - {title}")
    return po

tech  = vendors["TechSupply Corp"]
logis = vendors["Global Logistics"]
rawm  = vendors["RawMat Industries"]
clean = vendors["CleanServ Co"]

make_po("PO-202507-000001", tech,  "Q3 Laptop Procurement",        POPriority.HIGH,     POStatus.APPROVED,
        [("Dell Laptop 15\"", 10, 950), ("Laptop Bag", 10, 45)], approved_by=admin)
make_po("PO-202507-000002", logis, "Freight Services Q4",          POPriority.MEDIUM,   POStatus.DISPATCHED,
        [("Shipping Container (20ft)", 2, 2800), ("Insurance", 2, 200)], approved_by=admin)
make_po("PO-202507-000003", rawm,  "Raw Materials Batch #47",       POPriority.HIGH,     POStatus.DELIVERED,
        [("Steel Sheet 2mm", 500, 8.50), ("Aluminium Rod", 200, 12)], approved_by=admin)
make_po("PO-202507-000004", tech,  "Server Infrastructure Upgrade", POPriority.CRITICAL, POStatus.COMPLETED,
        [("Dell PowerEdge R750", 3, 8500), ("32GB RAM Module", 12, 350)], approved_by=admin)
make_po("PO-202507-000005", clean, "Office Cleaning Services Q3",   POPriority.LOW,      POStatus.PENDING,
        [("Weekly Deep Clean (mo)", 3, 1200)])
make_po("PO-202507-000006", rawm,  "Packaging Materials Order",     POPriority.MEDIUM,   POStatus.APPROVED,
        [("Cardboard Box 40x30", 1000, 1.20), ("Bubble Wrap Roll", 50, 18)], approved_by=admin)
make_po("PO-202507-000007", logis, "Express Courier Services",      POPriority.HIGH,     POStatus.PENDING,
        [("Same-Day Delivery (batch)", 20, 75)])
make_po("PO-202507-000008", tech,  "Network Equipment Purchase",    POPriority.MEDIUM,   POStatus.CANCELLED,
        [("Cisco Switch 48-port", 4, 2200), ("Cat6 Cable 100m", 10, 85)])

db.commit()
db.close()

print("\n✅ Seeding complete!")
print("   URL:      http://localhost:4200")
print("   API Docs: http://localhost:8000/api/docs")
print("   Login:    alice@vrplatform.com  /  Password123!")
print("   Login:    admin@vrplatform.com  /  Password123!")
