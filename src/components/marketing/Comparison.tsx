"use client";

import React from "react";

export default function Comparison() {
  const comparisonRows = [
    { feature: "One Unified Platform", anvaya: true, erp: false, multiple: false },
    { feature: "AI & Predictive Workflows", anvaya: true, erp: "Limited", multiple: false },
    { feature: "Modern & Intuitive UI", anvaya: true, erp: "Old Legacy UI", multiple: false },
    { feature: "Mobile First (iOS & Android)", anvaya: true, erp: "Limited Mobile", multiple: false },
    { feature: "Everything Connected", anvaya: true, erp: false, multiple: false },
    { feature: "Fast 1-Day Implementation", anvaya: true, erp: false, multiple: false }
  ];

  return (
    <section id="comparison" className="py-5 bg-light border-bottom position-relative">
      <div className="container py-lg-4">
        
        {/* Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
            <span className="mkt-pulse-dot"></span>
            <span>WHY WE'RE DIFFERENT</span>
          </div>
          <h2 className="mkt-title mb-3">Comparison Matrix</h2>
          <p className="mkt-subtitle mx-auto text-secondary">
            See how Mirai CloudIT SERVICES stacks up against legacy traditional ERPs and fragmented single-purpose tools.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mkt-card-clean p-0 overflow-hidden shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-center">
              <thead className="table-dark text-white">
                <tr>
                  <th className="py-3 px-4 text-start fw-bold fs-6">Feature</th>
                  <th className="py-3 px-4 fw-bold fs-6" style={{ background: 'var(--brand-orange)' }}>
                    <i className="bi bi-stars me-1"></i> Mirai CloudIT SERVICES
                  </th>
                  <th className="py-3 px-4 fw-bold fs-6 text-secondary">Traditional ERP</th>
                  <th className="py-3 px-4 fw-bold fs-6 text-secondary">Multiple Software</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4 text-start fw-bold text-dark">{row.feature}</td>
                    
                    {/* Anvaya360 Column */}
                    <td className="py-3 px-4 fw-extrabold text-white" style={{ background: 'var(--brand-orange)_BG', color: 'var(--brand-orange)' }}>
                      <div className="d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill bg-orange text-white fw-bold" style={{ background: 'var(--brand-orange)' }}>
                        <i className="bi bi-check-circle-fill"></i> YES
                      </div>
                    </td>

                    {/* Traditional ERP Column */}
                    <td className="py-3 px-4 text-muted">
                      {typeof row.erp === "boolean" ? (
                        row.erp ? <span className="text-success fw-bold">YES</span> : <span className="text-danger fw-bold">❌ NO</span>
                      ) : (
                        <span className="badge bg-secondary bg-opacity-10 text-dark">{row.erp}</span>
                      )}
                    </td>

                    {/* Multiple Software Column */}
                    <td className="py-3 px-4 text-muted">
                      {typeof row.multiple === "boolean" ? (
                        row.multiple ? <span className="text-success fw-bold">YES</span> : <span className="text-danger fw-bold">❌ NO</span>
                      ) : (
                        <span className="badge bg-secondary bg-opacity-10 text-dark">{row.multiple}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
