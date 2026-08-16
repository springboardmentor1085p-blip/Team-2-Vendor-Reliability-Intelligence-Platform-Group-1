from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base

from app.routers.purchase_orders import router as po_router
from app.routers.notifications import router as notification_router
from app.routers.preferences import router as pref_router
from app.routers.contracts import router as contract_router
from app.routers.analytics import router as analytics_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(po_router)
app.include_router(notification_router)
app.include_router(pref_router)
app.include_router(contract_router)
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])

@app.get("/")
def home():
    return {"message": "Backend Running"}