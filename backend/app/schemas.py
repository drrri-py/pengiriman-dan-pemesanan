from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from enum import Enum
from decimal import Decimal

# --- ENUMS ---
class RoleEnum(str, Enum):
    admin = "admin"
    driver = "driver"
    finance = "finance"

class VerificationStatusEnum(str, Enum):
    pending = "pending"
    verified = "verified"

class PaymentStatusEnum(str, Enum):
    unpaid = "unpaid"
    paid = "paid"

# --- OWNER PROFILE ---
class OwnerProfileBase(BaseModel):
    nama_perusahaan: str = 'PT. YUSUF ALDI LAKSANA'
    alamat: Optional[str] = None
    npwp: Optional[str] = None
    email: Optional[str] = None
    bank_nama: Optional[str] = None
    bank_cabang: Optional[str] = None
    bank_rekening: Optional[str] = None
    bank_atas_nama: Optional[str] = None

class OwnerProfileCreate(OwnerProfileBase):
    pass

class OwnerProfileUpdate(OwnerProfileBase):
    pass

class OwnerProfileResponse(OwnerProfileBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- USERS ---
class UserBase(BaseModel):
    username: str
    nama_lengkap: Optional[str] = None
    role: RoleEnum

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    nama_lengkap: Optional[str] = None
    role: Optional[RoleEnum] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    user_id: int
    model_config = ConfigDict(from_attributes=True)

# --- CLIENTS ---
class ClientBase(BaseModel):
    nama_klien: str = 'PT. PATRA LOGISTIK'
    alamat_klien: Optional[str] = None
    npwp_klien: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    nama_klien: Optional[str] = None
    alamat_klien: Optional[str] = None
    npwp_klien: Optional[str] = None

class ClientResponse(ClientBase):
    client_id: int
    model_config = ConfigDict(from_attributes=True)

# --- CONTRACTS ---
class ContractBase(BaseModel):
    client_id: int
    no_kontrak: str
    tgl_mulai: date
    tgl_selesai: date
    tarif_per_kl: Decimal

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    client_id: Optional[int] = None
    no_kontrak: Optional[str] = None
    tgl_mulai: Optional[date] = None
    tgl_selesai: Optional[date] = None
    tarif_per_kl: Optional[Decimal] = None

class ContractResponse(ContractBase):
    contract_id: int
    model_config = ConfigDict(from_attributes=True)

# --- TRUCKS ---
class TruckBase(BaseModel):
    plat_nomor: str
    kapasitas_kl: float

class TruckCreate(TruckBase):
    pass

class TruckUpdate(BaseModel):
    plat_nomor: Optional[str] = None
    kapasitas_kl: Optional[float] = None

class TruckResponse(TruckBase):
    truck_id: int
    model_config = ConfigDict(from_attributes=True)

# --- SHIPMENTS ---
class ShipmentBase(BaseModel):
    contract_id: int
    truck_id: int
    driver_id: int
    tgl_pengiriman: date
    supply_point: str = 'IT Balongan'
    tujuan_pengiriman: Optional[str] = None
    volume_kl: float
    bukti_surat_jalan: Optional[str] = None

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdateStatus(BaseModel):
    status_verifikasi: VerificationStatusEnum
    bukti_surat_jalan: Optional[str] = None

class ShipmentResponse(ShipmentBase):
    shipment_id: int
    status_verifikasi: VerificationStatusEnum
    model_config = ConfigDict(from_attributes=True)

# --- INVOICES ---
class InvoiceBase(BaseModel):
    contract_id: int
    periode_awal: date
    periode_akhir: date
    is_tax_exempt: bool = False

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    status_pembayaran: Optional[PaymentStatusEnum] = None
    no_faktur_pajak: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    invoice_id: int
    no_invoice: str
    tgl_invoice: date
    total_kl_akumulasi: float
    is_tax_exempt: bool
    dpp: Decimal
    ppn_persen: Decimal
    ppn_nilai: Decimal
    total_tagihan: Decimal
    no_faktur_pajak: Optional[str] = None
    status_pembayaran: PaymentStatusEnum
    model_config = ConfigDict(from_attributes=True)

# --- RECEIPTS ---
class ReceiptBase(BaseModel):
    invoice_id: int
    tgl_bayar: date
    metode_bayar: str = 'Transfer Bank'

class ReceiptCreate(ReceiptBase):
    pass

class ReceiptResponse(ReceiptBase):
    receipt_id: int
    no_kwitansi: str
    model_config = ConfigDict(from_attributes=True)
