from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import engine, Base, SessionLocal
import models
import schemas


# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VendorIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    """Yield a database session and ensure it is closed after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Helper ────────────────────────────────────────────────────────────────────

def get_vendor_or_404(vendor_id: int, db: Session) -> models.Vendor:
    """Return the vendor with the given id, or raise 404 if not found."""
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor with id {vendor_id} not found.",
        )
    return vendor


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "VendorIQ backend running"}


@app.post(
    "/vendors",
    response_model=schemas.VendorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new vendor",
)
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    """
    Create a new vendor profile.

    - Returns **201 Created** on success.
    - Returns **409 Conflict** if the email is already registered.
    - Returns **422 Unprocessable Entity** if validation fails.
    """
    new_vendor = models.Vendor(
        name=vendor.vendorName,
        email=vendor.email,
        phone=vendor.phone,
        address=vendor.address,
    )
    db.add(new_vendor)
    try:
        db.commit()
        db.refresh(new_vendor)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vendor with this email address is already registered.",
        )
    return new_vendor


@app.get(
    "/vendors",
    response_model=list[schemas.VendorResponse],
    summary="List all vendors",
)
def get_vendors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Retrieve a paginated list of vendors.

    - **skip**: number of records to skip (default 0)
    - **limit**: maximum records to return (default 100)
    """
    return db.query(models.Vendor).offset(skip).limit(limit).all()


@app.get(
    "/vendors/{vendor_id}",
    response_model=schemas.VendorResponse,
    summary="Get a single vendor by ID",
)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single vendor by their ID.

    - Returns **404 Not Found** if the vendor does not exist.
    """
    return get_vendor_or_404(vendor_id, db)


@app.put(
    "/vendors/{vendor_id}",
    response_model=schemas.VendorResponse,
    summary="Update a vendor",
)
def update_vendor(
    vendor_id: int,
    vendor_data: schemas.VendorUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an existing vendor's details.

    Only the fields you include in the request body will be changed.
    Omitted fields keep their current value.

    - Returns **404 Not Found** if the vendor does not exist.
    - Returns **409 Conflict** if the new email is already used by another vendor.
    """
    vendor = get_vendor_or_404(vendor_id, db)

    # Only update fields that were explicitly provided (not None)
    update_fields = vendor_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        # Map camelCase 'vendorName' back to the ORM attribute 'name'
        orm_field = "name" if field == "vendorName" else field
        setattr(vendor, orm_field, value)

    try:
        db.commit()
        db.refresh(vendor)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vendor with this email address is already registered.",
        )
    return vendor


@app.delete(
    "/vendors/{vendor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a vendor",
)
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    """
    Permanently delete a vendor by ID.

    - Returns **204 No Content** on success.
    - Returns **404 Not Found** if the vendor does not exist.
    """
    vendor = get_vendor_or_404(vendor_id, db)
    db.delete(vendor)
    db.commit()
