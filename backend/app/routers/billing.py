from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter()

# --- INVOICES ---
@router.post("/invoices/", response_model=schemas.InvoiceResponse)
def generate_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    # Business logic (Sum KL, DPP, PPN, Total) is inside crud.py
    return crud.create_invoice(db=db, invoice_req=invoice)

@router.get("/invoices/", response_model=list[schemas.InvoiceResponse])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_invoices(db, skip=skip, limit=limit)

@router.get("/invoices/{invoice_id}", response_model=schemas.InvoiceResponse)
def read_invoice(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = crud.get_invoice(db, invoice_id=invoice_id)
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@router.patch("/invoices/{invoice_id}", response_model=schemas.InvoiceResponse)
def update_invoice(invoice_id: int, invoice: schemas.InvoiceUpdate, db: Session = Depends(get_db)):
    return crud.update_invoice(db=db, invoice_id=invoice_id, invoice_update=invoice)

@router.delete("/invoices/{invoice_id}", response_model=dict)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    crud.delete_invoice(db=db, invoice_id=invoice_id)
    return {"ok": True}

# --- RECEIPTS ---
@router.post("/receipts/", response_model=schemas.ReceiptResponse)
def generate_receipt(receipt: schemas.ReceiptCreate, db: Session = Depends(get_db)):
    # Business logic (Change invoice status to paid, Generate receipt) is inside crud.py
    return crud.create_receipt(db=db, receipt_req=receipt)

@router.get("/receipts/", response_model=list[schemas.ReceiptResponse])
def read_receipts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_receipts(db, skip=skip, limit=limit)
