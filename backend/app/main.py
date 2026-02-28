from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app import models
from app.database import engine
from app.routers import users, contracts, shipments, billing, auth
import os

os.makedirs("uploads/proofs", exist_ok=True)

# Buat semua table di database secara otomatis jika belum ada
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PT Yusuf Aldi Laksana API",
    description="Backend operasional dan finansial untuk mengelola pengiriman BBM Patra Logistik.",
    version="1.0.0"
)

# Konfigurasi CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api", tags=["Users & Profiles"])
app.include_router(contracts.router, prefix="/api", tags=["Master Data"])
app.include_router(shipments.router, prefix="/api/shipments", tags=["Operasional Harian"])
app.include_router(billing.router, prefix="/api/finance", tags=["Finance"])

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "Selamat datang di API PT Yusuf Aldi Laksana. Buka /docs untuk dokumentasi."}
