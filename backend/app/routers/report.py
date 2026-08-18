from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.schemas.report import (
    ReportCreate,
    ReportUpdate,
    ReportResponse,
)

from app.services.report_service import (
    create_report_service,
    get_all_reports_service,
    get_report_by_id_service,
    update_report_service,
    delete_report_service,
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_report_service(
        db,
        report,
    )


@router.get(
    "",
    response_model=list[ReportResponse],
)
def get_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_reports_service(db)


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
)
def get_report_by_id(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_report_by_id_service(
        db,
        report_id,
    )


@router.put(
    "/{report_id}",
    response_model=ReportResponse,
)
def update_report(
    report_id: int,
    report: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_report_service(
        db,
        report_id,
        report,
    )


@router.delete(
    "/{report_id}",
)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return delete_report_service(
        db,
        report_id,
    )