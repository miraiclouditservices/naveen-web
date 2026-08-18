"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#070d19",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      className="pt-5 pb-4"
    >
      <div className="container py-lg-3">
        <div className="row gy-4 mb-5 justify-content-between">
          
          {/* Column 1: Brand Logo + Tagline + Social Icons */}
          <div className="col-lg-3 col-md-6">
            <div className="mb-3">
              <Link href="/" className="d-flex align-items-center text-decoration-none">
                <img
                  src="/mirai_logo.png"
                  alt="Mirai Cloud IT SERVICES"
                  style={{ height: 44 }}
                  className="w-auto object-fit-contain"
                />
              </Link>
            </div>
            
            <p
              className="small mb-4"
              style={{
                color: "#8b9cb8",
                lineHeight: 1.6,
                fontSize: "0.88rem",
                maxWidth: 300,
              }}
            >
              Secure, scalable and reliable technology solutions for businesses ready to move forward.
            </p>

            {/* Social Icons */}
            <div className="d-flex align-items-center gap-2">
              <a
                href="#"
                className="d-flex align-items-center justify-content-center rounded-3 text-decoration-none"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "#111b2e",
                  color: "#8b9cb8",
                  border: "1px solid #1a273e",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bi bi-linkedin small"></i>
              </a>
              <a
                href="#"
                className="d-flex align-items-center justify-content-center rounded-3 text-decoration-none"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "#111b2e",
                  color: "#8b9cb8",
                  border: "1px solid #1a273e",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bi bi-instagram small"></i>
              </a>
              <a
                href="#"
                className="d-flex align-items-center justify-content-center rounded-3 text-decoration-none"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "#111b2e",
                  color: "#8b9cb8",
                  border: "1px solid #1a273e",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bi bi-facebook small"></i>
              </a>
              <a
                href="#"
                className="d-flex align-items-center justify-content-center rounded-3 text-decoration-none"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "#111b2e",
                  color: "#8b9cb8",
                  border: "1px solid #1a273e",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bi bi-whatsapp small"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="col-lg-2 col-md-6 col-6">
            <div className="mb-3 position-relative d-inline-block">
              <h6
                className="fw-bold text-white mb-2"
                style={{ fontSize: "1rem", letterSpacing: "0.01em" }}
              >
                Company
              </h6>
              <div
                style={{
                  width: 28,
                  height: 3,
                  backgroundColor: "#2563eb",
                  borderRadius: 2,
                }}
              ></div>
            </div>

            <ul className="list-unstyled d-flex flex-column gap-2.5 pt-1 mb-0 small" style={{ color: "#8b9cb8", fontSize: "0.88rem" }}>
              <li>
                <a href="/" className="text-decoration-none text-reset hover-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#modules" className="text-decoration-none text-reset hover-white">
                  Services
                </a>
              </li>
              <li>
                <a href="#who-uses" className="text-decoration-none text-reset hover-white">
                  Industries
                </a>
              </li>
              <li>
                <a href="#problems" className="text-decoration-none text-reset hover-white">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div className="col-lg-3 col-md-6 col-6">
            <div className="mb-3 position-relative d-inline-block">
              <h6
                className="fw-bold text-white mb-2"
                style={{ fontSize: "1rem", letterSpacing: "0.01em" }}
              >
                Solutions
              </h6>
              <div
                style={{
                  width: 28,
                  height: 3,
                  backgroundColor: "#2563eb",
                  borderRadius: 2,
                }}
              ></div>
            </div>

            <ul className="list-unstyled d-flex flex-column gap-2.5 pt-1 mb-0 small" style={{ color: "#8b9cb8", fontSize: "0.88rem" }}>
              <li>
                <a href="#modules" className="text-decoration-none text-reset hover-white">
                  Cloud Services
                </a>
              </li>
              <li>
                <a href="#modules" className="text-decoration-none text-reset hover-white">
                  Cybersecurity
                </a>
              </li>
              <li>
                <a href="#modules" className="text-decoration-none text-reset hover-white">
                  Network Infrastructure
                </a>
              </li>
              <li>
                <a href="#modules" className="text-decoration-none text-reset hover-white">
                  Managed IT Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Get in touch */}
          <div className="col-lg-4 col-md-6">
            <div className="mb-3 position-relative d-inline-block">
              <h6
                className="fw-bold text-white mb-2"
                style={{ fontSize: "1rem", letterSpacing: "0.01em" }}
              >
                Get in touch
              </h6>
              <div
                style={{
                  width: 28,
                  height: 3,
                  backgroundColor: "#2563eb",
                  borderRadius: 2,
                }}
              ></div>
            </div>

            <div className="d-flex flex-column gap-3 pt-1 small" style={{ color: "#8b9cb8", fontSize: "0.88rem" }}>
              <div className="d-flex align-items-center gap-2.5">
                <i className="bi bi-envelope fs-6 text-primary" style={{ color: "#2563eb" }}></i>
                <a
                  href="mailto:info@miraiclouditservices.com"
                  className="text-decoration-none text-reset hover-white text-break"
                >
                  info@miraiclouditservices.com
                </a>
              </div>

              <div className="d-flex align-items-center gap-2.5">
                <i className="bi bi-telephone fs-6 text-primary" style={{ color: "#2563eb" }}></i>
                <a
                  href="tel:+919100218218"
                  className="text-decoration-none text-reset hover-white"
                >
                  +91 91002 18218
                </a>
              </div>

              <div className="d-flex align-items-start gap-2.5">
                <i className="bi bi-geo-alt fs-6 text-primary mt-0.5" style={{ color: "#2563eb" }}></i>
                <span style={{ lineHeight: 1.5, maxWidth: 320 }}>
                  Kalki chambers A Block 108, NH 65, widia colony Miyapur, Hyderabad, India, 502032
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Footer Line */}
        <div
          className="pt-4 mt-2 d-flex flex-column flex-md-row align-items-center justify-content-between small"
          style={{
            borderTop: "1px solid #111e36",
            color: "#64748b",
            fontSize: "0.85rem",
          }}
        >
          <p className="mb-2 mb-md-0">
            © {new Date().getFullYear()} Mirai Cloud IT Services. All rights reserved.
          </p>
          <div className="d-flex align-items-center gap-4">
            <a href="#" className="text-decoration-none text-reset hover-white">
              Privacy Policy
            </a>
            <a href="#" className="text-decoration-none text-reset hover-white">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
