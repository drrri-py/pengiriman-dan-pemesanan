from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas
from passlib.context import CryptContext
from decimal import Decimal
from datetime import date
from fastapi import HTTPException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- USERS ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        password_hash=hashed_password,
        nama_lengkap=user.nama_lengkap,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    data = user_update.model_dump(exclude_unset=True)
    if "password" in data:
        db_user.password_hash = get_password_hash(data.pop("password"))
    for field, value in data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return True

# --- OWNER PROFILE ---
def get_owner_profile(db: Session):
    return db.query(models.OwnerProfile).first()

def create_owner_profile(db: Session, profile: schemas.OwnerProfileCreate):
    db_profile = models.OwnerProfile(**profile.model_dump())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

# --- CLIENTS ---
def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Client).offset(skip).limit(limit).all()

def create_client(db: Session, client: schemas.ClientCreate):
    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client_update: schemas.ClientUpdate):
    db_client = db.query(models.Client).filter(models.Client.client_id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    data = client_update.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_client, field, value)
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int):
    db_client = db.query(models.Client).filter(models.Client.client_id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(db_client)
    db.commit()
    return True

# --- CONTRACTS ---
def get_contracts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Contract).offset(skip).limit(limit).all()

def create_contract(db: Session, contract: schemas.ContractCreate):
    db_contract = models.Contract(**contract.model_dump())
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

def update_contract(db: Session, contract_id: int, contract_update: schemas.ContractUpdate):
    db_contract = db.query(models.Contract).filter(models.Contract.contract_id == contract_id).first()
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    data = contract_update.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_contract, field, value)
    db.commit()
    db.refresh(db_contract)
    return db_contract

def delete_contract(db: Session, contract_id: int):
    db_contract = db.query(models.Contract).filter(models.Contract.contract_id == contract_id).first()
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    db.delete(db_contract)
    db.commit()
    return True

# --- TRUCKS ---
def get_truck_by_plat(db: Session, plat_nomor: str):
    return db.query(models.Truck).filter(models.Truck.plat_nomor == plat_nomor).first()

def get_trucks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Truck).offset(skip).limit(limit).all()

def create_truck(db: Session, truck: schemas.TruckCreate):
    db_truck = models.Truck(**truck.model_dump())
    db.add(db_truck)
    db.commit()
    db.refresh(db_truck)
    return db_truck

def update_truck(db: Session, truck_id: int, truck_update: schemas.TruckUpdate):
    db_truck = db.query(models.Truck).filter(models.Truck.truck_id == truck_id).first()
    if not db_truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    data = truck_update.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_truck, field, value)
    db.commit()
    db.refresh(db_truck)
    return db_truck

def delete_truck(db: Session, truck_id: int):
    db_truck = db.query(models.Truck).filter(models.Truck.truck_id == truck_id).first()
    if not db_truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    db.delete(db_truck)
    db.commit()
    return True

# --- SHIPMENTS (Operasional Harian) ---
def get_shipments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Shipment).offset(skip).limit(limit).all()

