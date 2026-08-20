"use client";

import React, { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceInterest: "Cloud Services",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-5 py-lg-6 bg-white position-relative overflow-hidden">
      <div className="container py-lg-3">
        <div className="row g-5 align-items-start">

          {/* Left Column: Contact Information & Location Map */}
          <div className="col-lg-5">
            <div className="pe-lg-3">
              
              {/* Badge */}
              <span className="d-inline-block text-primary fw-bold small text-uppercase mb-2" style={{ letterSpacing: "0.08em", fontSize: "0.8rem", color: "#2563eb" }}>
                CONTACT US
              </span>
              
              {/* Main Heading */}
              <h2 className="fw-extrabold text-dark mb-3 display-6" style={{ fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a", lineHeight: 1.25 }}>
                Let's build smarter infrastructure together.
              </h2>
              
              {/* Subtitle */}
              <p className="text-secondary mb-4 mb-lg-5" style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#64748b" }}>
                Tell us about your goals and our team will help you find the right technology path forward.
              </p>

              {/* Info Items List */}
              <div className="d-flex flex-column gap-4 mb-4">
                
                {/* Email Item */}
                <div className="d-flex align-items-start gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{ width: 44, height: 44, backgroundColor: "#eff6ff", color: "#2563eb" }}
                  >
                    <i className="bi bi-envelope-fill fs-5"></i>
                  </div>
                  <div>
                    <span className="text-secondary small d-block mb-0.5" style={{ fontSize: "0.82rem", color: "#64748b" }}>Email</span>
                    <a 
                      href="mailto:info@miraiclouditservices.com" 
                      className="fw-bold text-dark fs-6 text-decoration-none hover-orange text-break"
                      style={{ color: "#0f172a", fontSize: "0.98rem" }}
                    >
                      info@miraiclouditservices.com
                    </a>
                  </div>
                </div>

                {/* Phone Item */}
                <div className="d-flex align-items-start gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{ width: 44, height: 44, backgroundColor: "#eff6ff", color: "#2563eb" }}
                  >
                    <i className="bi bi-telephone-fill fs-5"></i>
                  </div>
                  <div>
                    <span className="text-secondary small d-block mb-0.5" style={{ fontSize: "0.82rem", color: "#64748b" }}>Phone</span>
                    <a 
                      href="tel:+919100218218" 
                      className="fw-bold text-dark fs-6 text-decoration-none hover-orange"
                      style={{ color: "#0f172a", fontSize: "0.98rem" }}
                    >
                      +91 91002 18218
                    </a>
                  </div>
                </div>

                {/* Office Address Item */}
                <div className="d-flex align-items-start gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{ width: 44, height: 44, backgroundColor: "#eff6ff", color: "#2563eb" }}
                  >
                    <i className="bi bi-geo-alt-fill fs-5"></i>
                  </div>
                  <div>
                    <span className="text-secondary small d-block mb-0.5" style={{ fontSize: "0.82rem", color: "#64748b" }}>Office</span>
                    <p className="fw-bold text-dark mb-0" style={{ color: "#0f172a", fontSize: "0.92rem", lineHeight: 1.5 }}>
                      Kalki chambers A Block 108, NH 65, widia colony Miyapur, Hyderabad, India, 502032
                    </p>
                  </div>
                </div>

              </div>

              {/* Embedded Location Map Card */}
              <div 
                className="overflow-hidden bg-white mt-4"
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)"
                }}
              >
                <iframe
                  title="Mirai CloudIT Services Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3804.887858682054!2d78.358249!3d17.498569!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb921a8b9f5f0b%3A0x6b09cf9017a5996f!2sNH%2065%2C%20Widia%20Colony%2C%20Miyapur%2C%20Hyderabad%2C%20Telangana%20502032!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="220"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

            </div>
          </div>

          {/* Right Column: Request a Consultation Form Card */}
          <div className="col-lg-7">
            <div 
              className="bg-white p-4 p-md-5"
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)"
              }}
            >
              {submitted ? (
                <div className="text-center py-5">
                  <div 
                    className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center p-3 mb-3" 
                    style={{ width: 60, height: 60 }}
                  >
                    <i className="bi bi-check-circle-fill fs-3"></i>
                  </div>
                  <h4 className="fw-extrabold text-dark mb-2" style={{ color: "#0f172a" }}>
                    Thank you! Your request has been sent.
                  </h4>
                  <p className="text-secondary small mb-4" style={{ color: "#64748b" }}>
                    Our consultation team will get back to you shortly at <strong>{formData.email || "your email"}</strong>.
                  </p>
                  <button 
                    className="btn px-4 py-2.5 text-white fw-bold" 
                    onClick={() => setSubmitted(false)}
                    style={{ backgroundColor: "#2563eb", borderRadius: "9999px" }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  
                  {/* Form Header */}
                  <h3 className="fw-extrabold text-dark mb-1" style={{ fontWeight: 800, fontSize: "1.45rem", color: "#0f172a" }}>
                    Request a consultation
                  </h3>
                  <p className="text-secondary small mb-4" style={{ color: "#64748b", fontSize: "0.88rem" }}>
                    Share a few details and we'll get back to you shortly.
                  </p>

                  {/* Row 1: Your Name & Work Email */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="fw-bold small text-dark mb-1" style={{ fontSize: "0.84rem", color: "#334155" }}>
                        Your name
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control py-2.5 px-3"
                        style={{ borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold small text-dark mb-1" style={{ fontSize: "0.84rem", color: "#334155" }}>
                        Work email
                      </label>
                      <input
                        type="email"
                        required
                        className="form-control py-2.5 px-3"
                        style={{ borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                        placeholder="Enter work email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone Number & Service Interest */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="fw-bold small text-dark mb-1" style={{ fontSize: "0.84rem", color: "#334155" }}>
                        Phone number
                      </label>
                      <input
                        type="tel"
                        required
                        className="form-control py-2.5 px-3"
                        style={{ borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold small text-dark mb-1" style={{ fontSize: "0.84rem", color: "#334155" }}>
                        Service interest
                      </label>
                      <select
                        className="form-select py-2.5 px-3"
                        style={{ borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                        value={formData.serviceInterest}
                        onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                      >
                        <option value="Cloud Services">Cloud Services</option>
                        <option value="Property & Asset Management">Property & Asset Management</option>
                        <option value="Coworking Space Solutions">Coworking Space Solutions</option>
                        <option value="Visitor & Gate Pass Management">Visitor & Gate Pass Management</option>
                        <option value="IT Infrastructure & Support">IT Infrastructure & Support</option>
                        <option value="Custom Enterprise Software">Custom Enterprise Software</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: How Can We Help? */}
                  <div className="mb-4">
                    <label className="fw-bold small text-dark mb-1" style={{ fontSize: "0.84rem", color: "#334155" }}>
                      How can we help?
                    </label>
                    <textarea
                      rows={4}
                      required
                      className="form-control py-2.5 px-3"
                      style={{ borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                      placeholder="Tell us about your requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      backgroundColor: "#1d4ed8",
                      color: "#ffffff",
                      borderRadius: "9999px",
                      fontSize: "1rem",
                      fontWeight: 700,
                      border: "none",
                      boxShadow: "0 4px 14px rgba(29, 78, 216, 0.35)",
                      transition: "all 0.25s ease"
                    }}
                  >
                    Send Message <i className="bi bi-send-fill" style={{ fontSize: "0.9rem" }}></i>
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
