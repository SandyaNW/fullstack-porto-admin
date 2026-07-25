'use client';

import { useState, useEffect } from 'react';

interface NavbarProps {
  fullName: string;
}

export default function Navbar({ fullName }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);

  const firstName = fullName.split(' ')[0];

  useEffect(() => {
    const handleScroll = () => {
      // Backdrop effect
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Scrollspy detection
      const sections = ['hero', 'about', 'skills', 'experience', 'projects', 'certificates', 'contact'];
      let currentSection = 'hero';

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Active if the section's top is near or above the upper middle viewport, and its bottom is still below the threshold
          if (rect.top <= 160 && rect.bottom >= 150) {
            currentSection = id;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount to set initial active section
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = ['About', 'Skills', 'Experience', 'Projects', 'Certificates', 'Contact'];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'nav-blur py-3 shadow-lg shadow-[#0a0a0f]/40' : 'bg-transparent py-5'}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="text-xl font-bold tracking-tight text-shimmer">
          {firstName}.dev
        </a>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => {
            const id = item.toLowerCase();
            const isActive = activeSection === id;
            return (
              <a
                key={item}
                href={`#${id}`}
                className={`transition-all duration-300 relative py-1 ${
                  isActive ? 'text-violet-400 font-semibold animate-pulse-glow' : 'text-gray-400 hover:text-violet-400'
                } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-violet-500 after:transition-all after:duration-300 ${
                  isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
                }`}
              >
                {item}
              </a>
            );
          })}
        </nav>

        {/* Desktop Hire Me CTA */}
        <a
          href="#contact"
          className="hidden md:inline-flex btn-primary text-white text-xs font-semibold px-5 py-2.5 rounded-full relative z-10"
        >
          <span className="relative z-10">Let's Talk</span>
        </a>

        {/* Mobile Menu Button (Hamburger) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-300 hover:text-white focus:outline-none z-50 p-1"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-lg md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 text-xl font-medium">
          {navItems.map((item) => {
            const id = item.toLowerCase();
            const isActive = activeSection === id;
            return (
              <a
                key={item}
                href={`#${id}`}
                onClick={() => setIsOpen(false)}
                className={`transition-colors duration-300 ${
                  isActive ? 'text-violet-400 font-bold scale-105' : 'text-gray-400 hover:text-violet-400'
                }`}
              >
                {item}
              </a>
            );
          })}
          <a
            href="#contact"
            onClick={() => setIsOpen(false)}
            className="btn-primary text-white text-sm font-semibold px-8 py-3 rounded-full mt-4"
          >
            Let's Talk
          </a>
        </div>
      </div>
    </header>
  );
}
