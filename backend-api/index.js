import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import sequelize from './database.js';
import { Project, Profile, Education, Experience, Certificate, Contact } from './models.js';

const app = express();
const PORT = process.env.PORT || 8000;
const SECRET_KEY = "rahasia-super-ganteng-banget-jangan-lupa-diganti";

const USERS = {
  "admin@admin.com": {
    username: "admin@admin.com",
    password: "123456",
    disabled: false
  }
};

// Ensure static/images directory exists
fs.mkdirSync('static/images', { recursive: true });

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'static/images/');
  },
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'avatar' ? 'avatar-' : '';
    cb(null, `${prefix}${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Helper to delete old file
function deleteFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }
}

// 2. Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
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
// Note: OAuth2PasswordRequestForm sends data as x-www-form-urlencoded
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
      image_path = `static/images/${req.file.filename}`;
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
        deleteFile(project.image);
      }
      project.image = `static/images/${req.file.filename}`;
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
      deleteFile(project.image);
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

app.patch('/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ detail: "Profile not found" });
    }

    const { full_name, job_title, bio, github_url, linkedin_url } = req.body;

    if (full_name !== undefined) profile.full_name = full_name;
    if (job_title !== undefined) profile.job_title = job_title || null;
    if (bio !== undefined) profile.bio = bio;
    if (github_url !== undefined) profile.github_url = github_url || null;
    if (linkedin_url !== undefined) profile.linkedin_url = linkedin_url || null;

    if (req.file) {
      if (profile.avatar) {
        deleteFile(profile.avatar);
      }
      profile.avatar = `static/images/${req.file.filename}`;
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

// ==================== ROOT ENDPOINT ====================
app.get('/', (req, res) => {
  res.json({
    message: "Portfolio API is running",
    status: "success",
    auth: "simple"
  });
});

// Synchronize Database and start server
sequelize.sync()
  .then(() => {
    console.log("Database connected and synchronized successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Unable to connect/sync database:", err);
  });
