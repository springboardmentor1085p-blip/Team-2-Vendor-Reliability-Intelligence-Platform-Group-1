from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exception_handlers import register_exception_handlers
from app.database.session import init_db
from app.routers.analytics import router as analytics_router
from app.seed_data import seed_data

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
init_db()
seed_data()

app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
