"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero-section position-relative overflow-hidden">
      <div className="container position-relative z-2">
        <div className="row align-items-center gy-5">
          {/* Left Column - Product Information */}
          <div className="col-lg-6 text-start">
            {/* Enterprise Badge */}
            <div className="badge-wrapper mb-3">
              <span className="hero-badge-pill">
                <i className="bi bi-hash"></i>
                ONE PLATFORM. COMPLETE BUSINESS OPERATIONS.
              </span>
            </div>

            {/* Main Title */}
            <h1 className="hero-title mb-2">
              Manage Your
              Entire Business <br />
              <span className="text-highlight">From One Platform.</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle mb-4">
              Stop using multiple software. Run CRM, Employees, Visitors, Properties, Helpdesk, Assets and Reports from one intelligent platform built for modern businesses.
            </p>

            {/* Bullet Checklist */}
            <div className="checklist-grid mb-4">
              <div className="checklist-column">
                <div className="check-item">
                  <span className="check-icon-circle">
                    <i className="bi bi-check-lg"></i>
                  </span>
                  <span>CRM</span>
                </div>
                <div className="check-item">
                  <span className="check-icon-circle">
                    <i className="bi bi-check-lg"></i>
                  </span>
                  <span>Coworking</span>
                </div>
                <div className="check-item">
                  <span className="check-icon-circle">
                    <i className="bi bi-check-lg"></i>
                  </span>
                  <span>Visitor Management</span>
                </div>
                <div className="check-item">
                  <span className="check-icon-circle">
                    <i className="bi bi-check-lg"></i>
                  </span>
                  <span>Helpdesk</span>
                </div>
              </div>
              <div className="checklist-column">
                <div className="check-item">
                  <span className="check-icon-circle">
                    <i className="bi bi-check-lg"></i>
                  </span>
                  <span>Property Management</span>
                </div>
                <div className="check-item">
                  <span className="check-icon-circle">
                    <i className="bi bi-check-lg"></i>
                  </span>
                  <span>Employee Management</span>
                </div>
                <div className="check-item">
                  <span className="check-icon-circle">
                    <i className="bi bi-check-lg"></i>
                  </span>
                  <span>Attendance</span>
                </div>
                <div className="check-item">
                  <span className="check-icon-circle">
                    <i className="bi bi-check-lg"></i>
                  </span>
                  <span>Asset Management</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="cta-buttons-wrapper mb-4">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Link href="/login" className="btn-hero-primary">
                  Start Free Demo
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="arrow-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link href="/login" className="btn-hero-outline">
                  Book Live Demo
                </Link>
              </div>

            </div>

          </div>

          {/* Right Column - Premium Browser Mockup */}
          <div className="col-lg-6 position-relative ps-lg-5">
            <div className="browser-window shadow-premium position-relative">
              {/* Browser Bar */}
              <div className="browser-bar d-flex align-items-center px-3 justify-content-between">
                <div className="browser-dots d-flex gap-1.5">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="browser-url">app.anvaya360.com/dashboard</div>
                <div className="browser-actions">
                  <i className="bi bi-bell text-muted" style={{ fontSize: '0.75rem' }}></i>
                </div>
              </div>

              {/* Browser Workspace */}
              <div className="browser-workspace d-flex">
                {/* Mock Sidebar */}
                <div className="mock-sidebar">
                  <div className="sidebar-logo">
                    <img src="/anvaya360-logo.png" alt="Logo" className="sidebar-logo-img" />
                    <span>Anvaya360</span>
                  </div>
                  <div className="sidebar-menu">
                    <div className="menu-item active">
                      <i className="bi bi-grid-fill"></i> Dashboard
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-funnel-fill"></i> Leads
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-people-fill"></i> Employees
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-cash-stack"></i> Revenue
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-building"></i> Coworking
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-file-earmark-bar-graph"></i> Reports
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-plugin"></i> Integrations
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-gear-fill"></i> Settings
                    </div>
                  </div>
                </div>

                {/* Mock Content Dashboard Body */}
                <div className="mock-body p-3 flex-grow-1">
                  {/* Dashboard Header inside browser */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.8rem' }}>Dashboard</h6>
                      <span className="text-muted" style={{ fontSize: '0.55rem' }}>Welcome back, Chief Operations Officer</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-light text-dark border-0 p-1 px-2" style={{ fontSize: '0.5rem', fontWeight: 600, background: '#ffffff !important', border: '1px solid #e2e8f0 !important' }}>
                        <i className="bi bi-calendar3 me-1"></i> Mar 1 - Mar 15, 2026
                      </span>
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=60" alt="User" className="rounded-circle" style={{ width: '18px', height: '18px', objectFit: 'cover' }} />
                    </div>
                  </div>

                  {/* Top Stats Row */}
                  <div className="row g-2 mb-3">
                    <div className="col-3">
                      <div className="stat-card">
                        <span className="stat-label">VISITORS</span>
                        <div className="stat-num">24.8K</div>
                        <span className="stat-trend text-dark"><i className="bi bi-caret-up-fill"></i> 12.5%</span>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="stat-card">
                        <span className="stat-label">LEADS</span>
                        <div className="stat-num">1,429</div>
                        <span className="stat-trend text-dark"><i className="bi bi-caret-up-fill"></i> 8.2%</span>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="stat-card">
                        <span className="stat-label">EMPLOYEES</span>
                        <div className="stat-num">245</div>
                        <span className="stat-trend text-muted"><i className="bi bi-dash"></i> 0.0%</span>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="stat-card">
                        <span className="stat-label">REVENUE</span>
                        <div className="stat-num">$45.7K</div>
                        <span className="stat-trend text-dark"><i className="bi bi-caret-up-fill"></i> 15.3%</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row - Visitors Chart & Leads Pie */}
                  <div className="row g-2 mb-3">
                    <div className="col-7">
                      <div className="chart-card p-2.5">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="chart-title">Visitors Overview</span>
                          <span className="text-muted" style={{ fontSize: '0.5rem' }}>July</span>
                        </div>
                        {/* Line Chart Draw */}
                        <div className="visitors-chart-container position-relative">
                          <svg viewBox="0 0 100 40" className="sparkline-svg">
                            <path d="M0,35 Q15,10 30,28 T60,8 T90,20 L100,15 L100,40 L0,40 Z" fill="rgba(4, 4, 4, 0.03)" />
                            <path d="M0,35 Q15,10 30,28 T60,8 T90,20 L100,15" fill="none" stroke="var(--dark-section)" strokeWidth="1.5" />
                          </svg>
                          <div className="chart-axis-labels d-flex justify-content-between">
                            <span>May 10</span>
                            <span>May 20</span>
                            <span>May 30</span>
                            <span>June 10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-5">
                      <div className="chart-card p-2.5">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="chart-title">Leads by Source</span>
                          <span className="text-muted" style={{ fontSize: '0.5rem' }}>This Month</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <div className="donut-chart-mock">
                            <div className="donut-inner">1,429</div>
                          </div>
                          <div className="donut-legend flex-grow-1">
                            <div className="d-flex align-items-center justify-content-between" style={{ fontSize: '0.45rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
                              <span><i className="bi bi-circle-fill me-1" style={{ color: 'var(--dark-section)', fontSize: '0.35rem' }}></i> Organic</span>
                              <strong>62%</strong>
                            </div>
                            <div className="d-flex align-items-center justify-content-between" style={{ fontSize: '0.45rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px', paddingTop: '2px' }}>
                              <span><i className="bi bi-circle-fill me-1" style={{ color: 'var(--text-primary)', fontSize: '0.35rem' }}></i> Direct</span>
                              <strong>25%</strong>
                            </div>
                            <div className="d-flex align-items-center justify-content-between" style={{ fontSize: '0.45rem', paddingTop: '2px' }}>
                              <span><i className="bi bi-circle-fill me-1" style={{ color: 'var(--text-muted)', fontSize: '0.35rem' }}></i> Referral</span>
                              <strong>13%</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row - Revenue Graph & Top Campaigns */}
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="chart-card p-2.5">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="chart-title">Revenue Overview</span>
                          <span className="text-muted" style={{ fontSize: '0.5rem' }}>July</span>
                        </div>
                        <div className="visitors-chart-container position-relative">
                          <svg viewBox="0 0 100 30" className="sparkline-svg">
                            <path d="M0,28 Q20,5 40,22 T80,8 L100,12 L100,30 L0,30 Z" fill="rgba(4, 4, 4, 0.03)" />
                            <path d="M0,28 Q20,5 40,22 T80,8 L100,12" fill="none" stroke="var(--dark-section)" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="chart-card p-2.5">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="chart-title">Top Campaigns</span>
                          <span className="text-muted" style={{ fontSize: '0.5rem' }}>View All</span>
                        </div>
                        <div className="campaigns-list">
                          <div className="campaign-item d-flex justify-content-between align-items-center">
                            <span>Spring Promo</span>
                            <span className="progress-bar-mock"><span className="progress-fill" style={{ width: '80%' }}></span></span>
                            <strong>$12.4K</strong>
                          </div>
                          <div className="campaign-item d-flex justify-content-between align-items-center">
                            <span>Product Launch</span>
                            <span className="progress-bar-mock"><span className="progress-fill" style={{ width: '65%' }}></span></span>
                            <strong>$8.6K</strong>
                          </div>
                          <div className="campaign-item d-flex justify-content-between align-items-center">
                            <span>Newsletter May</span>
                            <span className="progress-bar-mock"><span className="progress-fill" style={{ width: '45%' }}></span></span>
                            <strong>$4.3K</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge - Today's Visitors (top-left) */}
              <div className="floating-badge-visitors shadow-premium">
                <div className="d-flex align-items-center gap-2">
                  <div className="badge-icon-circle">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div>
                    <div className="f-title">Today's Visitors</div>
                    <div className="f-val">248 <span className="f-trend">+12%</span></div>
                  </div>
                </div>
              </div>

              {/* Floating Badge - Leads (mid-right) */}
              <div className="floating-badge-leads shadow-premium">
                <div className="d-flex align-items-center gap-2">
                  <div className="badge-icon-circle">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div>
                    <div className="f-title">Leads</div>
                    <div className="f-val">1,429 <span className="f-trend">+8.2%</span></div>
                  </div>
                </div>
              </div>

              {/* Floating Badge - Revenue (bottom-left) */}
              <div className="floating-badge-revenue shadow-premium">
                <div className="d-flex align-items-center gap-2">
                  <div className="badge-icon-circle">
                    <i className="bi bi-currency-dollar"></i>
                  </div>
                  <div>
                    <div className="f-title">Revenue</div>
                    <div className="f-val">$45.7K <span className="f-trend">+15.3%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hero-section {
          position: relative;
          background-color: var(--bg-app);
          background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
          background-size: 30px 30px;
          min-height: auto;
          display: flex;
          align-items: center;
          padding-top: 90px;
          padding-bottom: 30px;
          overflow: visible;
        }

        .hero-badge-pill {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.02em;
        }

        .hero-section .hero-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .hero-section .text-highlight {
          color: var(--dark-section);
        }

        .hero-section .hero-subtitle {
          color: var(--text-primary);
          font-size: 1.05rem;
          line-height: 1.65;
          max-width: 580px;
        }

        /* Checklist */
        .checklist-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 24px;
          max-width: 540px;
        }

        .checklist-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .check-icon-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark-section);
          font-size: 0.68rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        /* Buttons Styling */
        .cta-buttons-wrapper {
          display: flex;
          flex-direction: column;
          margin-top: 2rem;
        }

        .btn-hero-primary {
          background-color: var(--dark-section) !important;
          border: none !important;
          color: var(--bg-card, #ffffff) !important;
          font-weight: 700 !important;
          padding: 12px 28px !important;
          border-radius: 9999px !important;
          font-size: 0.95rem !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px;
          text-decoration: none !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .btn-hero-primary:hover {
          background-color: var(--text-primary) !important;
          transform: translateY(-1.5px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
        }

        .btn-hero-primary .arrow-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
        }

        .btn-hero-primary:hover .arrow-icon {
          transform: translateX(3px);
        }

        .btn-hero-outline {
          background-color: var(--bg-card) !important;
          border: 1px solid var(--border-color, #E8E6E3) !important;
          color: var(--text-primary) !important;
          font-weight: 700 !important;
          padding: 12px 28px !important;
          border-radius: 9999px !important;
          font-size: 0.95rem !important;
          display: inline-flex !important;
          align-items: center !important;
          text-decoration: none !important;
          transition: all 0.2s ease !important;
        }

        .btn-hero-outline:hover {
          border-color: var(--text-main) !important;
          color: var(--text-main) !important;
          transform: translateY(-1.5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .btn-hero-tour-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary) !important;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none !important;
          transition: color 0.2s ease;
        }

        .btn-hero-tour-link:hover {
          color: var(--text-main) !important;
        }

        .play-icon-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark-section);
          font-size: 0.85rem;
          transition: transform 0.2s ease;
        }

        .btn-hero-tour-link:hover .play-icon-circle {
          transform: scale(1.1);
          background-color: var(--dark-section);
          color: var(--bg-card);
        }

        /* Browser Window CSS */
        .browser-window {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border-color, #E8E6E3);
          overflow: visible;
          box-shadow: 0 30px 60px -15px rgba(15, 23, 42, 0.12);
        }

        .browser-bar {
          background: var(--bg-app);
          border-bottom: 1px solid var(--border-color, #E8E6E3);
          height: 38px;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }

        .browser-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot-red { background: #ff5f56; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #27c93f; }

        .browser-url {
          font-size: 0.65rem;
          color: var(--text-muted);
          background: var(--bg-card);
          border: 1px solid var(--border-color, #E8E6E3);
          border-radius: 6px;
          padding: 1px 16px;
          font-weight: 500;
        }

        .browser-workspace {
          background: var(--bg-app);
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }

        .mock-sidebar {
          width: 105px;
          background: var(--bg-card);
          color: var(--text-muted);
          padding: 12px 6px;
          display: flex;
          flex-direction: column;
          border-bottom-left-radius: 16px;
          border-right: 1px solid var(--border-color, #E8E6E3);
          flex-shrink: 0;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 16px;
          padding-left: 4px;
        }

        .sidebar-logo-img {
          width: 14px;
          height: 14px;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .menu-item {
          font-size: 0.58rem;
          padding: 5px 6px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          white-space: nowrap;
          color: var(--text-muted);
        }

        .menu-item i {
          font-size: 0.68rem;
        }

        .menu-item.active {
          background: var(--bg-app);
          color: var(--text-main);
          font-weight: 700;
        }

        .menu-item:hover:not(.active) {
          background: var(--border-color);
          color: var(--text-main);
        }

        .mock-body {
          background: var(--bg-app);
          border-bottom-right-radius: 16px;
          overflow: hidden;
        }

        /* Stat Cards */
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 6px 8px;
          text-align: left;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .stat-label {
          font-size: 0.46rem;
          font-weight: 700;
          color: var(--text-muted);
          display: block;
          margin-bottom: 2px;
          white-space: nowrap;
        }

        .stat-num {
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.1;
        }

        .stat-trend {
          font-size: 0.46rem;
          font-weight: 700;
          display: block;
          margin-top: 1px;
          white-space: nowrap;
        }

        /* Chart Cards */
        .chart-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .chart-title {
          font-size: 0.58rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .sparkline-svg {
          width: 100%;
          height: 38px;
          display: block;
          overflow: visible;
        }

        .chart-axis-labels {
          font-size: 0.4rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Donut Chart Mock */
        .donut-chart-mock {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: conic-gradient(
            var(--dark-section) 0% 62%,
            var(--text-primary) 62% 87%,
            var(--border-color) 87% 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .donut-inner {
          width: 20px;
          height: 20px;
          background: var(--bg-card);
          border-radius: 50%;
          font-size: 0.35rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
        }

        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        /* Campaigns List */
        .campaigns-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .campaign-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.46rem;
          font-weight: 600;
          color: var(--text-primary);
          padding-bottom: 2px;
          border-bottom: 1px solid var(--border-color);
        }

        .campaign-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .progress-bar-mock {
          width: 28px;
          height: 3px;
          background-color: var(--border-color);
          border-radius: 999px;
          overflow: hidden;
          margin: 0 4px;
        }

        .progress-fill {
          height: 100%;
          background-color: var(--dark-section);
          display: block;
          border-radius: 999px;
        }

        /* Floating Badges */
        .floating-badge-visitors {
          position: absolute;
          top: 50px;
          left: -30px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 8px 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
          z-index: 10;
          text-align: left;
        }

        .floating-badge-leads {
          position: absolute;
          bottom: 100px;
          right: -30px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 8px 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
          z-index: 10;
          text-align: left;
        }

        .floating-badge-revenue {
          position: absolute;
          bottom: -20px;
          left: 40px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 8px 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
          z-index: 10;
          text-align: left;
        }

        .badge-icon-circle {
          width: 24px;
          height: 24px;
          background: var(--bg-app);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark-section);
          font-size: 0.65rem;
          flex-shrink: 0;
        }

        .f-title {
          font-size: 0.52rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .f-val {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .f-trend {
          font-size: 0.52rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        @media (max-width: 991.98px) {
          .hero-section {
            padding-top: 100px;
            text-align: center !important;
          }
          .hero-section .hero-title {
            text-align: center;
          }
          .hero-section .hero-subtitle {
            margin: 0 auto 1.5rem auto;
            text-align: center;
          }
          .checklist-grid {
            margin: 0 auto 1.5rem auto;
            justify-content: center;
          }
          .cta-buttons-wrapper {
            align-items: center;
            justify-content: center;
          }
          .cta-buttons-wrapper .d-flex {
            justify-content: center;
          }
          .browser-window {
            margin-top: 2.5rem;
          }
          .floating-badge-visitors {
            left: 10px;
            top: 30px;
          }
          .floating-badge-leads {
            right: 10px;
            bottom: 70px;
          }
          .floating-badge-revenue {
            left: 20px;
            bottom: -15px;
          }
        }
      `}</style>
    </section>
  );
}
