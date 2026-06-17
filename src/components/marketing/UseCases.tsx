"use client";

export default function UseCases() {
  const useCases = [
    "Centralize all property operations in one place",
    "Automate tasks and reduce manual work",
    "Improve communication between owners, tenants & staff",
    "Track payments, dues and financial performance",
    "Ensure timely maintenance and better asset life",
    "Enhance security and visitor management",
    "Generate real-time reports for better decisions"
  ];

  const comparisons = [
    {
      problem: "Manual Records & Paperwork",
      probIcon: "bi-file-earmark-text-fill",
      solution: "Digital records & centralized data",
      solIcon: "bi-cloud-check-fill"
    },
    {
      problem: "Payment Delays & Tracking Issues",
      probIcon: "bi-exclamation-circle-fill",
      solution: "Automated reminders & online payments",
      solIcon: "bi-credit-card-fill"
    },
    {
      problem: "Maintenance Delays & Missed Tasks",
      probIcon: "bi-tools",
      solution: "Ticket system & staff assignment",
      solIcon: "bi-check-circle-fill"
    },
    {
      problem: "Communication Gaps Between People",
      probIcon: "bi-chat-slash-fill",
      solution: "In-app communication & notifications",
      solIcon: "bi-chat-left-text-fill"
    },
    {
      problem: "Lack of Transparency & Real-time Data",
      probIcon: "bi-eye-slash-fill",
      solution: "Live dashboard & real-time reports",
      solIcon: "bi-graph-up-arrow"
    }
  ];

  return (
    <section id="use-cases" className="bg-light position-relative" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
      <div className="container">
        <div className="row gy-5 align-items-center">
          
          {/* Column 1: Where It Helps */}
          <div className="col-lg-4 col-md-12">
            <h3 className="section-subtitle-small mb-4 fw-bold">Where It Helps (Use Cases)</h3>
            <div className="use-case-list">
              {useCases.map((text, idx) => (
                <div key={idx} className="use-case-item">
                  <div className="use-case-icon-box">
                    <i className="bi bi-check2"></i>
                  </div>
                  <span className="use-case-text">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: High-Fidelity Bento Quadrants (Center Visual) */}
          <div className="col-lg-4 col-md-12 d-flex flex-column align-items-center justify-content-center py-4">
            <div className="ecosystem-bento-card">
              <div className="row g-2 h-100">
                
                {/* Quadrant 1: ops. */}
                <div className="col-6">
                  <div className="quadrant-box q-red">
                    <div className="mini-mockup-card shadow-sm p-2 mb-2">
                      <div className="mock-bar bg-rose mb-1.5" style={{ width: '40%', height: '4px' }}></div>
                      <div className="mock-bar bg-light mb-1" style={{ width: '80%', height: '3px' }}></div>
                      <div className="mock-bar bg-light" style={{ width: '60%', height: '3px' }}></div>
                      <div className="d-flex gap-1 mt-2">
                        <span className="mock-dot bg-rose"></span>
                        <span className="mock-dot bg-light"></span>
                        <span className="mock-dot bg-light"></span>
                      </div>
                    </div>
                    <div className="quadrant-title fw-bold">ops<span className="text-muted">.</span></div>
                    <div className="quadrant-subtitle">BY ANVAYA360</div>
                  </div>
                </div>

                {/* Quadrant 2: pay. */}
                <div className="col-6">
                  <div className="quadrant-box q-green">
                    <div className="mini-mockup-card shadow-sm p-2 mb-2">
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <div className="mock-bar bg-emerald" style={{ width: '50%', height: '4px' }}></div>
                        <span className="bi bi-check-circle-fill text-emerald" style={{ fontSize: '0.6rem' }}></span>
                      </div>
                      <div className="mock-bar bg-light mb-1" style={{ width: '90%', height: '3px' }}></div>
                      <div className="mock-bar bg-light" style={{ width: '70%', height: '3px' }}></div>
                    </div>
                    <div className="quadrant-title fw-bold">pay<span className="text-muted">.</span></div>
                    <div className="quadrant-subtitle">BY ANVAYA360</div>
                  </div>
                </div>

                {/* Quadrant 3: chat. */}
                <div className="col-6">
                  <div className="quadrant-box q-blue">
                    <div className="mini-mockup-card shadow-sm p-2 mb-2 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '46px' }}>
                      <div className="play-button-visual">
                        <i className="bi bi-play-fill text-white"></i>
                      </div>
                      <div className="mock-bar bg-primary mt-2" style={{ width: '60%', height: '3px' }}></div>
                    </div>
                    <div className="quadrant-title fw-bold">chat<span className="text-muted">.</span></div>
                    <div className="quadrant-subtitle">BY ANVAYA360</div>
                  </div>
                </div>

                {/* Quadrant 4: gate. */}
                <div className="col-6">
                  <div className="quadrant-box q-yellow">
                    <div className="mini-mockup-card shadow-sm p-2 mb-2">
                      <div className="d-flex gap-1 mb-1.5">
                        <div className="mock-grid-block bg-lime" style={{ width: '50%', height: '8px' }}></div>
                        <div className="mock-grid-block bg-lime" style={{ width: '50%', height: '8px' }}></div>
                      </div>
                      <div className="mock-bar bg-light mb-1" style={{ width: '80%', height: '3px' }}></div>
                      <div className="mock-bar bg-light" style={{ width: '40%', height: '3px' }}></div>
                    </div>
                    <div className="quadrant-title fw-bold">gate<span className="text-muted">.</span></div>
                    <div className="quadrant-subtitle">BY ANVAYA360</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Column 3: How Problems Get Solved */}
          <div className="col-lg-4 col-md-12">
            <h3 className="section-subtitle-small mb-4 fw-bold text-center text-lg-start">How Problems Get Solved</h3>
            <div className="d-flex flex-column gap-2">
              {comparisons.map((row, idx) => (
                <div key={idx} className="comparison-row">
                  {/* Problem */}
                  <div className="problem-box">
                    <i className={`bi ${row.probIcon}`}></i>
                    <span className="box-text">{row.problem}</span>
                  </div>
                  {/* Arrow */}
                  <div className="arrow-box">
                    <i className="bi bi-arrow-right"></i>
                  </div>
                  {/* Solution */}
                  <div className="solution-box">
                    <i className={`bi ${row.solIcon}`}></i>
                    <span className="box-text">{row.solution}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .section-subtitle-small {
          font-size: 1.15rem;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .use-case-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          transition: transform 0.2s ease;
        }

        .use-case-item:hover {
          transform: translateX(4px);
        }

        .use-case-icon-box {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
          font-weight: bold;
        }

        .use-case-text {
          font-size: 0.88rem;
          color: #475569;
          font-weight: 500;
        }

        /* Bento Ecosystem Quadrants */
        .ecosystem-bento-card {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          padding: 16px;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
          max-width: 320px;
          width: 100%;
        }

        .quadrant-box {
          border-radius: 16px;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.3s ease;
        }

        .quadrant-box:hover {
          transform: scale(1.03);
        }

        .q-red {
          background: #fff5f5;
        }
        .q-green {
          background: #f0fdf4;
        }
        .q-blue {
          background: #eff6ff;
        }
        .q-yellow {
          background: #fefbeb;
        }

        .mini-mockup-card {
          background: #ffffff;
          border-radius: 8px;
          width: 80px;
          min-height: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .mock-bar {
          border-radius: 99px;
        }

        .bg-rose { background: #f43f5e; }
        .bg-emerald { background: #10b981; }
        .bg-primary { background: #3b82f6; }
        .bg-lime { background: #84cc16; }
        .bg-light { background: #f1f5f9; }

        .mock-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
        }

        .play-button-visual {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
        }

        .mock-grid-block {
          border-radius: 2px;
        }

        .quadrant-title {
          font-size: 0.85rem;
          color: #0f172a;
          margin-top: 4px;
        }

        .quadrant-subtitle {
          font-size: 0.55rem;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        /* Problem & Solution Styling */
        .comparison-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .problem-box {
          flex: 1;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #991b1b;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 48px;
        }

        .solution-box {
          flex: 1;
          background: #f0fdf4;
          border: 1px solid #dcfce7;
          color: #166534;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 48px;
        }

        .arrow-box {
          color: #94a3b8;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .box-text {
          line-height: 1.3;
        }

      `}</style>
    </section>
  );
}
