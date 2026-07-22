"use client";

export default function Problem() {
  return (
    <section id="problem" className="problem-section position-relative overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-block mb-3">
            <span className="problem-badge">THE PROBLEM</span>
          </div>
          <h2 className="section-title fw-bold text-dark mb-3">
            Running multiple software?
          </h2>
          <p className="section-subtitle text-muted mx-auto">
            Most businesses waste hours syncing data between disconnected tools. Here's what that costs.
          </p>
        </div>

        {/* Cards Row */}
        <div className="row g-4 justify-content-center mb-4">
          {/* Scattered tools */}
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="problem-card">
              <h5 className="problem-card-title fw-bold mb-4">Scattered tools</h5>
              <div className="problem-list">
                <div className="problem-list-item">
                  <span className="cross-icon-wrapper">
                    <i className="bi bi-x-lg"></i>
                  </span>
                  <span>Excel Sheets</span>
                </div>
                <div className="problem-list-item">
                  <span className="cross-icon-wrapper">
                    <i className="bi bi-x-lg"></i>
                  </span>
                  <span>Multiple Apps</span>
                </div>
                <div className="problem-list-item">
                  <span className="cross-icon-wrapper">
                    <i className="bi bi-x-lg"></i>
                  </span>
                  <span>Manual Attendance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Paper & pen chaos */}
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="problem-card">
              <h5 className="problem-card-title fw-bold mb-4">Paper & pen chaos</h5>
              <div className="problem-list">
                <div className="problem-list-item">
                  <span className="cross-icon-wrapper">
                    <i className="bi bi-x-lg"></i>
                  </span>
                  <span>Visitor Registers</span>
                </div>
                <div className="problem-list-item">
                  <span className="cross-icon-wrapper">
                    <i className="bi bi-x-lg"></i>
                  </span>
                  <span>Paper Complaints</span>
                </div>
                <div className="problem-list-item">
                  <span className="cross-icon-wrapper">
                    <i className="bi bi-x-lg"></i>
                  </span>
                  <span>Missing Follow-ups</span>
                </div>
              </div>
            </div>
          </div>

          {/* No visibility */}
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="problem-card">
              <h5 className="problem-card-title fw-bold mb-4">No visibility</h5>
              <div className="problem-list">
                <div className="problem-list-item">
                  <span className="cross-icon-wrapper">
                    <i className="bi bi-x-lg"></i>
                  </span>
                  <span>Asset Tracking Issues</span>
                </div>
                <div className="problem-list-item">
                  <span className="cross-icon-wrapper">
                    <i className="bi bi-x-lg"></i>
                  </span>
                  <span>Poor Reports</span>
                </div>
                <div className="problem-list-item">
                  <span className="cross-icon-wrapper">
                    <i className="bi bi-x-lg"></i>
                  </span>
                  <span>Data Silos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Down Arrow Connector */}
        <div className="text-center my-4">
          <div className="connector-arrow-circle">
            <i className="bi bi-arrow-down"></i>
          </div>
        </div>

        {/* Solution Banner */}
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-12">
            <div className="solution-highlight-card text-center">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <div className="solution-logo-circle">
                  <img src="/anvaya360-logo.png" alt="Logo" className="solution-logo-img" />
                </div>
                <span className="solution-brand-name fw-bold">Anvaya360</span>
              </div>
              <h6 className="solution-tagline fw-bold mb-0">
                Everything connected. One intelligent platform.
              </h6>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .problem-section {
          padding-top: 60px;
          padding-bottom: 60px;
          background-color: var(--bg-card);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }

        .problem-badge {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 9999px;
          letter-spacing: 0.05em;
        }

        .problem-section .section-title {
          font-size: 2.2rem;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .problem-section .section-subtitle {
          font-size: 1.05rem;
          color: var(--text-primary);
          max-width: 600px;
        }

        /* Problem Cards */
        .problem-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 32px;
          height: 100%;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .problem-card:hover {
          transform: translateY(-2px);
          border-color: var(--text-muted);
        }

        .problem-card-title {
          font-size: 1.05rem;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .problem-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .problem-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.88rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .cross-icon-wrapper {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.58rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        /* Down Arrow Connector */
        .connector-arrow-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          font-size: 0.9rem;
          box-shadow: var(--shadow-sm);
        }

        /* Solution Banner */
        .solution-highlight-card {
          background: var(--bg-app) !important;
          border: 1px solid var(--dark-section);
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--shadow-md);
        }

        .solution-logo-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--bg-app);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .solution-logo-img {
          width: 14px;
          height: 14px;
        }

        .solution-brand-name {
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .solution-tagline {
          font-size: 1rem;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        @media (max-width: 991.98px) {
          .problem-section .section-title {
            font-size: 1.8rem;
          }
          .problem-card {
            padding: 24px;
          }
        }
      `}</style>
    </section>
  );
}
