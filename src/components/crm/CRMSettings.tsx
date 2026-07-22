import React from "react";

export default function CRMSettings() {
  return (
    <div className="card border p-4 shadow-sm animate__animated animate__fadeIn" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
      <h6 className="fw-bold mb-4" style={{ color: "var(--text-main)" }}>CRM Settings & Automations</h6>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="p-3 border rounded-3 mb-3 bg-light" style={{ borderColor: "var(--border-color)" }}>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" id="roundRobinCheck" defaultChecked />
              <label className="form-check-label fw-bold small text-dark" htmlFor="roundRobinCheck">
                Enable Round Robin Lead Assignment
              </label>
            </div>
            <p className="extra-small text-muted" style={{ fontSize: "0.75rem" }}>
              Automatically distributes new CRM leads evenly among all registered Sales representatives.
            </p>
          </div>


        </div>

        <div className="col-md-6">
          <div className="p-3 border rounded-3 bg-light" style={{ borderColor: "var(--border-color)", height: "100%" }}>
            <div className="fw-bold small text-dark mb-2">Deal Won Triggers</div>
            <ul className="extra-small text-muted ps-3" style={{ fontSize: "0.75rem" }}>
              <li className="mb-2">Generate Office Owner user account in PMS</li>
              <li className="mb-2">Auto-create Invoice under generated customer profile</li>
              <li className="mb-2">Send gate pass check-in eligibility notification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
