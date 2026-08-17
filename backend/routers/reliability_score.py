from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.reliability_score import (
    ReliabilityNotification,
    ReliabilityScore
)


router = APIRouter(
    prefix="/reliability-score",
    tags=["Reliability Score"]
)


class ReliabilityInput(BaseModel):
    vendor_id: int = Field(gt=0)

    quality_score: float = Field(ge=0, le=100)
    delivery_score: float = Field(ge=0, le=100)
    compliance_score: float = Field(ge=0, le=100)
    communication_score: float = Field(ge=0, le=100)


def calculate_weighted_score(data: ReliabilityInput) -> float:
    score = (
        data.quality_score * 0.30
        + data.delivery_score * 0.30
        + data.compliance_score * 0.25
        + data.communication_score * 0.15
    )

    return round(score, 2)


def get_status(score: float) -> str:
    if score >= 90:
        return "Excellent"

    if score >= 75:
        return "Good"

    if score >= 60:
        return "Average"

    return "High Risk"


def get_risk_level(score: float) -> str:
    if score >= 90:
        return "Low Risk"

    if score >= 75:
        return "Moderate Risk"

    if score >= 60:
        return "Medium Risk"

    return "Critical Risk"


def get_recommendation(data: ReliabilityInput) -> str:
    performance_scores = {
        "quality performance": data.quality_score,
        "delivery performance": data.delivery_score,
        "compliance": data.compliance_score,
        "communication": data.communication_score
    }

    lowest_area = min(
        performance_scores,
        key=performance_scores.get
    )

    lowest_score = performance_scores[lowest_area]

    if lowest_score >= 90:
        return (
            "Vendor performance is excellent. "
            "Continue the current monitoring process."
        )

    if lowest_score >= 75:
        return (
            f"Vendor performance is stable. Monitor "
            f"{lowest_area} for further improvement."
        )

    if lowest_score >= 60:
        return (
            f"Improvement is required in {lowest_area}. "
            f"Create a performance improvement plan."
        )

    return (
        f"Immediate action is required for {lowest_area}. "
        f"Review the vendor before future procurement."
    )


def create_notification(
    db: Session,
    vendor_id: int,
    score: float,
    status: str
) -> None:

    if score >= 90:
        notification_type = "success"

        message = (
            f"Vendor {vendor_id} achieved an excellent "
            f"reliability score of {score}."
        )

    elif score < 60:
        notification_type = "critical"

        message = (
            f"Vendor {vendor_id} reliability score dropped "
            f"to {score}. Immediate review is required."
        )

    elif score < 75:
        notification_type = "warning"

        message = (
            f"Vendor {vendor_id} reliability score is "
            f"{score}. Performance improvement is required."
        )

    else:
        notification_type = "info"

        message = (
            f"Vendor {vendor_id} reliability score was "
            f"updated to {score} with status {status}."
        )

    notification = ReliabilityNotification(
        vendor_id=vendor_id,
        message=message,
        notification_type=notification_type,
        is_read=False,
        created_at=datetime.now()
    )

    db.add(notification)


def score_to_dictionary(score: ReliabilityScore) -> dict:
    return {
        "id": score.id,
        "vendor_id": score.vendor_id,
        "quality_score": score.quality_score,
        "delivery_score": score.delivery_score,
        "compliance_score": score.compliance_score,
        "communication_score": score.communication_score,
        "reliability_score": score.reliability_score,
        "status": score.status,
        "risk_level": score.risk_level,
        "recommendation": score.recommendation,
        "calculated_at": score.calculated_at
    }


def get_latest_scores(db: Session) -> List[ReliabilityScore]:
    latest_ids = (
        db.query(
            func.max(ReliabilityScore.id).label("latest_id")
        )
        .group_by(ReliabilityScore.vendor_id)
        .subquery()
    )

    return (
        db.query(ReliabilityScore)
        .filter(
            ReliabilityScore.id.in_(
                db.query(latest_ids.c.latest_id)
            )
        )
        .all()
    )


@router.get("/")
def reliability_home():
    return {
        "message": "MS3 Reliability Score API is working successfully",
        "features": [
            "Reliability score calculation",
            "Database score storage",
            "Vendor score history",
            "Latest vendor score",
            "Dashboard analytics",
            "Top vendor ranking",
            "High-risk vendor detection",
            "Automatic notifications",
            "Mark notifications as read",
            "Recalculate all vendor scores"
        ]
    }


