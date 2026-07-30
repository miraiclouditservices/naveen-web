"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/utils/api";

interface FloorDetailsDrawerProps {
  selectedFloor: any;
  onClose: () => void;
  onEdit: (floor: any) => void;
}

export default function FloorDetailsDrawer({
  selectedFloor,
  onClose,
  onEdit,
}: FloorDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  
  // Dynamic Tab Data states
  const [floorUnits, setFloorUnits] = useState<any[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  const [floorPayments, setFloorPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const fetchFloorUnits = useCallback(async () => {
    setUnitsLoading(true);
    try {
      const res = await api.get(`/units?floor=${selectedFloor._id}&limit=20`);
      if (res.success) {
        setFloorUnits(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUnitsLoading(false);
    }
  }, [selectedFloor]);

  const fetchFloorPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      // Find invoices associated with this floor directly from backend API
      const res = await api.get(`/invoices?floor=${selectedFloor._id}&limit=100`);
      if (res.success && res.data) {
        setFloorPayments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  }, [selectedFloor]);

  useEffect(() => {
    fetchFloorUnits();
    fetchFloorPayments();
  }, [selectedFloor, fetchFloorUnits, fetchFloorPayments]);

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getStatusBadgeStyle = (status: string) => {
    return status === "Active"
      ? { backgroundColor: "#e8f5e9", color: "#2e7d32", border: "1px solid rgba(46, 125, 50, 0.15)" }
      : { backgroundColor: "#fff3e0", color: "#ef6c00", border: "1px solid rgba(239, 108, 0, 0.15)" };
  };

  const adminName = selectedFloor.assignedAdmin?.name || selectedFloor.assignedOwner?.ownerName || "—";
  const adminContact = selectedFloor.assignedAdmin?.phoneNumber || selectedFloor.assignedOwner?.contactNumber || "—";
  const adminEmail = selectedFloor.assignedAdmin?.email || selectedFloor.assignedOwner?.emailId || "—";
  const initials = adminName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const totalCap = selectedFloor.totalSft || 0;
  const occupiedCap = selectedFloor.occupiedSft || 0;
  const availableCap = selectedFloor.availableSft !== undefined ? selectedFloor.availableSft : (totalCap - occupiedCap);
  const occupancyPct = totalCap > 0 ? Math.round((occupiedCap / totalCap) * 100) : 0;

  const latestInvoice = floorPayments.length > 0
    ? [...floorPayments].sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())[0]
    : null;

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
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-purple-light rounded d-flex align-items-center justify-content-center"
              style={{ width: 44, height: 44, color: "#8b5cf6" }}
            >
              <i className="bi bi-layers" style={{ fontSize: "1.4rem" }} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: "1.1rem" }}>
                  {selectedFloor.floorName || `Floor ${selectedFloor.floorNumber}`}
                </h4>
                <span
                  className="badge px-2.5 py-1.5 fw-bold rounded-pill"
                  style={{
                    ...getStatusBadgeStyle(selectedFloor.status || "Active"),
                    fontSize: "0.68rem",
                  }}
                >
                  {selectedFloor.status || "Active"}
                </span>
              </div>
              <div className="text-muted small mt-1 fw-medium" style={{ fontSize: "0.76rem" }}>
                {selectedFloor.property?.propertyName || "Commercial Property"}
              </div>
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
          {["Overview", `Units (${floorUnits.length})`, "Payments", "Activity"].map((tab) => {
            const label = tab.split(" ")[0];
            const isActive = activeTab === label;
            return (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
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

        {/* Drawer Content */}
        <div className="flex-grow-1 overflow-auto p-4" style={{ backgroundColor: "#ffffff" }}>
          
          {activeTab === "Overview" && (
            <div className="d-flex flex-column gap-4">
              
              {/* Floor Information */}
              <div>
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3" style={{ fontSize: "0.82rem" }}>
                  Floor Information
                </h6>
                <div className="row g-3" style={{ fontSize: "0.78rem" }}>
                  <div className="col-6">
                    <span className="d-block text-muted">Floor Name</span>
                    <strong className="text-dark">{selectedFloor.floorName || `Floor ${selectedFloor.floorNumber}`}</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Floor Code</span>
                    <strong className="text-dark">FL-{selectedFloor.floorNumber || "00"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Floor Type</span>
                    <strong className="text-dark">Commercial</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Total Capacity</span>
                    <strong className="text-dark">{totalCap.toLocaleString("en-IN")} SFT</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Occupied Area</span>
                    <strong className="text-dark">{occupiedCap.toLocaleString("en-IN")} SFT ({occupancyPct}%)</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Available Area</span>
                    <strong className="text-dark">{availableCap.toLocaleString("en-IN")} SFT ({100 - occupancyPct}%)</strong>
                  </div>
                </div>
              </div>

              {/* Assigned Admin */}
              <div>
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3" style={{ fontSize: "0.82rem" }}>
                  Assigned Admin
                </h6>
                {selectedFloor.assignedAdmin || selectedFloor.assignedOwner ? (
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: 42,
                        height: 42,
                        backgroundColor: "#8b5cf6",
                        fontSize: "0.9rem",
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ fontSize: "0.78rem" }}>
                      <strong className="text-dark d-block" style={{ fontSize: "0.85rem" }}>{adminName}</strong>
                      <span className="text-muted d-block mt-0.5">Floor Administrator</span>
                      <div className="d-flex align-items-center gap-3 mt-1.5 text-muted">
                        <span><i className="bi bi-telephone me-1" /> {adminContact}</span>
                        <span><i className="bi bi-envelope me-1" /> {adminEmail}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted p-3 bg-light rounded text-center" style={{ fontSize: "0.76rem" }}>
                    No administrator is currently assigned to this floor.
                  </div>
                )}
              </div>

              {/* Monthly Payment Details */}
              <div>
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3" style={{ fontSize: "0.82rem" }}>
                  Monthly Payment Details
                </h6>
                <div className="row g-3" style={{ fontSize: "0.78rem" }}>
                  <div className="col-6">
                    <span className="d-block text-muted">Monthly Fee</span>
                    <strong className="text-dark">{selectedFloor.floorRevenue > 0 ? `₹ ${Number(selectedFloor.floorRevenue).toLocaleString("en-IN")}` : "—"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Payment Cycle</span>
                    <strong className="text-dark">{selectedFloor.floorRevenue > 0 ? "Monthly" : "—"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Next Payment Date</span>
                    <strong className="text-dark">
                      {selectedFloor.occupants?.find((o: any) => o.nextDueDate)?.nextDueDate
                        ? formatDate(selectedFloor.occupants.find((o: any) => o.nextDueDate).nextDueDate)
                        : "—"}
                    </strong>
                  </div>
                  <div className="col-6">
                    <span className="d-block text-muted">Payment Status</span>
                    {selectedFloor.floorRevenue > 0 ? (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 rounded">
                        {selectedFloor.occupants?.find((o: any) => o.paymentStatus)?.paymentStatus || "Paid"}
                      </span>
                    ) : (
                      <strong className="text-dark">—</strong>
                    )}
                  </div>
                  <div className="col-12">
                    <span className="d-block text-muted">Last Payment</span>
                    <strong className="text-dark">
                      {latestInvoice 
                        ? `₹ ${Number(latestInvoice.invoiceAmount).toLocaleString("en-IN")} (on ${formatDate(latestInvoice.invoiceDate)})`
                        : "—"}
                    </strong>
                  </div>
                </div>
                <button
                  className="btn btn-sm text-white w-100 mt-4 d-flex align-items-center justify-content-center gap-2 py-2"
                  style={{ backgroundColor: "#5820e4", fontWeight: 600, borderRadius: "6px" }}
                >
                  <i className="bi bi-wallet2" /> View Payment History
                </button>
              </div>

            </div>
          )}

          {activeTab === "Units" && (
            <div style={{ fontSize: "0.8rem" }}>
              <div className="fw-bold text-dark mb-3" style={{ fontSize: "0.82rem" }}>Floor Units & Spaces</div>
              {unitsLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-secondary mb-2" role="status" />
                  <div className="text-muted small">Loading units...</div>
                </div>
              ) : floorUnits.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {floorUnits.map(unit => (
                    <div key={unit._id} className="d-flex justify-content-between align-items-center p-2.5 border rounded-3 bg-white">
                      <div>
                        <strong className="text-dark d-block">{unit.unitNumber}</strong>
                        <span className="text-muted small">{unit.sqft ? `${unit.sqft.toLocaleString()} SFT` : "—"}</span>
                      </div>
                      <div className="text-end">
                        <span
                          className="badge rounded-pill px-2.5 py-1.5 fw-semibold"
                          style={{
                            ...getStatusBadgeStyle(unit.unitStatus || "Available"),
                            fontSize: "0.68rem",
                          }}
                        >
                          {unit.unitStatus || "Available"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted text-center py-4">
                  <i className="bi bi-building mb-2" style={{ fontSize: "1.8rem", opacity: 0.3 }} />
                  <div className="small">No units associated with this floor.</div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Payments" && (
            <div style={{ fontSize: "0.8rem" }}>
              <div className="fw-bold text-dark mb-3" style={{ fontSize: "0.82rem" }}>Invoices History</div>
              {paymentsLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-secondary mb-2" role="status" />
                  <div className="text-muted small">Loading payments...</div>
                </div>
              ) : floorPayments.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {floorPayments.map(inv => (
                    <div key={inv._id} className="d-flex justify-content-between align-items-center p-2.5 border rounded-3 bg-white">
                      <div>
                        <strong className="text-dark d-block">{inv.invoiceNumber}</strong>
                        <span className="text-muted small">{formatDate(inv.billingPeriodStart)}</span>
                      </div>
                      <div className="text-end">
                        <strong className="text-dark d-block">₹ {Number(inv.invoiceAmount).toLocaleString("en-IN")}</strong>
                        <span className="badge bg-success bg-opacity-10 text-success px-2 py-0.5 rounded-pill" style={{ fontSize: "0.62rem" }}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted text-center py-4">
                  <i className="bi bi-credit-card mb-2" style={{ fontSize: "1.8rem", opacity: 0.3 }} />
                  <div className="small">No invoice history found.</div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Activity" && (
            <div style={{ fontSize: "0.8rem" }}>
              <div className="fw-bold text-dark mb-3" style={{ fontSize: "0.82rem" }}>Recent Floor Activity</div>
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
                  <strong className="text-dark d-block">Floor operational status checked</strong>
                  <span className="text-muted small d-block mt-0.5">Last updated: {formatDate(selectedFloor.createdAt)}</span>
                </div>
                
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
                  <strong className="text-dark d-block">Floor capacity metrics updated</strong>
                  <span className="text-muted small d-block mt-0.5">{totalCap.toLocaleString()} SFT assigned</span>
                </div>

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
                  <strong className="text-dark d-block">Floor added to Property Database</strong>
                  <span className="text-muted small d-block mt-0.5">Created on {formatDate(selectedFloor.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-top bg-light d-flex gap-2">
          <button
            onClick={() => onEdit(selectedFloor)}
            className="btn btn-sm btn-outline-secondary fw-semibold flex-grow-1"
            style={{ height: 36, borderRadius: "6px" }}
          >
            Edit Floor
          </button>
          <Link
            href={`/admin/floors/${selectedFloor._id}`}
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
