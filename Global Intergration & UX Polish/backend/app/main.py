from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes.integration import router as integration_router
from app.serializers.response import success_response

app = FastAPI(
    title="Vendor Reliability Intelligence Platform",
    version="1.0.0",
    description="Backend API for Vendor Reliability Intelligence Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:4201",
        "http://127.0.0.1:4201",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
API_V1_PREFIX = "/api/v1"
app.include_router(integration_router, prefix=API_V1_PREFIX)

# ── Root ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return success_response(message="Vendor Reliability Intelligence Platform API is running.")

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "api_version": "1.0.0"}