@router.post("/calculate")
def calculate_reliability_score(
    data: ReliabilityInput,
    db: Session = Depends(get_db)
):
    final_score = calculate_weighted_score(data)

    status = get_status(final_score)
    risk_level = get_risk_level(final_score)
    recommendation = get_recommendation(data)

    reliability_record = ReliabilityScore(
        vendor_id=data.vendor_id,
        quality_score=data.quality_score,
        delivery_score=data.delivery_score,
        compliance_score=data.compliance_score,
        communication_score=data.communication_score,
        reliability_score=final_score,
        status=status,
        risk_level=risk_level,
        recommendation=recommendation,
        calculated_at=datetime.now()
    )

    db.add(reliability_record)

    create_notification(
        db=db,
        vendor_id=data.vendor_id,
        score=final_score,
        status=status
    )

    db.commit()
    db.refresh(reliability_record)

    return {
        "message": "Reliability score calculated and saved successfully",
        "id": reliability_record.id,
        "vendor_id": data.vendor_id,
        "reliability_score": final_score,
        "status": status,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "calculated_at": reliability_record.calculated_at,
        "breakdown": {
            "quality": {
                "score": data.quality_score,
                "weight": "30%",
                "weighted_score": round(
                    data.quality_score * 0.30,
                    2
                )
            },
            "delivery": {
                "score": data.delivery_score,
                "weight": "30%",
                "weighted_score": round(
                    data.delivery_score * 0.30,
                    2
                )
            },
            "compliance": {
                "score": data.compliance_score,
                "weight": "25%",
                "weighted_score": round(
                    data.compliance_score * 0.25,
                    2
                )
            },
            "communication": {
                "score": data.communication_score,
                "weight": "15%",
                "weighted_score": round(
                    data.communication_score * 0.15,
                    2
                )
            }
        }
    }


@router.get("/dashboard")
def get_reliability_dashboard(
    db: Session = Depends(get_db)
):
    latest_scores = get_latest_scores(db)

    if not latest_scores:
        return {
            "total_vendors": 0,
            "average_score": 0,
            "excellent_vendors": 0,
            "good_vendors": 0,
            "average_vendors": 0,
            "high_risk_vendors": 0,
            "unread_notifications": 0
        }

    total_vendors = len(latest_scores)

    average_score = round(
        sum(
            item.reliability_score
            for item in latest_scores
        ) / total_vendors,
        2
    )

    excellent_count = sum(
        1 for item in latest_scores
        if item.status == "Excellent"
    )

    good_count = sum(
        1 for item in latest_scores
        if item.status == "Good"
    )

    average_count = sum(
        1 for item in latest_scores
        if item.status == "Average"
    )

    high_risk_count = sum(
        1 for item in latest_scores
        if item.status == "High Risk"
    )

    unread_count = (
        db.query(ReliabilityNotification)
        .filter(
            ReliabilityNotification.is_read.is_(False)
        )
        .count()
    )

    return {
        "total_vendors": total_vendors,
        "average_score": average_score,
        "excellent_vendors": excellent_count,
        "good_vendors": good_count,
        "average_vendors": average_count,
        "high_risk_vendors": high_risk_count,
        "unread_notifications": unread_count
    }


