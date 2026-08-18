"use client";

import React from "react";

export default function Problems() {
  const problems = [
    { title: "Excel Sheets & Disjointed Spreadsheets", desc: "Data fragmentation across teams" },
    { title: "WhatsApp Messages & Unstructured Group Chats", desc: "Missed requests & security risks" },
    { title: "Paper Registers & Manual Logbooks", desc: "Zero audit trail or real-time visibility" },
    { title: "Multiple Expensive Disconnected Software", desc: "Siloed subscriptions & double data entry" },
    { title: "Lost Sales Leads & Delayed Follow-ups", desc: "Revenue leakage across sales funnel" },
    { title: "Manual Attendance & Buddy Punching", desc: "Payroll inaccuracies & attendance fraud" },
    { title: "Paper Visitor Registers at Security Gate", desc: "Unverified visitor entries & security gaps" },
    { title: "Complaint Delays & SLA Breaches", desc: "Frustrated tenants & unresolved tickets" }
  ];

  const solutions = [
    { title: "One Unified Login & Master Portal", desc: "Single login for all properties & modules" },
    { title: "One Real-Time Business Dashboard", desc: "Instant high-level analytics & insights" },
    { title: "One Mobile App for Admin & Tenants", desc: "Seamless iOS & Android mobile accessibility" },
    { title: "AI Automation & Predictive Workflows", desc: "Smart copilot alerts & auto dispatch" },
    { title: "Live Financial & Audit Reports", desc: "1-Click PDF, Excel & compliance exports" },
    { title: "Complete Visibility Across Locations", desc: "Unified operational governance in real-time" }
  ];

  return (
    <section id="problems" className="py-5 bg-white border-bottom position-relative">
      <div className="container py-lg-4">
        
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
            <span className="mkt-pulse-dot"></span>
            <span>PROBLEMS WE SOLVE</span>
          </div>
          <h2 className="mkt-title mb-3">Stop Managing Your Business with Multiple Apps</h2>
          <p className="mkt-subtitle mx-auto text-muted">
            Replace disconnected spreadsheets, messaging groups, and legacy tools with one intelligent ecosystem.
          </p>
        </div>

        {/* Before vs After Comparative Layout */}
        <div className="row g-4 align-items-stretch">
          
          {/* Before Box (Red / Disjointed) */}
          <div className="col-lg-6">
            <div className="p-4 rounded-4 h-100 border border-danger border-opacity-25" style={{ background: '#fef2f2' }}>
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-danger border-opacity-25">
                <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 42, height: 42 }}>
                  <i className="bi bi-x-lg fs-5"></i>
                </div>
                <div>
                  <h4 className="fw-bold text-danger mb-0">BEFORE MIRAI</h4>
                  <span className="small text-danger opacity-75">Chaotic, manual & disconnected operations</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                {problems.map((prob, idx) => (
                  <div key={idx} className="p-3 rounded-3 bg-white border border-danger border-opacity-20 d-flex align-items-start gap-3">
                    <span className="text-danger fw-bold fs-5">❌</span>
                    <div>
                      <h6 className="fw-bold text-dark mb-1 small">{prob.title}</h6>
                      <span className="extra-small text-muted d-block">{prob.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* After Box (Green / Orange Unified) */}
          <div className="col-lg-6">
            <div className="p-4 rounded-4 h-100 border border-success border-opacity-25" style={{ background: '#f0fdf4' }}>
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-success border-opacity-25">
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 42, height: 42 }}>
                  <i className="bi bi-check-lg fs-4"></i>
                </div>
                <div>
                  <h4 className="fw-bold text-success mb-0">AFTER MIRAI</h4>
                  <span className="small text-success opacity-75">Unified, automated & AI-powered efficiency</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                {solutions.map((sol, idx) => (
                  <div key={idx} className="p-3 rounded-3 bg-white border border-success border-opacity-20 d-flex align-items-start gap-3">
                    <span className="text-success fw-bold fs-5">✅</span>
                    <div>
                      <h6 className="fw-bold text-dark mb-1 small">{sol.title}</h6>
                      <span className="extra-small text-muted d-block">{sol.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
