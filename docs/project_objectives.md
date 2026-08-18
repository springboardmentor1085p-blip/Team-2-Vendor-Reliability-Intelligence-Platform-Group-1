# Project Objectives — Vendor Reliability Intelligence Platform (VRIP)

## 1. Project Title

**Vendor Reliability Intelligence Platform: Vendor Reliability Intelligence & Procurement Risk Management Platform**

---

## 2. Objective

Build a full-stack web application using Angular and FastAPI that enables organisations to evaluate vendor reliability, manage procurement operations, monitor supplier performance, track delivery history, maintain contract compliance, and improve procurement decision-making through centralised dashboards and analytics.

The platform helps procurement teams reduce supply chain risks by providing vendor performance insights, procurement monitoring, contract management, communication tracking, and reliability scoring.

---

## 3. Implemented Outcomes

| # | Outcome | Status |
|---|---|---|
| i | Developed and deployed a full-stack Vendor Reliability Intelligence platform | ✅ |
| ii | Implemented secure user authentication and role-based access control | ✅ |
| iii | Built vendor registration and supplier management modules | ✅ |
| iv | Developed procurement and purchase order management workflows | ✅ |
| v | Implemented vendor reliability scoring based on operational performance | ✅ |
| vi | Built contract and compliance monitoring systems | ✅ |
| vii | Developed dashboards for procurement analytics and vendor performance | ✅ |
| viii | Implemented notifications and procurement alerts | ✅ |
| ix | Generated procurement and vendor performance reports | ✅ |
| x | Deployed the application using Docker and Docker Compose | ✅ |
| xi | Designed responsive UI wireframes and procurement user workflows | ✅ |

---

## 4. Architecture

- **Frontend:** Angular 21 Standalone Components, TypeScript, Angular Material, RxJS
- **Backend:** Python 3.11, FastAPI 0.128, Uvicorn, SQLAlchemy 2.0, Pydantic v2, Alembic
- **Database:** PostgreSQL 15
- **Authentication:** JWT (HS256), OAuth2 password flow, bcrypt password hashing
- **Deployment:** Docker, Docker Compose, Nginx (frontend)

---

## 5. Module Summary

### Module 1 — User Authentication & Role Management
- JWT login, token-based session, auth guard on all routes
- Role field: Admin, Procurement Manager, Supply Chain Manager, Finance Officer, Auditor
- All API endpoints require valid Bearer token

### Module 2 — Vendor Management
- Full CRUD with vendor categorisation
- Approval workflow: Pending → Active or Rejected
- Vendor status monitoring

### Module 3 — Procurement Management
- Procurement request lifecycle: Pending → Approved → Ordered → Delivered → Completed
- Approval workflow endpoints: `PUT /procurements/{id}/approve` and `/reject`
- Vendor assignment, invoice tracking

### Module 4 — Purchase Order Management
- POs linked to procurement requests and vendors
- Status: Ordered / Delivered / Completed / Cancelled
- Payment status: Pending / Paid

### Module 5 — Vendor Performance Module
- On-time deliveries, delayed deliveries, quality rating
- Communication response time, order completion rate
- Performance score per vendor

### Module 6 — Vendor Reliability Module (Core Intelligence)
Five-factor weighted reliability algorithm:

| Factor | Weight | Source |
|---|---|---|
| Delivery performance | 30% | on_time / total deliveries |
| Product quality | 25% | quality_rating / 5 × 100 |
| Contract compliance | 20% | order_completion_rate |
| Communication efficiency | 15% | response_time banding |
| Risk factor | 10% | 100 − (impact_score × 5) |

Output: overall score (0–100), risk level (LOW/MEDIUM/HIGH), and actionable procurement recommendations.

### Module 7 — Contract & Compliance Module
- Contract CRUD with value, currency, start/end dates
- Active contract status monitoring
- **Expiry tracking:** `GET /contracts/expiring?days=30` returns contracts expiring within window

### Module 8 — Communication Module
- Vendor messaging and procurement discussions
- Communication history with priority and status

### Module 9 — Dashboard & Analytics
- `GET /dashboard/summary` aggregates live PostgreSQL data:
  total vendors, active vendors, purchase orders, active contracts,
  high-risk vendors, total contract value, total procurement value,
  communications count, average performance score

### Module 10 — Notification Module
- Notification types: Alert, Warning, Info
- Status: Read / Unread
- CRUD + storage in PostgreSQL

### Module 11 — Reports & Export Module
- Report records stored in PostgreSQL
- Dashboard shows live DB counts (no hardcoded values)
- TXT export: formatted procurement summary
- CSV export: all report records

---

## 6. Database

10 PostgreSQL tables via SQLAlchemy ORM:
`users`, `vendors`, `procurements`, `purchase_orders`, `contracts`,
`vendor_performance`, `vendor_risks`, `communications`, `notifications`, `reports`

All migrations managed with Alembic (11 migration files).

---

## 7. Testing & Verification

- Backend imports cleanly (60 routes registered)
- Angular production build: exit code 0, zero errors
- Docker Compose config: valid
- All major CRUD flows verified via FastAPI Swagger UI (`/docs`)
- Authentication flow: login → JWT → protected routes
- Reliability algorithm tested with real vendor performance data

---

## 8. Deployment

```bash
# Clone repository
cd Vendor-Reliability-Platform
cp .env.example .env   # configure credentials
docker compose up --build
```

Services exposed:
- Frontend: http://localhost:80
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

---

## 9. Limitations & Future Enhancements

| Item | Status | Notes |
|---|---|---|
| SMTP email notifications | Not implemented | Requires external SMTP credentials |
| SMS notifications (Twilio) | Not implemented | Requires Twilio account |
| PDF generation (server-side) | Not implemented | TXT/CSV export is available |
| Redis caching | Not implemented | Architecture supports addition |
| Full RBAC frontend gating | Partial | Role field exists on User model |
| Performance trend analysis | Not implemented | Time-series data structure needed |
