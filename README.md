# Vendor Reliability Intelligence Platform (VRIP)

**Vendor Reliability Intelligence & Procurement Risk Management Platform**

A full-stack enterprise web application built with Angular 21 and FastAPI that enables organisations to evaluate vendor reliability, manage procurement operations, monitor supplier performance, track delivery history, maintain contract compliance, and improve procurement decision-making through centralised dashboards and analytics.

---

## Table of Contents

1. [Project Objective](#1-project-objective)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Modules](#4-modules)
5. [Database Schema](#5-database-schema)
6. [Authentication](#6-authentication)
7. [API Overview](#7-api-overview)
8. [Setup — Local Development](#8-setup--local-development)
9. [Setup — Docker Deployment](#9-setup--docker-deployment)
10. [Database Migrations](#10-database-migrations)
11. [Frontend Setup](#11-frontend-setup)
12. [Demo Workflow](#12-demo-workflow)
13. [Evaluation Criteria Coverage](#13-evaluation-criteria-coverage)

---

## 1. Project Objective

VRIP helps procurement teams reduce supply chain risk by providing:

- Vendor performance insights and reliability scoring
- Procurement monitoring and purchase order management
- Contract management and compliance tracking
- Communication and activity logging
- Risk assessment and analytics dashboards
- Notification and alert management
- Reporting with CSV/TXT export

Target users: Manufacturing companies, retail businesses, logistics organisations, healthcare providers, construction firms, and enterprise procurement departments.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND  (Angular 21)                     │
│  Dashboard · Vendors · Procurement · PO · Contracts     │
│  Performance · Reliability · Risk · Comms · Reports     │
│  Notifications                                          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│              BACKEND  (FastAPI + Python)                 │
│  Auth · Vendor · Procurement · PO · Contract            │
│  Performance · Reliability · Risk · Communication       │
│  Notification · Report · Dashboard                      │
└────────────────────────┬────────────────────────────────┘
                         │ SQLAlchemy ORM
┌────────────────────────▼────────────────────────────────┐
│              DATABASE  (PostgreSQL)                     │
│  users · vendors · procurements · purchase_orders       │
│  contracts · vendor_performance · vendor_risks          │
│  communications · notifications · reports               │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TypeScript, Angular Material, RxJS |
| Backend | Python 3.11, FastAPI 0.128, Uvicorn |
| ORM | SQLAlchemy 2.0, Alembic |
| Validation | Pydantic v2 |
| Database | PostgreSQL 15 |
| Authentication | JWT (python-jose), bcrypt (passlib), OAuth2 |
| Containerisation | Docker, Docker Compose |
| Web Server | Nginx (frontend container) |

---

## 4. Modules

### 4.1 User Authentication & Role Management
- JWT-based secure login with `HS256` signing
- OAuth2 password flow via `/auth/login`
- Role field on User model (Admin, Procurement Manager, Supply Chain Manager, etc.)
- Auth guard on all frontend routes
- All backend API endpoints protected with `Depends(get_current_user)`

### 4.2 Vendor Management
- Full CRUD: create, list, view, edit, delete vendors
- Vendor categories (IT Vendors, Logistics Partners, Raw Material Suppliers, etc.)
- Vendor status: Active / Inactive / Pending
- Vendor approval workflow: `PUT /vendors/{id}/approve` and `PUT /vendors/{id}/reject`
- Pending vendor list view

### 4.3 Procurement Management
- Full CRUD for procurement requests
- Vendor assignment, order tracking, invoice number
- Procurement status: Pending → Approved → Ordered → Delivered → Completed / Cancelled
- **Approval workflow:** `PUT /procurements/{id}/approve?approved_by=name`
- **Reject workflow:** `PUT /procurements/{id}/reject?rejected_by=name`

### 4.4 Purchase Order Management
- Full CRUD for purchase orders linked to procurement requests
- PO status tracking (Ordered / Delivered / Completed / Cancelled)
- Payment status (Pending / Paid)

### 4.5 Vendor Performance Monitoring
- On-time deliveries, delayed deliveries, quality rating
- Communication response time, issue resolution time, order completion rate
- Performance score per vendor
- CRUD via `/vendor-performance` endpoints

### 4.6 Vendor Reliability Intelligence
- **Five-factor weighted reliability algorithm:**
  - Delivery Score (30%) — on-time vs delayed deliveries
  - Quality Score (25%) — quality rating normalised to 100
  - Compliance Score (20%) — order completion rate
  - Communication Score (15%) — response time banding
  - Risk Score (10%) — impact score deduction from active risks
- Overall Reliability Score (0–100) with risk level: LOW / MEDIUM / HIGH
- **Procurement Recommendations** generated automatically from scores
- Endpoint: `GET /reliability/{vendor_id}`

### 4.7 Contract & Compliance Management
- Full CRUD for contracts with vendor linkage
- Contract fields: number, name, value, currency, start/end dates, status
- **Contract expiry monitoring:** `GET /contracts/expiring?days=30`
  returns active contracts expiring within the specified window
- Contract status: Active / Expired / Terminated

### 4.8 Communication Module
- Vendor messaging and procurement discussions
- Communication history with subject, message, status, priority
- Full CRUD via `/communications` endpoints

### 4.9 Risk Management
- Risk records with type, severity (High/Medium/Low), impact score, status
- Risk linked to vendor via `vendor_id`
- Risk Dashboard: live counts from PostgreSQL (replaces previous hardcoded values)
- Full CRUD via `/risks` endpoints

### 4.10 Notification Module
- Procurement alerts, delivery delay notifications, contract expiry alerts
- Notification types: Alert, Warning, Info
- Status: Read / Unread
- Full CRUD via `/notifications` endpoints

### 4.11 Reports & Export Module
- Report records stored in PostgreSQL (name, type, format, generated_by, status)
- Report Dashboard: live counts from `/dashboard/summary` + `/reports` API
- **TXT export:** downloads formatted procurement summary
- **CSV export:** downloads all report records as spreadsheet-compatible CSV
- Full CRUD via `/reports` endpoints

### 4.12 Dashboard & Analytics
- `GET /dashboard/summary` — live aggregated counts from PostgreSQL:
  - Total vendors, active vendors
  - Total purchase orders
  - Active contracts
  - High risk vendors
  - Total contract value, total procurement value
  - Total communications
  - Average performance score
- Vendor Reliability Dashboard via `/reliability/{vendor_id}`

---

## 5. Database Schema

| Table | Key Fields |
|---|---|
| `users` | id, email, hashed_password, role, is_active |
| `vendors` | id, company_name, category, status, contact fields |
| `procurements` | id, request_number, vendor_id, status, approved_by, total_amount |
| `purchase_orders` | id, po_number, procurement_id, vendor_id, status, payment_status |
| `contracts` | id, contract_number, vendor_id, start_date, end_date, status, contract_value |
| `vendor_performance` | id, vendor_id, on_time_deliveries, delayed_deliveries, quality_rating, response_time, order_completion_rate |
| `vendor_risks` | id, vendor_id, risk_type, severity, impact_score, status |
| `communications` | id, vendor_id, subject, message, status, priority |
| `notifications` | id, title, message, recipient, notification_type, status |
| `reports` | id, report_name, report_type, generated_by, file_format, status |

All tables include `id` (PK), `created_at`, `updated_at` via `BaseModel`.

---

## 6. Authentication

Tokens are issued at `POST /auth/login` (form: `username` + `password`).

Include the token in all subsequent requests:
```
Authorization: Bearer <access_token>
```

Token lifetime: 60 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).

---

## 7. API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login, returns JWT token |
| GET | `/vendors` | List all vendors |
| PUT | `/vendors/{id}/approve` | Approve vendor |
| PUT | `/vendors/{id}/reject` | Reject vendor |
| GET | `/procurements` | List procurements |
| PUT | `/procurements/{id}/approve` | Approve procurement |
| PUT | `/procurements/{id}/reject` | Reject procurement |
| GET | `/purchase-orders` | List purchase orders |
| GET | `/contracts` | List contracts |
| GET | `/contracts/expiring?days=30` | Contracts expiring within N days |
| GET | `/vendor-performance` | List performance records |
| GET | `/reliability/{vendor_id}` | Vendor reliability score + recommendations |
| GET | `/risks` | List risk records |
| GET | `/dashboard/summary` | Live dashboard statistics |
| GET | `/notifications` | List notifications |
| GET | `/reports` | List reports |
| GET | `/communications` | List communications |

Full interactive API documentation available at: `http://localhost:8000/docs` (Swagger UI)

---

## 8. Setup — Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15
- npm

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env (see .env.example)
cp ../.env.example .env
# Edit DATABASE_URL, SECRET_KEY

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

API available at: `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
ng serve
```

App available at: `http://localhost:4200`

---

## 9. Setup — Docker Deployment

### Prerequisites
- Docker 24+
- Docker Compose v2

```bash
# From project root
cp .env.example .env
# Edit POSTGRES_USER, POSTGRES_PASSWORD, SECRET_KEY

docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (Nginx) | http://localhost:80 |
| Backend (FastAPI) | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5433 (host port) |

To stop:
```bash
docker compose down
```

To stop and remove volumes (wipes DB):
```bash
docker compose down -v
```

---

## 10. Database Migrations

```bash
cd backend

# Apply all migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"

# Rollback one step
alembic downgrade -1
```

---

## 11. Frontend Setup

```bash
cd frontend
npm install

# Development server
ng serve

# Production build
ng build --configuration production

# Run unit tests
ng test
```

---

## 12. Demo Workflow

1. Navigate to `http://localhost:4200` → redirected to `/login`
2. Login with credentials → JWT stored → redirected to `/dashboard`
3. Dashboard shows live counts: vendors, purchase orders, contracts, risks
4. **Vendors** → view 4 vendors, add/edit/approve vendor, check pending vendors
5. **Procurement** → view 3 procurement requests, approve/reject workflow
6. **Purchase Orders** → view 3 POs (PO-2026-001 to PO-2026-003)
7. **Contracts** → view 2 contracts; CON-002 expiring soon (< 30 days)
8. **Vendor Performance** → view 4 performance records with scores
9. **Reliability** → navigate to reliability for vendor 1 — see 5-factor score + recommendations
10. **Risk** → Risk Dashboard shows live counts from DB; Risk List shows 4 risks
11. **Communications** → view/add communication records
12. **Notifications** → view 2 notifications (Contract Expiry Alert, High Risk Vendor)
13. **Reports** → Report Dashboard shows live DB counts; Export CSV or TXT
14. Logout → redirected to `/login`

---

## 13. Evaluation Criteria Coverage

| Milestone | Criterion | Status |
|---|---|---|
| M1 | FastAPI project setup | ✅ Complete |
| M1 | Angular application initialized | ✅ Complete |
| M1 | Database schema finalized | ✅ Complete (10 tables, 11 Alembic migrations) |
| M1 | Authentication implemented | ✅ Complete (JWT + authGuard) |
| M2 | Vendor Management operational | ✅ Complete (CRUD + approval workflow) |
| M2 | Procurement module functional | ✅ Complete (CRUD + approve/reject) |
| M2 | Purchase Order workflow completed | ✅ Complete |
| M2 | Contract Management functional | ✅ Complete (+ expiry endpoint) |
| M3 | Vendor Performance Dashboard | ✅ Complete (4 records, live DB) |
| M3 | Reliability Scoring operational | ✅ Complete (5-factor algorithm + recommendations) |
| M3 | Reports generated successfully | ✅ Complete (live DB + CSV/TXT export) |
| M3 | Analytics Dashboard functional | ✅ Complete (live PostgreSQL aggregations) |
| M4 | Docker deployment | ✅ Complete (Dockerfile × 2 + docker-compose.yml) |
| M4 | Documentation prepared | ✅ Complete (README.md + project_objectives.md) |
| M4 | Complete workflow demonstrated | ✅ See Demo Workflow above |
