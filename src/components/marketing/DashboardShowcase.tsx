"use client";

import React, { useState } from "react";

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState<"overview" | "finance" | "visitors" | "helpdesk">("overview");

  return (
    <section id="dashboard" className="py-5 bg-light border-bottom position-relative overflow-hidden">
      <div className="container py-lg-4">
        
        {/* Section Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
            <span className="mkt-pulse-dot"></span>
            <span>ENTERPRISE COMMAND CENTER</span>
          </div>
          <h2 className="mkt-title mb-3">Unified Business Dashboard</h2>
          <p className="mkt-subtitle mx-auto text-secondary">
            Everything connected in one real-time dashboard — monitor operations, finance, visitors, and tickets at a glance.
          </p>

          {/* Interactive Widget Selector Pills */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            <button className={`mkt-tab-pill ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
              Executive Overview
            </button>
            <button className={`mkt-tab-pill ${activeTab === "finance" ? "active" : ""}`} onClick={() => setActiveTab("finance")}>
              Revenue & Leases
            </button>
            <button className={`mkt-tab-pill ${activeTab === "visitors" ? "active" : ""}`} onClick={() => setActiveTab("visitors")}>
              Visitor & Access
            </button>
            <button className={`mkt-tab-pill ${activeTab === "helpdesk" ? "active" : ""}`} onClick={() => setActiveTab("helpdesk")}>
              Helpdesk & Assets
            </button>
          </div>
        </div>

        {/* Dashboard Preview Shell */}
        <div className="bg-dark rounded-4 p-3 p-md-4 shadow-lg text-white border border-secondary border-opacity-50">
          
          {/* Top Bar Header */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-50">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex gap-1.5">
                <span className="rounded-circle bg-danger d-inline-block" style={{ width: 12, height: 12 }}></span>
                <span className="rounded-circle bg-warning d-inline-block" style={{ width: 12, height: 12 }}></span>
                <span className="rounded-circle bg-success d-inline-block" style={{ width: 12, height: 12 }}></span>
              </div>
              <span className="fw-mono text-secondary small">mirai.app/dashboard/live</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50">
                <i className="bi bi-broadcast me-1"></i> Live Stream Connected
              </span>
            </div>
          </div>

          {/* 9 Connected Widgets Grid */}
          <div className="row g-3">
            
            {/* Widget 1: Revenue */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small text-secondary fw-bold">1. REVENUE & COLLECTIONS</span>
                  <i className="bi bi-currency-dollar text-success"></i>
                </div>
                <h3 className="fw-extrabold text-white mb-1">$482,900</h3>
                <span className="extra-small text-success">↑ 14.8% vs last month ($420k collected)</span>
              </div>
            </div>

            {/* Widget 2: Occupancy */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small text-secondary fw-bold">2. PROPERTY OCCUPANCY</span>
                  <i className="bi bi-building text-info"></i>
                </div>
                <h3 className="fw-extrabold text-white mb-1">98.4%</h3>
                <span className="extra-small text-info">1,240 / 1,260 units active</span>
              </div>
            </div>

            {/* Widget 3: Visitors */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small text-secondary fw-bold">3. VISITOR CHECK-INS</span>
                  <i className="bi bi-person-badge text-warning"></i>
                </div>
                <h3 className="fw-extrabold text-white mb-1">342 Today</h3>
                <span className="extra-small text-warning">QR Approved • Zero gate queue</span>
              </div>
            </div>

            {/* Widget 4: Attendance */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small text-secondary fw-bold">4. STAFF ATTENDANCE</span>
                  <i className="bi bi-people text-primary"></i>
                </div>
                <h3 className="fw-extrabold text-white mb-1">96.5%</h3>
                <span className="extra-small text-primary">128 On-duty • Geo-fenced mobile</span>
              </div>
            </div>

            {/* Widget 5: Open Tickets */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small text-secondary fw-bold">5. HELPDESK TICKETS</span>
                  <i className="bi bi-ticket-detailed text-danger"></i>
                </div>
                <h3 className="fw-extrabold text-white mb-1">12 Open SLA</h3>
                <span className="extra-small text-success">Average resolution: 24 mins</span>
              </div>
            </div>

            {/* Widget 6: Leads */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small text-secondary fw-bold">6. CRM SALES PIPELINE</span>
                  <i className="bi bi-funnel style-orange" style={{ color: 'var(--brand-orange)' }}></i>
                </div>
                <h3 className="fw-extrabold text-white mb-1">84 Active Leads</h3>
                <span className="extra-small" style={{ color: 'var(--brand-orange)' }}>18 Deals closing this week</span>
              </div>
            </div>

            {/* Widget 7: Assets */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small text-secondary fw-bold">7. ASSETS & AMC</span>
                  <i className="bi bi-box-seam text-light"></i>
                </div>
                <h3 className="fw-extrabold text-white mb-1">3,450 Assets</h3>
                <span className="extra-small text-secondary">QR Tagged • 100% AMC Compliant</span>
              </div>
            </div>

            {/* Widget 8: Tasks */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small text-secondary fw-bold">8. TASKS & WORKFLOWS</span>
                  <i className="bi bi-check-square text-success"></i>
                </div>
                <h3 className="fw-extrabold text-white mb-1">45 Completed</h3>
                <span className="extra-small text-success">Automated dispatch active</span>
              </div>
            </div>

            {/* Widget 9: AI Analytics */}
            <div className="col-lg-4 col-md-6">
              <div className="p-3 rounded-3 bg-secondary bg-opacity-25 border border-secondary border-opacity-25 h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small text-secondary fw-bold">9. AI PREDICTIVE INSIGHTS</span>
                  <i className="bi bi-stars text-warning"></i>
                </div>
                <h3 className="fw-extrabold text-white mb-1">Zero Risks</h3>
                <span className="extra-small text-warning">Copilot monitoring 24/7</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
