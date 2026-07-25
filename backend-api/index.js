import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import sequelize from './database.js';
import { Project, Profile, Education, Experience, Certificate, Contact, Skill } from './models.js';

const app = express();
const PORT = process.env.PORT || 8000;
const SECRET_KEY = process.env.JWT_SECRET || "rahasia-super-ganteng-banget-jangan-lupa-diganti";

const USERS = {
  "admin@admin.com": {
    username: "admin@admin.com",
    password: "123456",
    disabled: false
  }
};

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log("Supabase Storage integration active.");
} else {
  console.log("Supabase Storage credentials missing. Falling back to local file storage.");
  if (process.env.NODE_ENV !== 'production') {
    fs.mkdirSync('static/images', { recursive: true });
    fs.mkdirSync('static/files', { recursive: true });
  }
}

// Setup Multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Helper to upload file (supports both Supabase & local fallback)
async function uploadFileToStorage(file) {
  if (!file) return null;

  const fileExt = file.originalname.split('.').pop();
  const prefix = file.fieldname === 'avatar' ? 'avatar-' : file.fieldname === 'resume' ? 'resume-' : '';
  const fileName = `${prefix}${uuidv4()}.${fileExt}`;

  if (supabase) {
    const { data, error } = await supabase.storage
      .from('portfolio-assets')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  } else {
    const subFolder = file.fieldname === 'resume' ? 'static/files' : 'static/images';
    fs.mkdirSync(subFolder, { recursive: true });
    const localPath = `${subFolder}/${fileName}`;
    fs.writeFileSync(localPath, file.buffer);
    return localPath;
  }
}

// Helper to delete file (supports both Supabase & local fallback)
async function deleteFileFromStorage(fileUrl) {
  if (!fileUrl) return;

  if (supabase && fileUrl.startsWith('http') && fileUrl.includes('/storage/v1/object/public/portfolio-assets/')) {
    const fileName = fileUrl.split('/portfolio-assets/').pop();
    if (fileName) {
      const { error } = await supabase.storage
        .from('portfolio-assets')
        .remove([fileName]);
      if (error) {
        console.error(`Error deleting from Supabase Storage:`, error.message);
      }
    }
  } else {
    if (fs.existsSync(fileUrl)) {
      try {
        fs.unlinkSync(fileUrl);
      } catch (err) {
        console.error(`Error deleting local file ${fileUrl}:`, err);
      }
    }
  }
}

// Dynamic CORS Setup
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Policy Error: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for Lazy Database Sync in Serverless
let isDbSynced = false;
app.use(async (req, res, next) => {
  if (!isDbSynced) {
    try {
      await sequelize.sync();
      
      // Auto migration check
      try {
        await sequelize.query("ALTER TABLE profile ADD COLUMN resume TEXT;");
      } catch (err) {
        // Ignore if column already exists
      }
      
      isDbSynced = true;
    } catch (error) {
      console.error("Database connection failure:", error);
    }
  }
  next();
});

// Serve static files (Local dev only)
app.use('/static', express.static('static'));

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }
    const username = decoded.sub;
    if (!username || !USERS[username]) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }
    req.user = username;
    next();
  });
}

// ==================== AUTH ENDPOINTS ====================
app.post('/token', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ detail: "Username and password are required" });
  }

  const user = USERS[username];
  if (!user || user.password !== password || user.disabled) {
    return res.status(401).json({ detail: "Incorrect username or password" });
  }

  const accessToken = jwt.sign({ sub: user.username }, SECRET_KEY, { expiresIn: '30m' });
  return res.json({
    access_token: accessToken,
    token_type: "bearer",
    user: user.username
  });
});

app.get('/users/me', authenticateToken, (req, res) => {
  res.json({ username: req.user });
});

app.get('/test-protected', authenticateToken, (req, res) => {
  res.json({ message: "You have access!", user: req.user });
});

