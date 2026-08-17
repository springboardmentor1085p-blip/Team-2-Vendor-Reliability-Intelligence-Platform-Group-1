from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

import models
import schemas
from database import SessionLocal


router = APIRouter(
    prefix="/exports",
    tags=["Exports"],
)


# ── Dependency ────────────────────────────────────────────────────────────────

def get_db():
    """Yield a database session and ensure it is closed after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Helper ────────────────────────────────────────────────────────────────────

def get_export_job_or_404(export_id: int, db: Session) -> models.ExportJob:
    """Return the export job with the given id, or raise 404."""
    job = (
        db.query(models.ExportJob)
        .filter(models.ExportJob.id == export_id)
        .first()
    )
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Export job with id {export_id} not found.",
        )
    return job


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=schemas.ExportJobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new export job",
)
def create_export_job(
    payload: schemas.ExportJobCreate,
    db: Session = Depends(get_db),
):
    """
    Enqueue a new data export request for a user.
    The job is created with status **pending** automatically.

    - Returns **201 Created** with the full job record (including the assigned id).
    - Returns **422 Unprocessable Entity** if export_type is invalid or user_id is missing.
    """
    new_job = models.ExportJob(
        user_id     = payload.user_id,
        export_type = payload.export_type,
        status      = models.ExportStatusEnum.pending,
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


# NOTE: This route MUST be declared before GET /{export_id}.
# FastAPI resolves routes top-to-bottom; if /{export_id} came first,
# the literal segment "user" would be matched as an integer export_id
# and raise a 422 before this handler was ever reached.
@router.get(
    "/user/{user_id}",
    response_model=list[schemas.ExportJobResponse],
    summary="Get all export jobs for a user",
)
def get_export_jobs_by_user(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all export jobs belonging to a specific user,
    ordered by requested_at descending (most recent first).

    - Returns **200 OK** with a list of jobs (empty list if none exist).
    """
    jobs = (
        db.query(models.ExportJob)
        .filter(models.ExportJob.user_id == user_id)
        .order_by(models.ExportJob.requested_at.desc())
        .all()
    )
    return jobs


@router.get(
    "/{export_id}",
    response_model=schemas.ExportJobResponse,
    summary="Get a single export job by ID",
)
def get_export_job(export_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single export job by its id.

    - Returns **200 OK** with the job record on success.
    - Returns **404 Not Found** if no job with that id exists.
    """
    return get_export_job_or_404(export_id, db)


@router.patch(
    "/{export_id}/status",
    response_model=schemas.ExportJobResponse,
    summary="Update the status of an export job",
)
def update_export_job_status(
    export_id: int,
    payload: schemas.ExportJobUpdate,
    db: Session = Depends(get_db),
):
    """
    Advance the status of an export job through its lifecycle:
    **pending → processing → completed | failed**

    Automatic side-effects based on the incoming status:
    - `completed` — sets `completed_at` to the current UTC time if not provided;
      optionally accepts `file_path` pointing to the generated file.
    - `failed` — accepts an `error_message` describing what went wrong;
      clears `completed_at` since the job did not finish successfully.
    - `processing` — clears any previous `error_message` from a prior failed attempt.

    Only the fields present in the request body are written;
    omitted fields keep their current value.

    - Returns **200 OK** with the updated job record on success.
    - Returns **404 Not Found** if no job with that id exists.
    - Returns **422 Unprocessable Entity** if the status value is invalid.
    """
    job = get_export_job_or_404(export_id, db)

    # Apply every field the caller explicitly sent
    update_fields = payload.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(job, field, value)

    # Status-driven side-effects
    if payload.status == models.ExportStatusEnum.completed:
        # Auto-stamp completed_at if the caller did not override it
        if payload.completed_at is None:
            job.completed_at = datetime.now(tz=timezone.utc)
        # Clear any leftover error from a previous failed attempt
        job.error_message = None

    elif payload.status == models.ExportStatusEnum.failed:
        # A failed job has no completion time
        job.completed_at = None

    elif payload.status == models.ExportStatusEnum.processing:
        # Job has been picked up — clear any error from a previous failed attempt
        job.error_message = None
        job.completed_at  = None

    db.commit()
    db.refresh(job)
    return job
