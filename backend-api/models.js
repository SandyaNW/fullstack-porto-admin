import { DataTypes } from 'sequelize';
import sequelize from './database.js';

// Project Model
export const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tech_stack: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  demo_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  repo_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'projects',
  timestamps: false,
});

// Profile Model
export const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  github_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  linkedin_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'profile',
  timestamps: false,
});

// Education Model
export const Education = sequelize.define('Education', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  school_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  degree: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  end_year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'educations',
  timestamps: false,
});

// Experience Model
export const Experience = sequelize.define('Experience', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  end_year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'experiences',
  timestamps: false,
});

// Certificate Model
export const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issuer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issued_date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  credential_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'certificates',
  timestamps: false,
});

// Contact Model
export const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'contacts',
  timestamps: false,
});

// Skill Model
export const Skill = sequelize.define('Skill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  level: {
    type: DataTypes.STRING, // e.g. "Beginner", "Intermediate", "Advanced", "Expert"
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING, // e.g. "Frontend", "Backend", "Tools", "Others"
    allowNull: false,
  },
}, {
  tableName: 'skills',
  timestamps: false,
});
