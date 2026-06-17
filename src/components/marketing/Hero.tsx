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
            <div className="badge-wrapper mb-3 animate__animated animate__fadeInDown">
              <span className="badge-pill d-inline-flex align-items-center gap-2">
                <i className="bi bi-cpu-fill text-primary-blue"></i>
                Enterprise Property OS
              </span>
            </div>

            {/* Main Title */}
            <h1 className="hero-title fw-bold mb-4 animate__animated animate__fadeIn">
              Manage Every <br />
              Property <br />
              <span>From One <span className="text-highlight">Smart</span> Platform</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle mb-4 animate__animated animate__fadeIn">
              Simplify property operations with powerful tools for tenants, payments, maintenance, security, assets, and analytics — built for portfolios of every size.
            </p>

            {/* CTA Buttons */}
            <div className="btn-group-custom mb-4 animate__animated animate__fadeInUp">
              <Link href="/login" className="btn btn-orange-cta">
                Start Free Trial <i className="bi bi-arrow-right ms-2"></i>
              </Link>
              <a href="#demo" className="btn btn-demo-outline">
                Book a Demo
              </a>
            </div>

            {/* Bullet Checklist */}
            <div className="checklist-wrapper d-flex gap-4 mb-4 flex-wrap animate__animated animate__fadeIn">
              <div className="check-item d-flex align-items-center gap-2">
                <i className="bi bi-check text-primary-blue fs-5 fw-bold"></i>
                <span>14-day free trial</span>
              </div>
              <div className="check-item d-flex align-items-center gap-2">
                <i className="bi bi-check text-primary-blue fs-5 fw-bold"></i>
                <span>No credit card</span>
              </div>
              <div className="check-item d-flex align-items-center gap-2">
                <i className="bi bi-check text-primary-blue fs-5 fw-bold"></i>
                <span>SOC 2 ready</span>
              </div>
            </div>

            {/* Social Proof Stars */}
            <div className="trust-block d-flex align-items-center gap-3 animate__animated animate__fadeIn">
              <div className="overlapping-avatars">
                <span className="avatar-circle avatar-blue"></span>
                <span className="avatar-circle avatar-navy"></span>
                <span className="avatar-circle avatar-orange"></span>
                <span className="avatar-circle avatar-black"></span>
              </div>
              <div className="stars-info d-flex flex-column text-start">
                <div className="stars-row text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
                <span className="stars-text">Loved by 2,400+ property teams</span>
              </div>
            </div>
          </div>

          {/* Right Column - Premium Browser Mockup */}
          <div className="col-lg-6 position-relative ps-lg-5">
            <div className="browser-window shadow-premium position-relative animate__animated animate__fadeInRight">
              {/* Browser Bar */}
              <div className="browser-bar d-flex align-items-center px-3 justify-content-between">
                <div className="browser-dots d-flex gap-1.5">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="browser-url">app.estatly.com/dashboard</div>
                <div className="browser-actions">
                  <i className="bi bi-bell text-muted"></i>
                </div>
              </div>
              
              {/* Browser Workspace */}
              <div className="browser-workspace d-flex">
                {/* Mock Sidebar */}
                <div className="mock-sidebar">
                  <div className="sidebar-section-title">WORKSPACE</div>
                  <div className="sidebar-menu">
                    <div className="menu-item active">
                      <i className="bi bi-grid-1x2-fill me-2"></i> Dashboard
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-building me-2"></i> Properties
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-people me-2"></i> Tenants
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-credit-card me-2"></i> Payments
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-tools me-2"></i> Maintenance
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-safe me-2"></i> Assets
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-file-earmark-bar-graph me-2"></i> Reports
                    </div>
                    <div className="menu-item">
                      <i className="bi bi-gear me-2"></i> Settings
                    </div>
                  </div>
                </div>
                
                {/* Mock Content Dashboard Body */}
                <div className="mock-body p-3 flex-grow-1">
                  {/* Top Stats Cards */}
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <div className="stat-card">
                        <span className="stat-label">TOTAL PROPERTIES</span>
                        <div className="stat-num">248</div>
                        <span className="stat-trend trend-up">+12% vs last mo</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stat-card">
                        <span className="stat-label">TOTAL UNITS</span>
                        <div className="stat-num">12,486</div>
                        <span className="stat-trend trend-up">+4.2% vs last mo</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stat-card">
                        <span className="stat-label">OCCUPANCY RATE</span>
                        <div className="stat-num">94.6%</div>
                        <span className="stat-trend trend-up">+1.2% vs last mo</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="stat-card">
                        <span className="stat-label">MONTHLY REVENUE</span>
                        <div className="stat-num">$1.84M</div>
                        <span className="stat-trend trend-up">+18% vs last mo</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat-card">
                        <span className="stat-label">PENDING PAYMENTS</span>
                        <div className="stat-num">$92K</div>
                        <span className="stat-trend trend-down">-3.4% vs last mo</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Card */}
                  <div className="chart-card p-2.5 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="chart-title">Revenue Analytics</span>
                      <div className="chart-legend d-flex gap-2">
                        <span className="legend-dot dot-blue">Collected</span>
                        <span className="legend-dot dot-orange">Pending</span>
                      </div>
                    </div>
                    <div className="mock-chart-bars d-flex align-items-end justify-content-between pt-3" style={{ height: '70px' }}>
                      <div className="bar bar-1" style={{ height: '40%' }}></div>
                      <div className="bar bar-2" style={{ height: '65%' }}></div>
                      <div className="bar bar-3" style={{ height: '50%' }}></div>
                      <div className="bar bar-4" style={{ height: '85%' }}></div>
                      <div className="bar bar-5" style={{ height: '70%' }}></div>
                      <div className="bar bar-6" style={{ height: '90%' }}></div>
                    </div>
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="row g-2">
                    <div className="col-5">
                      <div className="status-card p-2 h-100">
                        <span className="card-mini-title">PAYMENT STATUS</span>
                        <div className="d-flex align-items-center gap-1.5 mt-2">
                          <div className="pie-mock"></div>
                          <div className="pie-legend">
                            <div>Paid 72%</div>
                            <div>Pending 20%</div>
                            <div>Overdue 8%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-7">
                      <div className="status-card p-2 h-100">
                        <span className="card-mini-title">MAINTENANCE REQUESTS</span>
                        <div className="mt-2 list-mini">
                          <div className="list-mini-item">
                            <span>AC repair — Unit 412</span>
                            <span className="badge-mini badge-open">Open</span>
                          </div>
                          <div className="list-mini-item">
                            <span>Lobby lighting</span>
                            <span className="badge-mini badge-progress">In progress</span>
                          </div>
                          <div className="list-mini-item">
                            <span>Elevator service</span>
                            <span className="badge-mini badge-resolved">Resolved</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge - Occupancy */}
              <div className="floating-badge-occupancy">
                <div className="d-flex align-items-center gap-2">
                  <div className="occupancy-icon">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <div>
                    <div className="f-title">Occupancy</div>
                    <div className="f-val">94.6% <span className="f-trend">+1.2%</span></div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge - New Payment */}
              <div className="floating-badge-payment">
                <div className="f-label">NEW PAYMENT</div>
                <div className="f-amount">$2,480.00</div>
                <div className="f-meta">Tower A · Unit 220</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hero-section {
          position: relative;
          background-color: #fcfdfe;
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
          background-size: 30px 30px;
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding-top: 110px;
          padding-bottom: 40px;
          overflow: visible;
        }

        .hero-section .badge-pill {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #1e40af;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 9999px;
        }

        .hero-section .text-primary-blue {
          color: #2563eb;
        }

        .hero-section .hero-title {
          font-size: clamp(1.4rem, 2.6vw, 2.1rem);
          font-weight: 800;
          color: #0f172a;
          line-height: 1.12;
          letter-spacing: -0.025em;
        }

        .hero-section .text-highlight {
          color: #2563eb;
        }

        .hero-section .hero-subtitle {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.65;
          max-width: 520px;
        }

        .hero-section .btn-group-custom {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .hero-section .btn-orange-cta {
          background-color: #ff6f00 !important;
          background-image: linear-gradient(135deg, #ff7a00 0%, #ff5500 100%) !important;
          border: none !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          padding: 0.9rem 2.2rem !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 20px -6px rgba(255, 111, 0, 0.5) !important;
          transition: all 0.3s ease !important;
          font-size: 0.95rem !important;
          display: inline-flex !important;
          align-items: center !important;
          text-decoration: none !important;
        }

        .hero-section .btn-orange-cta:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 24px -4px rgba(255, 111, 0, 0.7) !important;
          background-image: linear-gradient(135deg, #ff8c00 0%, #ff6f00 100%) !important;
        }

        .hero-section .btn-demo-outline {
          background-color: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #334155 !important;
          font-weight: 600 !important;
          padding: 0.9rem 2.2rem !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
          font-size: 0.95rem !important;
          display: inline-flex !important;
          align-items: center !important;
          text-decoration: none !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
        }

        .hero-section .btn-demo-outline:hover {
          transform: translateY(-2px) !important;
          background-color: #f8fafc !important;
          border-color: #94a3b8 !important;
        }

        .hero-section .checklist-wrapper .check-item {
          font-size: 0.9rem;
          color: #475569;
          font-weight: 600;
        }

        .hero-section .overlapping-avatars {
          display: flex;
          align-items: center;
        }

        .hero-section .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          margin-left: -10px;
          display: inline-block;
        }

        .hero-section .overlapping-avatars .avatar-circle:first-child {
          margin-left: 0;
        }

        .hero-section .avatar-blue { background-color: #2563eb; }
        .hero-section .avatar-navy { background-color: #0f172a; }
        .hero-section .avatar-orange { background-color: #ff6f00; }
        .hero-section .avatar-black { background-color: #1e293b; }

        .hero-section .stars-row {
          font-size: 0.85rem;
          letter-spacing: 1px;
        }

        .hero-section .stars-text {
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          margin-top: 2px;
        }

        /* Browser Window CSS */
        .browser-window {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: visible;
          box-shadow: 0 30px 60px -15px rgba(15, 23, 42, 0.12);
        }

        .browser-bar {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          height: 42px;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }

        .browser-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot-red { background: #ff5f56; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #27c93f; }

        .browser-url {
          font-size: 0.72rem;
          color: #64748b;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 2px 20px;
          font-weight: 500;
        }

        .browser-workspace {
          background: #f8fafc;
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }

        .mock-sidebar {
          width: 120px;
          background: #0f172a;
          color: #94a3b8;
          padding: 16px 6px;
          display: flex;
          flex-direction: column;
          border-bottom-left-radius: 16px;
        }

        .sidebar-section-title {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #475569;
          margin-bottom: 10px;
          padding-left: 6px;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .menu-item {
          font-size: 0.65rem;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .menu-item.active {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-weight: 600;
        }

        .menu-item:hover:not(.active) {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .mock-body {
          background: #f8fafc;
          border-bottom-right-radius: 16px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px;
          text-align: left;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
        }

        .stat-label {
          font-size: 0.5rem;
          font-weight: 700;
          color: #64748b;
          display: block;
          margin-bottom: 2px;
          white-space: nowrap;
        }

        .stat-num {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .stat-trend {
          font-size: 0.5rem;
          font-weight: 700;
          display: block;
          margin-top: 2px;
          white-space: nowrap;
        }

        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }

        .chart-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
        }

        .chart-title {
          font-size: 0.6rem;
          font-weight: 700;
          color: #0f172a;
        }

        .chart-legend {
          font-size: 0.52rem;
          font-weight: 600;
        }

        .legend-dot {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .legend-dot::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .dot-blue::before { background: #2563eb; }
        .dot-orange::before { background: #ff6f00; }

        .mock-chart-bars {
          gap: 6px;
        }

        .bar {
          flex: 1;
          background: #e2e8f0;
          border-radius: 3px 3px 0 0;
          transition: background 0.3s ease;
        }

        .bar-2, .bar-4, .bar-6 {
          background: #2563eb;
        }

        .bar-1, .bar-3, .bar-5 {
          background: #ff6f00;
          opacity: 0.85;
        }

        .status-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
          text-align: left;
        }

        .card-mini-title {
          font-size: 0.5rem;
          font-weight: 700;
          color: #64748b;
          display: block;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .pie-mock {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: conic-gradient(
            #2563eb 0% 72%,
            #ff6f00 72% 92%,
            #cbd5e1 92% 100%
          );
          flex-shrink: 0;
        }

        .pie-legend {
          font-size: 0.48rem;
          color: #475569;
          font-weight: 600;
          line-height: 1.2;
        }

        .list-mini {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .list-mini-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.52rem;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 2px;
        }

        .list-mini-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .badge-mini {
          font-size: 0.44rem;
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: 700;
        }

        .badge-open {
          background: #fee2e2;
          color: #ef4444;
        }

        .badge-progress {
          background: #fef3c7;
          color: #d97706;
        }

        .badge-resolved {
          background: #d1fae5;
          color: #059669;
        }

        /* Floating Badges */
        .floating-badge-occupancy {
          position: absolute;
          bottom: -20px;
          left: -24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
          z-index: 10;
          text-align: left;
        }

        .occupancy-icon {
          width: 28px;
          height: 28px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          font-size: 0.8rem;
        }

        .f-title {
          font-size: 0.55rem;
          color: #64748b;
          font-weight: 600;
        }

        .f-val {
          font-size: 0.78rem;
          font-weight: 800;
          color: #0f172a;
        }

        .f-trend {
          font-size: 0.58rem;
          color: #10b981;
          font-weight: 700;
        }

        .floating-badge-payment {
          position: absolute;
          top: -16px;
          right: -24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
          z-index: 10;
          text-align: left;
          min-width: 125px;
        }

        .f-label {
          font-size: 0.5rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .f-amount {
          font-size: 0.88rem;
          font-weight: 800;
          color: #0f172a;
        }

        .f-meta {
          font-size: 0.55rem;
          color: #2563eb;
          font-weight: 600;
        }

        @media (max-width: 991px) {
          .hero-section {
            padding-top: 90px;
            text-align: center !important;
          }
          .hero-section .hero-title {
            text-align: center;
          }
          .hero-section .hero-subtitle {
            margin: 0 auto 1.5rem auto;
            text-align: center;
          }
          .hero-section .btn-group-custom {
            justify-content: center;
          }
          .hero-section .checklist-wrapper {
            justify-content: center;
          }
          .hero-section .trust-block {
            justify-content: center;
          }
          .browser-window {
            margin-top: 2rem;
          }
        }

        @media (max-width: 576px) {
          .floating-badge-occupancy {
            left: 10px;
            bottom: -15px;
          }
          .floating-badge-payment {
            right: 10px;
            top: -15px;
          }
        }
      `}</style>
    </section>
  );
}
