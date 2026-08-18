"use client";

import React from "react";

interface ServiceCardItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export default function Services() {
  const servicesList: ServiceCardItem[] = [
    {
      id: "cloud",
      icon: "bi-cloud",
      title: "Cloud Services",
      desc: "Secure, scalable cloud strategies for migration, hosting and optimisation.",
    },
    {
      id: "network",
      icon: "bi-diagram-3",
      title: "Network Infrastructure",
      desc: "Reliable connectivity, switching, routing and enterprise network design.",
    },
    {
      id: "cybersecurity",
      icon: "bi-shield-check",
      title: "Cybersecurity",
      desc: "Threat protection, monitoring and security frameworks for modern teams.",
    },
    {
      id: "datacenter",
      icon: "bi-layout-split",
      title: "Data Center Solutions",
      desc: "High-performance infrastructure planning, deployment and operations.",
    },
    {
      id: "communication",
      icon: "bi-telephone-inbound",
      title: "Business Communication",
      desc: "Unified communication systems that keep your teams connected.",
    },
    {
      id: "cctv",
      icon: "bi-camera-video",
      title: "CCTV & Surveillance",
      desc: "Smart surveillance and monitoring systems for safer workplaces.",
    },
    {
      id: "itsupport",
      icon: "bi-tools",
      title: "IT Support & AMC",
      desc: "Responsive support and preventive maintenance for business continuity.",
    },
    {
      id: "webdev",
      icon: "bi-display",
      title: "Website Development",
      desc: "Modern, responsive digital experiences built around your business goals.",
    },
  ];

  return (
    <section id="services" className="py-5 bg-white border-bottom position-relative">
      <div className="container py-lg-4">
        
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-2 px-3 py-1 rounded-pill" style={{ backgroundColor: "#eff6ff", border: "1px solid #dbeafe" }}>
            <span className="extra-small fw-bold text-uppercase" style={{ color: "#2563eb", letterSpacing: "0.05em", fontSize: "0.72rem" }}>
              OUR SERVICES
            </span>
          </div>
          <h2 className="mkt-title mb-2" style={{ fontWeight: 800, fontSize: "2.25rem", color: "#0f172a" }}>
            Technology solutions built for resilience and scale.
          </h2>
          <p className="mkt-subtitle mx-auto text-secondary" style={{ maxWidth: 680, fontSize: "0.95rem" }}>
            From cloud migration to cybersecurity and managed IT, we help businesses modernise with confidence.
          </p>
        </div>

        {/* 8 Cards Grid (4 per row on LG) */}
        <div className="row g-4">
          {servicesList.map((item, idx) => (
            <div className="col-lg-3 col-md-6 col-sm-12" key={item.id}>
              <div
                className="p-4 bg-white h-100 d-flex flex-column justify-content-between position-relative"
                style={{
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  transition: "all 0.25s ease-in-out",
                }}
              >
                <div>
                  {/* Icon Container */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 mb-4"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <i className={`bi ${item.icon} fs-5`}></i>
                  </div>

                  {/* Title */}
                  <h5 className="fw-extrabold mb-2" style={{ fontSize: "1.08rem", color: "#0f172a" }}>
                    {item.title}
                  </h5>

                  {/* Description */}
                  <p className="text-secondary small mb-4" style={{ lineHeight: 1.6, fontSize: "0.86rem", color: "#64748b" }}>
                    {item.desc}
                  </p>
                </div>

                {/* Blue Arrow Button */}
                <div>
                  <a
                    href="#contact"
                    className="d-inline-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                    style={{
                      width: 34,
                      height: 34,
                      backgroundColor: "#f8fafc",
                      color: "#2563eb",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className="bi bi-arrow-up-right small"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