// ==================== CRUD PROJECTS ====================
app.get('/projects', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.skip) || 0;
    const projects = await Project.findAll({ limit, offset });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/projects/:project_id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.project_id);
    if (!project) {
      return res.status(404).json({ detail: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/projects', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, tech_stack, demo_url, repo_url } = req.body;
    let image_path = null;
    if (req.file) {
      image_path = await uploadFileToStorage(req.file);
    }

    const newProject = await Project.create({
      title,
      description,
      tech_stack,
      demo_url: demo_url || null,
      repo_url: repo_url || null,
      image: image_path
    });

    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/projects/:project_id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.project_id);
    if (!project) {
      return res.status(404).json({ detail: "Project not found" });
    }

    const { title, description, tech_stack, demo_url, repo_url } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (tech_stack !== undefined) project.tech_stack = tech_stack;
    if (demo_url !== undefined) project.demo_url = demo_url || null;
    if (repo_url !== undefined) project.repo_url = repo_url || null;

    if (req.file) {
      if (project.image) {
        await deleteFileFromStorage(project.image);
      }
      project.image = await uploadFileToStorage(req.file);
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/projects/:project_id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.project_id);
    if (!project) {
      return res.status(404).json({ detail: "Project not found" });
    }

    if (project.image) {
      await deleteFileFromStorage(project.image);
    }

    await project.destroy();
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CRUD PROFILE ====================
app.get('/profile', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        full_name: "Nama Lengkap Anda",
        job_title: "Job Title Anda",
        bio: "Deskripsi singkat tentang diri anda...",
        avatar: null,
        github_url: "https://github.com/",
        linkedin_url: "https://linkedin.com/"
      });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/profile', authenticateToken, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ detail: "Profile not found" });
    }

    const { full_name, job_title, bio, github_url, linkedin_url, delete_resume } = req.body;

    if (full_name !== undefined) profile.full_name = full_name;
    if (job_title !== undefined) profile.job_title = job_title || null;
    if (bio !== undefined) profile.bio = bio;
    if (github_url !== undefined) profile.github_url = github_url || null;
    if (linkedin_url !== undefined) profile.linkedin_url = linkedin_url || null;

    if (delete_resume === 'true' || delete_resume === true) {
      if (profile.resume) {
        await deleteFileFromStorage(profile.resume);
      }
      profile.resume = null;
    }

    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        if (profile.avatar) {
          await deleteFileFromStorage(profile.avatar);
        }
        profile.avatar = await uploadFileToStorage(req.files.avatar[0]);
      }
      if (req.files.resume && req.files.resume[0]) {
        if (profile.resume) {
          await deleteFileFromStorage(profile.resume);
        }
        profile.resume = await uploadFileToStorage(req.files.resume[0]);
      }
    }

    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CRUD EDUCATION ====================
