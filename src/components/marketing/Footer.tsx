"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 border-top border-secondary border-opacity-25">
      <div className="container">

        {/* Modern Card Pattern Container */}
        <div className="p-4 p-md-5 rounded-4 mb-4" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="row gy-4 align-items-center justify-content-between">

            {/* Column 1: White BG Logo + Tagline + Social Badges */}
            <div className="col-lg-4 col-md-6">
              {/* White Background Container for Logo */}
              <div className="p-2.5 px-3 bg-white rounded-3 d-inline-block shadow-xs mb-3">
                <Link href="/" className="d-flex align-items-center text-decoration-none">
                  <img
                    src="/brand-logo.png"
                    alt="ANVAYA360"
                    style={{ height: 38 }}
                    className="w-auto object-fit-contain"
                  />
                </Link>
              </div>

              <p className="text-secondary extra-small mb-3" style={{ maxWidth: 320, lineHeight: 1.6 }}>
                AI-Powered Business Operations & Property Management Platform. Manage CRM, visitor passes, helpdesk SLA, attendance, and finance in one connected portal.
              </p>

              {/* Social Media Badges */}
              <div className="d-flex align-items-center gap-2">
                <a href="#" className="p-2 rounded-circle bg-secondary bg-opacity-25 text-white hover-orange text-decoration-none d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                  <i className="bi bi-linkedin extra-small"></i>
                </a>
                <a href="#" className="p-2 rounded-circle bg-secondary bg-opacity-25 text-white hover-orange text-decoration-none d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                  <i className="bi bi-twitter-x extra-small"></i>
                </a>
                <a href="#" className="p-2 rounded-circle bg-secondary bg-opacity-25 text-white hover-orange text-decoration-none d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                  <i className="bi bi-github extra-small"></i>
                </a>
                <a href="#" className="p-2 rounded-circle bg-secondary bg-opacity-25 text-white hover-orange text-decoration-none d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                  <i className="bi bi-youtube extra-small"></i>
                </a>
              </div>
            </div>

            {/* Column 2: Direct Contact Block */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                <h6 className="extra-small fw-bold text-uppercase text-orange mb-3" style={{ color: '#ea580c' }}>
                  <i className="bi bi-headset me-1"></i> DIRECT SUPPORT CONTACT
                </h6>
                <div className="d-flex flex-column gap-2 extra-small text-white">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-telephone-fill text-orange" style={{ color: '#ea580c' }}></i>
                    <a href="tel:8106651649" className="text-white text-decoration-none hover-orange fw-bold">
                      +91 8106651649 (24/7 Support)
                    </a>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-envelope-fill text-orange" style={{ color: '#ea580c' }}></i>
                    <a href="mailto:sales.anvaya360@gmail.com" className="text-white text-decoration-none hover-orange">
                      sales.anvaya360@gmail.com
                    </a>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-geo-alt-fill text-orange" style={{ color: '#ea580c' }}></i>
                    <span className="text-secondary">Hitech City, Hyderabad, India</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Navigation Grid */}
            <div className="col-lg-4 col-md-12">
              <h6 className="extra-small fw-bold text-uppercase text-white mb-3">Quick Navigation</h6>
              <div className="row g-2 extra-small">
                <div className="col-6">
                  <a href="#who-uses" className="text-decoration-none text-secondary hover-white d-block py-1">
                    • Industries & Sectors
                  </a>
                  <a href="#problems" className="text-decoration-none text-secondary hover-white d-block py-1">
                    • Problems We Solve
                  </a>
                  <a href="#modules" className="text-decoration-none text-secondary hover-white d-block py-1">
                    • 12 Platform Modules
                  </a>
                </div>
                <div className="col-6">
                  <a href="#dashboard" className="text-decoration-none text-secondary hover-white d-block py-1">
                    • Command Center
                  </a>
                  <a href="#pricing" className="text-decoration-none text-secondary hover-white d-block py-1">
                    • Transparent Pricing
                  </a>
                  <a href="#contact" className="text-decoration-none text-secondary hover-white d-block py-1">
                    • 24/7 Contact Team
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright & Security Badges Bar */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between extra-small text-secondary pt-2">
          <p className="mb-2 mb-md-0">
            © {new Date().getFullYear()} Anvaya360. All rights reserved. Built for modern property & business portfolios.
          </p>
          <div className="d-flex align-items-center gap-3">
            <span className="text-success"><i className="bi bi-shield-check me-1"></i> SOC2 Certified</span>
            <a href="#" className="text-decoration-none text-secondary hover-white">Privacy Policy</a>
            <a href="#" className="text-decoration-none text-secondary hover-white">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
