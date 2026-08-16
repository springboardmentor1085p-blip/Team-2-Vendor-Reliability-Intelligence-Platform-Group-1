"""
Vendor Reliability Intelligence Platform — FastAPI Backend
==========================================================
Entry point for the FastAPI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, purchase_orders, vendors

# ── Create all tables (development convenience; use Alembic in production) ──
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vendor Reliability Intelligence Platform",
    description=(
        "Full-stack procurement and vendor reliability management platform. "
        "Provides Purchase Order management with auto-generated PO IDs, "
        "vendor management, and procurement analytics."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:80", "http://frontend"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(vendors.router)
app.include_router(purchase_orders.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Vendor Reliability Intelligence Platform"}
