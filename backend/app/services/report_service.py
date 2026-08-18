from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.report import (
    create_report,
    get_all_reports,
    get_report_by_id,
    update_report,
    delete_report,
)

from app.models.report import Report

from app.schemas.report import (
    ReportCreate,
    ReportUpdate,
)


def create_report_service(
    db: Session,
    report: ReportCreate,
):
    new_report = Report(**report.model_dump())

    return create_report(
        db,
        new_report,
    )


def get_all_reports_service(
    db: Session,
):
    return get_all_reports(db)


def get_report_by_id_service(
    db: Session,
    report_id: int,
):
    report = get_report_by_id(
        db,
        report_id,
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    return report


def update_report_service(
    db: Session,
    report_id: int,
    report_update: ReportUpdate,
):
    report = get_report_by_id(
        db,
        report_id,
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    update_data = report_update.model_dump(
        exclude_unset=True,
    )

    for key, value in update_data.items():
        setattr(report, key, value)

    return update_report(
        db,
        report,
    )


def delete_report_service(
    db: Session,
    report_id: int,
):
    report = get_report_by_id(
        db,
        report_id,
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    delete_report(
        db,
        report,
    )

    return {
        "message": "Report deleted successfully"
    }