"""
Upload routes — generic endpoint for uploading images and files.
"""
import os
import shutil
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from app.routes.auth import get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post(
    "/",
    summary="Upload a file and get a URL",
)
async def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """
    Accepts a multipart/form-data file upload.
    Saves it to a local 'uploads' directory and returns the public URL.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Ensure a safe, unique filename
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{uuid.uuid4().hex}_{int(datetime.utcnow().timestamp())}{ext}"
    
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/uploads/{safe_filename}"}
