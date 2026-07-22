import React from "react";

interface CRMDashboardProps {
  metrics: {
    totalLeads: number;
    newLeadsToday: number;
    activeDealsCount: number;
    revenuePipeline: number;
    conversionRate: number;
  };
  sourceBreakdown: Array<{ label: string; value: number }>;
  stageBreakdown: Array<{ stage: string; count: number }>;
}

export default function CRMDashboard({ metrics, sourceBreakdown, stageBreakdown }: CRMDashboardProps) {
  return (
    <div className="animate__animated animate__fadeIn">
      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Leads */}
        <div className="col-lg col-md-4 col-sm-6 col-12">
          <div className="card shadow-sm p-3 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
            <div className="d-flex align-items-center gap-2 mb-2 text-muted">
              <i className="bi bi-person-plus" style={{ fontSize: "1.2rem", color: "var(--text-muted)" }} />
              <span className="fw-semibold" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Leads</span>
            </div>
            <h4 className="fw-bold mb-1" style={{ color: "var(--text-main)", fontSize: "1.3rem" }}>
              {(metrics.totalLeads || 0).toLocaleString("en-IN")}
            </h4>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Total CRM Ledger Leads</span>
          </div>
        </div>

        {/* Card 2: Today's Leads */}
        <div className="col-lg col-md-4 col-sm-6 col-12">
          <div className="card shadow-sm p-3 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
            <div className="d-flex align-items-center gap-2 mb-2 text-muted">
              <i className="bi bi-clock-history" style={{ fontSize: "1.2rem", color: "var(--text-muted)" }} />
              <span className="fw-semibold" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>New Leads Today</span>
            </div>
            <h4 className="fw-bold mb-1" style={{ color: "var(--text-main)", fontSize: "1.3rem" }}>
              {metrics.newLeadsToday || 0}
            </h4>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Registered within 24h</span>
          </div>
        </div>

        {/* Card 3: Active Deals */}
        <div className="col-lg col-md-4 col-sm-6 col-12">
          <div className="card shadow-sm p-3 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
            <div className="d-flex align-items-center gap-2 mb-2 text-muted">
              <i className="bi bi-briefcase" style={{ fontSize: "1.2rem", color: "var(--text-muted)" }} />
              <span className="fw-semibold" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active Deals</span>
            </div>
            <h4 className="fw-bold mb-1" style={{ color: "var(--dark-section)", fontSize: "1.3rem" }}>
              {metrics.activeDealsCount || 0}
            </h4>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Ongoing negotiations</span>
          </div>
        </div>

        {/* Card 4: Revenue Pipeline */}
        <div className="col-lg col-md-6 col-sm-6 col-12">
          <div className="card shadow-sm p-3 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
            <div className="d-flex align-items-center gap-2 mb-2 text-muted">
              <i className="bi bi-currency-rupee text-success" style={{ fontSize: "1.2rem" }} />
              <span className="fw-semibold" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Revenue Pipeline</span>
            </div>
            <h4 className="fw-bold mb-1 text-success" style={{ fontSize: "1.3rem" }}>
              ₹{(metrics.revenuePipeline || 0).toLocaleString("en-IN")}
            </h4>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Projected Deal Value</span>
          </div>
        </div>

        {/* Card 5: Conversion Rate */}
        <div className="col-lg col-md-6 col-sm-6 col-12">
          <div className="card shadow-sm p-3 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
            <div className="d-flex align-items-center gap-2 mb-2 text-muted">
              <i className="bi bi-graph-up" style={{ fontSize: "1.2rem", color: "var(--text-muted)" }} />
              <span className="fw-semibold" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Conversion Rate</span>
            </div>
            <h4 className="fw-bold mb-1" style={{ color: "var(--text-main)", fontSize: "1.3rem" }}>
              {metrics.conversionRate || 0}%
            </h4>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Lead-to-deal ratio</span>
          </div>
        </div>
      </div>

      {/* Progress Charts Grid */}
      <div className="row g-4 mb-4">
        {/* Pipeline Stages */}
        <div className="col-md-6">
          <div className="card border p-4 shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
            <h6 className="fw-bold mb-3" style={{ color: "var(--text-main)" }}>
              <i className="bi bi-funnel text-muted me-2"></i>Sales Pipeline Stages
            </h6>
            <div className="d-flex flex-column gap-3">
              {stageBreakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="d-flex justify-content-between small fw-medium mb-1">
                    <span style={{ color: "var(--text-primary)" }}>{item.stage}</span>
                    <span style={{ color: "var(--text-muted)" }}>{item.count} Deals</span>
                  </div>
                  <div className="progress" style={{ height: "6px", backgroundColor: "var(--bg-app)" }}>
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ 
                        width: `${metrics.activeDealsCount > 0 ? (item.count / metrics.activeDealsCount) * 100 : 0}%`,
                        backgroundColor: "var(--dark-section)"
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {stageBreakdown.length === 0 && (
                <div className="text-center text-muted py-4 small">No active stages loaded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Lead Sources */}
        <div className="col-md-6">
          <div className="card border p-4 shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
            <h6 className="fw-bold mb-3" style={{ color: "var(--text-main)" }}>
              <i className="bi bi-globe2 text-muted me-2"></i>Lead Sources
            </h6>
            <div className="d-flex flex-column gap-3">
              {sourceBreakdown.map((item, idx) => (
                <div key={idx}>
                  <div className="d-flex justify-content-between small fw-medium mb-1">
                    <span style={{ color: "var(--text-primary)" }}>{item.label}</span>
                    <span style={{ color: "var(--text-muted)" }}>{item.value} Leads</span>
                  </div>
                  <div className="progress" style={{ height: "6px", backgroundColor: "var(--bg-app)" }}>
                    <div 
                      className="progress-bar bg-secondary" 
                      role="progressbar" 
                      style={{ width: `${metrics.totalLeads > 0 ? (item.value / metrics.totalLeads) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {sourceBreakdown.length === 0 && (
                <div className="text-center text-muted py-4 small">No source metrics recorded.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
