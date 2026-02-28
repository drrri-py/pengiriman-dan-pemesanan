from app.database import engine
from app.models import Base

def test_connection():
    try:
        # Reflect tables to see if they exist
        Base.metadata.reflect(bind=engine)
        tables = Base.metadata.tables.keys()
        print("Koneksi berhasil!")
        print("Tabel yang ada di database:", list(tables))
    except Exception as e:
        print("Gagal koneksi:", e)

if __name__ == "__main__":
    test_connection()
