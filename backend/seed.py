import sys
import os

# Ensure the /backend directory is in the path so we can import app modules directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import User, RoleEnum, Contract, Truck, Client, Base, OwnerProfile
from passlib.context import CryptContext
from datetime import date

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def seed_database():
    print("Preparing to seed database...")
    db = SessionLocal()

    try:
        # Seed 3 Default Users
        users_to_seed = [
            {"username": "admin@ptyusuf.com", "password": "admin123", "role": RoleEnum.admin, "nama_lengkap": "System Admin"},
            {"username": "finance@ptyusuf.com", "password": "finance123", "role": RoleEnum.finance, "nama_lengkap": "Finance Manager"},
            {"username": "driver@ptyusuf.com", "password": "driver123", "role": RoleEnum.driver, "nama_lengkap": "Driver"},
        ]

        for u in users_to_seed:
            existing_user = db.query(User).filter(User.username == u["username"]).first()
            if not existing_user:
                new_user = User(
                    username=u["username"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                    nama_lengkap=u["nama_lengkap"]
                )
                db.add(new_user)
                print(f"Added user: {u['username']}")
            else:
                print(f"User {u['username']} already exists.")

        # Seed 1 Example Client
        example_client_npwp = "01.234.567.8-901.000"
        client = db.query(Client).filter(Client.npwp_klien == example_client_npwp).first()
        if not client:
            client = Client(
                nama_klien="PT. PATRA LOGISTIK",
                alamat_klien="Jl. Patra No. 1, Jakarta",
                npwp_klien=example_client_npwp
            )
            db.add(client)
            db.commit()
            db.refresh(client)
            print("Added example Client.")

        # Seed Contract Patra Logistik (berlaku sampai 2030)
        # Jika sudah ada kontrak lama, akan di-update agar sesuai.
        desired_contract_no = "KTR-755/PL000010/2024-50"
        known_contract_nos = [desired_contract_no, "KONTRAK-PATRA-001"]

        contract = (
            db.query(Contract)
            .filter(Contract.no_kontrak.in_(known_contract_nos))
            .order_by(Contract.contract_id.asc())
            .first()
        )

        if not contract:
            contract = Contract(
                client_id=client.client_id,
                no_kontrak=desired_contract_no,
                tgl_mulai=date(2024, 1, 1),
                tgl_selesai=date(2030, 12, 31),
                tarif_per_kl=150000.00
            )
            db.add(contract)
            print(f"Added Contract: {desired_contract_no}")
        else:
            contract.client_id = client.client_id
            contract.no_kontrak = desired_contract_no
            contract.tgl_mulai = date(2024, 1, 1)
            contract.tgl_selesai = date(2030, 12, 31)
            contract.tarif_per_kl = 150000.00
            print(f"Updated Contract to: {desired_contract_no} (valid thru 2030)")

        # Seed 4 Trucks (masing-masing 16 KL)
        trucks_to_seed = [
            {"plat_nomor": "B 1234 PAT", "kapasitas_kl": 16.0},
            {"plat_nomor": "B 1235 PAT", "kapasitas_kl": 16.0},
            {"plat_nomor": "B 1236 PAT", "kapasitas_kl": 16.0},
            {"plat_nomor": "B 1237 PAT", "kapasitas_kl": 16.0},
        ]

        for t in trucks_to_seed:
            truck = db.query(Truck).filter(Truck.plat_nomor == t["plat_nomor"]).first()
            if not truck:
                truck = Truck(
                    plat_nomor=t["plat_nomor"],
                    kapasitas_kl=t["kapasitas_kl"],
                )
                db.add(truck)
                print(f"Added truck: {t['plat_nomor']} ({t['kapasitas_kl']} KL)")
            else:
                if float(truck.kapasitas_kl) != float(t["kapasitas_kl"]):
                    truck.kapasitas_kl = t["kapasitas_kl"]
                    print(f"Updated truck capacity: {t['plat_nomor']} -> {t['kapasitas_kl']} KL")

        # Seed Owner Profile
        owner_profile = db.query(OwnerProfile).first()
        if not owner_profile:
            owner_profile = OwnerProfile(
                nama_perusahaan="PT. YUSUF ALDI LAKSANA",
                alamat="Jl. Contoh Alamat No. 123, Jakarta",
                npwp="01.234.567.8-901.000",
                email="info@ptyusuf.com",
                bank_nama="Bank Mandiri",
                bank_cabang="Jakarta",
                bank_rekening="1234567890",
                bank_atas_nama="PT. YUSUF ALDI LAKSANA"
            )
            db.add(owner_profile)
            print("Added Owner Profile: PT. YUSUF ALDI LAKSANA")
        else:
            print("Owner Profile already exists.")

        db.commit()
        print("Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
