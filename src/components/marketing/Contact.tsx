"use client";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 3000);
  };

  return (
    <section id="contact" className="bg-white position-relative" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5 animate__animated animate__fadeIn">
          <div className="d-inline-block mb-3">
            <span className="contact-badge">Contact Us</span>
          </div>
          <h2 className="section-title fw-bold text-dark">
            Get in Touch
          </h2>
          <p className="section-subtitle text-muted mx-auto">
            Have questions about ANVAYA360? Our team is here to help you scale and streamline your property operations.
          </p>
        </div>

        <div className="row gy-4 align-items-stretch justify-content-center">
          
          {/* Column 1 - Contact Info */}
          <div className="col-lg-5 col-md-12 d-flex flex-column justify-content-between animate__animated animate__fadeInLeft">
            <div className="contact-info-card h-100 p-custom-card d-flex flex-column justify-content-between">
              <div>
                <h4 className="fw-bold text-white mb-3">Let's talk about your portfolio</h4>
                <p className="text-white-50 mb-4 small">
                  Fill out the form and our property solutions specialists will reach out to you within 24 hours.
                </p>

                <div className="d-flex flex-column gap-custom-list mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="info-icon bg-orange-trans">
                      <i className="bi bi-envelope-fill text-orange-accent"></i>
                    </div>
                    <div>
                      <div className="info-label">Email Us</div>
                      <a href="mailto:support@anvaya360.com" className="info-value text-white text-decoration-none">support@anvaya360.com</a>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="info-icon bg-orange-trans">
                      <i className="bi bi-telephone-fill text-orange-accent"></i>
                    </div>
                    <div>
                      <div className="info-label">Call Us</div>
                      <a href="tel:+919876543210" className="info-value text-white text-decoration-none">+91 98765 43210</a>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="info-icon bg-orange-trans">
                      <i className="bi bi-geo-alt-fill text-orange-accent"></i>
                    </div>
                    <div>
                      <div className="info-label">Our Headquarters</div>
                      <div className="info-value text-white-50">Indiranagar, Bengaluru, KA, India</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal geometric background pattern */}
              <div className="info-pattern position-relative overflow-hidden rounded-3 p-3 text-center">
                <i className="bi bi-building text-white-10 fs-1"></i>
                <div className="text-white-50 small mt-2 fw-semibold">ANVAYA360 Enterprise OS</div>
              </div>
            </div>
          </div>

          {/* Column 2 - Interactive Form */}
          <div className="col-lg-7 col-md-12 animate__animated animate__fadeInRight">
            <div className="contact-form-card p-custom-card">
              {submitted ? (
                <div className="success-overlay d-flex flex-column align-items-center justify-content-center text-center h-100 py-5">
                  <div className="success-icon mb-3">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Message Sent Successfully!</h5>
                  <p className="text-muted small mb-0">Thank you for reaching out. We will connect with you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6 col-12">
                      <div className="form-group-custom">
                        <label className="form-label-custom">Full Name</label>
                        <input
                          type="text"
                          className="form-control-custom"
                          placeholder="John Doe"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <div className="form-group-custom">
                        <label className="form-label-custom">Email Address</label>
                        <input
                          type="email"
                          className="form-control-custom"
                          placeholder="john@example.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group-custom">
                        <label className="form-label-custom">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control-custom"
                          placeholder="+91 98765 43210"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group-custom">
                        <label className="form-label-custom">How can we help?</label>
                        <textarea
                          className="form-control-custom textarea-custom"
                          rows={4}
                          placeholder="Tell us about your property portfolio..."
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                      </div>
                    </div>
                    <div className="col-12 text-end mt-4">
                      <button type="submit" className="btn btn-orange-contact rounded-pill px-4.5 py-2.5 fw-bold text-white transition-all hover-lift">
                        Send Message <i className="bi bi-send-fill ms-2 small"></i>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .contact-badge {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #2563eb;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .contact-info-card {
          background-color: #0f172a;
          border-radius: 20px;
          color: #ffffff;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.15);
        }

        .bg-orange-trans {
          background: rgba(255, 111, 0, 0.15);
          border: 1px solid rgba(255, 111, 0, 0.25);
        }

        .text-orange-accent {
          color: #ff7a00;
        }

        .info-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .info-label {
          font-size: 0.6rem;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 0.82rem;
          font-weight: 600;
        }

        .info-pattern {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .text-white-10 {
          color: rgba(255, 255, 255, 0.1);
        }

        /* Form Card */
        .contact-form-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
          height: 100%;
        }

        .form-group-custom {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }

        .form-label-custom {
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .form-control-custom {
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 0.85rem;
          color: #0f172a;
          outline: none;
          background: #f8fafc;
          transition: all 0.2s ease;
        }

        .form-control-custom:focus {
          border-color: #ff7a00;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.12);
        }

        .textarea-custom {
          resize: none;
        }

        .btn-orange-contact {
          background: linear-gradient(135deg, #ff7a00 0%, #ff5500 100%) !important;
          border: none !important;
          box-shadow: 0 8px 15px -3px rgba(255, 111, 0, 0.3);
          font-size: 0.85rem;
        }

        .btn-orange-contact:hover {
          background: linear-gradient(135deg, #ff8c00 0%, #ff6f00 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -3px rgba(255, 111, 0, 0.4);
        }

        .success-icon {
          font-size: 2.5rem;
          color: #10b981;
        }

        .p-custom-card {
          padding: 2.5rem !important;
        }

        .gap-custom-list {
          gap: 1.75rem !important;
        }
      `}</style>
    </section>
  );
}