app.get('/educations', async (req, res) => {
  try {
    const educations = await Education.findAll();
    res.json(educations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/educations', authenticateToken, upload.none(), async (req, res) => {
  try {
    const { school_name, degree, start_year, end_year, description } = req.body;
    const edu = await Education.create({
      school_name,
      degree,
      start_year,
      end_year,
      description: description || null
    });
    res.status(201).json(edu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/educations/:id', authenticateToken, upload.none(), async (req, res) => {
  try {
    const edu = await Education.findByPk(req.params.id);
    if (!edu) {
      return res.status(404).json({ detail: "Education not found" });
    }

    const { school_name, degree, start_year, end_year, description } = req.body;

    if (school_name !== undefined) edu.school_name = school_name;
    if (degree !== undefined) edu.degree = degree;
    if (start_year !== undefined) edu.start_year = start_year;
    if (end_year !== undefined) edu.end_year = end_year;
    if (description !== undefined) edu.description = description || null;

    await edu.save();
    res.json(edu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/educations/:id', authenticateToken, async (req, res) => {
  try {
    const edu = await Education.findByPk(req.params.id);
    if (!edu) {
      return res.status(404).json({ detail: "Education not found" });
    }
    await edu.destroy();
    res.json({ message: "Education deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CRUD EXPERIENCE ====================
app.get('/experiences', async (req, res) => {
  try {
    const experiences = await Experience.findAll();
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/experiences', authenticateToken, upload.none(), async (req, res) => {
  try {
    const { company_name, role, start_year, end_year, description } = req.body;
    const exp = await Experience.create({
      company_name,
      role,
      start_year,
      end_year,
      description: description || null
    });
    res.status(201).json(exp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/experiences/:id', authenticateToken, upload.none(), async (req, res) => {
  try {
    const exp = await Experience.findByPk(req.params.id);
    if (!exp) {
      return res.status(404).json({ detail: "Experience not found" });
    }

    const { company_name, role, start_year, end_year, description } = req.body;

    if (company_name !== undefined) exp.company_name = company_name;
    if (role !== undefined) exp.role = role;
    if (start_year !== undefined) exp.start_year = start_year;
    if (end_year !== undefined) exp.end_year = end_year;
    if (description !== undefined) exp.description = description || null;

    await exp.save();
    res.json(exp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/experiences/:id', authenticateToken, async (req, res) => {
  try {
    const exp = await Experience.findByPk(req.params.id);
    if (!exp) {
      return res.status(404).json({ detail: "Experience not found" });
    }
    await exp.destroy();
    res.json({ message: "Experience deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CRUD CERTIFICATES ====================
app.get('/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.findAll();
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/certificates', authenticateToken, upload.none(), async (req, res) => {
  try {
    const { title, issuer, issued_date, credential_url } = req.body;
    const cert = await Certificate.create({
      title,
      issuer,
      issued_date,
      credential_url: credential_url || null
    });
    res.status(201).json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/certificates/:id', authenticateToken, upload.none(), async (req, res) => {
  try {
    const cert = await Certificate.findByPk(req.params.id);
    if (!cert) {
      return res.status(404).json({ detail: "Certificate not found" });
    }

    const { title, issuer, issued_date, credential_url } = req.body;

    if (title !== undefined) cert.title = title;
    if (issuer !== undefined) cert.issuer = issuer;
    if (issued_date !== undefined) cert.issued_date = issued_date;
    if (credential_url !== undefined) cert.credential_url = credential_url || null;

    await cert.save();
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/certificates/:id', authenticateToken, async (req, res) => {
  try {
    const cert = await Certificate.findByPk(req.params.id);
    if (!cert) {
      return res.status(404).json({ detail: "Certificate not found" });
    }
    await cert.destroy();
    res.json({ message: "Certificate deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CRUD CONTACTS ====================
app.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.findAll();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/contacts', authenticateToken, upload.none(), async (req, res) => {
  try {
    const { platform, value, url } = req.body;
    const contact = await Contact.create({ platform, value, url });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/contacts/:id', authenticateToken, upload.none(), async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ detail: "Contact not found" });
    }

    const { platform, value, url } = req.body;

    if (platform !== undefined) contact.platform = platform;
    if (value !== undefined) contact.value = value;
    if (url !== undefined) contact.url = url;

    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ detail: "Contact not found" });
    }
    await contact.destroy();
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CRUD SKILLS ====================
app.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.findAll();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/skills', authenticateToken, upload.none(), async (req, res) => {
  try {
    const { name, level, category } = req.body;
    if (!name || !level || !category) {
      return res.status(400).json({ detail: "Name, level, and category are required" });
    }
    const skill = await Skill.create({ name, level, category });
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/skills/:id', authenticateToken, upload.none(), async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) {
      return res.status(404).json({ detail: "Skill not found" });
    }

    const { name, level, category } = req.body;

    if (name !== undefined) skill.name = name;
    if (level !== undefined) skill.level = level;
    if (category !== undefined) skill.category = category;

    await skill.save();
    res.json(skill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/skills/:id', authenticateToken, async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) {
      return res.status(404).json({ detail: "Skill not found" });
    }
    await skill.destroy();
    res.json({ message: "Skill deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROOT ENDPOINT ====================
app.get('/', (req, res) => {
  res.json({
    message: "Portfolio API is running",
    status: "success",
    auth: "simple"
  });
});

// ==================== VERCEL EXPORT & LOCAL LISTEN ====================
// Only run app.listen when developing locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

// Export default app for Vercel Serverless Function
export default app;