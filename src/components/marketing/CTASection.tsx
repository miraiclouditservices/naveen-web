"use client";

import React from "react";

export default function CTASection() {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="cta" className="py-5 bg-white position-relative overflow-hidden">
      <div className="container py-lg-3 position-relative z-2">

        {/* High-Impact Curved Card Pattern */}
        <div
          className="p-4 p-md-5 rounded-4 text-white text-center position-relative overflow-hidden shadow-lg border border-secondary border-opacity-25"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
        >
          {/* Ambient Radial Glow & Dot Grid */}
          <div
            className="position-absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#ea580c 0.75px, transparent 0.75px)',
              backgroundSize: '24px 24px'
            }}
          ></div>

          <div
            className="position-absolute top-0 end-0 translate-middle-y rounded-circle pointer-events-none opacity-25"
            style={{
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          ></div>

          <div className="position-relative z-2 max-w-2xl mx-auto">

            {/* Pill Badge */}
            <div className="d-inline-flex align-items-center gap-2 mb-3 px-3 py-1.5 rounded-pill" style={{ background: 'rgba(234, 88, 12, 0.18)', border: '1px solid rgba(234, 88, 12, 0.4)', color: '#f97316', fontSize: '0.72rem', fontWeight: 700 }}>
              <span className="mkt-pulse-dot"></span>
              <span>INSTANT ENTERPRISE ONBOARDING</span>
            </div>

            <h2 className="display-6 fw-extrabold text-white mb-3 tracking-tight">
              Ready to Transform Your Business?
            </h2>

            <p className="mkt-subtitle text-secondary mb-4 mx-auto" style={{ maxWidth: 600 }}>
              Join 500+ modern organisations using one intelligent platform to manage CRM, properties, coworking, visitors, attendance, SLA tickets, and AI.
            </p>

            {/* Action Buttons — Smooth Scroll to Contact Form */}
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mb-4">

              {/* Contact Sales Button -> Scrolls to #contact */}
              <a
                href="#contact"
                onClick={scrollToContact}
                className="btn-orange-primary text-decoration-none px-4 py-2.5 fs-6"
              >
                <i className="bi bi-headset"></i> Contact Sales
              </a>

              {/* Book Demo Button -> Scrolls to #contact */}
              <a
                href="#contact"
                onClick={scrollToContact}
                className="btn btn-light fw-bold px-4 py-2.5 rounded-3 text-dark text-decoration-none fs-6"
              >
                <i className="bi bi-calendar-check-fill me-1.5" style={{ color: '#ea580c' }}></i> Book Demo
              </a>

              {/* Start Free Trial -> Scrolls to #pricing */}
              <a
                href="#pricing"
                className="btn btn-outline-light fw-bold px-4 py-2.5 rounded-3 text-decoration-none fs-6"
              >
                Start Free Trial
              </a>

            </div>

            {/* Trust Signals */}
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 text-secondary extra-small fw-semibold pt-2 border-top border-secondary border-opacity-50">
              <span><i className="bi bi-check-circle-fill text-success me-1"></i> No Credit Card Required</span>
              <span><i className="bi bi-check-circle-fill text-success me-1"></i> 14-Day Free Access</span>
              <span><i className="bi bi-check-circle-fill text-success me-1"></i> 24/7 Dedicated Support</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
