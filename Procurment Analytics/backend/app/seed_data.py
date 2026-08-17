from app.database.session import SessionLocal, Base, engine
from app.models.spend import (
    VendorCategory, Vendor, Department, ProcurementCategory,
    PurchaseOrder, Contract, Budget, CostSaving
)
from datetime import date


def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # ── Vendor Categories ──────────────────────────────────────────────────
        if db.query(VendorCategory).count() == 0:
            vc = [
                VendorCategory(name="IT Services",      description="Software, cloud, and managed IT"),
                VendorCategory(name="Manufacturing",     description="Raw materials and components"),
                VendorCategory(name="Logistics",         description="Freight and supply-chain services"),
                VendorCategory(name="Professional Services", description="Consulting, legal, and advisory"),
                VendorCategory(name="Facilities",        description="Maintenance, utilities, cleaning"),
            ]
            db.add_all(vc)
            db.commit()

        # ── Departments ────────────────────────────────────────────────────────
        if db.query(Department).count() == 0:
            depts = [
                Department(name="Operations"),
                Department(name="Finance"),
                Department(name="Procurement"),
                Department(name="Engineering"),
                Department(name="Marketing"),
            ]
            db.add_all(depts)
            db.commit()

        # ── Procurement Categories ─────────────────────────────────────────────
        if db.query(ProcurementCategory).count() == 0:
            cats = [
                ProcurementCategory(name="Software"),
                ProcurementCategory(name="Hardware"),
                ProcurementCategory(name="Services"),
                ProcurementCategory(name="Raw Materials"),
                ProcurementCategory(name="Office Supplies"),
                ProcurementCategory(name="Consulting"),
            ]
            db.add_all(cats)
            db.commit()

        # ── Vendors ────────────────────────────────────────────────────────────
        if db.query(Vendor).count() == 0:
            vendors = [
                Vendor(name="Contoso Supply",         category_id=1, reliability_score=0.92, avg_delivery_time=3.5, contact_email="sales@contoso.com",      active=1),
                Vendor(name="Northwind Logistics",    category_id=3, reliability_score=0.84, avg_delivery_time=5.5, contact_email="info@northwind.com",      active=1),
                Vendor(name="Fabrikam Tech",           category_id=1, reliability_score=0.89, avg_delivery_time=4.0, contact_email="contact@fabrikam.com",   active=1),
                Vendor(name="Alpine Manufacturing",   category_id=2, reliability_score=0.78, avg_delivery_time=7.0, contact_email="ops@alpine.com",          active=1),
                Vendor(name="Tailspin Advisory",      category_id=4, reliability_score=0.95, avg_delivery_time=2.0, contact_email="hello@tailspin.com",      active=1),
                Vendor(name="Woodgrove Facilities",   category_id=5, reliability_score=0.81, avg_delivery_time=6.0, contact_email="service@woodgrove.com",   active=1),
                Vendor(name="Litware Solutions",      category_id=1, reliability_score=0.88, avg_delivery_time=3.8, contact_email="sales@litware.com",       active=1),
                Vendor(name="Proseware Inc",          category_id=2, reliability_score=0.76, avg_delivery_time=8.5, contact_email="orders@proseware.com",    active=1),
            ]
            db.add_all(vendors)
            db.commit()

        # ── Purchase Orders ────────────────────────────────────────────────────
        if db.query(PurchaseOrder).count() == 0:
            orders = [
                # 2024 history
                PurchaseOrder(po_number="PO-2001", vendor_id=1, department_id=1, category_id=1, order_date=date(2024,  1, 8),  status="Completed", amount=112000),
                PurchaseOrder(po_number="PO-2002", vendor_id=2, department_id=2, category_id=3, order_date=date(2024,  2, 15), status="Completed", amount=67000),
                PurchaseOrder(po_number="PO-2003", vendor_id=3, department_id=3, category_id=2, order_date=date(2024,  3, 20), status="Completed", amount=85000),
                PurchaseOrder(po_number="PO-2004", vendor_id=4, department_id=4, category_id=4, order_date=date(2024,  4, 10), status="Completed", amount=143000),
                PurchaseOrder(po_number="PO-2005", vendor_id=5, department_id=5, category_id=6, order_date=date(2024,  5, 25), status="Completed", amount=55000),
                PurchaseOrder(po_number="PO-2006", vendor_id=6, department_id=1, category_id=5, order_date=date(2024,  6, 12), status="Completed", amount=38000),
                PurchaseOrder(po_number="PO-2007", vendor_id=7, department_id=2, category_id=1, order_date=date(2024,  7, 19), status="Completed", amount=172000),
                PurchaseOrder(po_number="PO-2008", vendor_id=8, department_id=3, category_id=4, order_date=date(2024,  8, 5),  status="Completed", amount=96000),
                PurchaseOrder(po_number="PO-2009", vendor_id=1, department_id=4, category_id=2, order_date=date(2024,  9, 22), status="Completed", amount=131000),
                PurchaseOrder(po_number="PO-2010", vendor_id=3, department_id=5, category_id=3, order_date=date(2024, 10, 14), status="Completed", amount=74000),
                PurchaseOrder(po_number="PO-2011", vendor_id=5, department_id=1, category_id=6, order_date=date(2024, 11,  3), status="Completed", amount=62000),
                PurchaseOrder(po_number="PO-2012", vendor_id=2, department_id=2, category_id=5, order_date=date(2024, 12, 18), status="Completed", amount=44000),
                # 2025 data
                PurchaseOrder(po_number="PO-1001", vendor_id=1, department_id=1, category_id=1, order_date=date(2025,  1,  5), status="Completed", amount=125000),
                PurchaseOrder(po_number="PO-1002", vendor_id=2, department_id=2, category_id=2, order_date=date(2025,  1, 20), status="Completed", amount=78000),
                PurchaseOrder(po_number="PO-1003", vendor_id=3, department_id=3, category_id=3, order_date=date(2025,  2,  8), status="Completed", amount=95000),
                PurchaseOrder(po_number="PO-1004", vendor_id=4, department_id=4, category_id=4, order_date=date(2025,  2, 22), status="Completed", amount=145000),
                PurchaseOrder(po_number="PO-1005", vendor_id=5, department_id=5, category_id=6, order_date=date(2025,  3, 12), status="Approved",  amount=41000),
                PurchaseOrder(po_number="PO-1006", vendor_id=6, department_id=1, category_id=5, order_date=date(2025,  3, 25), status="Completed", amount=33000),
                PurchaseOrder(po_number="PO-1007", vendor_id=7, department_id=2, category_id=1, order_date=date(2025,  4,  3), status="Pending",   amount=188000),
                PurchaseOrder(po_number="PO-1008", vendor_id=8, department_id=3, category_id=4, order_date=date(2025,  4, 17), status="Completed", amount=107000),
                PurchaseOrder(po_number="PO-1009", vendor_id=1, department_id=4, category_id=2, order_date=date(2025,  5,  9), status="Approved",  amount=139000),
                PurchaseOrder(po_number="PO-1010", vendor_id=3, department_id=5, category_id=3, order_date=date(2025,  5, 23), status="Completed", amount=82000),
                PurchaseOrder(po_number="PO-1011", vendor_id=5, department_id=1, category_id=6, order_date=date(2025,  6,  6), status="Pending",   amount=58000),
                PurchaseOrder(po_number="PO-1012", vendor_id=2, department_id=2, category_id=5, order_date=date(2025,  6, 20), status="Cancelled", amount=29000),
                PurchaseOrder(po_number="PO-1013", vendor_id=4, department_id=3, category_id=4, order_date=date(2025,  7,  1), status="Completed", amount=165000),
                PurchaseOrder(po_number="PO-1014", vendor_id=6, department_id=4, category_id=5, order_date=date(2025,  7, 15), status="Rejected",  amount=22000),
                PurchaseOrder(po_number="PO-1015", vendor_id=7, department_id=5, category_id=1, order_date=date(2025,  8,  4), status="Approved",  amount=210000),
                PurchaseOrder(po_number="PO-1016", vendor_id=1, department_id=1, category_id=2, order_date=date(2025,  8, 19), status="Completed", amount=93000),
                PurchaseOrder(po_number="PO-1017", vendor_id=3, department_id=2, category_id=3, order_date=date(2025,  9,  7), status="Pending",   amount=71000),
                PurchaseOrder(po_number="PO-1018", vendor_id=8, department_id=3, category_id=4, order_date=date(2025,  9, 22), status="Completed", amount=119000),
                PurchaseOrder(po_number="PO-1019", vendor_id=5, department_id=4, category_id=6, order_date=date(2025, 10, 10), status="Completed", amount=47000),
                PurchaseOrder(po_number="PO-1020", vendor_id=2, department_id=5, category_id=2, order_date=date(2025, 10, 28), status="Approved",  amount=134000),
                PurchaseOrder(po_number="PO-1021", vendor_id=4, department_id=1, category_id=4, order_date=date(2025, 11, 11), status="Completed", amount=178000),
                PurchaseOrder(po_number="PO-1022", vendor_id=6, department_id=2, category_id=5, order_date=date(2025, 11, 25), status="Pending",   amount=36000),
                PurchaseOrder(po_number="PO-1023", vendor_id=7, department_id=3, category_id=1, order_date=date(2025, 12,  5), status="Completed", amount=225000),
                PurchaseOrder(po_number="PO-1024", vendor_id=1, department_id=4, category_id=2, order_date=date(2025, 12, 18), status="Cancelled", amount=54000),
            ]
            db.add_all(orders)
            db.commit()

        # ── Contracts ──────────────────────────────────────────────────────────
        if db.query(Contract).count() == 0:
            contracts = [
                Contract(contract_number="CT-1001", vendor_id=1, department_id=1, start_date=date(2024, 1, 1),  end_date=date(2026, 12, 31), value=1200000, status="Active"),
                Contract(contract_number="CT-1002", vendor_id=2, department_id=2, start_date=date(2023, 6, 1),  end_date=date(2025, 5, 31),  value=500000,  status="Expired"),
                Contract(contract_number="CT-1003", vendor_id=3, department_id=3, start_date=date(2025, 1, 1),  end_date=date(2026, 6, 30),  value=850000,  status="Active"),
                Contract(contract_number="CT-1004", vendor_id=4, department_id=4, start_date=date(2024, 7, 1),  end_date=date(2025, 9, 30),  value=430000,  status="Active"),
                Contract(contract_number="CT-1005", vendor_id=5, department_id=5, start_date=date(2025, 3, 1),  end_date=date(2025, 8, 31),  value=275000,  status="Expired"),
                Contract(contract_number="CT-1006", vendor_id=6, department_id=1, start_date=date(2025, 6, 1),  end_date=date(2025, 9, 15),  value=190000,  status="Active"),
                Contract(contract_number="CT-1007", vendor_id=7, department_id=2, start_date=date(2024, 1, 1),  end_date=date(2027, 12, 31), value=2100000, status="Active"),
                Contract(contract_number="CT-1008", vendor_id=8, department_id=3, start_date=date(2023, 1, 1),  end_date=date(2024, 12, 31), value=380000,  status="Expired"),
            ]
            db.add_all(contracts)
            db.commit()

        # ── Budgets ────────────────────────────────────────────────────────────
        if db.query(Budget).count() == 0:
            budgets = [
                Budget(department_id=1, fiscal_year="2025", allocated_amount=2500000, utilized_amount=1620000),
                Budget(department_id=2, fiscal_year="2025", allocated_amount=1500000, utilized_amount=890000),
                Budget(department_id=3, fiscal_year="2025", allocated_amount=1200000, utilized_amount=760000),
                Budget(department_id=4, fiscal_year="2025", allocated_amount=800000,  utilized_amount=510000),
                Budget(department_id=5, fiscal_year="2025", allocated_amount=600000,  utilized_amount=320000),
                Budget(department_id=1, fiscal_year="2024", allocated_amount=2200000, utilized_amount=2010000),
                Budget(department_id=2, fiscal_year="2024", allocated_amount=1300000, utilized_amount=1100000),
            ]
            db.add_all(budgets)
            db.commit()

        # ── Cost Savings ───────────────────────────────────────────────────────
        if db.query(CostSaving).count() == 0:
            savings = [
                CostSaving(month="2025-01", negotiated_savings=14200, budget_savings=9100,  procurement_savings=10500, savings_percentage=7.5),
                CostSaving(month="2025-02", negotiated_savings=17800, budget_savings=11400, procurement_savings=13200, savings_percentage=8.2),
                CostSaving(month="2025-03", negotiated_savings=21000, budget_savings=13800, procurement_savings=15500, savings_percentage=9.0),
                CostSaving(month="2025-04", negotiated_savings=19500, budget_savings=12500, procurement_savings=14800, savings_percentage=8.8),
                CostSaving(month="2025-05", negotiated_savings=23400, budget_savings=15200, procurement_savings=17900, savings_percentage=9.6),
                CostSaving(month="2025-06", negotiated_savings=18700, budget_savings=11900, procurement_savings=13700, savings_percentage=8.4),
                CostSaving(month="2025-07", negotiated_savings=26300, budget_savings=17100, procurement_savings=20200, savings_percentage=10.1),
                CostSaving(month="2025-08", negotiated_savings=24900, budget_savings=16200, procurement_savings=19100, savings_percentage=9.8),
                CostSaving(month="2025-09", negotiated_savings=28100, budget_savings=18400, procurement_savings=22000, savings_percentage=10.5),
                CostSaving(month="2025-10", negotiated_savings=22600, budget_savings=14700, procurement_savings=17400, savings_percentage=9.2),
                CostSaving(month="2025-11", negotiated_savings=30500, budget_savings=19800, procurement_savings=23800, savings_percentage=11.0),
                CostSaving(month="2025-12", negotiated_savings=27800, budget_savings=18100, procurement_savings=21500, savings_percentage=10.3),
            ]
            db.add_all(savings)
            db.commit()

    finally:
        db.close()
