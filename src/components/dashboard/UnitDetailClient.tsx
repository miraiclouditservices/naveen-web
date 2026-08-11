"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/utils/api";
import UnitModal from "@/components/dashboard/UnitModal";

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
};

const formatCurrency = (val: number | null | undefined) => {
  if (val == null || isNaN(val)) return "₹0";
  return `₹${val.toLocaleString("en-IN")}`;
};

const diffDays = (start: string, end: string) => {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  } catch {
    return 0;
  }
};

const remainingDays = (end: string) => {
  try {
    const now = new Date();
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  } catch {
    return 0;
  }
};

export default function UnitDetailClient({ unitId }: { unitId: string }) {
  const [unit, setUnit] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<"invoices" | "history" | "allocations">("invoices");

  const rawRole = currentUser?.role || "";
  const isTenantRole =
    ["COWORKING_TENANT", "Tenant", "Co-Working Member", "Coworking Tenant", "COWORKING TENANT", "COWORKING_MEMBER"].includes(rawRole) ||
    rawRole.toUpperCase().includes("TENANT");

  useEffect(() => {
    loadAll();
  }, [unitId]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Current user
      const meRes = await api.get("/auth/me").catch(() => null);
      const me = meRes?.success && meRes?.data ? meRes.data : null;
      if (!me) {
        const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (stored) { try { setCurrentUser(JSON.parse(stored)); } catch { } }
      } else {
        setCurrentUser(me);
      }

      // 2. Unit
      const unitRes = await api.get(`/units/${unitId}`);
      if (unitRes?.success && unitRes?.data) {
        setUnit(unitRes.data);
      } else {
        setError(unitRes?.error || "Failed to load unit.");
      }

      // 3. Agreement (for tenant)
      const userId = me?._id;
      if (userId) {
        const agrRes = await api.get(`/agreements/user/${userId}`).catch(() => null);
        if (agrRes?.success && agrRes?.data?.agreements?.length > 0) {
          setAgreement(agrRes.data.agreements[0]);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Error loading data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUnit = async (data: any) => {
    try {
      await api.put(`/units/${unitId}`, data);
      await loadAll();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
        <div className="spinner-border" style={{ color: "var(--brand-orange)" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="container py-5 text-center">
        <div className="alert border d-inline-block px-4 py-3 rounded-3" style={{ backgroundColor: "var(--brand-orange-bg)", borderColor: "var(--brand-orange-border)", color: "var(--brand-orange)" }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error || "Unit not found."}
        </div>
        <div className="mt-3">
          <Link href="/admin/units" className="btn btn-dark btn-sm rounded-2 px-3 py-2 fw-semibold">
            <i className="bi bi-arrow-left me-1"></i> Back to Units
          </Link>
        </div>
      </div>
    );
  }

  // ─── Seat data ───
  const totalSeats = unit.seatCount || 0;
  const occupiedSeats = unit.occupiedSeatCount || 0;
  const availableSeats = Math.max(totalSeats - occupiedSeats, 0);

  // Selected seat numbers from user map
  const selectedSeatsMap: Record<string, number[]> = currentUser?.unitSelectedSeatsMap || {};
  const mySeats: number[] = selectedSeatsMap[unitId] || Object.values(selectedSeatsMap)[0] || [];

  // Agreement data
  const agr = agreement;
  const agrPayments: any[] = agr?.payments || [];
  const totalBilled = agr?.totalAmount || 0;
  const totalPaid = agr?.totalPaid || 0;
  const pendingAmount = agr?.pendingAmount || 0;
  const remainingCredit = Math.max(totalPaid - totalBilled, 0);
  const duration = agr ? diffDays(agr.startDate, agr.endDate) : 0;
  const remDays = agr ? remainingDays(agr.endDate) : 0;

  // Initials
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const initials = getInitials(currentUser?.name || "");
  const paymentStatus = currentUser?.paymentStatus || "";
  const isOverdue = paymentStatus === "Overdue";

  // ─────────────────────────────────────────────────────────
  // TENANT VIEW
  // ─────────────────────────────────────────────────────────
  if (isTenantRole) {
    return (
      <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "24px 28px 48px", fontFamily: "var(--font-geist-sans), Inter, sans-serif" }}>
        <UnitModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveUnit} editData={unit} />

        {/* Breadcrumb */}
        <div className="mb-3">
          <Link href="/admin/units" className="text-decoration-none small d-inline-flex align-items-center gap-1" style={{ color: "#64748b", fontSize: "0.82rem" }}>
            Home
          </Link>
          <span className="mx-1" style={{ color: "#64748b", fontSize: "0.82rem" }}>&rsaquo;</span>
          <span className="small" style={{ color: "#64748b", fontSize: "0.82rem" }}>My Workspace</span>
          <span className="mx-1" style={{ color: "#64748b", fontSize: "0.82rem" }}>&rsaquo;</span>
          <span className="small fw-semibold" style={{ color: "#1e293b", fontSize: "0.82rem" }}>Workspace Details</span>
        </div>

        {/* Download Agreement button */}
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 fw-semibold" style={{ borderRadius: "8px", fontSize: "0.83rem", borderColor: "#cbd5e1", color: "#374151" }}>
            <i className="bi bi-download"></i> Download Agreement
          </button>
        </div>

        {/* ── SECTION 1: PROFILE CARD ── */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "14px", backgroundColor: "#fff" }}>
          <div className="card-body p-4">
            <div className="row g-4 align-items-start">
              {/* Left: Avatar + contact */}
              <div className="col-lg-4 col-md-5">
                <div className="d-flex align-items-start gap-3">
                  {/* Avatar */}
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-white"
                    style={{ width: "64px", height: "64px", backgroundColor: "#6366f1", fontSize: "1.35rem", letterSpacing: "-0.02em" }}>
                    {initials}
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="fw-bold" style={{ fontSize: "1.15rem", color: "#1e293b" }}>{currentUser?.name || "—"}</span>
                      <span className="badge rounded-pill fw-semibold px-2" style={{ fontSize: "0.72rem", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                        {currentUser?.agreementStatus || "Active"}
                      </span>
                    </div>
                    <div className="fw-semibold mt-1" style={{ fontSize: "0.88rem", color: "#374151" }}>{currentUser?.companyName || "—"}</div>
                    <div className="mt-2 d-flex flex-column gap-1">
                      <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        <i className="bi bi-envelope" style={{ width: "14px" }}></i>
                        <span>{currentUser?.email || "—"}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        <i className="bi bi-telephone" style={{ width: "14px" }}></i>
                        <span>{currentUser?.phoneNumber || "—"}</span>
                      </div>
                      {currentUser?.emergencyNumber && (
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          <i className="bi bi-telephone-plus" style={{ width: "14px" }}></i>
                          <span>{currentUser.emergencyNumber}</span>
                        </div>
                      )}
                      {currentUser?.address && (
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          <i className="bi bi-geo-alt" style={{ width: "14px" }}></i>
                          <span>{currentUser.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Info grid */}
              <div className="col-lg-8 col-md-7">
                {/* Top row: 3 info boxes */}
                <div className="row g-3 mb-3">
                  {[
                    { label: "Tenant Type", value: currentUser?.tenantType || "Individual", icon: "bi-person" },
                    { label: "Workspace Type", value: (currentUser?.workspaceType || "COMMERCIAL_OFFICE").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), icon: "bi-building" },
                    {
                      label: "Agreement Status", icon: "bi-check-circle",
                      value: currentUser?.agreementStatus || "Active",
                      isGreen: (currentUser?.agreementStatus || "") === "Active"
                    },
                  ].map((item, i) => (
                    <div key={i} className="col-4">
                      <div className="p-3 rounded-3" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <i className={`bi ${item.icon}`} style={{ fontSize: "0.78rem", color: "#64748b" }}></i>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{item.label}</span>
                        </div>
                        <div className="fw-bold" style={{ fontSize: "0.9rem", color: (item as any).isGreen ? "#16a34a" : "#1e293b" }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom row: 4 info items */}
                <div className="row g-3">
                  {[
                    { label: "GST / PAN", value: currentUser?.gstPan || "—" },
                    { label: "Payment Type", value: currentUser?.paymentType || "—" },
                    { label: "Payment Due Day", value: currentUser?.paymentDueDay ? `${currentUser.paymentDueDay}th` : "—" },
                    { label: "Monthly Mgmt. Amount", value: formatCurrency(currentUser?.monthlyManagementAmount) },
                  ].map((item, i) => (
                    <div key={i} className="col-3">
                      <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, marginBottom: "2px" }}>{item.label}</div>
                      <div className="fw-bold" style={{ fontSize: "0.88rem", color: "#1e293b" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: ASSIGNED WORKSPACE / UNIT ── */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3" style={{ fontSize: "1rem", color: "#1e293b" }}>Assigned Workspace / Unit</h6>
          <div className="card border-0 shadow-sm" style={{ borderRadius: "14px", backgroundColor: "#fff" }}>
            <div className="card-body p-4">
              <div className="row g-4 align-items-center">
                {/* Left: image + unit info */}
                <div className="col-lg-5 col-md-6">
                  <div className="d-flex align-items-start gap-3">
                    {/* Office image placeholder */}
                    <div className="flex-shrink-0 rounded-3 overflow-hidden" style={{ width: "110px", height: "80px", backgroundColor: "#e2e8f0" }}>
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
                        <i className="bi bi-building text-white" style={{ fontSize: "2rem" }}></i>
                      </div>
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: "1.05rem", color: "#1e293b", marginBottom: "4px" }}>
                        {unit.unitName || "—"}
                      </div>
                      <div style={{ fontSize: "0.83rem", color: "#3b82f6", fontWeight: 600, marginBottom: "6px" }}>
                        Unit No. {unit.unitNumber || "—"}
                      </div>
                      <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        <i className="bi bi-building"></i>
                        <span>{unit.property?.propertyName || "—"}</span>
                      </div>
                      <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        <i className="bi bi-layers"></i>
                        <span>
                          {unit.floor?.floorNumber != null
                            ? `Floor ${unit.floor.floorNumber} / ${unit.floor?.floorName || "Direct Floor"}`
                            : "Ground / Direct Floor"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: 5 stat boxes */}
                <div className="col-lg-7 col-md-6">
                  <div className="row g-2">
                    {[
                      { label: "Unit Type", value: unit.unitType || "Cabin" },
                      { label: "Unit Status", value: unit.unitStatus || "Occupied", isStatus: true },
                      { label: "Area (Sqft)", value: unit.sqft ? unit.sqft.toLocaleString("en-IN") : "—" },
                      { label: "Seats Assigned", value: currentUser?.assignedSeatCount || totalSeats },
                      { label: "Seats Occupied", value: occupiedSeats },
                    ].map((stat, i) => (
                      <div key={i} className="col">
                        <div className="p-3 text-center rounded-3" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500, marginBottom: "4px" }}>{stat.label}</div>
                          {(stat as any).isStatus ? (
                            <span className="badge rounded-pill fw-semibold" style={{ fontSize: "0.78rem", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "4px 10px" }}>
                              {stat.value}
                            </span>
                          ) : (
                            <div className="fw-bold" style={{ fontSize: "0.95rem", color: "#1e293b" }}>{stat.value}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: AGREEMENT OVERVIEW + OCCUPANT & SEAT DETAILS ── */}
        <div className="row g-4 mb-4">
          {/* Agreement Overview */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "14px", backgroundColor: "#fff" }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6 className="fw-bold m-0" style={{ fontSize: "1rem", color: "#1e293b" }}>Agreement Overview</h6>
                  <span className="badge rounded-pill fw-semibold px-2" style={{ fontSize: "0.72rem", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                    {agr?.status || currentUser?.agreementStatus || "Active"}
                  </span>
                </div>

                {/* Row 1: Start Date, End Date, Total Amount */}
                <div className="row g-3 mb-3">
                  {[
                    { icon: "bi-calendar3", label: "Start Date", value: formatDate(agr?.startDate || currentUser?.floorAssignmentStartDate) },
                    { icon: "bi-calendar3", label: "End Date", value: formatDate(agr?.endDate || currentUser?.floorAssignmentEndDate) },
                    { icon: "bi-percent", label: "Total Agreement Amount", value: formatCurrency(agr?.totalAmount || currentUser?.totalAgreementAmount) },
                  ].map((item, i) => (
                    <div key={i} className="col-4">
                      <div className="d-flex align-items-center gap-1 mb-1">
                        <i className={`bi ${item.icon}`} style={{ fontSize: "0.78rem", color: "#64748b" }}></i>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{item.label}</span>
                      </div>
                      <div className="fw-bold" style={{ fontSize: "0.92rem", color: "#1e293b" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <hr style={{ borderColor: "#f1f5f9", margin: "12px 0" }} />

                {/* Row 2: Payment Type, Payment Due Day, Agreement Status */}
                <div className="row g-3 mb-4">
                  {[
                    { icon: "bi-calendar3", label: "Payment Type", value: agr?.paymentType || currentUser?.paymentType || "—" },
                    { icon: "bi-calendar3", label: "Payment Due Day", value: agr?.paymentDueDay ? `${agr.paymentDueDay}th` : (currentUser?.paymentDueDay ? `${currentUser.paymentDueDay}th` : "—") },
                    { icon: "bi-check-circle", label: "Agreement Status", value: currentUser?.agreementStatus || "Active", isGreen: true },
                  ].map((item, i) => (
                    <div key={i} className="col-4">
                      <div className="d-flex align-items-center gap-1 mb-1">
                        <i className={`bi ${item.icon}`} style={{ fontSize: "0.78rem", color: "#64748b" }}></i>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{item.label}</span>
                      </div>
                      <div className="fw-bold" style={{ fontSize: "0.92rem", color: (item as any).isGreen ? "#16a34a" : "#1e293b" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Bottom summary row */}
                <div className="rounded-3 p-3" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="row g-0">
                    {[
                      { label: "Duration", value: duration ? `${duration} Days` : "—" },
                      { label: "Remaining Days", value: remDays ? `${remDays} Days` : "—" },
                      { label: "Remaining Credit", value: formatCurrency(remainingCredit) },
                    ].map((item, i) => (
                      <div key={i} className={`col-4 ${i > 0 ? "border-start ps-3" : ""}`}>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{item.label}</div>
                        <div className="fw-bold mt-1" style={{ fontSize: "0.92rem", color: "#1e293b" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Occupant & Seat Details */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "14px", backgroundColor: "#fff" }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3" style={{ fontSize: "1rem", color: "#1e293b" }}>Occupant & Seat Details</h6>

                {/* Occupant row */}
                <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold"
                    style={{ width: "44px", height: "44px", backgroundColor: "#6366f1", fontSize: "1rem" }}>
                    {initials}
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "0.95rem", color: "#1e293b" }}>{currentUser?.name || "—"}</div>
                    <div style={{ fontSize: "0.82rem", color: "#64748b" }}>{currentUser?.companyName || "—"}</div>
                  </div>
                </div>

                {/* Seat counts */}
                <div className="mb-3">
                  {[
                    { label: "Assigned Seat Count", value: currentUser?.assignedSeatCount || totalSeats },
                    { label: "Occupied Seat Count", value: occupiedSeats },
                  ].map((item, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "0.85rem", color: "#374151" }}>{item.label}</span>
                      <span className="fw-bold" style={{ fontSize: "0.9rem", color: "#1e293b" }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Seat numbers */}
                {mySeats.length > 0 && (
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500, marginBottom: "8px" }}>Seat Numbers</div>
                    <div className="d-flex flex-wrap gap-2">
                      {mySeats.map((seatNum) => (
                        <div key={seatNum} className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                          style={{ width: "36px", height: "36px", backgroundColor: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe", fontSize: "0.82rem" }}>
                          {seatNum}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: INVOICES & PAYMENTS ── */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3" style={{ fontSize: "1rem", color: "#1e293b" }}>Invoices & Payments</h6>
          <div className="card border-0 shadow-sm" style={{ borderRadius: "14px", backgroundColor: "#fff" }}>
            <div className="card-body p-0">
              <div className="row g-0">
                {/* Left: Tabs + table */}
                <div className="col-lg-8" style={{ borderRight: "1px solid #f1f5f9" }}>
                  {/* Tabs */}
                  <div className="d-flex border-bottom px-4" style={{ borderColor: "#f1f5f9" }}>
                    {([
                      { key: "invoices", label: "Invoices" },
                      { key: "history", label: "Payment History" },
                      { key: "allocations", label: "Allocations" },
                    ] as const).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActivePaymentTab(tab.key)}
                        className="btn btn-link text-decoration-none fw-semibold px-0 me-4 py-3"
                        style={{
                          fontSize: "0.85rem",
                          color: activePaymentTab === tab.key ? "#3b82f6" : "#64748b",
                          borderBottom: activePaymentTab === tab.key ? "2px solid #3b82f6" : "2px solid transparent",
                          borderRadius: 0
                        }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Invoices tab */}
                  {activePaymentTab === "invoices" && (
                    <div className="p-4">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0" style={{ fontSize: "0.82rem" }}>
                          <thead>
                            <tr style={{ backgroundColor: "#f8fafc" }}>
                              {["Invoice ID", "Billing Period", "Amount", "Paid Amount", "Pending", "Due Date", "Paid Date", "Status", "Receipt"].map((h) => (
                                <th key={h} className="fw-semibold py-2 px-2" style={{ color: "#64748b", borderColor: "#f1f5f9", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {agrPayments.length > 0 ? agrPayments.map((p: any, idx: number) => {
                              const billingDate = new Date(p.paymentDate || agr?.startDate);
                              const billingPeriod = billingDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
                              return (
                                <tr key={p._id || idx}>
                                  <td className="py-2 px-2 fw-semibold" style={{ color: "#3b82f6" }}>INV-{String(idx + 1).padStart(3, "0")}</td>
                                  <td className="py-2 px-2" style={{ color: "#374151" }}>{billingPeriod}</td>
                                  <td className="py-2 px-2 fw-semibold" style={{ color: "#1e293b" }}>{formatCurrency(p.amountPaid || agr?.totalAmount)}</td>
                                  <td className="py-2 px-2" style={{ color: "#374151" }}>{formatCurrency(p.amountPaid)}</td>
                                  <td className="py-2 px-2" style={{ color: "#374151" }}>{formatCurrency(0)}</td>
                                  <td className="py-2 px-2" style={{ color: "#374151", whiteSpace: "nowrap" }}>{formatDate(agr?.nextDueDate)}</td>
                                  <td className="py-2 px-2" style={{ color: "#374151", whiteSpace: "nowrap" }}>{formatDate(p.paymentDate)}</td>
                                  <td className="py-2 px-2">
                                    <span className="badge rounded-pill fw-semibold" style={{ fontSize: "0.72rem", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "3px 8px" }}>
                                      {p.status || "Paid"}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2">
                                    <button className="btn btn-link p-0" style={{ color: "#64748b" }} title="Download Receipt">
                                      <i className="bi bi-download"></i>
                                    </button>
                                  </td>
                                </tr>
                              );
                            }) : (
                              <tr>
                                <td colSpan={9} className="text-center py-4" style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                                  No invoices found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Payment History tab */}
                  {activePaymentTab === "history" && (
                    <div className="p-4">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0" style={{ fontSize: "0.82rem" }}>
                          <thead>
                            <tr style={{ backgroundColor: "#f8fafc" }}>
                              {["Receipt No.", "Date", "Amount Paid", "Payment Mode", "Ref / TxnID", "Notes", "Status"].map((h) => (
                                <th key={h} className="fw-semibold py-2 px-2" style={{ color: "#64748b", borderColor: "#f1f5f9", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {agrPayments.length > 0 ? agrPayments.map((p: any, idx: number) => (
                              <tr key={p._id || idx}>
                                <td className="py-2 px-2 fw-semibold" style={{ color: "#3b82f6" }}>{p.receiptNumber || `PAY-${String(idx + 1).padStart(4, "0")}`}</td>
                                <td className="py-2 px-2" style={{ color: "#374151", whiteSpace: "nowrap" }}>{formatDate(p.paymentDate)}</td>
                                <td className="py-2 px-2 fw-semibold" style={{ color: "#1e293b" }}>{formatCurrency(p.amountPaid)}</td>
                                <td className="py-2 px-2" style={{ color: "#374151" }}>{p.paymentMode || "—"}</td>
                                <td className="py-2 px-2" style={{ color: "#64748b" }}>{p.transactionRef || "—"}</td>
                                <td className="py-2 px-2" style={{ color: "#64748b", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.notes || "—"}</td>
                                <td className="py-2 px-2">
                                  <span className="badge rounded-pill fw-semibold" style={{ fontSize: "0.72rem", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "3px 8px" }}>
                                    {p.status || "Paid"}
                                  </span>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={7} className="text-center py-4" style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                                  No payment history found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Allocations tab */}
                  {activePaymentTab === "allocations" && (
                    <div className="p-4 text-center py-5">
                      <i className="bi bi-wallet2 mb-3" style={{ fontSize: "2.5rem", color: "#cbd5e1" }}></i>
                      <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>No allocations recorded yet.</div>
                    </div>
                  )}
                </div>

                {/* Right: Payment Summary */}
                <div className="col-lg-4">
                  <div className="p-4">
                    <h6 className="fw-bold mb-3" style={{ fontSize: "0.92rem", color: "#1e293b" }}>Payment Summary</h6>
                    <div className="d-flex flex-column gap-0">
                      {[
                        { label: "Total Billed", value: formatCurrency(totalBilled) },
                        { label: "Total Paid", value: formatCurrency(totalPaid) },
                        { label: "Pending Amount", value: formatCurrency(pendingAmount) },
                        { label: "Overdue Amount", value: formatCurrency(isOverdue ? pendingAmount : 0) },
                      ].map((row, i) => (
                        <div key={i} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #f1f5f9", fontSize: "0.85rem" }}>
                          <span style={{ color: "#374151" }}>{row.label}</span>
                          <span className="fw-semibold" style={{ color: "#1e293b" }}>{row.value}</span>
                        </div>
                      ))}
                      <div className="d-flex justify-content-between align-items-center pt-3 mt-1">
                        <span className="fw-semibold" style={{ fontSize: "0.88rem", color: "#374151" }}>Net Credit / Remaining</span>
                        <span className="fw-bold" style={{ fontSize: "1rem", color: "#3b82f6" }}>{formatCurrency(remainingCredit)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 5: BOTTOM NOTE BAR ── */}
        <div className="card border-0" style={{ borderRadius: "14px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
          <div className="card-body px-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "36px", height: "36px", backgroundColor: "#dbeafe", color: "#2563eb", fontSize: "1rem" }}>
                <i className="bi bi-info-circle-fill"></i>
              </div>
              <span style={{ fontSize: "0.85rem", color: "#1e40af" }}>
                {isOverdue
                  ? "Your account is currently Overdue. Please ensure timely payments to avoid service interruption."
                  : "Your account is in good standing. Thank you for timely payments."}
              </span>
            </div>
            <button className="btn fw-semibold btn-sm px-4 py-2" style={{ backgroundColor: "#2563eb", color: "#fff", borderRadius: "8px", fontSize: "0.85rem" }}>
              Make a Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN / OFFICE OWNER VIEW
  // ─────────────────────────────────────────────────────────
  const totalSeatsA = unit.seatCount || 0;
  const occupiedSeatsA = unit.occupiedSeatCount || 0;
  const availableSeatsA = Math.max(totalSeatsA - occupiedSeatsA, 0);
  const occupancyPct = totalSeatsA > 0 ? Math.round((occupiedSeatsA / totalSeatsA) * 100) : 0;
  const seatCountDisplay = totalSeatsA > 0 ? totalSeatsA : 10;
  const seatsList = Array.from({ length: seatCountDisplay }, (_, i) => ({
    number: i + 1,
    isOccupied: i < occupiedSeatsA,
  }));
  const createdByUser = unit.createdBy;
  const updatedByUser = unit.updatedBy;

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "24px 32px 48px", fontFamily: "var(--font-geist-sans), Inter, sans-serif" }}>
      <UnitModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveUnit} editData={unit} />

      {/* Header */}
      <div className="mb-4">
        <Link href="/admin/units" className="text-decoration-none small fw-bold d-inline-flex align-items-center gap-1 mb-2" style={{ fontSize: "0.82rem", color: "var(--text-body)" }}>
          <i className="bi bi-arrow-left"></i> Back to Units
        </Link>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-1">
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h2 className="fw-bold m-0" style={{ fontSize: "1.65rem", letterSpacing: "-0.02em", color: "var(--dark-heading)" }}>
                Unit {unit.unitNumber} {unit.unitName ? `– ${unit.unitName}` : ""}
              </h2>
              <span className="badge px-2 py-1 rounded-pill fw-bold" style={{ fontSize: "0.75rem", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                {unit.unitStatus || "Available"}
              </span>
            </div>
            <div className="small mt-1 fw-medium" style={{ color: "var(--text-body)", fontSize: "0.88rem" }}>
              {unit.floor?.floorName || "Office Workspace"}
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button onClick={() => setIsEditModalOpen(true)} className="btn btn-light bg-white border fw-semibold px-3 py-2 d-inline-flex align-items-center gap-2" style={{ borderRadius: "10px", fontSize: "0.85rem", borderColor: "var(--border-light)", color: "var(--dark-heading)" }}>
              <i className="bi bi-pencil" style={{ color: "var(--brand-orange)" }}></i> Edit Unit
            </button>
          </div>
        </div>
      </div>

      {/* Property summary */}
      <div className="card border mb-4" style={{ backgroundColor: "#ffffff", borderRadius: "10px", borderColor: "var(--border-light)", padding: "20px 24px" }}>
        <div className="row align-items-center g-3">
          <div className="col-lg-5 col-md-6 d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "48px", height: "48px", borderRadius: "10px", backgroundColor: "var(--brand-orange-bg)", color: "var(--brand-orange)", border: "1px solid var(--brand-orange-border)", fontSize: "1.35rem" }}>
              <i className="bi bi-building"></i>
            </div>
            <div>
              <div className="fw-bold fs-6" style={{ color: "var(--dark-heading)", lineHeight: "1.2" }}>{unit.property?.propertyName || "—"}</div>
              <div className="small mt-1 fw-medium" style={{ color: "var(--text-body)" }}>{unit.property?.city || "—"}, {unit.property?.state || "—"}</div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 border-start-md ps-md-3">
            <div className="small fw-medium" style={{ color: "var(--text-body)" }}>Floor</div>
            <div className="fw-bold mt-1" style={{ color: "var(--dark-heading)", fontSize: "0.9rem" }}>
              {unit.floor?.floorNumber != null ? `Floor ${unit.floor.floorNumber}` : "Ground"} - {unit.floor?.floorName || "Office Workspace"}
            </div>
          </div>
          <div className="col-lg-2 col-md-6 border-start-lg ps-lg-3">
            <div className="small fw-medium" style={{ color: "var(--text-body)" }}>Total Floor SFT</div>
            <div className="fw-bold mt-1" style={{ color: "var(--dark-heading)", fontSize: "0.9rem" }}>
              {unit.floor?.totalSft ? `${unit.floor.totalSft.toLocaleString("en-IN")} SFT` : "—"}
            </div>
          </div>
          <div className="col-lg-2 col-md-6 border-start-lg ps-lg-3">
            <div className="small fw-medium" style={{ color: "var(--text-body)" }}>Unit SFT</div>
            <div className="fw-bold mt-1" style={{ color: "var(--dark-heading)", fontSize: "0.9rem" }}>
              {unit.sqft ? `${unit.sqft.toLocaleString("en-IN")} SFT` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="row g-4 mb-4">
        {/* Left cards */}
        <div className="col-lg-4 col-md-5 d-flex flex-column gap-3">
          {/* Unit Info */}
          <div className="card border p-4" style={{ backgroundColor: "#ffffff", borderRadius: "10px", borderColor: "var(--border-light)" }}>
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: "var(--border-light)" }}>
              <i className="bi bi-file-earmark-text fs-5" style={{ color: "var(--brand-orange)" }}></i>
              <h6 className="fw-bold m-0" style={{ fontSize: "0.95rem", color: "var(--dark-heading)" }}>Unit Information</h6>
            </div>
            <div className="d-flex flex-column gap-2">
              {[
                { label: "Unit Number", value: unit.unitNumber },
                { label: "Unit Name", value: unit.unitName || "—" },
                { label: "Unit Type", value: unit.unitType || "Cabin", isBadge: true },
                { label: "Unit Status", value: unit.unitStatus || "Available", isStatus: true },
                { label: "SQFT", value: unit.sqft ? `${unit.sqft.toLocaleString("en-IN")} SFT` : "—" },
                { label: "Car Parking", value: unit.carParking || 0 },
                { label: "Bike Parking", value: unit.bikeParking || 0 },
                { label: "Floor Number", value: unit.floor?.floorNumber ?? unit.floorNumber ?? "—" },
              ].map((row, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center py-1 px-1">
                  <span className="small fw-medium" style={{ color: "var(--text-body)" }}>{row.label}</span>
                  {(row as any).isBadge ? (
                    <span className="badge border px-2 py-1 rounded-pill fw-semibold" style={{ fontSize: "0.75rem", backgroundColor: "var(--brand-orange-bg)", color: "var(--brand-orange)", borderColor: "var(--brand-orange-border)" }}>{row.value}</span>
                  ) : (row as any).isStatus ? (
                    <span className="badge px-2 py-1 rounded-pill fw-semibold" style={{ fontSize: "0.75rem", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>{row.value}</span>
                  ) : (
                    <span className="fw-bold" style={{ fontSize: "0.9rem", color: "var(--dark-heading)" }}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy */}
          <div className="card border p-4" style={{ backgroundColor: "#ffffff", borderRadius: "10px", borderColor: "var(--border-light)" }}>
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: "var(--border-light)" }}>
              <i className="bi bi-pie-chart fs-5" style={{ color: "var(--brand-orange)" }}></i>
              <h6 className="fw-bold m-0" style={{ fontSize: "0.95rem", color: "var(--dark-heading)" }}>Occupancy</h6>
            </div>
            <div className="d-flex flex-column gap-2">
              {[
                { label: "Total Seats", value: totalSeatsA },
                { label: "Occupied Seats", value: occupiedSeatsA },
                { label: "Available Seats", value: availableSeatsA, green: true },
                { label: "Occupancy Rate", value: `${occupancyPct}%`, badge: true },
              ].map((row, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center py-1 px-1">
                  <span className="small fw-medium" style={{ color: "var(--text-body)" }}>{row.label}</span>
                  {(row as any).badge ? (
                    <span className="badge border px-2 py-1 rounded-pill fw-semibold" style={{ fontSize: "0.75rem", backgroundColor: "var(--brand-orange-bg)", color: "var(--brand-orange)", borderColor: "var(--brand-orange-border)" }}>{row.value}</span>
                  ) : (
                    <span className="fw-bold" style={{ fontSize: "0.9rem", color: (row as any).green ? "#16a34a" : "var(--dark-heading)" }}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Occupants & Tenants */}
          <div className="card border p-4" style={{ backgroundColor: "#ffffff", borderRadius: "10px", borderColor: "var(--border-light)" }}>
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: "var(--border-light)" }}>
              <i className="bi bi-people-fill fs-5" style={{ color: "var(--brand-orange)" }}></i>
              <h6 className="fw-bold m-0" style={{ fontSize: "0.95rem", color: "var(--dark-heading)" }}>Occupants & Tenants</h6>
            </div>
            {unit.occupants && unit.occupants.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {unit.occupants.map((occ: any, idx: number) => (
                  <div key={occ._id || idx} className="p-3 rounded-3 border" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-white border d-flex align-items-center justify-content-center fw-bold text-dark" style={{ width: "30px", height: "30px", fontSize: "0.78rem" }}>
                          {occ.name ? occ.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: "0.85rem", color: "#1e293b" }}>{occ.name}</div>
                          {occ.companyName && <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{occ.companyName}</div>}
                        </div>
                      </div>
                      <span className="badge bg-white text-dark border rounded-pill fw-semibold" style={{ fontSize: "0.7rem" }}>
                        {occ.role === "OFFICE_OWNER" ? "Office Owner" : occ.role || "Tenant"}
                      </span>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-2 mt-2 pt-2 border-top" style={{ borderColor: "#e2e8f0", fontSize: "0.75rem", color: "#64748b" }}>
                      {occ.phone && <span><i className="bi bi-telephone me-1 text-primary"></i>{occ.phone}</span>}
                      {occ.assignedSeatCount && <span className="fw-semibold text-success"><i className="bi bi-person-workspace me-1"></i>{occ.assignedSeatCount} Seats</span>}
                      {occ.monthlyManagementAmount > 0 && <span className="fw-bold text-dark"><i className="bi bi-currency-rupee"></i>{occ.monthlyManagementAmount.toLocaleString("en-IN")}/mo</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {[
                  { label: "Owner", value: unit.owner?.ownerName || unit.ownerName || "—" },
                  { label: "Tenant", value: unit.tenant?.tenantName || unit.lease?.tenantName || "—" },
                  { label: "Monthly Rent", value: unit.lease?.monthlyRent ? formatCurrency(unit.lease.monthlyRent) : "—" },
                ].map((row, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center py-1 px-1">
                    <span className="small fw-medium" style={{ color: "var(--text-body)" }}>{row.label}</span>
                    <span className="fw-bold" style={{ fontSize: "0.9rem", color: "var(--dark-heading)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card border p-4" style={{ backgroundColor: "#ffffff", borderRadius: "10px", borderColor: "var(--border-light)" }}>
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: "var(--border-light)" }}>
              <i className="bi bi-clock fs-5" style={{ color: "var(--brand-orange)" }}></i>
              <h6 className="fw-bold m-0" style={{ fontSize: "0.95rem", color: "var(--dark-heading)" }}>Timeline</h6>
            </div>
            <div className="d-flex flex-column gap-3 ps-2">
              {[
                { dot: "#16a34a", title: "Unit Created", date: formatDate(unit.createdAt), desc: `Created ${createdByUser ? `by ${createdByUser.name}` : ""}` },
                { dot: "var(--brand-orange)", title: "Unit Updated", date: formatDate(unit.updatedAt || unit.createdAt), desc: `Updated ${updatedByUser ? `by ${updatedByUser.name}` : ""}` },
              ].map((item, i) => (
                <div key={i} className="d-flex align-items-start gap-3">
                  <div className="rounded-circle mt-1 flex-shrink-0" style={{ width: "10px", height: "10px", backgroundColor: item.dot }}></div>
                  <div className="w-100">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-bold" style={{ fontSize: "0.88rem", color: "var(--dark-heading)" }}>{item.title}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-body)" }}>{item.date}</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-body)" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Seat Map */}
        <div className="col-lg-8 col-md-7">
          <div className="card border p-4 h-100" style={{ backgroundColor: "#ffffff", borderRadius: "10px", borderColor: "var(--border-light)" }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: "var(--border-light)" }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-person-workspace fs-5" style={{ color: "var(--brand-orange)" }}></i>
                <h6 className="fw-bold m-0" style={{ fontSize: "1rem", color: "var(--dark-heading)" }}>
                  Seat Map <span className="fw-normal" style={{ color: "var(--text-body)" }}>({seatCountDisplay} Total)</span>
                </h6>
              </div>
              <div className="d-flex align-items-center gap-3" style={{ fontSize: "0.8rem" }}>
                <div className="d-flex align-items-center gap-1">
                  <span className="rounded-2 d-inline-block border" style={{ width: "14px", height: "14px", backgroundColor: "#f0fdf4", borderColor: "#16a34a" }}></span>
                  <span className="fw-medium" style={{ color: "var(--text-body)" }}>Available ({availableSeatsA})</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span className="rounded-2 d-inline-block border" style={{ width: "14px", height: "14px", backgroundColor: "#f1f5f9", borderColor: "#cbd5e1" }}></span>
                  <span className="fw-medium" style={{ color: "var(--text-body)" }}>Occupied ({occupiedSeatsA})</span>
                </div>
              </div>
            </div>

            <div className="my-3 text-center">
              <div className="d-inline-flex align-items-center justify-content-center px-4 py-1 rounded-pill border text-muted small fw-bold mb-2" style={{ backgroundColor: "#f1f5f9", fontSize: "0.75rem", letterSpacing: "0.06em" }}>
                <i className="bi bi-display me-2 text-primary"></i> MAIN EXECUTIVE DESK BAY
              </div>
              <div className="mx-auto rounded-pill" style={{ width: "70%", height: "4px", background: "linear-gradient(90deg, transparent 0%, var(--brand-orange) 50%, transparent 100%)", opacity: 0.8 }}></div>
            </div>

            <div className="p-4 bg-white border rounded-3 text-center mb-4" style={{ borderColor: "var(--border-light)" }}>
              <div className="row g-2 justify-content-center">
                {seatsList.map((seat) => (
                  <div key={seat.number} className="col-auto">
                    <div className="p-2 d-flex flex-column align-items-center justify-content-center position-relative"
                      style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: seat.isOccupied ? "#f1f5f9" : "#f0fdf4", border: seat.isOccupied ? "1px solid #cbd5e1" : "2px solid #16a34a", color: seat.isOccupied ? "#94a3b8" : "#16a34a", transition: "all 0.2s" }}
                      title={`Seat ${seat.number} (${seat.isOccupied ? "Occupied" : "Available"})`}>
                      <i className={`bi ${seat.isOccupied ? "bi-lock-fill" : "bi-person-workspace"}`} style={{ fontSize: "1.15rem" }}></i>
                      <span className="fw-bold" style={{ fontSize: "0.74rem", lineHeight: "1" }}>{seat.number}</span>
                      {!seat.isOccupied && (
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle" style={{ width: "10px", height: "10px" }}></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="row g-2 mb-3">
              {[
                { label: "Total Seats", value: totalSeatsA, bg: "#ffffff", color: "var(--dark-heading)" },
                { label: "Occupied", value: occupiedSeatsA, bg: "#f8fafc", color: "var(--dark-heading)" },
                { label: "Available", value: availableSeatsA, bg: "#f0fdf4", color: "#16a34a" },
                { label: "Occupancy", value: `${occupancyPct}%`, bg: "var(--brand-orange-bg)", color: "var(--brand-orange)" },
              ].map((card, i) => (
                <div key={i} className="col-3">
                  <div className="p-3 text-center rounded-3 border" style={{ backgroundColor: card.bg, borderColor: "var(--border-light)" }}>
                    <div className="fw-bold fs-4" style={{ lineHeight: "1", color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 600, marginTop: "4px", color: "var(--text-body)" }}>{card.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center py-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: "72px", height: "72px", backgroundColor: "var(--brand-orange-bg)", color: "var(--brand-orange)", fontSize: "2rem" }}>
                <i className="bi bi-person-workspace"></i>
              </div>
              <h5 className="fw-bold mb-1" style={{ color: "var(--dark-heading)" }}>
                {occupiedSeatsA === 0 ? "All Seats Available!" : `${occupiedSeatsA} Seat${occupiedSeatsA > 1 ? "s" : ""} Occupied`}
              </h5>
              <p className="small m-0" style={{ color: "var(--text-body)" }}>
                {occupiedSeatsA === 0 ? "This unit is ready to be occupied." : `${availableSeatsA} seats remaining available.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
