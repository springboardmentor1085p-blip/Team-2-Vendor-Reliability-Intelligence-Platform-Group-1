from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.reliability import ReliabilityResponse
from app.services.reliability_service import calculate_reliability


router = APIRouter(
    prefix="/reliability",
    tags=["Reliability Intelligence"],
)


@router.get(
    "/{vendor_id}",
    response_model=ReliabilityResponse,
)
def get_vendor_reliability(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return calculate_reliability(
        db,
        vendor_id,
    )
