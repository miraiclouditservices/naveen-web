"use client";

import React from "react";

interface AccountDetailViewProps {
  viewItem: any;
  onClose: () => void;
  onEdit: (item: any) => void;
}

const formatValue = (label: string, value: any) => {
  if (value === undefined || value === null || value === "" || value === "—") return "—";
  const stringVal = String(value).trim();
  
  const isPhone = label.toLowerCase().includes("phone") || label.toLowerCase().includes("mobile");
  const isEmail = label.toLowerCase().includes("email");
  const isWhatsApp = label.toLowerCase().includes("whatsapp");
  const isWebsite = label.toLowerCase().includes("website");

  if (isWhatsApp) {
    const cleanNum = stringVal.replace(/[^0-9]/g, "");
    return (
      <a href={`https://wa.me/${cleanNum}`} target="_blank" rel="noopener noreferrer" style={{ color: "#16a34a", textDecoration: "none", fontWeight: 600 }}>
        <i className="bi bi-whatsapp me-1" />{value}
      </a>
    );
  } else if (isPhone) {
    return (
      <a href={`tel:${stringVal}`} style={{ color: "var(--dark-section)", textDecoration: "none", fontWeight: 600 }}>
        <i className="bi bi-telephone me-1" />{value}
      </a>
    );
  } else if (isEmail && stringVal.includes("@")) {
    return (
      <a href={`mailto:${stringVal}`} style={{ color: "var(--dark-section)", textDecoration: "none", fontWeight: 600 }}>
        <i className="bi bi-envelope me-1" />{value}
      </a>
    );
  } else if (isWebsite) {
    const href = stringVal.startsWith("http") ? stringVal : `https://${stringVal}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--dark-section)", textDecoration: "none", fontWeight: 600 }}>
        <i className="bi bi-globe me-1" />{value} <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: "0.65rem" }} />
      </a>
    );
  }
  return value;
};

const ROW = ({ label, value }: { label: string; value: any }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "170px 16px 1fr",
      alignItems: "flex-start",
      padding: "9px 0",
      borderBottom: "1px solid var(--border-color)",
    }}
  >
    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>:</span>
    <span style={{ fontSize: "0.825rem", color: "var(--text-main)", fontWeight: 500 }}>{formatValue(label, value)}</span>
  </div>
);

export default function AccountDetailView({
  viewItem,
  onClose,
  onEdit,
}: AccountDetailViewProps) {
  if (!viewItem) return null;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Active":
        return { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" };
      case "Inactive":
        return { backgroundColor: "#fff7ed", color: "#ea580c", border: "1px solid #ffedd5" };
      case "Blocked":
        return { backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2" };
      default:
        return { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" };
    }
  };

  const statusStyles = getStatusStyles(viewItem.status || "Active");

  // System Dates
  const formattedCreated = viewItem.createdAt 
    ? new Date(viewItem.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

  const formattedUpdated = viewItem.updatedAt 
    ? new Date(viewItem.updatedAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

  // Creators/Updaters
  const creatorName = viewItem.created_by?.name || viewItem.createdBy?.name || "System";
  const updaterName = viewItem.updated_by?.name || viewItem.updatedBy?.name || "System";
  const ownerName = viewItem.owner_id?.name || viewItem.ownerName || "—";

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1100, backdropFilter: "blur(6px)" }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 640 }}>
        <div
          className="modal-content border-0 overflow-hidden"
          style={{ borderRadius: "10px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
        >
          {/* Header */}
          <div
            className="d-flex align-items-center justify-content-between px-4 py-2"
            style={{ backgroundColor: "var(--text-primary)" }}
          >
            <h5 className="mb-0 text-white fw-semibold" style={{ fontSize: "0.95rem" }}>
              View Account Details
            </h5>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none", border: "none", color: "var(--text-muted)",
                fontSize: "1.4rem", lineHeight: 1, cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--bg-card)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "24px", maxHeight: "calc(100vh - 180px)", overflowY: "auto", backgroundColor: "var(--bg-card)" }}>
            {/* Center Header Details */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-2 rounded-circle text-primary fw-bold"
                style={{ 
                  width: 56, 
                  height: 56, 
                  backgroundColor: "#eff6ff", 
                  fontSize: "1.3rem",
                  border: "1px solid #dbeafe"
                }}
              >
                <i className="bi bi-building"></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>
                  {viewItem.company_name ? (viewItem.company_name.charAt(0).toUpperCase() + viewItem.company_name.slice(1)) : "—"}
                </h5>
                <p className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>{viewItem.account_code || "—"}</p>
                <div className="d-flex justify-content-center gap-2">
                  <span
                    className="badge px-3 py-1 fw-bold"
                    style={{
                      ...statusStyles,
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.825rem",
                    }}
                  >
                    {viewItem.status || "Active"}
                  </span>
                  <span
                    className="badge px-3 py-1 fw-bold bg-light text-dark border"
                    style={{
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.825rem",
                    }}
                  >
                    {viewItem.account_type || "Customer"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Account Information */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-building-fill text-primary me-2"></i>
                Account Details
              </h6>
              <ROW label="Company Name" value={viewItem.company_name ? (viewItem.company_name.charAt(0).toUpperCase() + viewItem.company_name.slice(1)) : "—"} />
              <ROW label="Industry" value={viewItem.industry || "—"} />
              <ROW label="Account Type" value={viewItem.account_type || "Customer"} />
              <ROW label="Company Size" value={viewItem.company_size || "—"} />
              <ROW label="Employee Count" value={viewItem.employee_count || "—"} />
              <ROW label="Annual Revenue" value={viewItem.annual_revenue ? `₹${viewItem.annual_revenue.toLocaleString("en-IN")}` : "—"} />
              <ROW label="Business Category" value={viewItem.business_category || "—"} />
              <ROW label="Website URL" value={viewItem.website || "—"} />
            </div>

            {/* Section 2: Legal & Tax Details */}
            <div className="mb-4 pt-2">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-shield-lock-fill text-primary me-2"></i>
                Legal & Tax Credentials
              </h6>
              <ROW label="GST Number" value={viewItem.gst_number || "—"} />
              <ROW label="Registration Number" value={viewItem.registration_number || "—"} />
              <ROW label="PAN Number" value={viewItem.pan_number || "—"} />
              <ROW label="Tax ID" value={viewItem.tax_id || "—"} />
            </div>

            {/* Section 3: Contact Information */}
            <div className="mb-4 pt-2">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-person-badge-fill text-primary me-2"></i>
                Primary Contact
              </h6>
              <ROW label="Contact Person" value={viewItem.contact_name || "—"} />
              <ROW label="Designation" value={viewItem.designation || "—"} />
              <ROW label="Contact Phone" value={viewItem.phone || "—"} />
              <ROW label="Email Address" value={viewItem.email || "—"} />
              <ROW label="WhatsApp Number" value={viewItem.whatsapp || "—"} />
            </div>

            {/* Section 4: Location Details */}
            <div className="mb-4 pt-2">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                Office Address
              </h6>
              <ROW label="Address Line 1" value={viewItem.address || "—"} />
              <ROW label="Address Line 2" value={viewItem.address2 || "—"} />
              <ROW label="City" value={viewItem.city || "—"} />
              <ROW label="State / Region" value={viewItem.state || "—"} />
              <ROW label="Country" value={viewItem.country || "—"} />
              <ROW label="Pincode" value={viewItem.pincode || "—"} />
            </div>

            {/* Section 5: Audit & System Logs */}
            <div className="mb-2 pt-2">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-journal-text text-primary me-2"></i>
                Audit & System Logs
              </h6>
              <ROW label="Account Owner" value={ownerName} />
              <ROW label="Created By" value={creatorName} />
              <ROW label="Created Date" value={formattedCreated} />
              <ROW label="Last Updated By" value={updaterName} />
              <ROW label="Last Updated Date" value={formattedUpdated} />
            </div>

            {/* Section 6: Notes & Description */}
            {viewItem.notes && (
              <div className="mt-4 pt-2">
                <h6 className="fw-bold mb-2 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <i className="bi bi-sticky-fill text-primary me-2"></i>
                  Description & Notes
                </h6>
                <div 
                  className="p-3 rounded border text-secondary" 
                  style={{ 
                    backgroundColor: "var(--bg-app)", 
                    fontSize: "0.8rem", 
                    lineHeight: "1.5",
                    whiteSpace: "pre-line"
                  }}
                >
                  {viewItem.notes}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="d-flex justify-content-end gap-3 px-4 py-2"
            style={{ 
              borderTop: "1px solid var(--border-color)", 
              background: "var(--bg-app)" 
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn px-4 py-2 fw-semibold btn-light border"
              style={{
                borderRadius: "10px",
                fontSize: "0.85rem",
                color: "var(--text-main)",
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)"
              }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit(viewItem)}
              className="btn px-4 py-2 fw-semibold text-white"
              style={{ 
                backgroundColor: "var(--dark-section)", 
                border: "none", 
                borderRadius: "10px", 
                fontSize: "0.85rem" 
              }}
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
