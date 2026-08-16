# Vendor Reliability Intelligence Platform
## Module: Purchase Order Logic & ID Generation

---

## Module Overview

This module implements the complete **Purchase Order (PO) management system** including:

- **Backend**: FastAPI + PostgreSQL PO schema, auto PO ID generation, status tracking
- **Frontend**: Angular PO form with full validation, PO list, detail view, status updates

---

## PO Number Auto-Generation

PO numbers follow this format:

```
PO-YYYYMM-XXXXXX
```

| Part     | Description               | Example   |
|----------|---------------------------|-----------|
| PO       | Fixed prefix              | PO        |
| YYYYMM   | Year + Month              | 202506    |
| XXXXXX   | Zero-padded sequence (resets each month) | 000001 |

**Full example:** `PO-202506-000001`

The logic is in `backend/app/services/po_id_generator.py`.

---

## PO Status Workflow

```
PENDING → APPROVED → DISPATCHED → DELIVERED → COMPLETED
   ↓          ↓           ↓
CANCELLED  CANCELLED   CANCELLED
```

Every status change is recorded in `po_status_history` with:
- who made the change
- timestamp
- optional remarks
- previous and new status

---

## Quick Start

### Prerequisites
- Docker + Docker Compose

### Run with Docker

```bash
docker-compose up --build
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost             |
| Backend   | http://localhost:8000        |
| API Docs  | http://localhost:8000/api/docs |

### Seed Demo Data

```bash
docker exec vendor_backend python seed_data.py
```

**Demo credentials:**
- Email: `alice@vrplatform.com`  |  Password: `Password123!`
- Email: `admin@vrplatform.com`  |  Password: `Password123!`

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt

# Set env vars (or edit .env)
set DATABASE_URL=postgresql://user:pass@localhost:5432/vendor_db

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Copy angular-config.json to angular.json
copy angular-config.json angular.json
npm start
```

---

## API Endpoints (Purchase Orders)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/purchase-orders/` | Create new PO (auto-generates PO number) |
| GET    | `/api/purchase-orders/` | List all POs (filters: status, vendor_id, search) |
| GET    | `/api/purchase-orders/stats` | Dashboard statistics |
| GET    | `/api/purchase-orders/{id}` | Get PO details |
| GET    | `/api/purchase-orders/by-number/{po_number}` | Get by PO number |
| PUT    | `/api/purchase-orders/{id}` | Update PO (PENDING only) |
| PATCH  | `/api/purchase-orders/{id}/status` | Update status |
| DELETE | `/api/purchase-orders/{id}` | Delete (PENDING/CANCELLED only) |

---

## Database Schema

```
purchase_orders
  id, po_number, vendor_id, created_by, approved_by
  title, description, priority, status
  subtotal, tax_rate, tax_amount, discount_amount, total_amount, currency
  required_date, expected_delivery_date, actual_delivery_date
  approved_at, dispatched_at, delivered_at
  delivery_address, shipping_method, tracking_number
  internal_notes, vendor_notes
  created_at, updated_at

po_items
  id, purchase_order_id
  item_code, item_name, description
  quantity, unit, unit_price, total_price
  notes, created_at

po_status_history
  id, purchase_order_id, changed_by
  previous_status, new_status, remarks, changed_at
```

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Python, FastAPI, SQLAlchemy, Pydantic v2, Alembic |
| Database | PostgreSQL 15 |
| Frontend | Angular 17, Angular Material, Reactive Forms |
| Auth     | JWT (python-jose + passlib) |
| Deploy   | Docker, Docker Compose, Nginx |
