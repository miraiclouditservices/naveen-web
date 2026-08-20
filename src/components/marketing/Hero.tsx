"use client";

import React from "react";

export default function Hero() {
  return (
    <section
      className="position-relative overflow-hidden py-5 py-lg-6 border-bottom"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
        backgroundSize: "36px 36px"
      }}
    >
      <div className="container py-lg-4">
        <div className="row gy-5 align-items-center">

          {/* Left Column: Headline, Copy & CTAs */}
          <div className="col-lg-6">
            <div className="pe-lg-3">

              {/* Pill Badge */}
              <div
                className="d-inline-flex align-items-center gap-2 mb-3"
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #dbeafe",
                  borderRadius: "9999px",
                  padding: "6px 14px"
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2563eb", display: "inline-block" }}></span>
                <span className="fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.06em", color: "#2563eb" }}>
                  LEADER IN IT SERVICES
                </span>
              </div>

              {/* Main Headline */}
              <h3
                className="fw-extrabold text-dark mb-3"
                style={{
                  // fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.18,
                  letterSpacing: "-0.03em"
                }}
              >
                Empowering Businesses with Cloud, Cybersecurity &amp; IT Infrastructure Solutions
              </h3>

              {/* Sub-headline */}
              <p
                className="mb-4 text-secondary"
                style={{
                  fontSize: "1.08rem",
                  color: "#64748b",
                  lineHeight: 1.6,
                  maxWidth: "540px"
                }}
              >
                We design, secure and manage the digital foundations that help organisations scale with confidence.
              </p>

              {/* CTA Action Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <a
                  href="#contact"
                  className="btn text-white fw-bold d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: "#1d4ed8",
                    color: "#ffffff",
                    borderRadius: "9999px",
                    padding: "14px 28px",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    border: "none",
                    boxShadow: "0 4px 14px rgba(29, 78, 216, 0.35)",
                    transition: "all 0.25s ease"
                  }}
                >
                  Get a Quote <i className="bi bi-arrow-up-right" style={{ fontSize: "0.95rem" }}></i>
                </a>

                <a
                  href="#contact"
                  className="btn bg-white fw-bold d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9999px",
                    padding: "14px 28px",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    transition: "all 0.25s ease"
                  }}
                >
                  <i className="bi bi-telephone" style={{ fontSize: "0.95rem", color: "#0f172a" }}></i> Contact Us
                </a>
              </div>

              {/* Trust Signals Row */}
              <div className="d-flex flex-wrap align-items-center gap-4 pt-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill fs-5" style={{ color: "#2563eb" }}></i>
                  <span className="fw-bold text-dark" style={{ fontSize: "0.88rem", color: "#0f172a" }}>
                    24/7 Support
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill fs-5" style={{ color: "#2563eb" }}></i>
                  <span className="fw-bold text-dark" style={{ fontSize: "0.88rem", color: "#0f172a" }}>
                    Enterprise Security
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill fs-5" style={{ color: "#2563eb" }}></i>
                  <span className="fw-bold text-dark" style={{ fontSize: "0.88rem", color: "#0f172a" }}>
                    Scalable Solutions
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Hero Feature Image & Floating Cards */}
          <div className="col-lg-6 position-relative">
            <div className="position-relative ps-lg-2">

              {/* Main Datacenter / Hardware Image */}
              <img
                src="https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg"
                alt="Mirai CloudIT Services Datacenter Infrastructure"
                className="img-fluid w-100"
                style={{
                  borderRadius: "20px",
                  objectFit: "cover",
                  height: "460px",
                  boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15)"
                }}
              />

              {/* Top Right Floating Badge: Security Protected */}
              <div
                className="d-flex align-items-center gap-2"
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  backdropFilter: "blur(8px)",
                  color: "#ffffff",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                  zIndex: 2
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 24, height: 24, backgroundColor: "#2563eb", color: "#ffffff", fontSize: "0.75rem" }}
                >
                  <i className="bi bi-shield-check"></i>
                </div>
                <span className="fw-bold small" style={{ fontSize: "0.82rem" }}>
                  Security Protected
                </span>
              </div>

              {/* Bottom Left Floating Status Card */}
              <div
                className="p-3"
                style={{
                  position: "absolute",
                  bottom: "24px",
                  left: "12px",
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  width: "280px",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
                  zIndex: 2
                }}
              >
                {/* Status Header Line */}
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="text-uppercase fw-bold" style={{ fontSize: "0.65rem", letterSpacing: "0.08em", color: "#94a3b8" }}>
                    INFRASTRUCTURE STATUS
                  </span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 8px #22c55e" }}></span>
                </div>

                {/* Status Title */}
                <h6 className="fw-bold text-white mb-2" style={{ fontSize: "0.95rem" }}>
                  All systems operational
                </h6>

                {/* Progress Bar */}
                <div
                  className="w-100 mb-2 overflow-hidden"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "99px",
                    height: "7px"
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "99px",
                      backgroundColor: "#22c55e",
                      boxShadow: "0 0 10px rgba(34, 197, 94, 0.6)"
                    }}
                  ></div>
                </div>

                {/* Status Footer Row */}
                <div className="d-flex align-items-center justify-content-between" style={{ fontSize: "0.72rem" }}>
                  <span style={{ color: "#94a3b8" }}>Uptime</span>
                  <span className="fw-bold" style={{ color: "#22c55e" }}>99.99%</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
