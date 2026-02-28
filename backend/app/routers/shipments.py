from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
import os
import uuid
import shutil

router = APIRouter()

@router.post("/", response_model=schemas.ShipmentResponse)
def create_shipment(shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    # Business logic (contract validation and capacity validation) is inside crud.py
    return crud.create_shipment(db=db, shipment=shipment)

@router.get("/", response_model=list[schemas.ShipmentResponse])
def read_shipments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_shipments(db, skip=skip, limit=limit)

@router.patch("/{shipment_id}/status", response_model=schemas.ShipmentResponse)
def update_status(shipment_id: int, status_update: schemas.ShipmentUpdateStatus, db: Session = Depends(get_db)):
    return crud.update_shipment_status(db=db, shipment_id=shipment_id, status_update=status_update)

@router.post("/{shipment_id}/proof", response_model=schemas.ShipmentResponse)
def upload_proof(shipment_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Generate unique filename to avoid overriding
        ext = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join("uploads", "proofs", unique_filename)
        
        # Save file to disk
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Get shipment directly from crud without reading all
        shipment = crud.get_shipments(db, skip=0, limit=1000) # Since we just want current status for update_shipment_status
        shipment = next((s for s in shipment if s.shipment_id == shipment_id), None)
        
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        status_update = schemas.ShipmentUpdateStatus(
            status_verifikasi=shipment.status_verifikasi,
            bukti_surat_jalan=f"/uploads/proofs/{unique_filename}"
        )
        return crud.update_shipment_status(db=db, shipment_id=shipment_id, status_update=status_update)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
