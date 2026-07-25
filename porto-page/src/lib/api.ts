export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Express serves static files at /static/... so if path is static/images/..., we join it
  return `${API_BASE_URL}/${imagePath}`;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string | null;
  tech_stack: string;
  demo_url: string | null;
  repo_url: string | null;
}

export interface Profile {
  id: number;
  full_name: string;
  job_title: string | null;
  bio: string;
  avatar: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  resume: string | null;
}

export interface Education {
  id: number;
  school_name: string;
  degree: string;
  start_year: string;
  end_year: string;
  description: string | null;
}

export interface Experience {
  id: number;
  company_name: string;
  role: string;
  start_year: string;
  end_year: string;
  description: string | null;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issued_date: string;
  credential_url: string | null;
}

export interface Contact {
  id: number;
  platform: string;
  value: string;
  url: string;
}

export interface Skill {
  id: number;
  name: string;
  level: string;
  category: string;
}

// Fetch helper functions (Next.js server-compatible)
async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }
  return res.json();
}


export async function getProjects(): Promise<Project[]> {
  return fetchFromApi<Project[]>('projects');
}

export async function getProfile(): Promise<Profile> {
  return fetchFromApi<Profile>('profile');
}

export async function getEducations(): Promise<Education[]> {
  return fetchFromApi<Education[]>('educations');
}

export async function getExperiences(): Promise<Experience[]> {
  return fetchFromApi<Experience[]>('experiences');
}

export async function getCertificates(): Promise<Certificate[]> {
  return fetchFromApi<Certificate[]>('certificates');
}

export async function getContacts(): Promise<Contact[]> {
  return fetchFromApi<Contact[]>('contacts');
}

export async function getSkills(): Promise<Skill[]> {
  return fetchFromApi<Skill[]>('skills');
}
