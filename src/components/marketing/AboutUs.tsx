"use client";

import React from "react";

export default function AboutUs() {
  return (
    <section className="py-5 py-lg-6 bg-white position-relative overflow-hidden" id="about">
      <div className="container py-lg-3">
        <div className="row align-items-center g-5">
          
          {/* Left Content Column */}
          <div className="col-lg-6">
            <div className="pe-lg-3">
              
              {/* Badge */}
              <span className="d-inline-block text-primary fw-bold small text-uppercase mb-2" style={{ letterSpacing: "0.08em", fontSize: "0.8rem", color: "#2563eb" }}>
                ABOUT MIRAI
              </span>
              
              {/* Main Heading */}
              <h2 className="fw-extrabold text-dark mb-3 display-6" style={{ fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a", lineHeight: 1.25 }}>
                Helping businesses move confidently into what's next.
              </h2>
              
              {/* Description Paragraph */}
              <p className="text-secondary mb-4 mb-lg-5" style={{ fontSize: "0.98rem", lineHeight: 1.65, color: "#64748b" }}>
                Mirai Cloud IT Services is a trusted technology partner delivering secure, intelligent and scalable infrastructure for businesses across India.
              </p>
              
              {/* Vision & Mission Cards Row */}
              <div className="row g-3">
                
                {/* Vision Card */}
                <div className="col-sm-6">
                  <div 
                    className="p-4 bg-white rounded-4 h-100 transition-all"
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)"
                    }}
                  >
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: 44, height: 44, backgroundColor: "#eff6ff", color: "#2563eb" }}
                    >
                      <i className="bi bi-eye-fill fs-5"></i>
                    </div>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem", color: "#0f172a" }}>
                      Our Vision
                    </h5>
                    <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, color: "#64748b", fontSize: "0.86rem" }}>
                      To shape a more connected, secure and efficient digital future.
                    </p>
                  </div>
                </div>
                
                {/* Mission Card */}
                <div className="col-sm-6">
                  <div 
                    className="p-4 bg-white rounded-4 h-100 transition-all"
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)"
                    }}
                  >
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{ width: 44, height: 44, backgroundColor: "#eff6ff", color: "#2563eb" }}
                    >
                      <i className="bi bi-bullseye fs-5"></i>
                    </div>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem", color: "#0f172a" }}>
                      Our Mission
                    </h5>
                    <p className="text-secondary small mb-0" style={{ lineHeight: 1.55, color: "#64748b", fontSize: "0.86rem" }}>
                      To empower businesses with technology that works seamlessly every day.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Image Column with Floating Overlay */}
          <div className="col-lg-6 position-relative">
            <div className="position-relative ps-lg-2">
              
              {/* Main Image */}
              <img 
                src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1280"
                alt="Mirai Team Strategy Meeting"
                className="img-fluid w-100"
                style={{
                  borderRadius: "20px",
                  objectFit: "cover",
                  maxHeight: "520px",
                  boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.12)"
                }}
              />

              {/* Floating Overlay Badge */}
              <div 
                className="bg-white d-flex align-items-center gap-3"
                style={{
                  position: "absolute",
                  bottom: "24px",
                  left: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "12px 20px",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
                  zIndex: 2,
                  maxWidth: "280px"
                }}
              >
                <div 
                  className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                  style={{ width: 42, height: 42, backgroundColor: "#eff6ff", color: "#2563eb" }}
                >
                  <i className="bi bi-people-fill fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.92rem", color: "#0f172a" }}>
                    Expert-led delivery
                  </h6>
                  <p className="text-secondary extra-small mb-0" style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Strategy. Build. Support.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
