# Vendor Reliability Intelligence Platform
## Core Analytics & Dashboard Module

### Tech Stack
| Layer | Technology |
|---|---|
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2, PostgreSQL |
| Cache | Redis (dashboard caching, no Celery) |
| Frontend | Angular 18, Angular Material 18, Bootstrap 5, Chart.js |
| Auth | JWT (python-jose), bcrypt (passlib) |

---

## Project Structure

```
VENDOR 3/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Settings (reads .env)
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── cache.py             # Redis cache helpers
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # FastAPI route handlers
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py     # ★ Team B core router
│   │   │   ├── vendors.py
│   │   │   └── procurement.py
│   │   ├── services/
│   │   │   ├── dashboard_service.py  # ★ All aggregation & caching
│   │   │   ├── vendor_service.py
│   │   │   └── procurement_service.py
│   │   ├── auth/
│   │   │   ├── security.py      # JWT + bcrypt
│   │   │   └── dependencies.py  # Auth guards / RBAC
│   │   └── seed.py              # Demo data seeder
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    └── src/app/
        ├── models/              # TypeScript interfaces
        ├── services/            # HTTP services
        ├── guards/              # Route auth guard
        ├── interceptors/        # JWT HTTP interceptor
        ├── shared/              # Sidebar, Topbar components
        └── pages/
            ├── login/           # Login page
            └── dashboard/       # ★ Executive analytics dashboard
```

---

## Setup & Run

### 1. PostgreSQL — create the database
```sql
CREATE DATABASE vendor_platform;
```

### 2. Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# (Optional) edit .env to set your DB password
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/vendor_platform

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API will be live at: http://localhost:8000
Swagger docs:           http://localhost:8000/api/docs

### 3. Seed demo data (first run only)
```bash
# With venv active, inside /backend
python -m app.seed
```
Creates 12 vendors, 80 purchase orders, 12 months of performance data, contracts.

Demo logins:
- admin@vrip.com / Admin@123  (Administrator)
- pm@vrip.com    / Admin@123  (Procurement Manager)

### 4. Redis (optional — dashboard caching)
If you have Redis installed:
```bash
redis-server
```
If Redis is NOT running, the backend still works — caching is gracefully skipped.

### 5. Frontend
```bash
cd frontend
npm install
ng serve
```
Open: http://localhost:4200

---

## Dashboard API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/executive | Full dashboard (all data, cached 5 min) |
| GET | /api/dashboard/kpi | KPI summary cards |
| GET | /api/dashboard/vendor-categories | Vendor category breakdown |
| GET | /api/dashboard/procurement-status | PO status breakdown |
| GET | /api/dashboard/top-vendors | Top vendors by reliability |
| GET | /api/dashboard/recent-orders | Latest purchase orders |
| GET | /api/dashboard/delivery-trends | Monthly delivery performance |
| GET | /api/dashboard/cost-analysis | Monthly spend analysis |
| GET | /api/dashboard/risk-distribution | Vendor risk distribution |
| GET | /api/dashboard/monthly-po-trend | Monthly PO count trend |
| GET | /api/dashboard/reliability-trend | Avg reliability score trend |

### Filter parameters (all GET endpoints)
- `date_from` — YYYY-MM-DD
- `date_to`   — YYYY-MM-DD
- `vendor_category` — raw_material | equipment | it | service | logistics | maintenance
- `top_n`     — integer (1–50)

---

## Dashboard Features
- 8 KPI summary cards (vendors, POs, spend, scores, rates, alerts)
- Delivery performance bar chart (on-time vs delayed, 12 months)
- Procurement status doughnut chart
- Cost analysis line chart (total / approved / pending spend)
- Reliability score trend line chart
- Vendor category pie chart
- Monthly PO volume bar chart
- Risk distribution doughnut chart + legend
- Top vendors table with score bar visualisation
- Recent purchase orders table with status badges
- Date range + category + top-N filter bar
- Sidebar navigation + responsive topbar
- Redis caching (5 min for full dashboard, 3 min for KPIs)