@router.get("/top-vendors")
def get_top_vendors(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    latest_scores = get_latest_scores(db)

    sorted_scores = sorted(
        latest_scores,
        key=lambda item: item.reliability_score,
        reverse=True
    )

    top_scores = sorted_scores[:limit]

    return {
        "count": len(top_scores),
        "top_vendors": [
            {
                "rank": index + 1,
                **score_to_dictionary(score)
            }
            for index, score in enumerate(top_scores)
        ]
    }


@router.get("/high-risk")
def get_high_risk_vendors(
    db: Session = Depends(get_db)
):
    latest_scores = get_latest_scores(db)

    high_risk_scores = [
        score
        for score in latest_scores
        if score.reliability_score < 60
    ]

    high_risk_scores.sort(
        key=lambda item: item.reliability_score
    )

    return {
        "count": len(high_risk_scores),
        "high_risk_vendors": [
            score_to_dictionary(score)
            for score in high_risk_scores
        ]
    }


@router.post("/recalculate-all")
def recalculate_all_vendor_scores(
    db: Session = Depends(get_db)
):
    latest_scores = get_latest_scores(db)

    if not latest_scores:
        raise HTTPException(
            status_code=404,
            detail="No vendor reliability scores found"
        )

    recalculated_vendors = []

    for old_score in latest_scores:
        input_data = ReliabilityInput(
            vendor_id=old_score.vendor_id,
            quality_score=old_score.quality_score,
            delivery_score=old_score.delivery_score,
            compliance_score=old_score.compliance_score,
            communication_score=old_score.communication_score
        )

        final_score = calculate_weighted_score(input_data)
        status = get_status(final_score)
        risk_level = get_risk_level(final_score)
        recommendation = get_recommendation(input_data)

        new_score = ReliabilityScore(
            vendor_id=input_data.vendor_id,
            quality_score=input_data.quality_score,
            delivery_score=input_data.delivery_score,
            compliance_score=input_data.compliance_score,
            communication_score=input_data.communication_score,
            reliability_score=final_score,
            status=status,
            risk_level=risk_level,
            recommendation=recommendation,
            calculated_at=datetime.now()
        )

        db.add(new_score)

        create_notification(
            db=db,
            vendor_id=input_data.vendor_id,
            score=final_score,
            status=status
        )

        recalculated_vendors.append({
            "vendor_id": input_data.vendor_id,
            "reliability_score": final_score,
            "status": status
        })

    db.commit()

    return {
        "message": "All vendor reliability scores recalculated successfully",
        "total_recalculated": len(recalculated_vendors),
        "vendors": recalculated_vendors
    }


@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db)
):
    notification_records = (
        db.query(ReliabilityNotification)
        .order_by(
            ReliabilityNotification.created_at.desc()
        )
        .all()
    )

    unread_count = sum(
        1
        for notification in notification_records
        if not notification.is_read
    )

    return {
        "total_notifications": len(notification_records),
        "unread_count": unread_count,
        "notifications": [
            {
                "id": notification.id,
                "vendor_id": notification.vendor_id,
                "message": notification.message,
                "notification_type": notification.notification_type,
                "read": notification.is_read,
                "created_at": notification.created_at
            }
            for notification in notification_records
        ]
    }


@router.put("/notifications/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db)
):
    notifications = (
        db.query(ReliabilityNotification)
        .filter(
            ReliabilityNotification.is_read.is_(False)
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read",
        "updated_count": len(notifications)
    }


@router.put("/notifications/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    notification = (
        db.query(ReliabilityNotification)
        .filter(
            ReliabilityNotification.id == notification_id
        )
        .first()
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification": {
            "id": notification.id,
            "vendor_id": notification.vendor_id,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "read": notification.is_read,
            "created_at": notification.created_at
        }
    }


@router.delete("/notifications")
def clear_all_notifications(
    db: Session = Depends(get_db)
):
    deleted_count = (
        db.query(ReliabilityNotification)
        .delete()
    )

    db.commit()

    return {
        "message": "All notifications cleared",
        "deleted_count": deleted_count
    }


@router.get("/latest/{vendor_id}")
def get_latest_vendor_score(
    vendor_id: int,
    db: Session = Depends(get_db)
):
    latest_score = (
        db.query(ReliabilityScore)
        .filter(
            ReliabilityScore.vendor_id == vendor_id
        )
        .order_by(
            ReliabilityScore.calculated_at.desc(),
            ReliabilityScore.id.desc()
        )
        .first()
    )

    if latest_score is None:
        raise HTTPException(
            status_code=404,
            detail="Reliability score not found for this vendor"
        )

    return score_to_dictionary(latest_score)


@router.get("/history/{vendor_id}")
def get_vendor_score_history(
    vendor_id: int,
    db: Session = Depends(get_db)
):
    history = (
        db.query(ReliabilityScore)
        .filter(
            ReliabilityScore.vendor_id == vendor_id
        )
        .order_by(
            ReliabilityScore.calculated_at.asc()
        )
        .all()
    )

    if not history:
        raise HTTPException(
            status_code=404,
            detail="Reliability history not found for this vendor"
        )

    return {
        "vendor_id": vendor_id,
        "total_records": len(history),
        "history": [
            score_to_dictionary(score)
            for score in history
        ],
        "chart_data": {
            "labels": [
                score.calculated_at.strftime(
                    "%d-%m-%Y %H:%M"
                )
                for score in history
            ],
            "scores": [
                score.reliability_score
                for score in history
            ]
        }
    }