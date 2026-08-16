from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, vendors

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vendor Reliability Intelligence Platform",
    description="Procurement Risk Management — Member B: Approval Workflow & Security",
    version="1.0.0",
)

# Allow Angular dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vendors.router)


@app.get("/", tags=["Health"])
def root():
    return {"message": "Vendor Reliability Platform API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
