"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      // Add background when scrolled
      setIsScrolled(window.scrollY > 50);

      // Determine active section
      const sections = ['features', 'how-it-works', 'faq'];

      let currentSection = '';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust 150 to catch the section a bit earlier
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = section;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'floating-nav' : 'default-nav'}`}>
      <div className="container h-100">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <span className="brand-text-kalki">ANVAYA360</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon" style={{ width: '1.1rem', height: '1.1rem' }}></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-bold">
            <li className="nav-item">
              <a className={`nav-link px-3 transition-all ${activeSection === 'features' ? 'active-link' : ''}`} style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }} href="#features">Features</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link px-3 transition-all ${activeSection === 'how-it-works' ? 'active-link' : ''}`} style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }} href="#how-it-works">How it works</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link px-3 transition-all ${activeSection === 'faq' ? 'active-link' : ''}`} style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }} href="#faq">FAQ</a>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <Link href="/login" className="btn btn-orange-nav rounded-pill px-4 py-2.5 fw-bold shadow-orange-nav text-white transition-all hover-lift" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>Get Started</Link>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@900&family=Orbitron:wght@900&display=swap');

        .brand-text-kalki {
          font-family: 'Cinzel', 'Orbitron', serif;
          font-weight: 900;
          font-size: 1.45rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #ffe066 0%, #ff7a00 40%, #ff5500 75%, #cc2200 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 2px 4px rgba(255, 85, 0, 0.2));
        }

        .navbar {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 18px 0;
          background: transparent !important;
          left: 0;
          right: 0;
        }

        .navbar.default-nav {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(15, 23, 42, 0.04);
        }

        .navbar.floating-nav {
          top: 15px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 90% !important;
          max-width: 1200px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.08);
          padding: 10px 24px;
        }

        .navbar-nav .nav-link {
          position: relative;
          color: #64748b !important;
          transition: all 0.3s ease;
          padding: 6px 16px;
        }

        .navbar-nav .nav-link:hover,
        .navbar-nav .nav-link.active-link {
          color: #0f172a !important;
        }

        .navbar-nav .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #ff7a00 0%, #ff5500 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-50%);
          border-radius: 9999px;
        }

        .navbar-nav .nav-link:hover::after,
        .navbar-nav .nav-link.active-link::after {
          width: 16px;
        }

        .btn-orange-nav {
          background: linear-gradient(135deg, #ff7a00 0%, #ff5500 100%) !important;
          border: none !important;
        }

        .btn-orange-nav:hover {
          background: linear-gradient(135deg, #ff8c00 0%, #ff6f00 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -3px rgba(255, 111, 0, 0.4);
        }

        .shadow-orange-nav { 
          box-shadow: 0 8px 15px -3px rgba(255, 111, 0, 0.25); 
        }

        .hover-lift:hover { 
          transform: translateY(-2px); 
        }

        @media (max-width: 991.98px) {
          .navbar-collapse {
            background: #ffffff;
            border-radius: 12px;
            padding: 20px;
            margin-top: 12px;
            box-shadow: 0 10px 25px -10px rgba(15, 23, 42, 0.1);
            border: 1px solid rgba(15, 23, 42, 0.05);
          }
          
          .navbar.floating-nav {
            border-radius: 16px;
            padding: 10px 16px;
          }

          .navbar-nav .nav-link::after {
            left: 16px;
            transform: none;
          }
        }
      `}</style>
    </nav>
  );
}
