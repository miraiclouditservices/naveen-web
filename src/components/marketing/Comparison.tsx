"use client";

export default function Comparison() {
  const rows = [
    { feature: "One Login", anvaya: true, others: "cross" },
    { feature: "CRM", anvaya: true, others: "Partial" },
    { feature: "Property", anvaya: true, others: "Separate" },
    { feature: "Attendance", anvaya: true, others: "Separate" },
    { feature: "Visitor Management", anvaya: true, others: "Separate" },
    { feature: "Helpdesk", anvaya: true, others: "Separate" },
    { feature: "Assets", anvaya: true, others: "Separate" },
    { feature: "Unified Reports", anvaya: true, others: "Separate" },
    { feature: "Mobile App", anvaya: true, others: "Partial" }
  ];

  return (
    <section id="comparison" className="comparison-section position-relative overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-block mb-3">
            <span className="comparison-badge">WHY CHOOSE US</span>
          </div>
          <h2 className="section-title fw-bold text-dark">
            One platform beats seven<br className="d-none d-sm-block" /> subscriptions.
          </h2>
        </div>

        {/* Comparison Table Card */}
        <div className="row justify-content-center">
          <div className="col-lg-10 col-md-12">
            <div className="comparison-table-wrapper shadow-premium">
              <div className="table-responsive">
                <table className="table comparison-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="text-start ps-4 py-3" style={{ width: '40%' }}>Feature</th>
                      <th className="text-center py-3" style={{ width: '30%' }}>Anvaya360</th>
                      <th className="text-center py-3" style={{ width: '30%' }}>Multiple Apps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <td className="text-start ps-4 py-3 fw-bold text-dark-title">{row.feature}</td>
                        <td className="text-center py-3">
                          <span className="check-badge-success">
                            <i className="bi bi-check-lg"></i>
                          </span>
                        </td>
                        <td className="text-center py-3">
                          {row.others === "cross" ? (
                            <span className="cross-badge-danger">
                              <i className="bi bi-x-lg"></i>
                            </span>
                          ) : (
                            <span className="others-status-text">{row.others}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .comparison-section {
          padding-top: 60px;
          padding-bottom: 60px;
          background-color: var(--bg-app);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }

        .comparison-badge {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 9999px;
          letter-spacing: 0.05em;
        }

        .comparison-section .section-title {
          font-size: 2.2rem;
          color: var(--text-main);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .comparison-table-wrapper {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          background: transparent !important;
        }

        .comparison-table thead {
          background-color: rgba(0, 0, 0, 0.015);
          border-bottom: 1px solid var(--border-color);
        }

        .comparison-table th {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: 0.02em;
          border-bottom: none !important;
        }

        .comparison-table th:nth-child(2) {
          color: var(--dark-section);
        }

        .comparison-table th:nth-child(3) {
          color: var(--text-muted);
        }

        .comparison-table tr {
          border-bottom: 1px solid var(--border-color);
        }

        .comparison-table tr:last-child {
          border-bottom: none;
        }

        .comparison-table td {
          font-size: 0.88rem;
          border-bottom: none !important;
        }

        .text-dark-title {
          color: var(--text-primary) !important;
        }

        .check-badge-success {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: var(--border-color);
          color: var(--dark-section);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.62rem;
          font-weight: bold;
        }

        .cross-badge-danger {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: var(--border-color);
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.58rem;
          font-weight: bold;
        }

        .others-status-text {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        @media (max-width: 991.98px) {
          .comparison-section .section-title {
            font-size: 1.8rem;
          }
          .comparison-table td, .comparison-table th {
            font-size: 0.8rem;
            padding: 10px 8px !important;
          }
        }
      `}</style>
    </section>
  );
}
