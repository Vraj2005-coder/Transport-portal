"""
backend/app/routes/documents.py
--------------------------------
Driver document upload & management routes for TMS Admin.
Integrates with your existing project structure.

Features:
- List all documents for a driver (with status: valid / expiring / expired / missing)
- Upload a document (PDF/JPG/PNG, max 10 MB)
- Delete / replace a document
- Expiry-aware status calculation
"""

from __future__ import annotations

import os
import uuid
import shutil
from datetime import date, timedelta
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

# -- adjust these imports to match YOUR project paths --
from app.database import get_db
from app.models.driver import Driver          # your Driver model
from app.models.document import DriverDocument  # new model below


# ── CONFIG ────────────────────────────────────────────────────────────────────

MAX_FILE_SIZE_MB   = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png"}
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

# Where files are stored on disk
UPLOAD_DIR = Path("uploads/driver_documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Document types accepted for drivers
DOCUMENT_TYPES = [
    "driving_licence",
    "aadhar_card",
    "vehicle_insurance",
    "fitness_certificate",
    "national_permit",
    "pollution_certificate",
]

# Days before expiry to flag as "expiring soon"
EXPIRY_WARNING_DAYS = 30

router = APIRouter(prefix="/api/drivers", tags=["Driver Documents"])


# ── PYDANTIC SCHEMAS ──────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: int
    driver_id: int
    doc_type: str
    doc_number: Optional[str]
    issue_date: Optional[date]
    expiry_date: Optional[date]
    file_path: Optional[str]
    file_name: Optional[str]
    file_size_kb: Optional[int]
    status: str           # "valid" | "expiring" | "expired" | "missing"
    uploaded_at: Optional[date]

    class Config:
        from_attributes = True


class DocumentSummary(BaseModel):
    total: int
    valid: int
    expiring: int
    expired: int
    missing: int
    documents: List[DocumentOut]


# ── HELPERS ───────────────────────────────────────────────────────────────────

def compute_status(expiry_date: Optional[date]) -> str:
    """Return document status based on expiry date."""
    if expiry_date is None:
        return "missing"
    today = date.today()
    if expiry_date < today:
        return "expired"
    if expiry_date <= today + timedelta(days=EXPIRY_WARNING_DAYS):
        return "expiring"
    return "valid"


def validate_file(file: UploadFile) -> None:
    """Raise HTTPException if file type or size is invalid."""
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. "
                   f"Allowed: PDF, JPG, PNG."
        )
    # Check extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )


def save_file(file: UploadFile, driver_id: int, doc_type: str) -> tuple[str, str, int]:
    """
    Save uploaded file to disk.
    Returns (file_path, file_name, size_kb).
    Raises HTTPException if file exceeds MAX_FILE_SIZE_BYTES.
    """
    ext       = Path(file.filename).suffix.lower()
    unique_id = uuid.uuid4().hex[:10]
    file_name = f"{driver_id}_{doc_type}_{unique_id}{ext}"
    dest_path = UPLOAD_DIR / file_name

    # Stream-read to enforce size limit without loading all into RAM
    size = 0
    with open(dest_path, "wb") as out:
        while chunk := file.file.read(8192):          # 8 KB chunks
            size += len(chunk)
            if size > MAX_FILE_SIZE_BYTES:
                out.close()
                dest_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
                )
            out.write(chunk)

    return str(dest_path), file_name, size // 1024   # return KB


# ── ROUTES ────────────────────────────────────────────────────────────────────

@router.get("/{driver_id}/documents", response_model=DocumentSummary)
def get_driver_documents(driver_id: int, db: Session = Depends(get_db)):
    """
    Return all documents for a driver with their status summary.
    Automatically creates 'missing' placeholders for any doc type
    that hasn't been uploaded yet.
    """
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found.")

    existing = {
        doc.doc_type: doc
        for doc in db.query(DriverDocument)
                      .filter(DriverDocument.driver_id == driver_id)
                      .all()
    }

    docs_out = []
    counts   = {"valid": 0, "expiring": 0, "expired": 0, "missing": 0}

    for dt in DOCUMENT_TYPES:
        doc = existing.get(dt)
        if doc:
            st = compute_status(doc.expiry_date)
            counts[st] += 1
            docs_out.append(DocumentOut(
                id=doc.id,
                driver_id=doc.driver_id,
                doc_type=dt,
                doc_number=doc.doc_number,
                issue_date=doc.issue_date,
                expiry_date=doc.expiry_date,
                file_path=doc.file_path,
                file_name=doc.file_name,
                file_size_kb=doc.file_size_kb,
                status=st,
                uploaded_at=doc.uploaded_at,
            ))
        else:
            counts["missing"] += 1
            docs_out.append(DocumentOut(
                id=0,
                driver_id=driver_id,
                doc_type=dt,
                doc_number=None,
                issue_date=None,
                expiry_date=None,
                file_path=None,
                file_name=None,
                file_size_kb=None,
                status="missing",
                uploaded_at=None,
            ))

    return DocumentSummary(
        total=len(DOCUMENT_TYPES),
        valid=counts["valid"],
        expiring=counts["expiring"],
        expired=counts["expired"],
        missing=counts["missing"],
        documents=docs_out,
    )


