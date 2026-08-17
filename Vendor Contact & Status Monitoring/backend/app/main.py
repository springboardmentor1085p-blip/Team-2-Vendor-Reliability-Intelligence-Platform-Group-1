from datetime import datetime
from typing import List

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Vendor, VendorContact
from .schemas import (
    VendorContactCreate,
    VendorContactResponse,
    VendorContactUpdate,
    VendorProfileResponse,
    VendorStatusResponse,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vendor Reliability Intelligence Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return RedirectResponse(url="/docs")


@app.post("/vendors/{vendor_id}/contacts", response_model=VendorContactResponse, status_code=status.HTTP_201_CREATED)
def add_contact(vendor_id: int, contact: VendorContactCreate, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")

    new_contact = VendorContact(vendor_id=vendor_id, **contact.model_dump())
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact


@app.get("/vendors/{vendor_id}/contacts", response_model=List[VendorContactResponse])
def list_contacts(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")

    contacts = db.query(VendorContact).filter(VendorContact.vendor_id == vendor_id).all()
    return contacts


@app.put("/contacts/{contact_id}", response_model=VendorContactResponse)
def update_contact(contact_id: int, contact_update: VendorContactUpdate, db: Session = Depends(get_db)):
    contact = db.query(VendorContact).filter(VendorContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    update_data = contact_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")

    for key, value in update_data.items():
        setattr(contact, key, value)

    db.commit()
    db.refresh(contact)
    return contact


@app.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(VendorContact).filter(VendorContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    db.delete(contact)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/vendors/{vendor_id}/profile", response_model=VendorProfileResponse)
def get_vendor_profile(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    return vendor


@app.get("/vendors/{vendor_id}/status", response_model=VendorStatusResponse)
def get_vendor_status(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")

    return VendorStatusResponse(
        vendor_id=vendor.id,
        status=vendor.status,
        reliability_score=vendor.reliability_score,
        last_verified_at=datetime.utcnow(),
    )
