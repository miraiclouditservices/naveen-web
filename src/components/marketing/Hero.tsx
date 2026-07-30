"use client";

import React from "react";

export default function Hero() {
  return (
    <section
      className="position-relative overflow-hidden py-5 border-bottom"
      style={{
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container py-lg-4">
        <div className="row gy-5 align-items-center">

          {/* Left Column: Heading & Copy */}
          <div className="col-lg-6">
            <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
              <span className="mkt-pulse-dot"></span>
              <span>NEXT-GEN ENTERPRISE PLATFORM</span>
            </div>

            <h1 className="display-5 fw-extrabold text-white mb-3 tracking-tight" style={{ color: '#ffffff' }}>
              AI-Powered Business<br /> Operations Platform
            </h1>

            <p className="fs-6 fw-bold text-white mb-3">
              Manage your entire business from one intelligent platform.
            </p>

            <p className="mkt-subtitle mb-4" style={{ color: '#cbd5e1' }}>
              CRM, Property Management, Coworking, Employee Management, Visitor Management, Attendance, Helpdesk, Assets, Reports and AI — everything connected in one secure platform.
            </p>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <a href="#cta" className="btn-orange-primary text-decoration-none">
                <i className="bi bi-calendar-check-fill"></i> Book Free Demo
              </a>
              <a href="#dashboard" className="btn btn-light fw-bold px-4 py-2.5 rounded-3 text-dark text-decoration-none">
                <i className="bi bi-play-circle-fill me-1.5" style={{ color: '#ea580c' }}></i> Watch Product Tour
              </a>
            </div>

            {/* Key Trust Signals */}
            <div className="d-flex align-items-center gap-4 pt-3 border-top border-secondary border-opacity-50">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-success fs-5"></i>
                <span className="small fw-bold text-white">Bank-Grade SOC2</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
                <span className="small fw-bold text-white">Instant Setup</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-star-fill text-warning fs-5"></i>
                <span className="small fw-bold text-white">4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Hero Image */}
          <div className="col-lg-6 position-relative text-center">
            <img
              src="/hero-right.png"
              alt="Anvaya360 Platform Preview"
              className="w-100 h-auto object-fit-contain rounded-3"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
