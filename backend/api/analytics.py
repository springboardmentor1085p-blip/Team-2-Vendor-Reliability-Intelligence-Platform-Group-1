from fastapi import APIRouter
from services.analytics_service import get_analytics

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/")
def analytics():
    return get_analytics()