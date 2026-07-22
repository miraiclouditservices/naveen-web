"use client";

import React from "react";

interface ContactDetailViewProps {
  viewItem: any;
  onClose: () => void;
  onEdit: (item: any) => void;
}

const formatValue = (label: string, value: any) => {
  if (value === undefined || value === null || value === "" || value === "—") return "—";
  const stringVal = String(value).trim();
  const isPhone = label.toLowerCase().includes("phone") || label.toLowerCase().includes("contact");
  const isEmail = label.toLowerCase().includes("email");

  if (isPhone && /^\+?[0-9\s\-()]{7,20}$/.test(stringVal)) {
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
  }
  return value;
};

const ROW = ({ label, value }: { label: string; value: any }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "170px 16px 1fr",
      alignItems: "flex-start",
      padding: "10px 0",
      borderBottom: "1px solid var(--border-color)",
    }}
  >
    <span style={{ fontSize: "0.83rem", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
    <span style={{ color: "var(--text-muted)" }}>:</span>
    <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 500 }}>{formatValue(label, value)}</span>
  </div>
);

export default function ContactDetailView({
  viewItem,
  onClose,
  onEdit,
}: ContactDetailViewProps) {
  if (!viewItem) return null;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Active":
        return { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" };
      case "Inactive":
        return { backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2" };
      default:
        return { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" };
    }
  };

  const statusStyles = getStatusStyles(viewItem.status || "Active");

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

  const formatUserAudit = (userObj: any) => {
    if (!userObj) return "System";
    if (typeof userObj === "string") return userObj;
    const parts = [];
    if (userObj.name) parts.push(userObj.name);
    if (userObj.email) parts.push(userObj.email);
    if (userObj.phoneNumber) parts.push(userObj.phoneNumber);
    return parts.length > 0 ? parts.join(" | ") : "System";
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1100, backdropFilter: "blur(6px)" }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 580 }}>
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
              View Contact Details
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
                <i className="bi bi-person-circle"></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>
                  {viewItem.name}
                </h5>
                <p className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>{viewItem.contact_id || "—"}</p>
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
                    {viewItem.contact_type || "Tenant"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Contact Information */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-person-badge-fill text-primary me-2"></i>
                Contact Information
              </h6>
              <ROW label="Full Name" value={viewItem.name} />
              <ROW label="Account / Company" value={viewItem.account_id?.company_name || "—"} />
              <ROW label="Contact Phone" value={viewItem.phone || "—"} />
              <ROW label="Email Address" value={viewItem.email || "—"} />
              <ROW label="Designation" value={viewItem.designation || "—"} />
              <ROW label="Department" value={viewItem.department || "—"} />
            </div>

            {/* Section 2: Property Space Details */}
            {(viewItem.propertyId || viewItem.floorId || viewItem.unitId) && (
              <div className="mb-4 pt-2">
                <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                  Associated Space / Property
                </h6>
                <ROW label="Property / Building" value={viewItem.propertyId?.propertyName || "—"} />
                <ROW label="Floor Level" value={viewItem.floorId?.floorName || (viewItem.floorId?.floorNumber ? `Floor ${viewItem.floorId.floorNumber}` : "") || "—"} />
                <ROW label="Unit / Space Number" value={viewItem.unitId?.unitNumber || "—"} />
              </div>
            )}

            {/* Section 3: History & System Logs */}
            <div className="mb-2 pt-2">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-journal-text text-primary me-2"></i>
                System Details
              </h6>
              <ROW label="Created By" value={formatUserAudit(viewItem.created_by || viewItem.createdBy)} />
              <ROW label="Created Date" value={formattedCreated} />
              <ROW label="Last Updated By" value={formatUserAudit(viewItem.updated_by || viewItem.updatedBy)} />
              <ROW label="Last Updated Date" value={formattedUpdated} />
            </div>
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
