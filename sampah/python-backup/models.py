from sqlalchemy import Column, Integer, String, Text
from database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    image = Column(String, nullable=True) # Menyimpan nama file gambar
    tech_stack = Column(String)
    demo_url = Column(String, nullable=True)
    repo_url = Column(String, nullable=True)

class Profile(Base):
    __tablename__ = "profile"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    job_title = Column(String, nullable=True)
    bio = Column(Text)
    avatar = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)


class Education(Base):
    __tablename__ = "educations"
    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(String)     # Nama Sekolah/Univ
    degree = Column(String)          # Gelar / Jurusan
    start_year = Column(String)      # Tahun Mulai (misal "2019")
    end_year = Column(String)        # Tahun Selesai (misal "2023" atau "Present")
    description = Column(Text, nullable=True)

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String)
    role = Column(String)            # Posisi (misal "Frontend Dev")
    start_year = Column(String)
    end_year = Column(String)
    description = Column(Text, nullable=True)

class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)           # Nama Sertifikat
    issuer = Column(String)          # Penerbit (misal "Dicoding", "Coursera")
    issued_date = Column(String)     # Tanggal terbit
    credential_url = Column(String, nullable=True) # Link ke sertifikat

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String)  # Misal: "WhatsApp", "Email", "Instagram"
    value = Column(String)     # Teks yang tampil, Misal: "0812-3456-7890" atau "hello@sandya.com"
    url = Column(String)       # Link tujuannya, Misal: "https://wa.me/62812..." atau "mailto:hello@..."