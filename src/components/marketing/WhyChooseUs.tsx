"use client";

import React from "react";

interface WhyItem {
  icon: string;
  title: string;
  badge: string;
  desc: string;
}

export default function WhyChooseUs() {
  const whyList: WhyItem[] = [
    {
      icon: "bi-stars",
      title: "AI Powered",
      badge: "Smart Copilot",
      desc: "Built-in predictive intelligence for payment risks, maintenance schedule alerts, and automated workflow dispatch."
    },
    {
      icon: "bi-cloud-check-fill",
      title: "Cloud Based",
      badge: "99.99% Uptime",
      desc: "Access your property data securely from any browser or smartphone worldwide with multi-region backup."
    },
    {
      icon: "bi-layout-text-window-reverse",
      title: "Modern UI",
      badge: "Zero Training",
      desc: "Intuitive, clean interface designed for effortless navigation by staff, managers, owners, and tenants alike."
    },
    {
      icon: "bi-graph-up-arrow",
      title: "Real Time Analytics",
      badge: "Live Insights",
      desc: "Instant live dashboards tracking rental revenue, occupancy heatmaps, open SLA tickets, and visitor flow."
    },
    {
      icon: "bi-person-badge-fill",
      title: "Role Based Access",
      badge: "Granular Controls",
      desc: "Customize strict security roles and data permissions for super admins, floor managers, accounting, and staff."
    },
    {
      icon: "bi-shield-lock-fill",
      title: "Secure Architecture",
      badge: "Bank-Grade Encryption",
      desc: "256-bit AES encryption in transit and at rest, SOC2 compliance, and automated daily data snapshots."
    },
    {
      icon: "bi-phone-fill",
      title: "Mobile First",
      badge: "iOS & Android",
      desc: "Full-featured mobile apps for staff check-ins, gate passes, maintenance tickets, and owner approvals on the go."
    },
    {
      icon: "bi-lightning-charge-fill",
      title: "Fast Performance",
      badge: "< 50ms Latency",
      desc: "High-speed database indexing engineered to process millions of transactions smoothly at lightning speed."
    },
    {
      icon: "bi-diagram-3-fill",
      title: "Scalable Infrastructure",
      badge: "Unlimited Growth",
      desc: "Seamlessly expand from managing a single commercial building to thousands of units across global markets."
    },
    {
      icon: "bi-code-slash",
      title: "API Ready",
      badge: "Webhooks & Sync",
      desc: "REST APIs and webhooks to integrate effortlessly with your accounting tools, ERPs, and IoT turnstiles."
    }
  ];

  return (
    <section className="py-5 bg-white border-bottom position-relative">
      <div className="container py-lg-4">
        
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
            <span className="mkt-pulse-dot"></span>
            <span>CORE ADVANTAGES</span>
          </div>
          <h2 className="mkt-title mb-3">Why Businesses Choose Mirai CloudIT SERVICES</h2>
          <p className="mkt-subtitle mx-auto text-muted">
            Engineered from the ground up for speed, security, elegance, and enterprise scalability.
          </p>
        </div>

        {/* Large Feature Grid */}
        <div className="row g-4">
          {whyList.map((item, idx) => (
            <div className="col-lg-6 col-md-6 col-sm-12 animate-fade-up" key={idx} style={{ animationDelay: `${idx * 0.04}s` }}>
              <div className="mkt-card-clean p-4 h-100 d-flex align-items-start gap-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 p-3 flex-shrink-0" style={{ width: 56, height: 56, background: 'var(--brand-orange)_BG', color: 'var(--brand-orange)' }}>
                  <i className={`bi ${item.icon} fs-3`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h5 className="fw-bold text-dark mb-0 fs-6">{item.title}</h5>
                    <span className="badge" style={{ background: 'var(--brand-orange)_BG', color: 'var(--brand-orange)', border: '1px solid var(--brand-orange)_BORDER', fontSize: '0.65rem' }}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                    {item.desc}
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