@router.post("/{driver_id}/documents/upload", response_model=DocumentOut)
async def upload_document(
    driver_id:   int,
    doc_type:    str  = Form(...),
    doc_number:  Optional[str]  = Form(None),
    issue_date:  Optional[date] = Form(None),
    expiry_date: Optional[date] = Form(None),
    file:        UploadFile = File(...),
    db:          Session = Depends(get_db),
):
    """
    Upload or replace a driver document.
    - Validates file type (PDF / JPG / PNG only)
    - Enforces 10 MB size limit
    - Replaces old file on disk if re-uploading the same doc_type
    """
    # 1. Validate driver
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found.")

    # 2. Validate doc_type
    if doc_type not in DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid doc_type. Choose from: {', '.join(DOCUMENT_TYPES)}"
        )

    # 3. Validate file type
    validate_file(file)

    # 4. Save to disk (enforces 10 MB inside)
    file_path, file_name, size_kb = save_file(file, driver_id, doc_type)

    # 5. Upsert DB record
    existing_doc = (
        db.query(DriverDocument)
          .filter(
              DriverDocument.driver_id == driver_id,
              DriverDocument.doc_type  == doc_type,
          )
          .first()
    )

    if existing_doc:
        # Remove old file
        old = Path(existing_doc.file_path) if existing_doc.file_path else None
        if old and old.exists():
            old.unlink(missing_ok=True)
        # Update record
        existing_doc.doc_number  = doc_number
        existing_doc.issue_date  = issue_date
        existing_doc.expiry_date = expiry_date
        existing_doc.file_path   = file_path
        existing_doc.file_name   = file_name
        existing_doc.file_size_kb = size_kb
        existing_doc.uploaded_at = date.today()
        db.commit()
        db.refresh(existing_doc)
        doc_record = existing_doc
    else:
        doc_record = DriverDocument(
            driver_id   = driver_id,
            doc_type    = doc_type,
            doc_number  = doc_number,
            issue_date  = issue_date,
            expiry_date = expiry_date,
            file_path   = file_path,
            file_name   = file_name,
            file_size_kb = size_kb,
            uploaded_at = date.today(),
        )
        db.add(doc_record)
        db.commit()
        db.refresh(doc_record)

    return DocumentOut(
        id           = doc_record.id,
        driver_id    = doc_record.driver_id,
        doc_type     = doc_record.doc_type,
        doc_number   = doc_record.doc_number,
        issue_date   = doc_record.issue_date,
        expiry_date  = doc_record.expiry_date,
        file_path    = doc_record.file_path,
        file_name    = doc_record.file_name,
        file_size_kb = doc_record.file_size_kb,
        status       = compute_status(doc_record.expiry_date),
        uploaded_at  = doc_record.uploaded_at,
    )


@router.get("/{driver_id}/documents/{doc_type}/download")
def download_document(driver_id: int, doc_type: str, db: Session = Depends(get_db)):
    """Serve the stored file for viewing/downloading."""
    doc = (
        db.query(DriverDocument)
          .filter(
              DriverDocument.driver_id == driver_id,
              DriverDocument.doc_type  == doc_type,
          )
          .first()
    )
    if not doc or not doc.file_path:
        raise HTTPException(status_code=404, detail="Document not found.")

    path = Path(doc.file_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File missing from storage.")

    return FileResponse(
        path=str(path),
        filename=doc.file_name,
        media_type="application/octet-stream",
    )


@router.delete("/{driver_id}/documents/{doc_type}", status_code=204)
def delete_document(driver_id: int, doc_type: str, db: Session = Depends(get_db)):
    """Delete a document record and its file from disk."""
    doc = (
        db.query(DriverDocument)
          .filter(
              DriverDocument.driver_id == driver_id,
              DriverDocument.doc_type  == doc_type,
          )
          .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc.file_path:
        Path(doc.file_path).unlink(missing_ok=True)

    db.delete(doc)
    db.commit()


# ── SQLAlchemy MODEL (add to backend/app/models/document.py) ─────────────────
"""
Paste this into a new file:  backend/app/models/document.py

from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base

class DriverDocument(Base):
    __tablename__ = "driver_documents"

    id           = Column(Integer, primary_key=True, index=True)
    driver_id    = Column(Integer, ForeignKey("drivers.id"), nullable=False, index=True)
    doc_type     = Column(String(50), nullable=False)   # driving_licence, etc.
    doc_number   = Column(String(100), nullable=True)
    issue_date   = Column(Date, nullable=True)
    expiry_date  = Column(Date, nullable=True)
    file_path    = Column(String(500), nullable=True)
    file_name    = Column(String(255), nullable=True)
    file_size_kb = Column(Integer, nullable=True)
    uploaded_at  = Column(Date, nullable=True)
"""


# ── REGISTER IN main.py ───────────────────────────────────────────────────────
"""
In your backend/app/main.py, add:

    from app.routes.documents import router as documents_router
    app.include_router(documents_router)
"""