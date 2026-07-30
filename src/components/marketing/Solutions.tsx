"use client";

import React from "react";

interface SolutionItem {
  icon: string;
  title: string;
  desc: string;
  features: string[];
}

export default function Solutions() {
  const list: SolutionItem[] = [
    {
      icon: "bi-building-fill",
      title: "Commercial Buildings",
      desc: "Manage tenants, leases, maintenance and assets seamlessly in one platform.",
      features: ["Tenant directory", "Lease escalations", "CAM charges", "Asset maintenance"]
    },
    {
      icon: "bi-border-all",
      title: "Coworking Spaces",
      desc: "Manage members, desks, bookings and billing with zero operational friction.",
      features: ["Hot desk maps", "Meeting room credits", "Flex memberships", "Auto billing"]
    },
    {
      icon: "bi-briefcase-fill",
      title: "Corporate Offices",
      desc: "Employees, visitors, attendance and facilities managed effortlessly.",
      features: ["Staff directory", "QR visitor passes", "Geo-fence check-in", "Facility helpdesk"]
    },
    {
      icon: "bi-backpack-fill",
      title: "Schools & Colleges",
      desc: "Staff attendance, visitors, campus security and facility operations.",
      features: ["Campus security logs", "Staff rosters", "Visitor approvals", "Asset AMC"]
    },
    {
      icon: "bi-hospital-fill",
      title: "Hospitals & Healthcare",
      desc: "Departments, visitors, equipment tracking and facility operations.",
      features: ["Department access", "Visitor passes", "Equipment QR tags", "Shift schedules"]
    },
    {
      icon: "bi-building-fill-check",
      title: "Hotels & Serviced Apts",
      desc: "Guest stays, housekeeping maintenance dispatch and daily revenue logs.",
      features: ["Guest checkout", "Housekeeping dispatch", "Room maintenance", "Daily revenue"]
    },
    {
      icon: "bi-house-gear-fill",
      title: "Warehouses & Industrial",
      desc: "Inventory tracking, dock loading bays, heavy assets and workforce.",
      features: ["Dock bay logs", "Asset maintenance", "Gate security", "Worker shifts"]
    },
    {
      icon: "bi-tools",
      title: "Facility Management",
      desc: "Complete operations management for multi-site commercial portfolios.",
      features: ["Multi-site SLAs", "Ticket dispatch", "Vendor contracts", "Audit reports"]
    }
  ];

  return (
    <section className="py-5 bg-white border-bottom position-relative">
      <div className="container py-lg-4">
        
        {/* Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
            <span className="mkt-pulse-dot"></span>
            <span>SOLUTIONS BY SECTOR</span>
          </div>
          <h2 className="mkt-title mb-3">Industries & Solutions</h2>
          <p className="mkt-subtitle mx-auto text-muted">
            Tailored workflows for your industry — configured out of the box.
          </p>
        </div>

        {/* Grid */}
        <div className="row g-4">
          {list.map((item, idx) => (
            <div className="col-lg-3 col-md-6 col-sm-12 animate-fade-up" key={idx} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="mkt-card-clean p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-center rounded-3 p-2.5 mb-3" style={{ width: 46, height: 46, background: 'var(--brand-orange)_BG', color: 'var(--brand-orange)' }}>
                    <i className={`bi ${item.icon} fs-4`}></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2 fs-6">{item.title}</h5>
                  <p className="text-muted small mb-3" style={{ lineHeight: 1.5 }}>{item.desc}</p>
                  
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                    {item.features.map((f, i) => (
                      <li key={i} className="extra-small text-secondary d-flex align-items-center gap-1.5">
                        <i className="bi bi-check2 fw-bold" style={{ color: 'var(--brand-orange)' }}></i>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 mt-3 border-top d-flex align-items-center justify-content-between">
                  <span className="extra-small text-muted fw-bold text-uppercase">Explore Workflow</span>
                  <i className="bi bi-arrow-right" style={{ color: 'var(--brand-orange)' }}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
