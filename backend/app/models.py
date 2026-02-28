from sqlalchemy import Column, Integer, String, Date, Float, Numeric, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# Enums based on SQL
class RoleEnum(str, enum.Enum):
    admin = "admin"
    driver = "driver"
    finance = "finance"

class VerificationStatusEnum(str, enum.Enum):
    pending = "pending"
    verified = "verified"

class PaymentStatusEnum(str, enum.Enum):
    unpaid = "unpaid"
    paid = "paid"

# ... (owner_profile and user stay the same) ...
# 1. Grup Identitas & Pengguna
class OwnerProfile(Base):
    __tablename__ = "owner_profile"
    id = Column(Integer, primary_key=True, index=True)
    nama_perusahaan = Column(String(150), default='PT. YUSUF ALDI LAKSANA')
    alamat = Column(Text)
    npwp = Column(String(25))
    email = Column(String(100))
    bank_nama = Column(String(50))
    bank_cabang = Column(String(100))
    bank_rekening = Column(String(50))
    bank_atas_nama = Column(String(100))

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nama_lengkap = Column(String(100))
    role = Column(Enum(RoleEnum), nullable=False)

    shipments = relationship("Shipment", back_populates="driver")

# 2. Grup Klien & Kontrak
class Client(Base):
    __tablename__ = "clients"
    client_id = Column(Integer, primary_key=True, index=True)
    nama_klien = Column(String(150), default='PT. PATRA LOGISTIK')
    alamat_klien = Column(Text)
    npwp_klien = Column(String(25))

    contracts = relationship("Contract", back_populates="client")

class Contract(Base):
    __tablename__ = "contracts"
    contract_id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.client_id"))
    no_kontrak = Column(String(100), unique=True, index=True)
    tgl_mulai = Column(Date)
    tgl_selesai = Column(Date)
    tarif_per_kl = Column(Numeric(15, 2)) # Using Numeric for exact financial decimals

    client = relationship("Client", back_populates="contracts")
    shipments = relationship("Shipment", back_populates="contract")
    invoices = relationship("Invoice", back_populates="contract")

# 3. Grup Operasional (Lapangan)
class Truck(Base):
    __tablename__ = "trucks"
    truck_id = Column(Integer, primary_key=True, index=True)
    plat_nomor = Column(String(15), unique=True, index=True, nullable=False)
    kapasitas_kl = Column(Float, nullable=False) # Float is fine for volume

    shipments = relationship("Shipment", back_populates="truck")

class Shipment(Base):
    __tablename__ = "shipments"
    shipment_id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.contract_id"))
    truck_id = Column(Integer, ForeignKey("trucks.truck_id"))
    driver_id = Column(Integer, ForeignKey("users.user_id"))
    tgl_pengiriman = Column(Date)
    supply_point = Column(String(100), default='IT Balongan')
    tujuan_pengiriman = Column(Text)
    volume_kl = Column(Float, nullable=False) # Volume uses float
    bukti_surat_jalan = Column(String(255))
    status_verifikasi = Column(Enum(VerificationStatusEnum), default=VerificationStatusEnum.pending)

    contract = relationship("Contract", back_populates="shipments")
    truck = relationship("Truck", back_populates="shipments")
    driver = relationship("User", back_populates="shipments")

# 4. Grup Keuangan (Invoice & Kwitansi)
class Invoice(Base):
    __tablename__ = "invoices"
    invoice_id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.contract_id"))
    no_invoice = Column(String(100), unique=True, index=True)
    tgl_invoice = Column(Date)
    periode_awal = Column(Date)
    periode_akhir = Column(Date)
    total_kl_akumulasi = Column(Float)
    
    is_tax_exempt = Column(Boolean, default=False) # Flag for PP 49/2022
    dpp = Column(Numeric(15, 2))
    ppn_persen = Column(Numeric(5, 2), default=12.00)
    ppn_nilai = Column(Numeric(15, 2))
    total_tagihan = Column(Numeric(15, 2))
    
    no_faktur_pajak = Column(String(100))
    status_pembayaran = Column(Enum(PaymentStatusEnum), default=PaymentStatusEnum.unpaid)

    contract = relationship("Contract", back_populates="invoices")
    receipts = relationship("Receipt", back_populates="invoice")

class Receipt(Base):
    __tablename__ = "receipts"
    receipt_id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.invoice_id"))
    no_kwitansi = Column(String(100), unique=True, index=True)
    tgl_bayar = Column(Date)
    metode_bayar = Column(String(50), default='Transfer Bank')

    invoice = relationship("Invoice", back_populates="receipts")
