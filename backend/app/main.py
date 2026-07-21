from fastapi import FastAPI

from app.core.config import settings
from app.core.database import Base, engine
from app.routers.auth import router as auth_router
from app.routers.vendor import router as vendor_router
from app.routers.procurement import router as procurement_router
from app.routers.purchase_order import router as purchase_order_router
from app.routers.contract import router as contract_router
from app.routers.communication import router as communication_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(vendor_router)
app.include_router(procurement_router)
app.include_router(purchase_order_router)
app.include_router(contract_router)
app.include_router(communication_router)


@app.get("/")
def home():
    return {
        "message": "Vendor Reliability Intelligence Platform API is Running Successfully"
    }