def create_shipment(db: Session, shipment: schemas.ShipmentCreate):
    # 1. Validation: Contract dates
    contract = db.query(models.Contract).filter(models.Contract.contract_id == shipment.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if shipment.tgl_pengiriman < contract.tgl_mulai or shipment.tgl_pengiriman > contract.tgl_selesai:
        raise HTTPException(status_code=400, detail="Tanggal pengiriman di luar masa berlaku kontrak")

    # 2. Validation: Truck capacity
    truck = db.query(models.Truck).filter(models.Truck.truck_id == shipment.truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    if shipment.volume_kl > truck.kapasitas_kl:
        raise HTTPException(status_code=400, detail=f"Volume KL melebihi kapasitas truk ({truck.kapasitas_kl} KL)")

    db_shipment = models.Shipment(**shipment.model_dump())
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

def update_shipment_status(db: Session, shipment_id: int, status_update: schemas.ShipmentUpdateStatus):
    db_shipment = db.query(models.Shipment).filter(models.Shipment.shipment_id == shipment_id).first()
    if not db_shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    db_shipment.status_verifikasi = status_update.status_verifikasi
    if status_update.bukti_surat_jalan:
        db_shipment.bukti_surat_jalan = status_update.bukti_surat_jalan
    
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

# --- BILLING (Invoices & Receipts) ---
def generate_invoice_number(db: Session, year: int) -> str:
    # Format: [Urutan]/YL-INV.PSI/-[Tahun]
    count = db.query(models.Invoice).filter(func.extract('year', models.Invoice.tgl_invoice) == year).count()
    urutan = count + 1
    return f"{urutan:02d}/YL-INV.PSI/-{year}"

def generate_receipt_number(db: Session, year: int) -> str:
    # Format: [Urutan]/YL-KWT.PS/I-[Tahun]
    count = db.query(models.Receipt).filter(func.extract('year', models.Receipt.tgl_bayar) == year).count()
    urutan = count + 1
    return f"{urutan:02d}/YL-KWT.PS/I-{year}"

def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Invoice).offset(skip).limit(limit).all()

def create_invoice(db: Session, invoice_req: schemas.InvoiceCreate):
    # Retrieve contract to get tarif_per_kl
    contract = db.query(models.Contract).filter(models.Contract.contract_id == invoice_req.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Accumulate KL from Verified shipments within period
    total_kl_query = db.query(func.sum(models.Shipment.volume_kl)).filter(
        models.Shipment.contract_id == invoice_req.contract_id,
        models.Shipment.status_verifikasi == schemas.VerificationStatusEnum.verified,
        models.Shipment.tgl_pengiriman >= invoice_req.periode_awal,
        models.Shipment.tgl_pengiriman <= invoice_req.periode_akhir
    ).scalar()

    total_kl_akumulasi = total_kl_query or 0.0

    if total_kl_akumulasi == 0:
        raise HTTPException(status_code=400, detail="Tidak ada pengiriman terverifikasi pada periode tersebut untuk ditagihkan.")

    dpp = Decimal(str(total_kl_akumulasi)) * contract.tarif_per_kl
    
    if invoice_req.is_tax_exempt:
        ppn_persen = Decimal('0.00')
        ppn_nilai = Decimal('0.00')
    else:
        ppn_persen = Decimal('12.00')
        ppn_nilai = dpp * (ppn_persen / Decimal('100.00'))
        
    total_tagihan = dpp + ppn_nilai

    tgl_invoice = date.today()
    no_invoice = generate_invoice_number(db, tgl_invoice.year)

    db_invoice = models.Invoice(
        contract_id=invoice_req.contract_id,
        no_invoice=no_invoice,
        tgl_invoice=tgl_invoice,
        periode_awal=invoice_req.periode_awal,
        periode_akhir=invoice_req.periode_akhir,
        total_kl_akumulasi=total_kl_akumulasi,
        is_tax_exempt=invoice_req.is_tax_exempt,
        dpp=dpp,
        ppn_persen=ppn_persen,
        ppn_nilai=ppn_nilai,
        total_tagihan=total_tagihan,
        status_pembayaran=schemas.PaymentStatusEnum.unpaid
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def get_invoice(db: Session, invoice_id: int):
    return db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()

def update_invoice(db: Session, invoice_id: int, invoice_update: schemas.InvoiceUpdate):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    data = invoice_update.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_invoice, field, value)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: int):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(db_invoice)
    db.commit()
    return True

def get_receipts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Receipt).offset(skip).limit(limit).all()

def create_receipt(db: Session, receipt_req: schemas.ReceiptCreate):
    # Check invoice
    invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == receipt_req.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.status_pembayaran == schemas.PaymentStatusEnum.paid:
        raise HTTPException(status_code=400, detail="Invoice already paid")

    # Update Invoice Status
    invoice.status_pembayaran = schemas.PaymentStatusEnum.paid

    # Create Receipt
    no_kwitansi = generate_receipt_number(db, receipt_req.tgl_bayar.year)
    db_receipt = models.Receipt(
        invoice_id=receipt_req.invoice_id,
        no_kwitansi=no_kwitansi,
        tgl_bayar=receipt_req.tgl_bayar,
        metode_bayar=receipt_req.metode_bayar
    )
    db.add(db_receipt)
    db.commit()
    db.refresh(db_receipt)
    return db_receipt
