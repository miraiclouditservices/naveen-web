"use client";

import React, { useState } from "react";

interface ModuleItem {
  id: string;
  icon: string;
  title: string;
  badge: string;
  desc: string;
  bullets: string[];
}

export default function Modules() {
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);

  const modules: ModuleItem[] = [
    {
      id: "crm",
      icon: "bi-funnel-fill",
      title: "CRM & Sales Pipeline",
      badge: "Leads & Deals",
      desc: "Manage sales leads, deal pipelines, customer interactions, and conversion analytics.",
      bullets: ["Lead qualification funnel", "Pipeline stage tracking", "Automated email alerts"]
    },
    {
      id: "property",
      icon: "bi-building-fill",
      title: "Property Management",
      badge: "Units & Leases",
      desc: "Centralize buildings, floor units, tenant registries, lease agreements, and CAM charges.",
      bullets: ["Unit availability map", "Lease escalation index", "Automated rent invoicing"]
    },
    {
      id: "coworking",
      icon: "bi-border-all",
      title: "Coworking & Flex Space",
      badge: "Desks & Passes",
      desc: "Manage flex desk allocations, private suites, member subscriptions, and meeting room credits.",
      bullets: ["Interactive desk planner", "Meeting room bookings", "Credit subscription billing"]
    },
    {
      id: "employees",
      icon: "bi-people-fill",
      title: "Employees & HR Vault",
      badge: "Staff Directory",
      desc: "Employee profiles, department roles, document management, and onboarding workflows.",
      bullets: ["Granular role permissions", "Secure document storage", "Staff onboarding checklists"]
    },
    {
      id: "attendance",
      icon: "bi-clock-history",
      title: "Attendance & Shifts",
      badge: "Geo-Fence Log",
      desc: "Track employee shifts, leaves, overtime, geo-fenced mobile check-ins, and holidays.",
      bullets: ["Geo-fence mobile punch", "Shift rotation schedules", "Leave request approvals"]
    },
    {
      id: "visitor",
      icon: "bi-person-badge-fill",
      title: "Visitor Management",
      badge: "Digital QR Pass",
      desc: "Digital QR gate passes, instant host SMS approvals, and security visitor logs.",
      bullets: ["Instant QR invitation", "Host approval notifications", "Digital gate entry logbook"]
    },
    {
      id: "helpdesk",
      icon: "bi-ticket-detailed-fill",
      title: "Helpdesk & SLA Tickets",
      badge: "Maintenance",
      desc: "Tenant maintenance requests, automated ticket dispatch, SLA resolution, and ratings.",
      bullets: ["Auto staff ticket dispatch", "SLA escalation timers", "Tenant satisfaction feedback"]
    },
    {
      id: "assets",
      icon: "bi-box-seam-fill",
      title: "Asset & AMC Tracking",
      badge: "QR Inventory",
      desc: "QR code asset tagging, AMC contract schedules, preventive maintenance, and warranty logs.",
      bullets: ["QR asset code tagging", "AMC renewal reminders", "Depreciation history logs"]
    },
    {
      id: "vendor",
      icon: "bi-truck-front-fill",
      title: "Vendor Management",
      badge: "Payables & Contracts",
      desc: "Vendor service contracts, invoice payables tracking, purchase orders, and ratings.",
      bullets: ["Service contract vault", "Invoice approval routing", "Vendor performance scorecard"]
    },
    {
      id: "reports",
      icon: "bi-file-earmark-bar-graph-fill",
      title: "Reports & Financial Statements",
      badge: "PDF & Excel",
      desc: "Generate comprehensive financial statements, rent rolls, tax reports, and 1-click Excel exports.",
      bullets: ["1-Click Excel/CSV exports", "Automated PDF statement dispatch", "Audit trail compliance"]
    },
    {
      id: "ai_assistant",
      icon: "bi-stars",
      title: "AI Assistant & Predictive BI",
      badge: "Smart Copilot",
      desc: "AI copilot for predictive maintenance, payment risk alerts, and automated operational forecasting.",
      bullets: ["Predictive payment risk alerts", "Natural language query search", "Revenue yield forecasting"]
    }
  ];

  return (
    <section id="modules" className="py-5 bg-light border-bottom position-relative">
      <div className="container py-lg-3">
        
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
            <span className="mkt-pulse-dot"></span>
            <span>INTELLIGENT MODULE GRID</span>
          </div>
          <h2 className="mkt-title mb-3">Everything You Need</h2>
          <p className="mkt-subtitle mx-auto text-secondary">
            Turn on what you need today. Add the rest whenever you're ready — all integrated seamlessly.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="row g-4">
          {modules.map((mod, idx) => (
            <div className="col-lg-4 col-md-6 col-sm-12 animate-fade-up" key={idx} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div 
                className="mkt-card-clean p-4 h-100 d-flex flex-column justify-content-between cursor-pointer"
                onClick={() => setSelectedModule(mod)}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center justify-content-center rounded-3 p-2" style={{ width: 44, height: 44, background: 'var(--brand-orange)_BG', color: 'var(--brand-orange)' }}>
                      <i className={`bi ${mod.icon} fs-4`}></i>
                    </div>
                    <span className="badge" style={{ background: 'var(--brand-orange)_BG', color: 'var(--brand-orange)', border: '1px solid var(--brand-orange)_BORDER', fontSize: '0.68rem' }}>
                      {mod.badge}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2 fs-6">{mod.title}</h5>
                  <p className="text-muted small mb-3" style={{ lineHeight: 1.5 }}>
                    {mod.desc}
                  </p>

                  <ul className="list-unstyled mb-0 d-flex flex-column gap-1.5">
                    {mod.bullets.map((b, i) => (
                      <li key={i} className="extra-small text-secondary d-flex align-items-center gap-1.5">
                        <i className="bi bi-check2 text-orange fw-bold" style={{ color: 'var(--brand-orange)' }}></i>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 mt-4 border-top d-flex align-items-center justify-content-between">
                  <span className="extra-small text-muted fw-bold text-uppercase">Module Workflow</span>
                  <span className="extra-small fw-bold" style={{ color: 'var(--brand-orange)' }}>
                    View Feature <i className="bi bi-arrow-right ms-1"></i>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal Feature Popup */}
      {selectedModule && (
        <div className="position-fixed inset-0 bg-dark bg-opacity-50 backdrop-blur d-flex align-items-center justify-content-center p-3 z-100" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-4 p-4 max-w-lg w-100 border shadow-lg position-relative animate-fade-up">
            <button className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setSelectedModule(null)}></button>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle p-2 bg-orange bg-opacity-10 text-orange" style={{ background: 'var(--brand-orange)_BG', color: 'var(--brand-orange)' }}>
                <i className={`bi ${selectedModule.icon} fs-4`}></i>
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">{selectedModule.title}</h5>
                <span className="badge bg-light text-dark">{selectedModule.badge}</span>
              </div>
            </div>
            <p className="text-muted small mb-4">{selectedModule.desc}</p>
            <h6 className="extra-small text-muted fw-bold text-uppercase mb-2">Key Workflows Included</h6>
            <div className="d-flex flex-column gap-2 mb-4">
              {selectedModule.bullets.map((b, i) => (
                <div key={i} className="p-2 rounded bg-light d-flex align-items-center gap-2 small text-dark">
                  <i className="bi bi-check-circle-fill" style={{ color: 'var(--brand-orange)' }}></i>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-orange-primary w-100" onClick={() => setSelectedModule(null)}>
              Close Feature Preview
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
