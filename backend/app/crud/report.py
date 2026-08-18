from sqlalchemy.orm import Session

from app.models.report import Report


def get_report_by_id(
    db: Session,
    report_id: int,
):
    return (
        db.query(Report)
        .filter(Report.id == report_id)
        .first()
    )


def get_all_reports(
    db: Session,
):
    return db.query(Report).all()


def create_report(
    db: Session,
    report: Report,
):
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def update_report(
    db: Session,
    report: Report,
):
    db.commit()
    db.refresh(report)
    return report


def delete_report(
    db: Session,
    report: Report,
):
    db.delete(report)
    db.commit()