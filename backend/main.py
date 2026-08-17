from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from database import Base, engine

# Import every model before create_all
from models.user import User
from models.vendor import Vendor
from models.contract import Contract
from models.reliability_score import (
    ReliabilityNotification,
    ReliabilityScore
)

from routers.vendors import router as vendor_router
from routers.contracts import router as contract_router
from routers.reliability_score import router as reliability_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Vendor Reliability Intelligence API",
    description=(
        "Vendor management, contract management, "
        "reliability scoring and notification APIs"
    ),
    version="3.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(auth_router)
app.include_router(vendor_router)
app.include_router(contract_router)
app.include_router(reliability_router)


@app.get("/")
def home():
    return {
        "message": (
            "Vendor Reliability Intelligence API "
            "is running successfully"
        ),
        "version": "3.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Vendor Reliability Intelligence API"
    }