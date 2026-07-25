import Image from 'next/image';
import Navbar from '@/components/Navbar';
import {
  getProfile, getProjects, getExperiences, getEducations,
  getCertificates, getContacts, getSkills, getImageUrl,
  Project, Profile, Experience, Education, Certificate, Contact, Skill
} from '@/lib/api';

const fallbackProfile: Profile = {
  id: 1, full_name: "Sandya NW", job_title: "Fullstack Web Developer",
  bio: "I design and build beautiful, responsive, and high-performance web applications.",
  avatar: null, github_url: "https://github.com", linkedin_url: "https://linkedin.com", resume: null
};
const fallbackProjects: Project[] = [{
  id: 1, title: "Portfolio Admin Dashboard",
  description: "A secure, feature-rich admin panel to manage portfolio content dynamically.",
  tech_stack: "React, Refine, Express, SQLite", demo_url: null, repo_url: "https://github.com", image: null
}];
const fallbackExperiences: Experience[] = [{
  id: 1, company_name: "Tech Solutions", role: "Fullstack Developer",
  start_year: "2023", end_year: "Present", description: "Building scalable systems."
}];
const fallbackEducations: Education[] = [{
  id: 1, school_name: "Universitas Indonesia", degree: "Computer Science",
  start_year: "2020", end_year: "2024", description: "Web Dev & Database Systems."
}];
const fallbackCertificates: Certificate[] = [{
  id: 1, title: "Fullstack Web Development", issuer: "Dicoding Academy",
  issued_date: "2024", credential_url: "https://dicoding.com"
}];
const fallbackContacts: Contact[] = [
  { id: 1, platform: "Email", value: "hello@sandya.com", url: "mailto:hello@sandya.com" },
  { id: 2, platform: "LinkedIn", value: "Sandya NW", url: "https://linkedin.com" }
];

const fallbackSkills: Skill[] = [
  { id: 1, name: "React", level: "Expert", category: "Frontend" },
  { id: 2, name: "Next.js", level: "Expert", category: "Frontend" },
  { id: 3, name: "Tailwind CSS", level: "Expert", category: "Frontend" },
  { id: 4, name: "Node.js", level: "Advanced", category: "Backend" },
  { id: 5, name: "Express", level: "Advanced", category: "Backend" },
  { id: 6, name: "PostgreSQL", level: "Intermediate", category: "Backend" },
  { id: 7, name: "Git & GitHub", level: "Expert", category: "Tools/DevOps" },
  { id: 8, name: "Docker", level: "Intermediate", category: "Tools/DevOps" },
];

async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`safeFetch failed for function: ${fn.name || 'anonymous'}`, error);
    return fallback;
  }
}

function getContactIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes('email')) {
    return (
      <svg className="w-5 h-5 text-violet-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (p.includes('whatsapp') || p.includes('wa')) {
    return (
      <svg className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.559 5.338-11.894 11.897-11.894 3.176.001 6.165 1.237 8.407 3.481 2.245 2.244 3.48 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-2.014-.001-3.997-.511-5.753-1.485l-6.238 1.636zm6.735-3.327c1.642.975 3.25 1.483 4.908 1.484 5.378 0 9.756-4.378 9.759-9.756.002-2.605-1.012-5.054-2.859-6.901-1.848-1.848-4.298-2.862-6.905-2.863-5.38 0-9.76 4.38-9.762 9.761-.001 1.704.457 3.364 1.325 4.819l-.974 3.565 3.659-.96c1.5.819 2.898 1.151 4.549 1.151zm9.324-6.843c-.265-.133-1.57-.775-1.812-.862-.243-.088-.419-.133-.596.133-.177.265-.684.862-.839 1.039-.155.177-.31.199-.575.066-1.579-.79-2.73-1.391-3.782-3.197-.278-.476.278-.442.796-1.478.088-.177.044-.332-.022-.465-.066-.133-.596-1.436-.816-1.966-.215-.518-.432-.448-.597-.456-.153-.008-.33-.008-.507-.008-.177 0-.464.066-.707.332-.243.265-.928.906-.928 2.21 0 1.304.949 2.563 1.082 2.74.133.177 1.867 2.851 4.524 3.998.632.273 1.127.436 1.513.559.635.202 1.212.174 1.669.107.509-.074 1.57-.641 1.791-1.26.221-.619.221-1.15.155-1.26-.066-.11-.243-.177-.508-.31z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }
  if (p.includes('github')) {
    return (
      <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function getContactUrl(platform: string, url: string, value: string): string {
  const p = platform.toLowerCase();
  if (p.includes('email')) {
    return url.startsWith('mailto:') ? url : `mailto:${value}`;
  }
  if (p.includes('whatsapp') || p.includes('wa')) {
    if (url.startsWith('http')) return url;
    const cleanNum = value.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNum}`;
  }
  if (p.includes('linkedin') && !url.startsWith('http')) {
    return `https://linkedin.com/in/${value}`;
  }
  if (p.includes('github') && !url.startsWith('http')) {
    return `https://github.com/${value}`;
  }
  return url;
}

export default async function Home() {
  const profile = await safeFetch(getProfile, fallbackProfile);
  const projects = await safeFetch(getProjects, fallbackProjects);
  const experiences = await safeFetch(getExperiences, fallbackExperiences);
  const educations = await safeFetch(getEducations, fallbackEducations);
  const certificates = await safeFetch(getCertificates, fallbackCertificates);
  const contacts = await safeFetch(getContacts, fallbackContacts);
  const fetchedSkills = await safeFetch(getSkills, fallbackSkills);
  const skills = fetchedSkills.length > 0 ? fetchedSkills : fallbackSkills;

  const coreExpertise = skills
    .filter(s => s.level.toLowerCase() === 'expert' || s.level.toLowerCase() === 'advanced')
    .map(s => s.name)
    .slice(0, 4)
    .join(', ') || 'Frontend, Backend, APIs';

  const firstName = profile.full_name.split(' ')[0];
  const cvUrl = getImageUrl(profile.resume) || '/cv.pdf';

  return (
    <div className="min-h-screen relative text-gray-100">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Floating orbs */}
      <div className="orb orb-violet w-[500px] h-[500px] top-[-100px] left-[-100px]" />
      <div className="orb orb-cyan w-[400px] h-[400px] top-[500px] right-[-150px]" />
      <div className="orb orb-pink w-[350px] h-[350px] bottom-[200px] left-[10%]" />
      <div className="orb orb-violet w-[300px] h-[300px] top-[1200px] right-[20%]" />

      {/* ===== NAVBAR ===== */}
      <Navbar fullName={profile.full_name} />

      <main className="relative z-10 px-6 max-w-6xl mx-auto w-full">

        {/* ===== HERO ===== */}
        <section id="hero" className="hero-bg min-h-[90vh] flex items-center py-24 md:py-32">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-12 items-center w-full">
            {/* Left: Text */}
            <div className="md:col-span-3 space-y-7 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-violet-300 text-xs font-semibold uppercase tracking-widest">Available for work</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9]">
                <span className="text-gray-100">Hi, I'm</span><br />
                <span className="text-shimmer">{profile.full_name}</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 font-medium">
                {profile.job_title || "Fullstack Developer"} —{' '}
                <span className="text-gray-500">crafting digital experiences that matter.</span>
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <a href="#projects" className="btn-primary text-white font-semibold px-7 py-3.5 rounded-xl relative z-10">
                  <span className="relative z-10 flex items-center gap-2">
                    <span>View Projects</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </a>
                <a href={cvUrl} download className="btn-secondary text-gray-300 font-semibold px-7 py-3.5 rounded-xl flex items-center gap-2 relative z-10">
                  <span>Download CV</span>
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
              </div>

              <div className="flex items-center gap-6 pt-4">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer"
                    className="text-gray-500 hover:text-violet-400 transition-all duration-300 hover:scale-110 flex items-center gap-1.5 text-sm font-medium">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    GitHub
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer"
                    className="text-gray-500 hover:text-cyan-400 transition-all duration-300 hover:scale-110 flex items-center gap-1.5 text-sm font-medium">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Right: Avatar with orbital ring */}
            <div className="md:col-span-2 flex justify-center animate-float" style={{animationDelay: '0.5s'}}>
              <div className="relative w-64 h-64 md:w-72 md:h-72">
                {/* Orbit ring */}
                <div className="absolute inset-[-20px] rounded-full border border-dashed border-violet-500/20 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-[-40px] rounded-full border border-dashed border-cyan-500/10 animate-[spin_30s_linear_infinite_reverse]" />

                {/* Avatar */}
                <div className="avatar-ring w-full h-full rounded-full overflow-hidden bg-gray-900 flex items-center justify-center relative">
                  {profile.avatar ? (
                    <Image
                      src={getImageUrl(profile.avatar)}
                      alt={profile.full_name}
                      width={288}
                      height={288}
                      className="w-full h-full object-cover rounded-full"
                      priority
                    />
                  ) : (
                    <span className="text-7xl font-black text-shimmer">{firstName.charAt(0)}</span>
                  )}
                </div>

                {/* Floating badges */}
                <div className="absolute -top-2 -right-2 glass px-3 py-1.5 rounded-full text-xs font-bold text-violet-300 animate-float" style={{animationDelay: '1s'}}>
                  ✨ Creative
                </div>
                <div className="absolute -bottom-2 -left-4 glass px-3 py-1.5 rounded-full text-xs font-bold text-cyan-300 animate-float" style={{animationDelay: '2s'}}>
                  🚀 Fast
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" className="py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold section-heading">About Me</h2>
              <p className="text-gray-400 leading-relaxed text-lg pt-4">{profile.bio}</p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="glass-card rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-shimmer">{experiences.length}+</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Experience</p>
                </div>
                <div className="glass-card rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-shimmer">{projects.length}+</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Projects</p>
                </div>
                <div className="glass-card rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-shimmer">{certificates.length}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Certificates</p>
                </div>
                <div className="glass-card rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-shimmer">{educations.length}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Education</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-7 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800/40 pb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Quick Info</h3>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Available</span>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-800/20">
                    <span className="text-gray-500">Full Name</span>
                    <span className="text-gray-200 font-semibold">{profile.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800/20">
                    <span className="text-gray-500">Current Role</span>
                    <span className="text-gray-200 font-semibold">{profile.job_title || 'Fullstack Developer'}</span>
                  </div>
                  {contacts.find(c => c.platform.toLowerCase() === 'email') && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800/20">
                      <span className="text-gray-500">Email Address</span>
                      <a href={getContactUrl('email', contacts.find(c => c.platform.toLowerCase() === 'email')?.url || '', contacts.find(c => c.platform.toLowerCase() === 'email')?.value || '')} 
                         className="text-violet-400 hover:text-violet-300 font-semibold transition-colors flex items-center gap-1">
                        {contacts.find(c => c.platform.toLowerCase() === 'email')?.value}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  )}
                  {contacts.find(c => c.platform.toLowerCase() === 'whatsapp' || c.platform.toLowerCase() === 'wa') && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-800/20">
                      <span className="text-gray-500">WhatsApp</span>
                      <a href={getContactUrl('whatsapp', contacts.find(c => c.platform.toLowerCase() === 'whatsapp' || c.platform.toLowerCase() === 'wa')?.url || '', contacts.find(c => c.platform.toLowerCase() === 'whatsapp' || c.platform.toLowerCase() === 'wa')?.value || '')} 
                         className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1" target="_blank" rel="noreferrer">
                        {contacts.find(c => c.platform.toLowerCase() === 'whatsapp' || c.platform.toLowerCase() === 'wa')?.value}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-800/20">
                    <span className="text-gray-500">Core Expertise</span>
                    <span className="text-gray-300 font-medium">{coreExpertise}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800/20">
                    <span className="text-gray-500">Resume / CV</span>
                    <a href={cvUrl} download className="text-violet-400 hover:text-violet-300 font-semibold transition-colors flex items-center gap-1">
                      Download PDF
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Social Connections</span>
                    <div className="flex items-center gap-3">
                      {profile.github_url && (
                        <a href={profile.github_url} target="_blank" rel="noreferrer" 
                           className="text-gray-400 hover:text-violet-400 transition-colors p-1" title="GitHub">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                      )}
                      {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noreferrer" 
                           className="text-gray-400 hover:text-cyan-400 transition-colors p-1" title="LinkedIn">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SKILLS ===== */}
        <section id="skills" className="py-24 border-t border-gray-800/10">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold section-heading">Skills & Tech Stack</h2>
              <p className="text-gray-500 mt-4">Technologies, frameworks, and tools I use to build scalable web applications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from(new Set(skills.map(s => s.category))).map((cat) => {
                const filtered = skills.filter(s => s.category === cat);
                return (
                  <div key={cat} className="glass-card rounded-2xl p-6 space-y-6">
                    <h3 className="text-sm font-bold text-violet-400 border-b border-gray-800/40 pb-3 uppercase tracking-wider">
                      {cat}
                    </h3>
                    <div className="space-y-3">
                      {filtered.map((skill) => (
                        <div key={skill.id} className="flex justify-between items-center bg-gray-950/40 px-4 py-2.5 rounded-xl border border-gray-800/30 hover:border-violet-500/20 transition-all duration-300 hover:translate-x-1">
                          <span className="text-gray-200 font-medium text-sm">{skill.name}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            skill.level.toLowerCase() === 'expert' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                            skill.level.toLowerCase() === 'advanced' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' :
                            skill.level.toLowerCase() === 'intermediate' ? 'text-violet-400 bg-violet-500/10 border border-violet-500/20' :
                            'text-gray-400 bg-gray-500/10 border border-gray-500/20'
                          }`}>
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== EXPERIENCE & EDUCATION ===== */}
        <section id="experience" className="py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            {/* Experience */}
            <div className="space-y-10">
              <h2 className="text-3xl md:text-4xl font-bold section-heading">Experience</h2>
              <div className="timeline-line pl-8 space-y-10 pt-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative timeline-item">
                    <div className="timeline-dot" />
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/15 px-2.5 py-1 rounded-md">
                        {exp.start_year} — {exp.end_year}
                      </span>
                      <h3 className="text-xl font-bold text-gray-100 pt-1">{exp.role}</h3>
                      <p className="text-sm text-violet-400/80 font-medium">{exp.company_name}</p>
                      {exp.description && <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>}
                    </div>
                  </div>
                ))}
                {experiences.length === 0 && <p className="text-gray-600 text-sm">No experience logged yet.</p>}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-10">
              <h2 className="text-3xl md:text-4xl font-bold section-heading">Education</h2>
              <div className="timeline-line pl-8 space-y-10 pt-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="relative timeline-item">
                    <div className="timeline-dot timeline-dot-cyan" />
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-2.5 py-1 rounded-md">
                        {edu.start_year} — {edu.end_year}
                      </span>
                      <h3 className="text-xl font-bold text-gray-100 pt-1">{edu.degree}</h3>
                      <p className="text-sm text-cyan-400/80 font-medium">{edu.school_name}</p>
                      {edu.description && <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{edu.description}</p>}
                    </div>
                  </div>
                ))}
                {educations.length === 0 && <p className="text-gray-600 text-sm">No education logged yet.</p>}
              </div>
            </div>
          </div>
        </section>

        {/* ===== PROJECTS ===== */}
        <section id="projects" className="py-24">
          <div className="space-y-14">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold section-heading">Featured Projects</h2>
              <p className="text-gray-500 mt-4">A curated selection of my recent work.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="project-card flex flex-col">
                  {/* Image */}
                  <div className="h-52 overflow-hidden bg-gray-950 relative w-full">
                    {project.image ? (
                      <Image
                        src={getImageUrl(project.image)}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover project-img"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-950/60 via-gray-900 to-cyan-950/40 flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-mono uppercase tracking-widest">No Preview</span>
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Info */}
                  <div className="p-7 flex-grow flex flex-col justify-between gap-5">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-100">{project.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{project.description}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack.split(',').map((tech, i) => (
                          <span key={i} className="text-[10px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/15 px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-5 pt-2 border-t border-gray-800/30 text-xs font-semibold">
                        {project.demo_url && (
                          <a href={project.demo_url} target="_blank" rel="noreferrer"
                            className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                            Live Demo <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        )}
                        {project.repo_url && (
                          <a href={project.repo_url} target="_blank" rel="noreferrer"
                            className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
                            Source <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {projects.length === 0 && <p className="text-gray-600 text-center py-10">No projects yet.</p>}
          </div>
        </section>

        {/* ===== CERTIFICATES ===== */}
        <section id="certificates" className="py-24">
          <div className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-bold section-heading">Certificates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="cert-card glass-card rounded-2xl p-7 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-2.5 py-1 rounded-md">
                      {cert.issued_date}
                    </span>
                    <h3 className="text-lg font-bold text-gray-100">{cert.title}</h3>
                    <p className="text-sm text-gray-500">{cert.issuer}</p>
                  </div>
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noreferrer"
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors self-end flex items-center gap-1">
                      Verify <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>
              ))}
              {certificates.length === 0 && <p className="text-gray-600 text-sm col-span-2">No certificates yet.</p>}
            </div>
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section id="contact" className="py-24 mb-10">
          <div className="glass-card rounded-3xl p-10 md:p-16 text-center space-y-8 relative overflow-hidden">
            <div className="orb orb-violet w-[300px] h-[300px] top-[-100px] right-[-100px]" style={{position: 'absolute'}} />
            <div className="orb orb-cyan w-[200px] h-[200px] bottom-[-80px] left-[-50px]" style={{position: 'absolute'}} />

            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold">
                Let's build something <span className="text-shimmer">amazing</span> together.
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Have a project in mind or just want to chat? Feel free to reach out through any of these channels.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                {contacts.map((contact) => (
                  <a key={contact.id} href={getContactUrl(contact.platform, contact.url, contact.value)} target="_blank" rel="noreferrer"
                    className="contact-chip glass rounded-xl px-6 py-4 flex items-center gap-3 font-medium group transition-all duration-300">
                    {getContactIcon(contact.platform)}
                    <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{contact.platform}</span>
                    <span className="text-violet-400 font-semibold group-hover:text-violet-300 transition-colors">{contact.value}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800/30 py-10 px-6 text-center relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} {profile.full_name}. All rights reserved.</p>
          <p>Crafted with Next.js · Tailwind CSS · Express</p>
        </div>
      </footer>
    </div>
  );
}
