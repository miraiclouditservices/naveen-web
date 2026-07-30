"use client";

import React from "react";

interface LeadDetailViewProps {
  viewItem: any;
  onClose: () => void;
  onEdit: (item: any) => void;
}

const formatValue = (label: string, value: any) => {
  if (value === undefined || value === null || value === "" || value === "—") return "—";
  if (React.isValidElement(value)) return value;
  const stringVal = String(value).trim();
  const isPhone = label.toLowerCase().includes("phone") || label.toLowerCase().includes("contact");
  const isEmail = label.toLowerCase().includes("email");

  if (isPhone && stringVal) {
    return (
      <a href={`tel:${stringVal}`} style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 600 }}>
        <i className="bi bi-telephone me-1" style={{ color: "var(--text-muted)" }} />{value}
      </a>
    );
  } else if (isEmail && stringVal.includes("@")) {
    return (
      <a href={`mailto:${stringVal}`} style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 600 }}>
        <i className="bi bi-envelope me-1" style={{ color: "var(--text-muted)" }} />{value}
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

export default function LeadDetailView({
  viewItem,
  onClose,
  onEdit,
}: LeadDetailViewProps) {
  if (!viewItem) return null;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Won": 
        return { backgroundColor: "rgba(22, 163, 74, 0.08)", color: "#16a34a", border: "1px solid rgba(22, 163, 74, 0.15)" };
      case "Lost": 
        return { backgroundColor: "rgba(220, 53, 69, 0.08)", color: "#dc3545", border: "1px solid rgba(220, 53, 69, 0.15)" };
      default:
        return { backgroundColor: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--border-color)" };
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "High": 
        return { backgroundColor: "rgba(220, 53, 69, 0.08)", color: "#dc3545", border: "1px solid rgba(220, 53, 69, 0.15)" };
      default:
        return { backgroundColor: "var(--bg-app)", color: "var(--text-primary)", border: "1px solid var(--border-color)" };
    }
  };

  const statusStyles = getStatusStyles(viewItem.status || "New");
  const priorityStyles = getPriorityStyles(viewItem.priority || "Medium");

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

  const renderFollowUpBadge = () => {
    if (!viewItem.nextFollowUp) return "—";
    const dateObj = new Date(viewItem.nextFollowUp);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUpDate = new Date(dateObj);
    followUpDate.setHours(0, 0, 0, 0);

    let badgeBg = "rgba(120, 120, 120, 0.08)";
    let badgeColor = "var(--text-muted)";
    if (followUpDate < today) {
      badgeBg = "rgba(220, 53, 69, 0.09)";
      badgeColor = "#dc3545";
    } else if (followUpDate.getTime() === today.getTime()) {
      badgeBg = "rgba(249, 115, 22, 0.09)";
      badgeColor = "var(--brand-orange)_LIGHT";
    } else {
      badgeBg = "rgba(22, 163, 74, 0.09)";
      badgeColor = "#16a34a";
    }

    return (
      <span
        className="d-inline-flex align-items-center"
        style={{
          fontSize: "0.75rem",
          fontWeight: "600",
          borderRadius: "4px",
          padding: "3px 8px",
          gap: "6px",
          backgroundColor: badgeBg,
          color: badgeColor,
          border: `1px solid ${badgeColor}22`
        }}
      >
        <i className="bi bi-calendar-event" style={{ fontSize: "0.78rem" }}></i>
        <span>{formattedDate}</span>
      </span>
    );
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
              View Lead Details
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
                className="d-inline-flex align-items-center justify-content-center mb-2 rounded-circle fw-bold"
                style={{ 
                  width: 56, 
                  height: 56, 
                  backgroundColor: "var(--bg-app)", 
                  fontSize: "1.3rem",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-muted)"
                }}
              >
                <i className="bi bi-person-badge"></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>
                  {viewItem.lead_name}
                </h5>
                <p className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>{viewItem.lead_number || "—"}</p>
                <div className="d-flex justify-content-center gap-2">
                  <span
                    className="badge px-3 py-1 fw-bold"
                    style={{
                      ...statusStyles,
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.825rem",
                    }}
                  >
                    {viewItem.status || "New"}
                  </span>
                  <span
                    className="badge px-3 py-1 fw-bold"
                    style={{
                      ...priorityStyles,
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.825rem",
                    }}
                  >
                    {viewItem.priority || "Medium"} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Lead Information */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-person-badge-fill me-2" style={{ color: "var(--text-muted)" }}></i>
                Lead Information
              </h6>
              <ROW label="Lead Name" value={viewItem.lead_name} />
              <ROW label="Company Name" value={viewItem.companyName || "—"} />
              <ROW label="Contact Phone" value={viewItem.phone || "—"} />
              <ROW label="Email Address" value={viewItem.email || "—"} />
              <ROW label="Designation" value={viewItem.designation || "—"} />
              <ROW label="Industry / Sector" value={viewItem.industry || "—"} />
            </div>

            {/* Section 2: Requirement Details */}
            <div className="mb-4 pt-2">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-tags-fill me-2" style={{ color: "var(--text-muted)" }}></i>
                Requirement Details
              </h6>
              <ROW label="Requirement Type" value={viewItem.requirementType || "—"} />
              <ROW label="Required Area" value={viewItem.requiredArea ? `${viewItem.requiredArea} SFT` : "—"} />
              <ROW label="Lead Source" value={viewItem.source || "—"} />
            </div>

            {/* Section 3: Interested Property Location */}
            {(viewItem.propertyId || viewItem.floorId) && (
              <div className="mb-4 pt-2">
                <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <i className="bi bi-geo-alt-fill me-2" style={{ color: "var(--text-muted)" }}></i>
                  Interested Property
                </h6>
                <ROW label="Property / Building" value={viewItem.propertyId?.propertyName || "—"} />
                <ROW label="Floor Level" value={viewItem.floorId?.floorName || (viewItem.floorId?.floorNumber ? `Floor ${viewItem.floorId.floorNumber}` : "") || "—"} />
              </div>
            )}

            {/* Section 4: Follow-up & Owner Assignment */}
            <div className="mb-4 pt-2">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-person-workspace me-2" style={{ color: "var(--text-muted)" }}></i>
                Follow-up & Assignment
              </h6>
              <ROW label="Assigned Employee" value={viewItem.owner_id?.name || "Unassigned"} />
              <ROW label="Next Follow-up Date" value={renderFollowUpBadge()} />
            </div>

            {/* Section 5: Notes & Logs */}
            <div className="mb-2 pt-2">
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <i className="bi bi-journal-text me-2" style={{ color: "var(--text-muted)" }}></i>
                Notes & History
              </h6>
              <ROW label="Notes / Comments" value={viewItem.notes || "—"} />
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
                borderRadius: "var(--radius-md)",
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
                borderRadius: "var(--radius-md)", 
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
