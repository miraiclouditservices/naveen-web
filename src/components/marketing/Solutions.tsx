"use client";

import React from "react";

interface IndustryCard {
  number: string;
  title: string;
  desc: string;
  image: string;
}

export default function Solutions() {
  const industries: IndustryCard[] = [
    {
      number: "01",
      title: "Manufacturing",
      desc: "Connected plants, secure networks and real-time operational visibility.",
      image: "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      number: "02",
      title: "Education",
      desc: "Smarter campuses with Wi-Fi, cloud tools and safer learning environments.",
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      number: "03",
      title: "Healthcare",
      desc: "Protected data, resilient systems and communication that never misses a beat.",
      image: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      number: "04",
      title: "Banking & Finance",
      desc: "Secure infrastructure and continuity-focused systems for critical operations.",
      image: "https://images.pexels.com/photos/210574/pexels-photo-210574.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  return (
    <section className="py-5 py-lg-6 bg-white position-relative border-bottom" id="solutions">
      <div className="container py-lg-3">
        
        {/* Header Row: Badge, Title & Paragraph */}
        <div className="row align-items-end g-4 mb-5">
          <div className="col-lg-7">
            <span className="d-inline-block text-primary fw-bold small text-uppercase mb-2" style={{ letterSpacing: "0.08em", fontSize: "0.8rem", color: "#2563eb" }}>
              INDUSTRIES WE EMPOWER
            </span>
            <h2 className="fw-extrabold text-dark mb-0 display-6" style={{ fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a", lineHeight: 1.2 }}>
              Built around the way your industry works.
            </h2>
          </div>
          <div className="col-lg-5">
            <p className="text-secondary mb-0" style={{ fontSize: "0.96rem", lineHeight: 1.65, color: "#64748b" }}>
              Every sector has different operational realities. We shape infrastructure, security and collaboration systems around yours.
            </p>
          </div>
        </div>

        {/* 4 Industry Cards Responsive Grid */}
        <div className="row g-4">
          {industries.map((ind, idx) => (
            <div className="col-lg-3 col-md-6 col-sm-12" key={idx}>
              <div 
                className="bg-white rounded-4 h-100 overflow-hidden transition-all"
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease"
                }}
              >
                {/* Industry Card Image */}
                <div className="overflow-hidden" style={{ height: "190px" }}>
                  <img 
                    src={ind.image} 
                    alt={ind.title}
                    className="w-100 h-100 object-fit-cover"
                    style={{ transition: "transform 0.4s ease" }}
                  />
                </div>

                {/* Industry Card Content Body */}
                <div className="p-4">
                  {/* Number Badge */}
                  <span className="d-block fw-extrabold mb-1" style={{ color: "#2563eb", fontWeight: 800, fontSize: "0.9rem" }}>
                    {ind.number}
                  </span>

                  {/* Industry Title */}
                  <h4 className="fw-bold text-dark mb-2" style={{ fontSize: "1.12rem", fontWeight: 800, color: "#0f172a" }}>
                    {ind.title}
                  </h4>

                  {/* Industry Description */}
                  <p className="text-secondary small mb-0" style={{ color: "#64748b", fontSize: "0.86rem", lineHeight: 1.55 }}>
                    {ind.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
