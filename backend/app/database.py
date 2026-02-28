from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Menghubungkan ke PostgreSQL dengan database 'ptyusuf'
# Ganti dengan username dan password PostgreSQL lokal Anda.
# Default di sini menggunakan postgres:postgres (user postgres, tidak ada password atau postgres) pada localhost
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:123456@localhost:5432/ptyusuf"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency untuk mendapatkan session DB di FastAPI per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
