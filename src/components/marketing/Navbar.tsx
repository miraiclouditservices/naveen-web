"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const sectionIds = ["who-uses", "problems", "modules", "services", "dashboard", "comparison", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleTopScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection("hero");
      }
    };

    window.addEventListener("scroll", handleTopScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleTopScroll);
    };
  }, []);

  return (
    <header className="mkt-navbar-fixed">
      <div className="container d-flex align-items-center justify-content-between py-2">

        {/* Brand Logo */}
        <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <img
            src="/mirai_logo.png"
            alt="Mirai CloudIT SERVICES"
            style={{ height: 42 }}
            className="w-auto object-fit-contain"
          />
        </Link>

        {/* Desktop Nav Links with Center-Expanding Underline */}
        <nav className="d-none d-lg-flex align-items-center gap-4">
          <a href="#who-uses" className={`mkt-nav-link ${activeSection === "who-uses" ? "active" : ""}`}>
            Industries
          </a>
          <a href="#problems" className={`mkt-nav-link ${activeSection === "problems" ? "active" : ""}`}>
            Why Us
          </a>
          <a href="#modules" className={`mkt-nav-link ${activeSection === "modules" ? "active" : ""}`}>
            Products
          </a>
          <a href="#services" className={`mkt-nav-link ${activeSection === "services" ? "active" : ""}`}>
            Services
          </a>
          <a href="#dashboard" className={`mkt-nav-link ${activeSection === "dashboard" ? "active" : ""}`}>
            Dashboard
          </a>
          <a href="#comparison" className={`mkt-nav-link ${activeSection === "comparison" ? "active" : ""}`}>
            Comparison
          </a>
          <a href="#contact" className={`mkt-nav-link ${activeSection === "contact" ? "active" : ""}`}>
            Contact
          </a>
        </nav>

        {/* Right Action Button */}
        <div className="d-none d-lg-flex align-items-center">
          <Link href="/login" className="btn-orange-primary text-decoration-none">
            Sign In <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="btn btn-light d-lg-none border-0"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <i className={`bi ${mobileNavOpen ? "bi-x-lg" : "bi-list"} fs-4`}></i>
        </button>

      </div>

      {/* Mobile Responsive Drawer */}
      {mobileNavOpen && (
        <div className="d-lg-none bg-white border-top p-4 d-flex flex-column gap-3 shadow-sm animate-fade-up">
          <a href="#who-uses" onClick={() => setMobileNavOpen(false)} className="text-decoration-none text-dark fw-bold small">Industries</a>
          <a href="#problems" onClick={() => setMobileNavOpen(false)} className="text-decoration-none text-dark fw-bold small">Why Us</a>
          <a href="#modules" onClick={() => setMobileNavOpen(false)} className="text-decoration-none text-dark fw-bold small">Products</a>
          <a href="#services" onClick={() => setMobileNavOpen(false)} className="text-decoration-none text-dark fw-bold small">Services</a>
          <a href="#dashboard" onClick={() => setMobileNavOpen(false)} className="text-decoration-none text-dark fw-bold small">Dashboard</a>
          <a href="#comparison" onClick={() => setMobileNavOpen(false)} className="text-decoration-none text-dark fw-bold small">Comparison</a>
          <a href="#contact" onClick={() => setMobileNavOpen(false)} className="text-decoration-none text-dark fw-bold small">Contact</a>
          <hr className="my-2" />
          <Link href="/login" onClick={() => setMobileNavOpen(false)} className="btn-orange-primary text-center text-decoration-none">
            Sign In <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      )}
    </header>
  );
}
