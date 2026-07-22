"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar navbar-expand-lg fixed-top navbar-custom ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container">
        <Link href="/" className="logo-container">
          <img src="/anvaya360-logo.png" alt="Anvaya360 Logo" className="logo-img" />
        </Link>

        {/* Mobile Header Toggler */}
        <button className="navbar-toggler border-0 d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link-custom" href="#modules">Modules</a>
            </li>
            <li className="nav-item">
              <a className="nav-link-custom" href="#why-anvaya360">Why Anvaya360</a>
            </li>
            <li className="nav-item">
              <a className="nav-link-custom" href="#industries">Industries</a>
            </li>
            <li className="nav-item">
              <a className="nav-link-custom" href="#pricing">Pricing</a>
            </li>
            <li className="nav-item">
              <a className="nav-link-custom" href="#faq">FAQ</a>
            </li>
          </ul>

          {/* Desktop Actions */}
          <div className="navbar-actions-desktop d-none d-lg-flex align-items-center">
            <Link href="/login" className="btn-signin">Sign in</Link>
          </div>

          {/* Mobile Collapse Menu Sign-in (Visible inside the open collapse) */}
          <div className="navbar-actions-mobile-menu d-flex d-lg-none justify-content-center pt-3 border-top border-light mt-3">
            <Link href="/login" className="btn-signin-mobile">Sign in</Link>
          </div>
        </div>
      </div>
      <style jsx>{`
        .navbar-custom {
          background-color: var(--bg-card) !important;
          border-bottom: 1px solid var(--border-color) !important;
          padding: 6px 0;
          transition: padding 0.3s ease, box-shadow 0.3s ease;
          z-index: 1030;
        }

        .navbar-scrolled {
          padding: 12px 0;
          box-shadow: 0 4px 20px -10px rgba(0, 0, 0, 0.05);
        }

        .logo-container {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          margin-right: 8px;
        }

        .logo-text {
          font-weight: 800;
          font-size: 1.3rem;
          color: var(--text-main, #000000);
          letter-spacing: -0.02em;
        }

        .logo-text span {
          color: var(--text-muted, #787878);
        }

        .nav-link-custom {
          color: var(--text-muted, #787878) !important;
          font-weight: 500;
          font-size: 0.9rem;
          padding: 8px 16px !important;
          text-decoration: none;
          transition: color 0.2s ease;
          display: inline-block;
        }

        .nav-link-custom:hover {
          color: var(--text-main, #000000) !important;
        }

        .btn-navbar-cta {
          background-color: #1b723a !important;
          border-color: #1b723a !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
          padding: 10px 24px !important;
          font-weight: 700 !important;
          font-size: 0.95rem !important;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
        }

        .btn-navbar-cta:hover {
          background-color: #14532d !important;
          border-color: #14532d !important;
          box-shadow: 0 4px 12px rgba(27, 114, 58, 0.15);
        }

        .btn-navbar-cta .arrow-icon {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }

        .btn-navbar-cta:hover .arrow-icon {
          transform: translateX(3px);
        }

        .btn-navbar-cta-mobile {
          background-color: #1b723a !important;
          border-color: #1b723a !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
          padding: 8px 18px !important;
          font-weight: 700 !important;
          font-size: 0.85rem !important;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          border: none;
          transition: all 0.2s ease;
        }

        .btn-navbar-cta-mobile:hover {
          background-color: #14532d !important;
          border-color: #14532d !important;
        }

        .btn-signin {
          border: 1px solid var(--border-color, #E8E6E3) !important;
          color: var(--text-primary, #202020) !important;
          background-color: transparent !important;
          border-radius: 9999px !important;
          padding: 8px 22px !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-signin:hover {
          border-color: var(--dark-section, #040404) !important;
          background-color: var(--dark-section, #040404) !important;
          color: var(--bg-card, #ffffff) !important;
        }

        .btn-signin-mobile {
          border: 1px solid var(--border-color, #E8E6E3) !important;
          color: var(--text-primary, #202020) !important;
          background-color: transparent !important;
          border-radius: 9999px !important;
          padding: 8px 22px !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          width: 100%;
        }

        .btn-signin-mobile:hover {
          border-color: var(--dark-section, #040404) !important;
          background-color: var(--dark-section, #040404) !important;
          color: var(--bg-card, #ffffff) !important;
        }

        @media (max-width: 991.98px) {
          .navbar-collapse {
            background: var(--bg-card, #ffffff);
            border-radius: 12px;
            padding: 20px;
            margin-top: 12px;
            border: 1px solid var(--border-color, #E8E6E3);
            box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.08);
          }

          .nav-link-custom {
            padding: 10px 0 !important;
            display: block;
            border-bottom: 1px solid var(--border-color, #E8E6E3);
            width: 100%;
          }

          .navbar-nav li:last-child .nav-link-custom {
            border-bottom: none;
          }
        }
      `}</style>
    </nav>
  );
}
