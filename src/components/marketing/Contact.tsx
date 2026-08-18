"use client";

import React, { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyType: "Commercial Building",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-5 bg-white border-bottom position-relative">
      <div className="container py-lg-4">

        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
            <span className="mkt-pulse-dot"></span>
            <span>24/7 DEDICATED SUPPORT & RAPID RESOLUTION</span>
          </div>
          <h2 className="mkt-title mb-3">Contact Our 24/7 Support Team</h2>
          <p className="mkt-subtitle mx-auto text-muted">
            Our customer team is available 24/7 to resolve any issue, assist with setup, or answer your operational questions instantly.
          </p>
        </div>

        {/* 24/7 Highlight Banner */}
        <div className="p-3.5 p-md-4 rounded-4 mb-4 text-white d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 shadow-xs" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid #334155' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle p-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ background: '#ea580c', width: 48, height: 48 }}>
              <i className="bi bi-headset fs-4 text-white"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge rounded-pill bg-success text-white extra-small">24/7 AVAILABLE</span>
                <span className="extra-small text-secondary fw-bold">ZERO DOWN-TIME SUPPORT</span>
              </div>
              <h5 className="fw-extrabold text-white mb-0 mt-1">Need Immediate Operational Assistance or Bug Resolution?</h5>
              <span className="extra-small text-secondary d-block">Our dedicated technical team monitors and resolves issues around the clock.</span>
            </div>
          </div>
          <a href="tel:+919100218218" className="btn-orange-primary text-decoration-none flex-shrink-0 px-4 py-2.5">
            <i className="bi bi-telephone-outbound-fill"></i> Call 24/7 Support
          </a>
        </div>

        <div className="row g-4 align-items-stretch">

          {/* Left Column: Direct Contact Info Cards */}
          <div className="col-lg-5">
            <div className="d-flex flex-column gap-3 h-100 justify-content-between">

              {/* Phone Card */}
              <div className="mkt-card-clean p-4 d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 p-3 text-white flex-shrink-0" style={{ width: 48, height: 48, background: '#ea580c' }}>
                  <i className="bi bi-telephone-fill fs-5"></i>
                </div>
                <div>
                  <span className="extra-small text-muted fw-bold text-uppercase d-block mb-0.5">24/7 Call & WhatsApp Support</span>
                  <a href="tel:+919100218218" className="fw-extrabold text-dark fs-6 text-decoration-none hover-orange">
                    +91 91002 18218
                  </a>
                  <span className="extra-small text-success fw-bold d-block mt-0.5">
                    <i className="bi bi-check-circle-fill me-1"></i> 24/7 Available (365 Days) • Instant Resolution
                  </span>
                </div>
              </div>

              {/* Email Card */}
              <div className="mkt-card-clean p-4 d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 p-3 text-white flex-shrink-0" style={{ width: 48, height: 48, background: '#ea580c' }}>
                  <i className="bi bi-envelope-fill fs-5"></i>
                </div>
                <div>
                  <span className="extra-small text-muted fw-bold text-uppercase d-block mb-0.5">24/7 Support & Sales Email</span>
                  <a href="mailto:info@miraiclouditservices.com" className="fw-extrabold text-dark fs-6 text-decoration-none hover-orange text-break">
                    info@miraiclouditservices.com
                  </a>
                  <span className="extra-small text-muted d-block mt-0.5">Priority Response SLA within 15 mins</span>
                </div>
              </div>

              {/* Office Address Card */}
              <div className="mkt-card-clean p-4 d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 p-3 text-white flex-shrink-0" style={{ width: 48, height: 48, background: '#ea580c' }}>
                  <i className="bi bi-geo-alt-fill fs-5"></i>
                </div>
                <div>
                  <span className="extra-small text-muted fw-bold text-uppercase d-block mb-0.5">Global Operations Center</span>
                  <h6 className="fw-extrabold text-dark mb-1 fs-6">Mirai CloudIT SERVICES Tower</h6>
                  <p className="text-muted extra-small mb-0" style={{ lineHeight: 1.5 }}>
                    Kalki chambers A Block 108, NH 65, widia colony Miyapur, Hyderabad, India, 502032
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Clean Interactive Contact Form */}
          <div className="col-lg-7">
            <div className="mkt-card-clean p-4 p-md-5 h-100">
              {submitted ? (
                <div className="text-center py-5">
                  <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center p-3 mb-3" style={{ width: 60, height: 60 }}>
                    <i className="bi bi-check-circle-fill fs-3"></i>
                  </div>
                  <h4 className="fw-extrabold text-dark mb-2">Issue / Message Dispatched to 24/7 Team!</h4>
                  <p className="text-muted small mb-4">
                    Thank you for contacting support. Our 24/7 customer engineering team will contact you at <strong>{formData.email || "your email"}</strong> or call <strong>{formData.phone || "your phone"}</strong> immediately.
                  </p>
                  <button className="btn-orange-primary" onClick={() => setSubmitted(false)}>
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="fw-extrabold text-dark mb-0">Submit Inquiry / Report Issue</h4>
                    <span className="badge bg-success bg-opacity-10 text-success extra-small fw-bold">
                      <i className="bi bi-clock-history me-1"></i> 24/7 Team Active
                    </span>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="extra-small fw-bold text-muted text-uppercase mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-control rounded-3 py-2 small"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="extra-small fw-bold text-muted text-uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        className="form-control rounded-3 py-2 small"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="extra-small fw-bold text-muted text-uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="form-control rounded-3 py-2 small"
                        placeholder="+91 8106651649"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="extra-small fw-bold text-muted text-uppercase mb-1">Inquiry / Issue Category</label>
                      <select
                        className="form-select rounded-3 py-2 small"
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      >
                        <option value="Operational Issue & Support">Operational Issue & Support (24/7 Fast SLA)</option>
                        <option value="Commercial Building Demo">Commercial Building Demo</option>
                        <option value="Coworking Space Setup">Coworking Space Setup</option>
                        <option value="Apartment / Resident Hub">Apartment / Resident Hub</option>
                        <option value="Enterprise API & Customs">Enterprise API & Customs</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="extra-small fw-bold text-muted text-uppercase mb-1">Describe Your Inquiry or Issue</label>
                    <textarea
                      rows={4}
                      required
                      className="form-control rounded-3 py-2 small"
                      placeholder="Explain your operational requirements or issue details..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-orange-primary w-100 justify-content-center py-2.5">
                    <i className="bi bi-headset"></i> Submit to 24/7 Support Team
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
