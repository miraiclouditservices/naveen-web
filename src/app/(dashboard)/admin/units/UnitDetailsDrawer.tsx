"use client";

import React from "react";
import Link from "next/link";

interface UnitDetailsDrawerProps {
  selectedUnit: any;
  onClose: () => void;
  activeDetailTab: string;
  setActiveDetailTab: (tab: string) => void;
  unitInvoices: any[];
  invoicesLoading: boolean;
  onEdit: (unit: any) => void;
}

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "Occupied":
      return { backgroundColor: "#e8f5e9", color: "#2e7d32", border: "1px solid rgba(46, 125, 50, 0.15)" };
    case "Reserved":
      return { backgroundColor: "#fff3e0", color: "#ef6c00", border: "1px solid rgba(239, 108, 0, 0.15)" };
    case "Available":
      return { backgroundColor: "#e3f2fd", color: "#0d47a1", border: "1px solid rgba(13, 71, 161, 0.15)" };
    default:
      return { backgroundColor: "#ffebee", color: "#c62828", border: "1px solid rgba(198, 40, 40, 0.15)" };
  }
};

export default function UnitDetailsDrawer({
  selectedUnit,
  onClose,
  activeDetailTab,
  setActiveDetailTab,
  unitInvoices,
  invoicesLoading,
  onEdit,
}: UnitDetailsDrawerProps) {
  const formatDate = (dateStr: any) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.15)",
          zIndex: 1040,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "450px",
          maxWidth: "100%",
          height: "100vh",
          backgroundColor: "#ffffff",
          borderLeft: "1px solid var(--border-color)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          zIndex: 1050,
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        {/* Header */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-start bg-light">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h4 className="fw-bold text-dark mb-0" style={{ fontSize: "1.1rem" }}>Unit Details</h4>
              <span
                className="badge px-2.5 py-1.5 fw-bold rounded-pill"
                style={{
                  ...getStatusBadgeStyle(selectedUnit.isMeetingRoom ? "Reserved" : (selectedUnit.unitStatus || "Available")),
                  fontSize: "0.68rem",
                }}
              >
                {selectedUnit.isMeetingRoom ? "Reserved" : (selectedUnit.unitStatus || "Available")}
              </span>
            </div>
            <div className="text-muted small mt-1.5 fw-medium" style={{ fontSize: "0.76rem" }}>
              {selectedUnit.unitNumber} • {selectedUnit.property?.propertyName || "Commercial Hub"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-close shadow-none"
            style={{ fontSize: "0.85rem", cursor: "pointer" }}
          />
        </div>

        {/* Tabs Row */}
        <div className="px-3 border-bottom bg-white d-flex" style={{ overflowX: "auto" }}>
          {["Overview", "Lease", "Financials", "Documents", "Activity"].map((tab) => {
            const isActive = activeDetailTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveDetailTab(tab)}
                className="btn px-3 py-2.5 fw-semibold border-0 text-nowrap"
                style={{
                  fontSize: "0.8rem",
                  color: isActive ? "var(--dark-section)" : "var(--text-muted)",
                  borderBottom: isActive ? "2.5px solid var(--dark-section)" : "2.5px solid transparent",
                  borderRadius: 0,
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tabs content container */}
        <div className="flex-grow-1 overflow-auto p-4" style={{ backgroundColor: "#ffffff" }}>
          
          {activeDetailTab === "Overview" && (
            <div className="d-flex flex-column gap-4">
              
              {/* Unit Information Section */}
              <div>
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3" style={{ fontSize: "0.82rem" }}>
                  <i className="bi bi-info-circle-fill me-2 text-primary" /> Unit Information
                </h6>
                <div className="row g-3" style={{ fontSize: "0.78rem" }}>
                  <div className="col-6">
                    <span className="d-block text-muted">Unit ID</span>
                    <strong className="text-dark">{selectedUnit.unitNumber}</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Carpet Area</span>
                    <strong className="text-dark">{Math.round(selectedUnit.sqft * 0.84).toLocaleString("en-IN")} SFT</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Property Name</span>
                    <strong className="text-dark">{selectedUnit.property?.propertyName || "Commercial Hub"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Built-up Area</span>
                    <strong className="text-dark">{selectedUnit.sqft ? selectedUnit.sqft.toLocaleString("en-IN") : 0} SFT</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Floor Name</span>
                    <strong className="text-dark">{selectedUnit.floor?.floorName || `Floor ${selectedUnit.floorNumber || "—"}`}</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Facing</span>
                    <strong className="text-dark">{selectedUnit.facing || "—"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Unit Type</span>
                    <strong className="text-dark">{selectedUnit.unitType || "—"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Status</span>
                    <strong className="text-dark">{selectedUnit.isMeetingRoom ? "Reserved" : (selectedUnit.unitStatus || "Available")}</strong>
                  </div>
                  <div className="col-12">
                    <span className="d-block text-muted">Total SFT</span>
                    <strong className="text-dark">{selectedUnit.sqft ? selectedUnit.sqft.toLocaleString("en-IN") : 0} SFT</strong>
                  </div>
                </div>
              </div>

              {/* Tenant Information Section */}
              <div>
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3" style={{ fontSize: "0.82rem" }}>
                  <i className="bi bi-person-fill me-2 text-primary" /> Tenant Information
                </h6>
                {selectedUnit.unitStatus === "Occupied" || selectedUnit.lease ? (
                  <div className="row g-3" style={{ fontSize: "0.78rem" }}>
                    <div className="col-6">
                      <span className="d-block text-muted">Company Name</span>
                      <strong className="text-dark d-flex align-items-center gap-1">
                        {selectedUnit.lease?.companyName || selectedUnit.tenant?.companyName || "—"}
                        {selectedUnit.unitStatus === "Occupied" && <i className="bi bi-check-circle-fill text-success" />}
                      </strong>
                    </div>
                    <div className="col-6">
                      <span className="d-block text-muted">Lease Start</span>
                      <strong className="text-dark">{formatDate(selectedUnit.lease?.startDate || selectedUnit.lease?.agreementStartDate)}</strong>
                    </div>
                    <div className="col-6">
                      <span className="d-block text-muted">Contact Person</span>
                      <strong className="text-dark">{selectedUnit.lease?.tenantName || selectedUnit.tenant?.tenantName || "—"}</strong>
                    </div>
                    <div className="col-6">
                      <span className="d-block text-muted">Lease End</span>
                      <strong className="text-dark">{formatDate(selectedUnit.lease?.endDate || selectedUnit.lease?.agreementEndDate)}</strong>
                    </div>
                    <div className="col-6">
                      <span className="d-block text-muted">Phone</span>
                      <strong className="text-dark">{selectedUnit.lease?.tenantContact || selectedUnit.tenant?.contactNumber || "—"}</strong>
                    </div>
                    <div className="col-6">
                      <span className="d-block text-muted">Lease Type</span>
                      <strong className="text-dark">{selectedUnit.lease?.leaseType || "—"}</strong>
                    </div>
                    <div className="col-12">
                      <span className="d-block text-muted">Email</span>
                      <strong className="text-dark">{selectedUnit.lease?.tenantEmail || selectedUnit.tenant?.emailId || "—"}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted p-3 bg-light rounded text-center" style={{ fontSize: "0.76rem" }}>
                    No tenant is currently occupying this unit.
                  </div>
                )}
              </div>

              {/* Financial Information Section */}
              <div>
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3" style={{ fontSize: "0.82rem" }}>
                  <i className="bi bi-credit-card-2-front-fill me-2 text-primary" /> Financial Information
                </h6>
                <div className="row g-3" style={{ fontSize: "0.78rem" }}>
                  <div className="col-6">
                    <span className="d-block text-muted">Rent Per SFT</span>
                    <strong className="text-dark">
                      {selectedUnit.lease?.rentPerSft 
                        ? `₹ ${Number(selectedUnit.lease.rentPerSft).toFixed(2)}`
                        : (selectedUnit.lease?.monthlyRent && selectedUnit.sqft 
                            ? `₹ ${(selectedUnit.lease.monthlyRent / selectedUnit.sqft).toFixed(2)}`
                            : "—")}
                    </strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Security Deposit</span>
                    <strong className="text-dark">
                      {selectedUnit.lease?.securityDeposit 
                        ? `₹ ${Number(selectedUnit.lease.securityDeposit).toLocaleString("en-IN")}`
                        : "—"}
                    </strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Monthly Rent</span>
                    <strong className="text-dark">
                      {selectedUnit.lease?.monthlyRent 
                        ? `₹ ${Number(selectedUnit.lease.monthlyRent).toLocaleString("en-IN")}`
                        : (selectedUnit.monthlyRent 
                            ? `₹ ${Number(selectedUnit.monthlyRent).toLocaleString("en-IN")}`
                            : "—")}
                    </strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Payment Status</span>
                    <strong className="text-success fw-semibold">{selectedUnit.lease?.paymentStatus || "—"}</strong>
                  </div>
                </div>
              </div>

              {/* Occupancy Overview Section (Donut Chart) */}
              <div>
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3" style={{ fontSize: "0.82rem" }}>
                  <i className="bi bi-pie-chart-fill me-2 text-primary" /> Occupancy Overview
                </h6>
                
                {selectedUnit.unitStatus === "Occupied" ? (
                  <div className="d-flex align-items-center gap-4 py-2 bg-light rounded-3 px-3 border">
                    {/* Circular Donut via SVG */}
                    <div style={{ position: "relative", width: "90px", height: "90px" }}>
                      <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                        <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#ffffff" />
                        <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--border-light)" strokeWidth="5.5" />
                        <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#22c55e" strokeWidth="5.5" strokeDasharray="84 16" strokeDashoffset="25" />
                      </svg>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.68rem" }}>84%</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ fontSize: "0.78rem", flex: 1 }}>
                      <div className="fw-bold text-dark mb-2" style={{ fontSize: "0.82rem" }}>
                        {(selectedUnit.sqft || 0).toLocaleString("en-IN")} Total SFT
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center gap-1.5">
                          <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: "#22c55e" }}></span>
                          <span className="text-muted">Occupied SFT</span>
                        </div>
                        <strong className="text-dark">{Math.round(selectedUnit.sqft * 0.84).toLocaleString("en-IN")} SFT (84%)</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-1.5">
                          <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: "#0284c7" }}></span>
                          <span className="text-muted">Available SFT</span>
                        </div>
                        <strong className="text-dark">{Math.round(selectedUnit.sqft * 0.16).toLocaleString("en-IN")} SFT (16%)</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-4 py-2 bg-light rounded-3 px-3 border">
                    {/* Circular Donut via SVG */}
                    <div style={{ position: "relative", width: "90px", height: "90px" }}>
                      <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                        <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#ffffff" />
                        <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#0284c7" strokeWidth="5.5" />
                      </svg>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.68rem" }}>100%</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ fontSize: "0.78rem", flex: 1 }}>
                      <div className="fw-bold text-dark mb-2" style={{ fontSize: "0.82rem" }}>
                        {(selectedUnit.sqft || 0).toLocaleString("en-IN")} Total SFT
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center gap-1.5">
                          <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: "#22c55e" }}></span>
                          <span className="text-muted">Occupied SFT</span>
                        </div>
                        <strong className="text-dark">0 SFT (0%)</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-1.5">
                          <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: "#0284c7" }}></span>
                          <span className="text-muted">Available SFT</span>
                        </div>
                        <strong className="text-dark">{(selectedUnit.sqft || 0).toLocaleString("en-IN")} SFT (100%)</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeDetailTab === "Lease" && (
            <div style={{ fontSize: "0.8rem" }}>
              {selectedUnit.lease ? (
                <div className="d-flex flex-column gap-3.5">
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="fw-bold text-dark mb-3" style={{ fontSize: "0.82rem" }}>Lease Terms & Policies</div>
                    <div className="row g-3">
                      <div className="col-6">
                        <span className="d-block text-muted">Lock-in Period</span>
                        <strong className="text-dark">
                          {selectedUnit.lease.lockInPeriod !== undefined ? `${selectedUnit.lease.lockInPeriod} Months` : "—"}
                        </strong>
                      </div>
                      <div className="col-6">
                        <span className="d-block text-muted">Notice Period</span>
                        <strong className="text-dark">
                          {selectedUnit.lease.noticePeriod !== undefined ? `${selectedUnit.lease.noticePeriod} Months` : "—"}
                        </strong>
                      </div>
                      <div className="col-6">
                        <span className="d-block text-muted">Auto Renewal</span>
                        <strong className="text-dark">
                          {selectedUnit.lease.autoRenewal !== undefined ? (selectedUnit.lease.autoRenewal ? "Enabled" : "Disabled") : "—"}
                        </strong>
                      </div>
                      <div className="col-6">
                        <span className="d-block text-muted">Escalation %</span>
                        <strong className="text-dark">
                          {selectedUnit.lease.escalationPercentage !== undefined ? `${selectedUnit.lease.escalationPercentage}%` : "—"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-3">
                    <div className="fw-bold text-dark mb-2.5" style={{ fontSize: "0.82rem" }}>Other Charges</div>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Parking Charges</span>
                        <strong className="text-dark">
                          {selectedUnit.lease.parkingCharges !== undefined ? `₹ ${selectedUnit.lease.parkingCharges.toLocaleString("en-IN")}` : "—"}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Utility Charges</span>
                        <strong className="text-dark">
                          {selectedUnit.lease.utilityCharges !== undefined ? `₹ ${selectedUnit.lease.utilityCharges.toLocaleString("en-IN")}` : "—"}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Maintenance (CAM)</span>
                        <strong className="text-dark">
                          {selectedUnit.lease.maintenanceCharges !== undefined ? `₹ ${selectedUnit.lease.maintenanceCharges.toLocaleString("en-IN")}` : "—"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted text-center py-5">
                  <i className="bi bi-file-earmark-lock mb-2" style={{ fontSize: "2rem", opacity: 0.3 }} />
                  <div className="small">No active lease agreement for this space.</div>
                </div>
              )}
            </div>
          )}

          {activeDetailTab === "Financials" && (
            <div style={{ fontSize: "0.8rem" }}>
              <div className="fw-bold text-dark mb-3" style={{ fontSize: "0.82rem" }}>Invoices History</div>
              {invoicesLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-secondary mb-2" role="status" />
                  <div className="text-muted small">Loading invoices...</div>
                </div>
              ) : unitInvoices.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {unitInvoices.map(inv => (
                    <div key={inv._id} className="d-flex justify-content-between align-items-center p-2.5 border rounded-3 bg-white">
                      <div>
                        <strong className="text-dark d-block">{inv.invoiceNumber}</strong>
                        <span className="text-muted small">{formatDate(inv.billingPeriodStart)}</span>
                      </div>
                      <div className="text-end">
                        <strong className="text-dark d-block">₹ {Number(inv.invoiceAmount).toLocaleString("en-IN")}</strong>
                        <span
                          className="badge rounded-pill px-2 py-0.5"
                          style={{
                            ...getStatusBadgeStyle(inv.status),
                            fontSize: "0.62rem",
                          }}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted text-center py-4">
                  <i className="bi bi-receipt mb-2" style={{ fontSize: "1.8rem", opacity: 0.3 }} />
                  <div className="small">No invoice history found.</div>
                </div>
              )}
            </div>
          )}

          {activeDetailTab === "Documents" && (
            <div style={{ fontSize: "0.8rem" }}>
              <div className="fw-bold text-dark mb-3" style={{ fontSize: "0.82rem" }}>Verification Documents</div>
              {selectedUnit.lease?.agreementUrl ? (
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-center p-2.5 border rounded-3 bg-white">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-file-earmark-pdf-fill text-danger" style={{ fontSize: "1.2rem" }} />
                      <div>
                        <strong className="text-dark d-block text-truncate" style={{ maxWidth: "220px" }}>
                          {selectedUnit.lease.agreementUrl.split("/").pop() || "Lease Agreement.pdf"}
                        </strong>
                        <span className="text-muted small">Agreement URL</span>
                      </div>
                    </div>
                    <a
                      href={selectedUnit.lease.agreementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-light btn-sm border-0 shadow-none p-1.5 rounded-circle d-flex align-items-center justify-content-center"
                    >
                      <i className="bi bi-download" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-muted text-center py-5">
                  <i className="bi bi-file-earmark-lock mb-2" style={{ fontSize: "2rem", opacity: 0.3 }} />
                  <div className="small">No documents associated with this space.</div>
                </div>
              )}
            </div>
          )}

          {activeDetailTab === "Activity" && (
            <div style={{ fontSize: "0.8rem" }}>
              <div className="fw-bold text-dark mb-3" style={{ fontSize: "0.82rem" }}>Recent Space Activity</div>
              <div className="position-relative ps-3" style={{ borderLeft: "2px solid var(--border-light)" }}>
                <div className="mb-4 position-relative">
                  <div
                    className="position-absolute rounded-circle"
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: "var(--dark-section)",
                      left: -21,
                      top: 4,
                      border: "2px solid #ffffff",
                    }}
                  />
                  <strong className="text-dark d-block">Unit Operational Status: {selectedUnit.isMeetingRoom ? "Reserved" : (selectedUnit.unitStatus || "Available")}</strong>
                  <span className="text-muted small d-block mt-0.5">Last updated: {formatDate(selectedUnit.updatedAt)}</span>
                </div>

                {selectedUnit.lease && (
                  <div className="mb-4 position-relative">
                    <div
                      className="position-absolute rounded-circle"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: "#cbd5e1",
                        left: -21,
                        top: 4,
                        border: "2px solid #ffffff",
                      }}
                    />
                    <strong className="text-dark d-block">Lease Agreement Associated</strong>
                    <span className="text-muted small d-block mt-0.5">
                      Started: {formatDate(selectedUnit.lease.startDate || selectedUnit.lease.agreementStartDate)}
                    </span>
                  </div>
                )}

                <div className="mb-4 position-relative">
                  <div
                    className="position-absolute rounded-circle"
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: "#cbd5e1",
                      left: -21,
                      top: 4,
                      border: "2px solid #ffffff",
                    }}
                  />
                  <strong className="text-dark d-block">Unit Created in Database</strong>
                  <span className="text-muted small d-block mt-0.5">Created: {formatDate(selectedUnit.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-top bg-light d-flex gap-2">
          <button
            onClick={() => onEdit(selectedUnit)}
            className="btn btn-sm btn-outline-secondary fw-semibold flex-grow-1"
            style={{ height: 36, borderRadius: "6px" }}
          >
            Edit Unit
          </button>
          <Link
            href={`/admin/units/${selectedUnit._id}`}
            className="btn btn-sm text-white fw-semibold flex-grow-1 d-flex align-items-center justify-content-center"
            style={{ height: 36, borderRadius: "6px", backgroundColor: "var(--dark-section)" }}
          >
            Go to Details Page
          </Link>
        </div>
      </div>
    </>
  );
}
