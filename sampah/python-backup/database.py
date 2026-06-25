from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Nanti akan muncul file "portfolio.db" otomatis
SQLALCHEMY_DATABASE_URL = "sqlite:///./portfolio.db"

# Kalau pake MySQL nanti tinggal ganti baris di atas jadi:
# SQLALCHEMY_DATABASE_URL = "mysql+pymysql://user:pass@localhost/db_name"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()