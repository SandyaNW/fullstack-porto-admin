from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# Import file lokal yang sudah kita buat
import models, database

# 1. Inisialisasi Database & App
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# 2. Konfigurasi CORS
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Setup Folder Static untuk Gambar
os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================== KONFIGURASI AUTH YANG FIX ====================
SECRET_KEY = "rahasia-super-ganteng-banget-jangan-lupa-diganti"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# APPROACH SIMPLE - TANPA HASH COMPLEX
class AuthHandler:
    def __init__(self):
        self.users = {
            "admin@admin.com": {
                "username": "admin@admin.com", 
                "password": "123456",  # Plain password untuk development
                "disabled": False
            }
        }
    
    def authenticate_user(self, username: str, password: str):
        if username in self.users:
            user = self.users[username]
            if user["password"] == password and not user["disabled"]:
                return user
        return None
    
    def create_access_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

auth_handler = AuthHandler()

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    if username not in auth_handler.users:
        raise credentials_exception
        
    return username

# ==================== ENDPOINT AUTH ====================
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth_handler.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
        )
    
    access_token = auth_handler.create_access_token(data={"sub": user["username"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user["username"]
    }

@app.get("/users/me")
async def read_users_me(current_user: str = Depends(get_current_user)):
    return {"username": current_user}

# ==================== HELPER FILE UPLOAD ====================
def save_uploaded_file(upload_file: UploadFile) -> str:
    filename = f"{uuid.uuid4()}-{upload_file.filename}"
    file_location = f"static/images/{filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return f"static/images/{filename}"

# ==================== CRUD PROJECTS ====================
@app.get("/projects")
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    return projects

@app.get("/projects/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.post("/projects")
def create_project(
    title: str = Form(...),
    description: str = Form(...),
    tech_stack: str = Form(...),
    demo_url: Optional[str] = Form(None),
    repo_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    image_path = None
    if image:
        image_path = save_uploaded_file(image)

    new_project = models.Project(
        title=title,
        description=description,
        tech_stack=tech_stack,
        demo_url=demo_url,
        repo_url=repo_url,
        image=image_path
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.image and os.path.exists(project.image):
        os.remove(project.image)

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@app.patch("/projects/{project_id}")
def update_project(
    project_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tech_stack: Optional[str] = Form(None),
    demo_url: Optional[str] = Form(None),
    repo_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if title: project.title = title
    if description: project.description = description
    if tech_stack: project.tech_stack = tech_stack
    if demo_url: project.demo_url = demo_url
    if repo_url: project.repo_url = repo_url
    
    if image:
        if project.image and os.path.exists(project.image):
            os.remove(project.image)
        new_image_path = save_uploaded_file(image)
        project.image = new_image_path

    db.commit()
    db.refresh(project)
    return project

# ==================== CRUD PROFILE ====================
@app.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(models.Profile).first()
    if not profile:
        new_profile = models.Profile(
            full_name="Nama Lengkap Anda",
            bio="Deskripsi singkat tentang diri anda...",
            avatar=None,
            github_url="https://github.com/",
            linkedin_url="https://linkedin.com/"
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        return new_profile
    return profile

@app.patch("/profile")
def update_profile(
    full_name: Optional[str] = Form(None),
    job_title: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    profile = db.query(models.Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if full_name: profile.full_name = full_name
    if job_title: profile.job_title = job_title
    if bio: profile.bio = bio
    if github_url: profile.github_url = github_url
    if linkedin_url: profile.linkedin_url = linkedin_url
    
    if avatar:
        if profile.avatar and os.path.exists(profile.avatar):
            os.remove(profile.avatar)
        filename = f"avatar-{uuid.uuid4()}-{avatar.filename}"
        file_location = f"static/images/{filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        profile.avatar = f"static/images/{filename}"

    db.commit()
    db.refresh(profile)
    return profile

# ==================== CRUD EDUCATION ====================
@app.get("/educations")
def get_educations(db: Session = Depends(get_db)):
    return db.query(models.Education).all()

@app.post("/educations")
def create_education(
    school_name: str = Form(...), 
    degree: str = Form(...),
    start_year: str = Form(...), 
    end_year: str = Form(...),
    description: Optional[str] = Form(None), 
    db: Session = Depends(get_db), 
    current_user: str = Depends(get_current_user)
):
    edu = models.Education(
        school_name=school_name, 
        degree=degree, 
        start_year=start_year, 
        end_year=end_year, 
        description=description
    )
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

@app.delete("/educations/{id}")
def delete_education(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    education = db.query(models.Education).filter(models.Education.id == id).first()
    if not education:
        raise HTTPException(status_code=404, detail="Education not found")
    
    db.delete(education)
    db.commit()
    return {"message": "Education deleted successfully"}

@app.patch("/educations/{id}")
def update_education(
    id: int, 
    school_name: Optional[str] = Form(None), 
    degree: Optional[str] = Form(None), 
    start_year: Optional[str] = Form(None), 
    end_year: Optional[str] = Form(None), 
    description: Optional[str] = Form(None), 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    edu = db.query(models.Education).filter(models.Education.id == id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    
    if school_name: edu.school_name = school_name
    if degree: edu.degree = degree
    if start_year: edu.start_year = start_year
    if end_year: edu.end_year = end_year
    if description: edu.description = description
    
    db.commit()
    db.refresh(edu)
    return edu

# ==================== CRUD EXPERIENCE ====================
@app.get("/experiences")
def get_experiences(db: Session = Depends(get_db)):
    return db.query(models.Experience).all()

@app.post("/experiences")
def create_experience(
    company_name: str = Form(...), 
    role: str = Form(...),
    start_year: str = Form(...), 
    end_year: str = Form(...),
    description: Optional[str] = Form(None), 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    exp = models.Experience(
        company_name=company_name, 
        role=role, 
        start_year=start_year, 
        end_year=end_year, 
        description=description
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@app.delete("/experiences/{id}")
def delete_experience(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    experience = db.query(models.Experience).filter(models.Experience.id == id).first()
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    db.delete(experience)
    db.commit()
    return {"message": "Experience deleted successfully"}

@app.patch("/experiences/{id}")
def update_experience(
    id: int, 
    company_name: Optional[str] = Form(None), 
    role: Optional[str] = Form(None), 
    start_year: Optional[str] = Form(None), 
    end_year: Optional[str] = Form(None), 
    description: Optional[str] = Form(None), 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    exp = db.query(models.Experience).filter(models.Experience.id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    if company_name: exp.company_name = company_name
    if role: exp.role = role
    if start_year: exp.start_year = start_year
    if end_year: exp.end_year = end_year
    if description: exp.description = description
    
    db.commit()
    db.refresh(exp)
    return exp

# ==================== CRUD CERTIFICATES ====================
@app.get("/certificates")
def get_certificates(db: Session = Depends(get_db)):
    return db.query(models.Certificate).all()

@app.post("/certificates")
def create_certificate(
    title: str = Form(...), 
    issuer: str = Form(...), 
    issued_date: str = Form(...), 
    credential_url: Optional[str] = Form(None), 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    cert = models.Certificate(
        title=title, 
        issuer=issuer, 
        issued_date=issued_date, 
        credential_url=credential_url
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@app.delete("/certificates/{id}")
def delete_certificate(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    certificate = db.query(models.Certificate).filter(models.Certificate.id == id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    db.delete(certificate)
    db.commit()
    return {"message": "Certificate deleted successfully"}

@app.patch("/certificates/{id}")
def update_certificate(
    id: int, 
    title: Optional[str] = Form(None), 
    issuer: Optional[str] = Form(None), 
    issued_date: Optional[str] = Form(None), 
    credential_url: Optional[str] = Form(None), 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    cert = db.query(models.Certificate).filter(models.Certificate.id == id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    if title: cert.title = title
    if issuer: cert.issuer = issuer
    if issued_date: cert.issued_date = issued_date
    if credential_url: cert.credential_url = credential_url
    
    db.commit()
    db.refresh(cert)
    return cert

# ==================== CRUD CONTACTS ====================
@app.get("/contacts")
def get_contacts(db: Session = Depends(get_db)):
    return db.query(models.Contact).all()

@app.post("/contacts")
def create_contact(
    platform: str = Form(...), 
    value: str = Form(...), 
    url: str = Form(...), 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    contact = models.Contact(platform=platform, value=value, url=url)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@app.delete("/contacts/{id}")
def delete_contact(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    contact = db.query(models.Contact).filter(models.Contact.id == id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted successfully"}

@app.patch("/contacts/{id}")
def update_contact(
    id: int, 
    platform: Optional[str] = Form(None), 
    value: Optional[str] = Form(None), 
    url: Optional[str] = Form(None), 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    contact = db.query(models.Contact).filter(models.Contact.id == id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    if platform: contact.platform = platform
    if value: contact.value = value
    if url: contact.url = url
    
    db.commit()
    db.refresh(contact)
    return contact

# ==================== ROOT ENDPOINT ====================
@app.get("/")
async def root():
    return {"message": "Portfolio API is running", "status": "success", "auth": "simple"}

# Test endpoint untuk verify auth works
@app.get("/test-protected")
async def test_protected(current_user: str = Depends(get_current_user)):
    return {"message": "You have access!", "user": current_user}