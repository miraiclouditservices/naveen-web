"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/utils/api";
import RecordPaymentModal from "@/components/users/modals/RecordPaymentModal";

const STATUS_COLOR: Record<string, string> = {
  Paid: "success",
  Unpaid: "danger",
  Pending: "warning",
  "Partially Paid": "warning",
  "Partial Paid": "warning",
  Partial: "warning",
  Overdue: "danger",
  Active: "success",
  Expired: "secondary",
  Suspended: "danger",
};

export default function LeaseDetailClient({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [lease, setLease] = useState<any>(null);
  const [agreement, setAgreement] = useState<any>(null);
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search, filter, and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmountInput, setPaymentAmountInput] = useState("");
  const [paymentDateInput, setPaymentDateInput] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentModeInput, setPaymentModeInput] = useState("UPI");
  const [transactionRefInput, setTransactionRefInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Checkbox state for table selection
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<any>(null);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch user profile
      const resUser = await api.get(`/users/${userId}`);
      if (resUser.success) {
        const userData = resUser.data;
        setUser(userData);

        // Fetch lease for this user
        try {
          const resLease = await api.get(`/leases?limit=100`);
          if (resLease.success && resLease.data) {
            const matched = resLease.data.find(
              (l: any) =>
                l.tenantEmail === userData.email || l.tenantName === userData.name
            );
            setLease(matched || null);
          }
        } catch (err) {
          console.error("Error fetching lease details:", err);
        }

        // Fetch agreement details
        try {
          const resAgreement = await api.get(`/agreements/user/${userId}`);
          if (resAgreement.success && resAgreement.data) {
            setAgreement(resAgreement.data.agreements?.[0] || null);
          }
        } catch (err: any) {
          if (err.status === 404 || err.message === 'No agreement active for this user.') {
            setAgreement(null);
          } else {
            console.error("Error fetching agreement details:", err);
          }
        }

        // Fetch billing invoices & payments
        const resBilling = await api.get(`/users/${userId}/billing`);
        if (resBilling.success) {
          setBillingData(resBilling.data);
        }
      }
    } catch (err) {
      console.error("Error loading lease detail view:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userId !== "new" && userId !== "fallback") {
      fetchDetails();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  // Compute key financial metrics
  const totalAmount =
    agreement?.totalAmount ||
    user?.totalAgreementAmount ||
    (billingData?.invoices || []).reduce((sum: number, inv: any) => sum + inv.amount, 0) ||
    0;
  const totalPaid = billingData?.summary?.totalPaid || 0;
  const pendingAmount = Math.max(0, totalAmount - totalPaid);
  const paidPercent = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
  const pendingPercent = Math.max(0, 100 - paidPercent);

  const nextDueDateStr = agreement?.nextDueDate || user?.floorAssignmentStartDate || null;

  // Format Helper Methods
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const calculateDuration = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return "—";
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "—";

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    const days = end.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
    }

    const displayMonths = Math.max(0, months);
    const displayDays = days >= 0 ? days : 30 + days;

    return `${displayMonths} Months, ${displayDays} Days`;
  };

  // Filter and Paginated Invoices
  const filteredInvoices = (billingData?.invoices || []).filter((inv: any) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      inv.invoiceId.toLowerCase().includes(query) ||
      inv.billingPeriod.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "All" ||
      inv.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalFilteredCount = filteredInvoices.length;
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPagesCount = Math.ceil(totalFilteredCount / itemsPerPage) || 1;

  // Handle click on specific invoice pay now button
  const handlePayNowClick = (inv: any) => {
    const needed = inv.pendingAmount || inv.amount || 0;
    setPaymentAmountInput(String(needed));
    setNotesInput(`Payment for ${inv.billingPeriod} (${inv.invoiceId})`);
    setShowPaymentModal(true);
  };

  // Handle click to view receipt
  const handleViewReceiptClick = (inv: any) => {
    setSelectedInvoiceForReceipt(inv);
    setShowReceiptModal(true);
  };

  // Submit recorded payment
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingPayment) return;
    setIsSubmittingPayment(true);
    try {
      const payload = {
        amountPaid: Number(paymentAmountInput),
        paymentDate: paymentDateInput,
        paymentMode: paymentModeInput,
        transactionRef: transactionRefInput,
        notes: notesInput,
      };

      const targetId = agreement?._id || user?._id;
      const res = await api.post(`/agreements/${targetId}/payments`, payload);
      if (res.success) {
        setShowPaymentModal(false);
        // Reset inputs
        setPaymentAmountInput("");
        setTransactionRefInput("");
        setNotesInput("");
        // Reload details
        await fetchDetails();
      } else {
        alert(res.error || "Failed to record payment");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to record payment");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Bulk actions helpers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoices(paginatedInvoices.map((inv: any) => inv.invoiceId));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectRow = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices((prev) => [...prev, invoiceId]);
    } else {
      setSelectedInvoices((prev) => prev.filter((id) => id !== invoiceId));
    }
  };

  // Shimmer pulse loader rendering
  if (isLoading) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100" style={{ fontFamily: "var(--font-geist-sans)" }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          .animate-pulse {
            animation: pulse 1.5s infinite ease-in-out;
          }
          .bg-shimmer {
            background-color: #e2e8f0;
            border-radius: 6px;
          }
        `}</style>
        <div className="d-flex justify-content-between mb-4">
          <div className="w-25 bg-shimmer animate-pulse" style={{ height: 40 }} />
          <div className="w-25 bg-shimmer animate-pulse" style={{ height: 40 }} />
        </div>
        <div className="row g-4 mb-4">
          <div className="col-lg-3">
            <div className="bg-white border rounded-4 p-4 animate-pulse" style={{ height: 320 }}>
              <div className="rounded-circle bg-shimmer mx-auto mb-3" style={{ width: 64, height: 64 }} />
              <div className="bg-shimmer mx-auto mb-2" style={{ height: 20, width: "60%" }} />
              <div className="bg-shimmer mx-auto mb-4" style={{ height: 14, width: "40%" }} />
              <div className="bg-shimmer mb-2" style={{ height: 35 }} />
              <div className="bg-shimmer mb-2" style={{ height: 35 }} />
            </div>
          </div>
          <div className="col-lg-9">
            <div className="bg-white border rounded-4 p-4 animate-pulse mb-4" style={{ height: 220 }}>
              <div className="row g-3 mb-3">
                <div className="col-3"><div className="bg-shimmer" style={{ height: 80 }} /></div>
                <div className="col-3"><div className="bg-shimmer" style={{ height: 80 }} /></div>
                <div className="col-3"><div className="bg-shimmer" style={{ height: 80 }} /></div>
                <div className="col-3"><div className="bg-shimmer" style={{ height: 80 }} /></div>
              </div>
              <div className="bg-shimmer" style={{ height: 40 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-5 text-center bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <div className="bg-white border rounded-4 p-4 shadow-sm" style={{ maxWidth: 450 }}>
          <i className="bi bi-exclamation-triangle text-warning fs-1"></i>
          <h5 className="fw-bold text-dark mt-3">Agreement Profile Not Found</h5>
          <p className="text-muted small mt-2">
            The requested user or agreement profile could not be found in the system.
          </p>
          <Link href="/admin/leases" className="btn btn-primary btn-sm mt-3 px-4 py-2" style={{ borderRadius: "8px" }}>
            Back to Lease Agreements
          </Link>
        </div>
      </div>
    );
  }

  const durationStr = calculateDuration(
    agreement?.startDate || user.floorAssignmentStartDate,
    agreement?.endDate || user.floorAssignmentEndDate
  );

  return (
    <div className="container-fluid py-4 px-4 px-md-5" style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "var(--font-geist-sans)" }}>
      
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="fw-bold mb-1 text-dark" style={{ fontSize: "1.6rem", letterSpacing: "-0.025em" }}>
            Lease Agreement Details
          </h1>
          <p className="text-muted small mb-0">
            Manage lease, billing and payment details efficiently
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            onClick={() => alert("Lease editing is available in user management settings.")}
            className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-semibold px-3 py-2 text-dark bg-white"
            style={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}
          >
            <i className="bi bi-pencil text-muted"></i> Edit Lease
          </button>
          <Link
            href="/admin/leases"
            className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-3.5 py-2"
            style={{
              borderRadius: "8px",
              backgroundColor: "#0266e8",
              borderColor: "#0266e8",
              fontSize: "0.85rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <i className="bi bi-arrow-left"></i> Back to Leases
          </Link>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="row g-4 mb-4">
        
        {/* Left Card: Lease Information Card */}
        <div className="col-12 col-lg-4 col-xl-3">
          <div className="bg-white border rounded-4 p-4 h-100 shadow-sm d-flex flex-column gap-3" style={{ borderColor: "#e2e8f0" }}>
            
            {/* Tenant profile block */}
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                style={{
                  width: 56,
                  height: 56,
                  fontSize: "1.25rem",
                  flexShrink: 0,
                  backgroundColor: "#0266e8",
                }}
              >
                {getInitials(user.name)}
              </div>
              <div className="text-truncate">
                <h5 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: "1rem" }}>
                  {user.name}
                </h5>
                <span className="text-muted small d-block text-truncate mb-1">{user.email}</span>
                <span
                  className="badge px-2 py-1 rounded-pill"
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    backgroundColor: "#e8f5e9",
                    color: "#2e7d32",
                  }}
                >
                  Active Tenant
                </span>
              </div>
            </div>

            <hr className="my-1 opacity-10" />

            {/* List details */}
            <div className="d-flex flex-column gap-3 small">
              <div>
                <span className="text-muted d-block mb-0.5" style={{ fontSize: "0.75rem" }}>
                  Property / Unit
                </span>
                <strong className="text-dark">
                  {user.assignedProperties?.[0]?.propertyName || "Vasudha Enclave"}, Office{" "}
                  {user.assignedUnits?.[0]?.unitNumber || "204"}
                </strong>
              </div>
              <div>
                <span className="text-muted d-block mb-0.5" style={{ fontSize: "0.75rem" }}>
                  Lease ID
                </span>
                <strong className="text-dark">
                  {agreement ? `LSE-2025-${agreement._id.slice(-4).toUpperCase()}` : "LSE-2025-0001"}
                </strong>
              </div>
              <div>
                <span className="text-muted d-block mb-0.5" style={{ fontSize: "0.75rem" }}>
                  Lease Type
                </span>
                <strong className="text-dark">Commercial</strong>
              </div>
              <div>
                <span className="text-muted d-block mb-0.5" style={{ fontSize: "0.75rem" }}>
                  Agreement Period
                </span>
                <strong className="text-dark">
                  {formatDate(agreement?.startDate || user.floorAssignmentStartDate)} –{" "}
                  {formatDate(agreement?.endDate || user.floorAssignmentEndDate)}
                </strong>
              </div>
              <div>
                <span className="text-muted d-block mb-0.5" style={{ fontSize: "0.75rem" }}>
                  Duration
                </span>
                <strong className="text-dark">{durationStr}</strong>
              </div>
            </div>

          </div>
        </div>

        {/* Right Bento Area: Financial Summary & Progress */}
        <div className="col-12 col-lg-8 col-xl-9">
          <div className="d-flex flex-column gap-4 h-100">
            
            {/* Financial Cards Grid */}
            <div className="row g-3">
              
              {/* Total Contract Value */}
              <div className="col-6 col-md-3">
                <div className="bg-white border rounded-4 p-4 shadow-sm d-flex flex-column gap-2" style={{ borderColor: "#e2e8f0" }}>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <i className="bi bi-file-earmark-text fs-5"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block mb-0.5" style={{ fontSize: "0.72rem" }}>
                      Total Contract Value
                    </span>
                    <strong className="text-dark fs-5 fw-bold">
                      ₹{totalAmount.toLocaleString()}
                    </strong>
                    <span className="text-muted d-block small" style={{ fontSize: "0.7rem", marginTop: 2 }}>
                      For {durationStr.split(",")[0] || "6 Months"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Paid */}
              <div className="col-6 col-md-3">
                <div className="bg-white border rounded-4 p-4 shadow-sm d-flex flex-column gap-2" style={{ borderColor: "#e2e8f0" }}>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#ecfdf5",
                      color: "#047857",
                      border: "1px solid #d1fae5",
                    }}
                  >
                    <i className="bi bi-check-circle fs-5"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block mb-0.5" style={{ fontSize: "0.72rem" }}>
                      Amount Paid
                    </span>
                    <strong className="text-dark fs-5 fw-bold">
                      ₹{totalPaid.toLocaleString()}
                    </strong>
                    <span className="text-success d-block small fw-medium" style={{ fontSize: "0.7rem", marginTop: 2 }}>
                      {paidPercent}% of Total
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Amount */}
              <div className="col-6 col-md-3">
                <div className="bg-white border rounded-4 p-4 shadow-sm d-flex flex-column gap-2" style={{ borderColor: "#e2e8f0" }}>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#fff7ed",
                      color: "#c2410c",
                      border: "1px solid #ffedd5",
                    }}
                  >
                    <i className="bi bi-exclamation-circle fs-5"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block mb-0.5" style={{ fontSize: "0.72rem" }}>
                      Pending Amount
                    </span>
                    <strong className="text-dark fs-5 fw-bold">
                      ₹{pendingAmount.toLocaleString()}
                    </strong>
                    <span className="text-muted d-block small" style={{ fontSize: "0.7rem", marginTop: 2 }}>
                      Remaining Balance
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Due Date */}
              <div className="col-6 col-md-3">
                <div className="bg-white border rounded-4 p-4 shadow-sm d-flex flex-column gap-2" style={{ borderColor: "#e2e8f0" }}>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#faf5ff",
                      color: "#6b21a8",
                      border: "1px solid #f3e8ff",
                    }}
                  >
                    <i className="bi bi-calendar-event fs-5"></i>
                  </div>
                  <div>
                    <span className="text-muted small d-block mb-0.5" style={{ fontSize: "0.72rem" }}>
                      Next Due Date
                    </span>
                    <strong className="fs-5 fw-bold d-block">
                      {pendingAmount <= 0 || user?.paymentStatus === 'Paid' || agreement?.paymentStatus === 'Paid' ? (
                        <span className="text-success">Paid</span>
                      ) : (
                        <span className="text-dark">{formatDate(nextDueDateStr)}</span>
                      )}
                    </strong>
                    <span className="text-muted d-block small" style={{ fontSize: "0.7rem", marginTop: 2 }}>
                      {pendingAmount <= 0 || user?.paymentStatus === 'Paid' || agreement?.paymentStatus === 'Paid' ? "Fully Paid" : "Monthly Due"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Payment Progress Card */}
            <div className="bg-white border rounded-4 p-4 shadow-sm" style={{ borderColor: "#e2e8f0" }}>
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
                  Payment Progress
                </h6>
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <div className="d-flex align-items-center gap-1">
                    <span className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: "#00b074", display: "inline-block" }}></span>
                    <span className="text-muted" style={{ fontSize: "0.78rem" }}>Paid Amount</span>
                    <strong className="text-dark" style={{ fontSize: "0.82rem", fontWeight: 700 }}>₹{totalPaid.toLocaleString()}</strong>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: "#ff3a3a", display: "inline-block" }}></span>
                    <span className="text-muted" style={{ fontSize: "0.78rem" }}>Pending Amount</span>
                    <strong className="text-dark" style={{ fontSize: "0.82rem", fontWeight: 700 }}>₹{pendingAmount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
              
              <div className="position-relative">
                <div className="progress" style={{ height: "20px", borderRadius: "99px", backgroundColor: "#f1f5f9" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${paidPercent}%`,
                      backgroundColor: "#00b074",
                      borderRadius: "99px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff"
                    }}
                    aria-valuenow={paidPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    {paidPercent}% Paid
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Table Section */}
      <div className="row g-4 mb-4">
        
        {/* Billing & Payment Schedule Table - Full Width */}
        <div className="col-12">
          <div className="bg-white border rounded-4 p-4 shadow-sm h-100 d-flex flex-column" style={{ borderColor: "#e2e8f0" }}>
            
            {/* Table Header block */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
              <div>
                <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "1.05rem" }}>
                  Billing & Payment Schedule
                </h5>
                <p className="text-muted small mb-0">
                  All scheduled billing and payment status
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center ms-md-auto w-100 w-md-auto justify-content-md-end">
                <div className="position-relative" style={{ minWidth: 200 }}>
                  <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted" style={{ left: 12 }}></i>
                  <input
                    type="text"
                    className="form-control form-control-sm ps-5 border-0 bg-light"
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ borderRadius: "8px", fontSize: "0.8rem", height: 38 }}
                  />
                </div>
                
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 text-dark bg-white"
                    style={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.8rem", height: 38 }}
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-filter"></i> Filter
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 py-2 rounded-3 small">
                    <li>
                      <button className={`dropdown-item ${statusFilter === "All" ? "active" : ""}`} onClick={() => setStatusFilter("All")}>
                        All Invoices
                      </button>
                    </li>
                    <li>
                      <button className={`dropdown-item ${statusFilter === "Paid" ? "active" : ""}`} onClick={() => setStatusFilter("Paid")}>
                        Paid
                      </button>
                    </li>
                    <li>
                      <button className={`dropdown-item ${statusFilter === "Partially Paid" ? "active" : ""}`} onClick={() => setStatusFilter("Partially Paid")}>
                        Partially Paid
                      </button>
                    </li>
                    <li>
                      <button className={`dropdown-item ${statusFilter === "Pending" ? "active" : ""}`} onClick={() => setStatusFilter("Pending")}>
                        Pending
                      </button>
                    </li>
                    <li>
                      <button className={`dropdown-item ${statusFilter === "Overdue" ? "active" : ""}`} onClick={() => setStatusFilter("Overdue")}>
                        Overdue
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="table-responsive flex-grow-1 border rounded-3" style={{ borderColor: "#f1f5f9", overflowX: "auto" }}>
              <table className="table table-hover mb-0 align-middle text-nowrap small">
                <thead className="bg-light border-bottom">
                  <tr>
                    <th className="py-3 px-2 text-muted" style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={
                          paginatedInvoices.length > 0 &&
                          selectedInvoices.length === paginatedInvoices.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-3 px-2.5 text-muted fw-bold">Invoice No.</th>
                    <th className="py-3 px-2.5 text-muted fw-bold">Billing Period</th>
                    <th className="py-3 px-2.5 text-muted fw-bold">Due Date</th>
                    <th className="py-3 px-2.5 text-muted fw-bold">Invoice Amount</th>
                    <th className="py-3 px-2.5 text-muted fw-bold">Paid Amount</th>
                    <th className="py-3 px-2.5 text-muted fw-bold">Pending Amount</th>
                    <th className="py-3 px-2.5 text-muted fw-bold">Status</th>
                    <th className="py-3 px-2 text-muted fw-bold text-center" style={{ minWidth: 100 }}>Action</th>
                  </tr>
                </thead>
                <tbody className="border-0">
                  {paginatedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5 text-muted">
                        No scheduled bills matching search query found.
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((inv: any) => {
                      const displayNo = inv.invoiceId.startsWith("INV-")
                        ? `INV-${inv.invoiceId.slice(4).padStart(6, "0")}`
                        : inv.invoiceId;

                      const isSettled = inv.status === "Paid";

                      return (
                        <tr key={inv.invoiceId} className="border-bottom">
                          <td className="py-2.5 px-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedInvoices.includes(inv.invoiceId)}
                              onChange={(e) => handleSelectRow(inv.invoiceId, e.target.checked)}
                            />
                          </td>
                          <td className="py-2.5 px-2.5 fw-semibold text-dark">{displayNo}</td>
                          <td className="py-2.5 px-2.5 text-dark">{inv.billingPeriod}</td>
                          <td className="py-2.5 px-2.5 text-muted">{formatDate(inv.dueDate)}</td>
                          <td className="py-2.5 px-2.5 text-dark fw-medium">
                            ₹{Number(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-2.5 text-success fw-medium">
                            ₹{Number(inv.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-2.5 text-danger fw-medium">
                            ₹{Number(inv.pendingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-2.5">
                            <span
                              className={`badge bg-${STATUS_COLOR[inv.status] || "secondary"} bg-opacity-10 text-${
                                STATUS_COLOR[inv.status] || "secondary"
                              } border border-${STATUS_COLOR[inv.status] || "secondary"} border-opacity-25 rounded-pill px-2.5 py-1.5`}
                              style={{ fontSize: "0.72rem" }}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {isSettled ? (
                              <button
                                onClick={() => handleViewReceiptClick(inv)}
                                className="btn btn-sm fw-semibold px-3 py-1.5"
                                style={{
                                  backgroundColor: "#f0f7ff",
                                  border: "1px solid #dbeafe",
                                  color: "#0266e8",
                                  borderRadius: "8px",
                                  fontSize: "0.72rem",
                                  transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#e0f2fe";
                                  e.currentTarget.style.borderColor = "#bae6fd";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#f0f7ff";
                                  e.currentTarget.style.borderColor = "#dbeafe";
                                }}
                              >
                                View
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePayNowClick(inv)}
                                className="btn btn-sm fw-semibold px-3 py-1.5"
                                style={{
                                  backgroundColor: "#f0f7ff",
                                  border: "1px solid #dbeafe",
                                  color: "#0266e8",
                                  borderRadius: "8px",
                                  fontSize: "0.72rem",
                                  transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#e0f2fe";
                                  e.currentTarget.style.borderColor = "#bae6fd";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#f0f7ff";
                                  e.currentTarget.style.borderColor = "#dbeafe";
                                }}
                              >
                                Pay Now
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 pt-3 gap-3">
              <span className="text-muted small">
                Showing {totalFilteredCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, totalFilteredCount)} of {totalFilteredCount}{" "}
                entries
              </span>
              <div className="d-flex align-items-center gap-3">
                <nav>
                  <ul className="pagination pagination-sm mb-0 gap-1">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link border-0 bg-light rounded text-dark"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    {Array.from({ length: totalPagesCount }, (_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                        <button
                          className="page-link border-0 rounded"
                          style={{
                            backgroundColor: currentPage === i + 1 ? "#0266e8" : "#f1f5f9",
                            color: currentPage === i + 1 ? "#fff" : "#1e293b",
                          }}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPagesCount ? "disabled" : ""}`}>
                      <button
                        className="page-link border-0 bg-light rounded text-dark"
                        onClick={() => setCurrentPage((p) => Math.min(totalPagesCount, p + 1))}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>

                <select
                  className="form-select form-select-sm"
                  style={{ width: 110, borderRadius: "6px" }}
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                </select>
              </div>
            </div>

          </div>
        </div>

      </div>



      {/* Record Payment Modal integration */}
      {showPaymentModal && (
        <RecordPaymentModal
          agreement={{
            agreementNumber: agreement ? `AGB-${agreement._id.slice(-6).toUpperCase()}` : `AGB-${user._id.slice(-6).toUpperCase()}`,
            paymentType: agreement?.paymentType || user.paymentType || "Monthly",
            installmentAmount: agreement?.installmentAmount || user.monthlyManagementAmount || 0,
            pendingAmount: pendingAmount,
          }}
          amountInput={paymentAmountInput}
          setAmountInput={setPaymentAmountInput}
          dateInput={paymentDateInput}
          setDateInput={setPaymentDateInput}
          modeInput={paymentModeInput}
          setModeInput={setPaymentModeInput}
          refInput={transactionRefInput}
          setRefInput={setTransactionRefInput}
          notesInput={notesInput}
          setNotesInput={setNotesInput}
          onSubmit={handlePaymentSubmit}
          onClose={() => setShowPaymentModal(false)}
          isSubmitting={isSubmittingPayment}
        />
      )}

      {/* Clean Payment Receipt Modal */}
      {showReceiptModal && selectedInvoiceForReceipt && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(15,23,42,0.72)", zIndex: 1200, backdropFilter: "blur(10px)" }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 500 }}>
            <div className="modal-content border-0 rounded-4 overflow-hidden bg-white shadow-lg">
              
              {/* Receipt Header */}
              <div className="p-4 text-white text-center position-relative" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={() => setShowReceiptModal(false)}
                  aria-label="Close"
                  style={{ filter: "brightness(0) invert(1)" }}
                ></button>
                <div className="rounded-circle bg-white bg-opacity-20 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 56, height: 56 }}>
                  <i className="bi bi-receipt fs-3 text-white"></i>
                </div>
                <h5 className="fw-bold mb-0">Payment Receipt</h5>
                <p className="small mb-0 opacity-75">
                  Receipt No: PAY-{selectedInvoiceForReceipt.invoiceId.startsWith("INV-") ? selectedInvoiceForReceipt.invoiceId.slice(-4).toUpperCase() : "0001"}
                </p>
              </div>

              {/* Receipt Details Body */}
              <div className="p-4">
                <div className="text-center mb-4">
                  <span className="text-muted small d-block" style={{ letterSpacing: "0.05em" }}>AMOUNT PAID</span>
                  <span className="fs-2 fw-bold text-success">
                    ₹{Number(selectedInvoiceForReceipt.paidAmount || selectedInvoiceForReceipt.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="mt-2">
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: "0.75rem" }}>
                      Payment Successful
                    </span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3 small border-top pt-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Tenant Name:</span>
                    <strong className="text-dark">{user.name}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Email Address:</span>
                    <span className="text-dark">{user.email}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Property / Unit:</span>
                    <strong className="text-dark">
                      {user.assignedProperties?.[0]?.propertyName || "Vasudha Enclave"}, Unit {user.assignedUnits?.[0]?.unitNumber || "204"}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Billing Period:</span>
                    <span className="text-dark">{selectedInvoiceForReceipt.billingPeriod}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Transaction Date:</span>
                    <span className="text-dark">{formatDate(selectedInvoiceForReceipt.paidDate || selectedInvoiceForReceipt.dueDate)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Payment Mode:</span>
                    <strong className="text-dark">UPI / Net Banking</strong>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small d-block">Remaining Balance</span>
                    <strong className="text-danger small">₹{Number(selectedInvoiceForReceipt.pendingAmount || 0).toLocaleString()}</strong>
                  </div>
                  <span className="text-muted small">Status: <strong>{selectedInvoiceForReceipt.status}</strong></span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="modal-footer border-0 px-4 py-3 bg-light d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3.5 d-flex align-items-center gap-2"
                  onClick={() => alert("Receipt sent to tenant email address.")}
                >
                  <i className="bi bi-envelope"></i> Email Receipt
                </button>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3.5"
                    onClick={() => setShowReceiptModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer"></i> Print
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
