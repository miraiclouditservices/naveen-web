import React from "react";

interface ReportsAnalyticsProps {
  reportData: {
    conversionRate: number;
    salesPerformance: Array<{ name: string; leadsCount: number }>;
    revenueForecast: Array<{ month: string; projectedRevenue: number; count: number }>;
  };
}

export default function ReportsAnalytics({ reportData }: ReportsAnalyticsProps) {
  return (
    <div className="card border p-4 shadow-sm animate__animated animate__fadeIn" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
      <h6 className="fw-bold mb-4" style={{ color: "var(--text-main)" }}>CRM Reports & Analytics</h6>
      <div className="row g-4 mb-4">
        {/* Sales Performance */}
        <div className="col-md-6">
          <div className="p-3 border rounded-3" style={{ borderColor: "var(--border-color)" }}>
            <div className="fw-bold small text-dark mb-2">Sales Performance (Leads per Rep)</div>
            <div className="d-flex flex-column gap-2">
              {reportData.salesPerformance?.map((perf, i) => (
                <div key={i} className="d-flex justify-content-between small">
                  <span style={{ color: "var(--text-primary)" }}>{perf.name}</span>
                  <span className="fw-bold" style={{ color: "var(--text-main)" }}>{perf.leadsCount} Leads</span>
                </div>
              ))}
              {(!reportData.salesPerformance || reportData.salesPerformance.length === 0) && (
                <div className="text-center text-muted extra-small py-3">No sales rep data recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="col-md-6">
          <div className="p-3 border rounded-3" style={{ borderColor: "var(--border-color)" }}>
            <div className="fw-bold small text-dark mb-2">Projected Revenue Forecast</div>
            <div className="d-flex flex-column gap-2">
              {reportData.revenueForecast?.map((item, i) => (
                <div key={i} className="d-flex justify-content-between small">
                  <span style={{ color: "var(--text-primary)" }}>{item.month}</span>
                  <span className="fw-bold text-success">
                    ₹{(item.projectedRevenue || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              {(!reportData.revenueForecast || reportData.revenueForecast.length === 0) && (
                <div className="text-center text-muted extra-small py-3">No projected deal closes found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
