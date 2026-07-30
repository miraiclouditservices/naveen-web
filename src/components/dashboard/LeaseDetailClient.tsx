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
  Success: "success",
  Failed: "danger",
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

  // Actions loading states
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

  // Payments total
  const paymentsList = agreement?.payments || [];
  const totalPaid = billingData?.summary?.totalPaid || paymentsList.reduce((sum: number, p: any) => sum + (p.amountPaid || p.amount || 0), 0) || 0;
  const pendingAmount = Math.max(0, totalAmount - totalPaid);
  const paidPercent = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  // Next Due Date: first invoice that still has a balance (not fully Paid)
  const invoicesAll: any[] = billingData?.invoices || [];
  const firstUnpaidInvoice = [...invoicesAll]
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .find((inv: any) => inv.status !== 'Paid' && (inv.pendingAmount || 0) > 0);
  const nextDueDateStr = firstUnpaidInvoice?.dueDate
    || agreement?.nextDueDate
    || user?.floorAssignmentStartDate
    || null;

  // Format Helper Methods
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
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

  const durationMonths = billingData?.summary?.durationMonths || 12;
  const remainingDays = billingData?.summary?.remainingDays || 365;
  const remainingCredit = billingData?.summary?.remainingCredit || 0;
  const allocatedInvoices = billingData?.summary?.allocations || [];

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

  // Invoice Date Helper (standard B2B ERP shows invoice generation 5 days before billing cycle start, or cycle start)
  const getInvoiceDate = (dueDateStr: string) => {
    if (!dueDateStr) return "—";
    const d = new Date(dueDateStr);
    d.setDate(d.getDate() - 5); // standard 5 days credit period
    return formatDate(d);
  };

  // Actions trigger functions
  const handlePayNowClick = (inv: any) => {
    const needed = inv.pendingAmount || inv.amount || 0;
    setPaymentAmountInput(String(needed));
    setNotesInput(`Payment for ${inv.billingPeriod} (${inv.invoiceId})`);
    setShowPaymentModal(true);
  };

  const handleViewReceiptClick = (inv: any) => {
    setSelectedInvoiceForReceipt(inv);
    setShowReceiptModal(true);
  };

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
        setPaymentAmountInput("");
        setTransactionRefInput("");
        setNotesInput("");
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

  // Trigger manual invoice generation
  const handleGenerateInvoice = async () => {
    if (isGeneratingInvoice) return;
    
    // Determine month and year based on last invoice or current date
    let targetMonth = "July";
    let targetYear = 2026;
    
    const invoicesList = [...(billingData?.invoices || [])].sort(
      (a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    if (invoicesList.length > 0) {
      const last = invoicesList[invoicesList.length - 1];
      const parts = last.billingPeriod.split(" ");
      if (parts.length === 2) {
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const lastIdx = monthNames.indexOf(parts[0]);
        if (lastIdx !== -1) {
          const nextIdx = (lastIdx + 1) % 12;
          targetMonth = monthNames[nextIdx];
          targetYear = nextIdx === 0 ? Number(parts[1]) + 1 : Number(parts[1]);
        }
      }
    }

    if (!confirm(`Are you sure you want to generate billing invoice for ${targetMonth} ${targetYear}?`)) {
      return;
    }

    setIsGeneratingInvoice(true);
    try {
      const res = await api.post("/finance/generate", {
        month: targetMonth,
        year: targetYear
      });
      if (res.success) {
        alert(res.message || "Invoice generated successfully!");
        await fetchDetails();
      } else {
        alert(res.error || "Failed to generate invoice");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate invoice");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Trigger send reminder email
  const handleSendEmail = async () => {
    if (isSendingEmail) return;
    setIsSendingEmail(true);
    try {
      const res = await api.post("/email-templates/test", {
        templateCode: "PAYMENT_DUE_REMINDER",
        testEmail: user.email,
        variables: {
          userName: user.name,
          propertyName: user.assignedProperties?.[0]?.propertyName || "Green Valley Commercial Hub",
          amount: pendingAmount,
          dueDate: formatDate(nextDueDateStr)
        }
      });
      if (res.success) {
        alert(`Billing notice & invoice reminder successfully emailed to ${user.email}`);
      } else {
        alert(res.error || "Failed to send email");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadReceipt = () => {
    // Generate text/csv formatted transaction summary & download
    const headers = "Invoice No,Billing Period,Due Date,Invoice Amount,Paid Amount,Balance Amount,Status\n";
    const rows = (billingData?.invoices || []).map((inv: any) => 
      `${inv.invoiceId},${inv.billingPeriod},${new Date(inv.dueDate).toLocaleDateString()},₹${inv.amount},₹${inv.paidAmount},₹${inv.pendingAmount},${inv.status}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `Billing_Statement_${user.name.replace(/\s+/g, "_")}.csv`);
    a.click();
  };

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
            background-color: var(--border-color);
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
      <div className="p-5 text-center bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: "var(--bg-app)" }}>
        <div className="bg-white border rounded-4 p-4 shadow-sm" style={{ maxWidth: 450, borderColor: "var(--border-color)" }}>
          <i className="bi bi-exclamation-triangle text-warning fs-1"></i>
          <h5 className="fw-bold text-dark mt-3">Agreement Profile Not Found</h5>
          <p className="text-muted small mt-2">
            The requested user or lease agreement details could not be found in the system.
          </p>
          <Link href="/admin/leases" className="btn btn-primary btn-sm mt-3 px-4 py-2" style={{ borderRadius: "8px", backgroundColor: "var(--dark-section)", borderColor: "var(--dark-section)" }}>
            Back to Lease Agreements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 px-3 px-md-4" style={{ backgroundColor: "var(--bg-app)", minHeight: "100vh", fontFamily: "var(--font-geist-sans)", color: "var(--text-primary)" }}>

      {/* Back Navigation */}
      <div className="mb-3">
        <Link
          href="/admin/leases"
          className="d-inline-flex align-items-center gap-2 text-decoration-none"
          style={{
            color: "var(--text-muted)",
            fontSize: "0.83rem",
            fontWeight: 500,
            padding: "0.35rem 0.7rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            transition: "all 0.15s ease",
          }}
        >
          <i className="bi bi-arrow-left" style={{ fontSize: "0.85rem" }} />
          Back to Leases
        </Link>
      </div>

      {/* Top Header */}
      <div className="d-flex flex-column lg:flex-row justify-content-between align-items-start align-items-lg-center mb-4 pb-2 gap-3 border-bottom" style={{ borderColor: "var(--border-color)" }}>
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: "1.6rem", letterSpacing: "-0.03em", color: "var(--text-main)" }}>
            Lease Agreement Details
          </h1>
          <p className="small mb-0" style={{ color: "var(--text-muted)" }}>
            Manage lease, billing and payment details efficiently
          </p>
        </div>
        
        {/* Core Actions Bar */}
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="btn btn-sm text-white d-flex align-items-center gap-2 fw-semibold px-3 py-2"
            style={{
              backgroundColor: "var(--dark-section)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.82rem",
              boxShadow: "var(--shadow-sm)",
              border: "1px solid var(--dark-section)"
            }}
          >
            <i className="bi bi-plus-circle"></i> + Receive Payment
          </button>
          
          <button
            onClick={handleGenerateInvoice}
            disabled={isGeneratingInvoice}
            className="btn btn-sm d-flex align-items-center gap-2 fw-semibold px-3 py-2 bg-white"
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontSize: "0.82rem"
            }}
          >
            {isGeneratingInvoice ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-file-earmark-plus"></i>
            )}
            Generate Invoice
          </button>

          <button
            onClick={handleDownloadReceipt}
            className="btn btn-sm d-flex align-items-center gap-2 fw-semibold px-3 py-2 bg-white"
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontSize: "0.82rem"
            }}
          >
            <i className="bi bi-download"></i> Download Statement
          </button>

          <button
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="btn btn-sm d-flex align-items-center gap-2 fw-semibold px-3 py-2 bg-white"
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontSize: "0.82rem"
            }}
          >
            {isSendingEmail ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-envelope"></i>
            )}
            Send Email
          </button>
        </div>
      </div>

      {/* Main Grid: Left sidebar (Tenant/Property/Allocation) & Right dashboard */}
      <div className="row g-4 mb-4">
        
        {/* Left Columns */}
        <div className="col-12 col-lg-4 col-xl-3 d-flex flex-column gap-4">
          
          {/* Tenant Profile Card */}
          <div className="bg-white border rounded-3 p-4 shadow-sm" style={{ borderColor: "var(--border-color)" }}>
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                style={{
                  width: 50,
                  height: 50,
                  fontSize: "1.1rem",
                  flexShrink: 0,
                  backgroundColor: "var(--dark-section)",
                }}
              >
                {getInitials(user.name)}
              </div>
              <div className="text-truncate">
                <h5 className="fw-bold mb-0 text-truncate" style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                  {user.name}
                </h5>
                <span className="small d-block text-truncate mb-1.5" style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                  {user.email}
                </span>
                <span
                  className="badge px-2 py-1 rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25"
                  style={{ fontSize: "0.68rem", fontWeight: 600 }}
                >
                  Active Tenant
                </span>
              </div>
            </div>
          </div>

          {/* Property Details Card */}
          <div className="bg-white border rounded-3 p-4 shadow-sm" style={{ borderColor: "var(--border-color)" }}>
            <h6 className="fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
              Property & Unit Details
            </h6>
            
            <div className="d-flex flex-column gap-3" style={{ fontSize: "0.8rem" }}>
              <div>
                <span className="d-block mb-0.5" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Property</span>
                <strong style={{ color: "var(--text-primary)" }}>
                  {user.assignedProperties?.map((p: any) => p.propertyName || p.name).filter(Boolean).join(", ") || lease?.property?.propertyName || "—"}
                </strong>
              </div>
              
              <div>
                <span className="d-block mb-0.5" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Unit(s)</span>
                <strong style={{ color: "var(--text-primary)" }}>
                  {user.assignedUnits?.map((u: any) => typeof u === "object" ? `Office ${u.unitNumber}` : `Office ${u}`).filter(Boolean).join(", ") || (lease?.units?.length > 0 ? lease.units.map((u: any) => u.unitNumber || u).join(", ") : "—")}
                </strong>
              </div>

              <div>
                <span className="d-block mb-0.5" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Total Area</span>
                <strong style={{ color: "var(--text-primary)" }}>
                  {(user.assignedUnits?.reduce((sum: number, u: any) => sum + (u.sqft || 0), 0) || lease?.allocatedSft || lease?.assignedSft || 0).toLocaleString("en-IN")} SFT
                </strong>
              </div>

              <div>
                <span className="d-block mb-0.5" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Floor(s)</span>
                <strong style={{ color: "var(--text-primary)" }}>
                  {user.assignedFloors?.map((f: any) => f.floorName || `Floor ${f.floorNumber}`).filter(Boolean).join(", ") || lease?.floor?.floorName || "—"}
                </strong>
              </div>

              <div>
                <span className="d-block mb-0.5" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Lease Type</span>
                <strong style={{ color: "var(--text-primary)" }}>
                  {lease?.leaseType || "Commercial"}
                </strong>
              </div>

              <div>
                <span className="d-block mb-0.5" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Lease ID</span>
                <strong className="text-uppercase" style={{ color: "var(--text-primary)" }}>
                  {lease?._id ? `LSE-${lease._id.slice(-6).toUpperCase()}` : (agreement?._id ? `AGR-${agreement._id.slice(-6).toUpperCase()}` : "—")}
                </strong>
              </div>
            </div>
          </div>

          {/* Payment Allocation Section */}
          <div className="bg-white border rounded-3 p-4 shadow-sm" style={{ borderColor: "var(--border-color)" }}>
            <h6 className="fw-bold mb-1" style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
              Payment Allocation
            </h6>
            <p className="small mb-3" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
              FIFO Auto-Allocation Breakdown
            </p>

            {/* Total Received */}
            <div className="mb-3 rounded-2 d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "var(--bg-app)", padding: "8px 12px" }}>
              <span className="small fw-semibold" style={{ color: "var(--text-primary)" }}>Payment Received:</span>
              <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
                ₹{totalPaid.toLocaleString('en-IN')}
              </strong>
            </div>

            {/* Allocation List – show all invoices that have received funds */}
            <div className="d-flex flex-column gap-1 mb-3">
              <span className="fw-semibold d-block mb-1" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                Auto Allocation:
              </span>

              {allocatedInvoices.length === 0 ? (
                <span className="small text-muted text-center py-2">No invoices generated yet</span>
              ) : (
                allocatedInvoices
                  .filter((inv: any) => inv.status !== 'Pending' || inv.allocated > 0)
                  .map((inv: any) => (
                    <div
                      key={inv.invoiceId}
                      className="d-flex justify-content-between align-items-center py-1 border-bottom"
                      style={{ fontSize: "0.76rem" }}
                    >
                      <span style={{ color: "var(--text-primary)" }}>{inv.billingPeriod} Invoice</span>
                      {inv.status === "Paid" ? (
                        <span className="text-success fw-semibold">
                          <i className="bi bi-check-circle-fill me-1" />Paid
                        </span>
                      ) : inv.status === "Partially Paid" ? (
                        <span className="text-warning fw-semibold">
                          Partial (₹{Number(inv.allocated).toLocaleString('en-IN')})
                        </span>
                      ) : (
                        <span className="text-muted">Unpaid</span>
                      )}
                    </div>
                  ))
              )}
            </div>

            {/* Remaining Credit */}
            <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ fontSize: "0.78rem" }}>
              <span className="fw-bold" style={{ color: "var(--text-primary)" }}>Remaining Credit:</span>
              <strong
                className={remainingCredit > 0 ? "text-success" : "text-muted"}
                style={{ fontSize: "0.85rem" }}
              >
                ₹{remainingCredit.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

        </div>

        {/* Right Dashboard Area */}
        <div className="col-12 col-lg-8 col-xl-9 d-flex flex-column gap-4">
          
          {/* Agreement Summary Cards Grid (6 cards) */}
          <div className="row g-3">
            
            {/* Agreement Period */}
            <div className="col-6 col-md-4">
              <div className="bg-white border rounded-3 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: "var(--border-color)", padding: "16px 18px" }}>
                <span className="d-block mb-2 fw-semibold" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  Agreement Period
                </span>
                <div className="d-flex flex-column align-items-start gap-1 py-1">
                  <strong style={{ color: "var(--text-main)", fontSize: "0.88rem" }}>
                    {formatDate(agreement?.startDate || user?.floorAssignmentStartDate || "23 Jun 2026")}
                  </strong>
                  <div className="ps-3 py-0.5 text-muted" style={{ fontSize: "0.7rem" }}><i className="bi bi-arrow-down"></i></div>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.88rem" }}>
                    {formatDate(agreement?.endDate || user?.floorAssignmentEndDate || "22 Jun 2027")}
                  </strong>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="col-6 col-md-4">
              <div className="bg-white border rounded-3 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: "var(--border-color)", padding: "16px 18px" }}>
                <span className="d-block mb-2 fw-semibold" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  Duration
                </span>
                <div className="py-1">
                  <h4 className="fw-bold mb-1" style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>
                    {durationMonths} Months
                  </h4>
                  <span className="small fw-semibold d-block text-success" style={{ fontSize: "0.72rem" }}>
                    {remainingDays} Days Remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Contract Value */}
            <div className="col-6 col-md-4">
              <div className="bg-white border rounded-3 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: "var(--border-color)", padding: "16px 18px" }}>
                <span className="d-block mb-2 fw-semibold" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  Contract Value
                </span>
                <div className="py-1">
                  <h4 className="fw-bold mb-1" style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </h4>
                  <span className="text-muted d-block small" style={{ fontSize: "0.7rem" }}>
                    Base Billing Value
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Paid */}
            <div className="col-6 col-md-4">
              <div className="bg-white border rounded-3 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: "var(--border-color)", padding: "16px 18px" }}>
                <span className="d-block mb-2 fw-semibold" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  Amount Paid
                </span>
                <div className="py-1">
                  <h4 className="fw-bold mb-1" style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>
                    ₹{totalPaid.toLocaleString('en-IN')}
                  </h4>
                  <span className="small fw-semibold d-block text-success" style={{ fontSize: "0.72rem" }}>
                    {paidPercent}% Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Remaining Balance */}
            <div className="col-6 col-md-4">
              <div className="bg-white border rounded-3 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: "var(--border-color)", padding: "16px 18px" }}>
                <span className="d-block mb-2 fw-semibold" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  Remaining Balance
                </span>
                <div className="py-1">
                  <h4 className="fw-bold mb-1" style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>
                    ₹{pendingAmount.toLocaleString('en-IN')}
                  </h4>
                  <span className="text-muted d-block small" style={{ fontSize: "0.7rem" }}>
                    Outstanding Balance
                  </span>
                </div>
              </div>
            </div>

            {/* Next Due Date */}
            <div className="col-6 col-md-4">
              <div className="bg-white border rounded-3 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ borderColor: "var(--border-color)", padding: "16px 18px" }}>
                <span className="d-block mb-2 fw-semibold" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  Next Due Date
                </span>
                <div className="py-1">
                  <h4 className="fw-bold mb-1" style={{ color: pendingAmount <= 0 ? "var(--bs-success)" : "var(--text-main)", fontSize: "1.15rem" }}>
                    {pendingAmount <= 0 ? "Paid" : formatDate(nextDueDateStr)}
                  </h4>
                  <span className="text-muted d-block small" style={{ fontSize: "0.7rem" }}>
                    {pendingAmount <= 0 ? "Fully Settled" : "Cycle Due Date"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Payment Progress Section */}
          <div className="bg-white border rounded-3 p-4 shadow-sm" style={{ borderColor: "var(--border-color)" }}>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
              <h6 className="fw-bold mb-0" style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                Payment Progress
              </h6>
              <div className="d-flex flex-wrap align-items-center gap-3">
                <div className="d-flex align-items-center gap-1.5">
                  <span className="rounded-circle bg-success" style={{ width: 6, height: 6 }}></span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Paid:</span>
                  <strong style={{ fontSize: "0.78rem", color: "var(--text-main)" }}>₹{totalPaid.toLocaleString()}</strong>
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <span className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: "var(--border-light)" }}></span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Pending:</span>
                  <strong style={{ fontSize: "0.78rem", color: "var(--text-main)" }}>₹{pendingAmount.toLocaleString()}</strong>
                </div>
              </div>
            </div>
            
            <div className="position-relative">
              <div className="progress" style={{ height: "16px", borderRadius: "var(--radius-full)", backgroundColor: "var(--bg-app)" }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${paidPercent}%`,
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--dark-section)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF"
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

          {/* Billing & Invoice Schedule Table */}
          <div className="bg-white border rounded-3 p-4 shadow-sm" style={{ borderColor: "var(--border-color)" }}>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3.5 gap-3">
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                  Billing & Invoice Schedule
                </h5>
                <p className="small mb-0" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  All scheduled billing and payment status
                </p>
              </div>

              <div className="d-flex gap-2 align-items-center w-100 w-sm-auto">
                <div className="position-relative flex-grow-1" style={{ minWidth: 180 }}>
                  <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted" style={{ left: 10, fontSize: "0.8rem" }}></i>
                  <input
                    type="text"
                    className="form-control form-control-sm ps-4 border-0"
                    placeholder="Search invoice..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ borderRadius: "6px", fontSize: "0.75rem", height: 34, backgroundColor: "var(--bg-app)" }}
                  />
                </div>
                
                <div className="dropdown">
                  <button
                    className="btn btn-sm d-flex align-items-center gap-1.5 px-2.5 py-1.5 bg-white text-dark"
                    style={{ borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.75rem", height: 34 }}
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-filter"></i> Filter
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 py-2 rounded-3 small">
                    <li>
                      <button className={`dropdown-item ${statusFilter === "All" ? "active" : ""}`} onClick={() => setStatusFilter("All")}>All Invoices</button>
                    </li>
                    <li>
                      <button className={`dropdown-item ${statusFilter === "Paid" ? "active" : ""}`} onClick={() => setStatusFilter("Paid")}>Paid</button>
                    </li>
                    <li>
                      <button className={`dropdown-item ${statusFilter === "Partially Paid" ? "active" : ""}`} onClick={() => setStatusFilter("Partially Paid")}>Partially Paid</button>
                    </li>
                    <li>
                      <button className={`dropdown-item ${statusFilter === "Pending" ? "active" : ""}`} onClick={() => setStatusFilter("Pending")}>Pending</button>
                    </li>
                    <li>
                      <button className={`dropdown-item ${statusFilter === "Overdue" ? "active" : ""}`} onClick={() => setStatusFilter("Overdue")}>Overdue</button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="table-responsive border rounded-2" style={{ borderColor: "var(--border-color)", overflowX: "auto" }}>
              <table className="table table-hover mb-0 align-middle text-nowrap" style={{ fontSize: "0.78rem" }}>
                <thead style={{ backgroundColor: "var(--bg-app)" }}>
                  <tr className="border-bottom" style={{ borderColor: "var(--border-color)" }}>
                    <th className="py-2.5 px-2" style={{ width: 35 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={paginatedInvoices.length > 0 && selectedInvoices.length === paginatedInvoices.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-2.5 px-2 fw-semibold" style={{ color: "var(--text-muted)" }}>Invoice No</th>
                    <th className="py-2.5 px-2 fw-semibold" style={{ color: "var(--text-muted)" }}>Billing Period</th>
                    <th className="py-2.5 px-2 fw-semibold" style={{ color: "var(--text-muted)" }}>Invoice Date</th>
                    <th className="py-2.5 px-2 fw-semibold" style={{ color: "var(--text-muted)" }}>Due Date</th>
                    <th className="py-2.5 px-2 fw-semibold text-end" style={{ color: "var(--text-muted)" }}>Invoice Amount</th>
                    <th className="py-2.5 px-2 fw-semibold text-end" style={{ color: "var(--text-muted)" }}>Paid Amount</th>
                    <th className="py-2.5 px-2 fw-semibold text-end" style={{ color: "var(--text-muted)" }}>Balance Amount</th>
                    <th className="py-2.5 px-2 fw-semibold text-center" style={{ color: "var(--text-muted)" }}>Payment Status</th>
                    <th className="py-2.5 px-2 fw-semibold text-center" style={{ color: "var(--text-muted)", width: 80 }}>Action</th>
                  </tr>
                </thead>
                <tbody className="border-0">
                  {paginatedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-4 text-muted">
                        No scheduled bills matching filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((inv: any) => {
                      const displayNo = inv.invoiceId.startsWith("INV-")
                        ? `INV-${inv.invoiceId.slice(4).padStart(6, "0")}`
                        : inv.invoiceId;

                      const isSettled = inv.status === "Paid";

                      return (
                        <tr key={inv.invoiceId} className="border-bottom" style={{ borderColor: "var(--border-color)" }}>
                          <td className="py-2 px-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedInvoices.includes(inv.invoiceId)}
                              onChange={(e) => handleSelectRow(inv.invoiceId, e.target.checked)}
                            />
                          </td>
                          <td className="py-2 px-2 fw-bold" style={{ color: "var(--text-main)" }}>{displayNo}</td>
                          <td className="py-2 px-2" style={{ color: "var(--text-primary)" }}>{inv.billingPeriod}</td>
                          <td className="py-2 px-2" style={{ color: "var(--text-muted)" }}>{getInvoiceDate(inv.dueDate)}</td>
                          <td className="py-2 px-2" style={{ color: "var(--text-muted)" }}>{formatDate(inv.dueDate)}</td>
                          <td className="py-2 px-2 text-end fw-medium" style={{ color: "var(--text-primary)" }}>
                            ₹{Number(inv.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-end text-success fw-medium">
                            ₹{Number(inv.paidAmount || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-end text-danger fw-medium">
                            ₹{Number(inv.pendingAmount || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`badge bg-${STATUS_COLOR[inv.status] || "secondary"} bg-opacity-10 text-${
                                STATUS_COLOR[inv.status] || "secondary"
                              } border border-${STATUS_COLOR[inv.status] || "secondary"} border-opacity-25 rounded-pill px-2 py-1`}
                              style={{ fontSize: "0.68rem", fontWeight: 600 }}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            {isSettled ? (
                              <button
                                onClick={() => handleViewReceiptClick(inv)}
                                className="btn btn-xs btn-outline-secondary py-1 px-2.5 fw-semibold"
                                style={{
                                  borderRadius: "6px",
                                  fontSize: "0.68rem",
                                  border: "1px solid var(--border-color)",
                                  color: "var(--text-primary)"
                                }}
                              >
                                View
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePayNowClick(inv)}
                                className="btn btn-xs text-white py-1 px-2.5 fw-semibold"
                                style={{
                                  backgroundColor: "var(--dark-section)",
                                  borderRadius: "6px",
                                  fontSize: "0.68rem",
                                  border: "none"
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
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 pt-2 gap-2">
              <span className="small" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                Showing {totalFilteredCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, totalFilteredCount)} of {totalFilteredCount}{" "}
                entries
              </span>
              <div className="d-flex align-items-center gap-2">
                <nav>
                  <ul className="pagination pagination-sm mb-0 gap-1">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link border-0 bg-light rounded text-dark"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        style={{ fontSize: "0.7rem" }}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    {Array.from({ length: totalPagesCount }, (_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                        <button
                          className="page-link border-0 rounded text-center"
                          style={{
                            width: 28,
                            height: 28,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.72rem",
                            backgroundColor: currentPage === i + 1 ? "var(--dark-section)" : "var(--bg-app)",
                            color: currentPage === i + 1 ? "#FFFFFF" : "var(--text-primary)",
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
                        style={{ fontSize: "0.7rem" }}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>

                <select
                  className="form-select form-select-sm"
                  style={{ width: 95, borderRadius: "6px", fontSize: "0.72rem", height: 28, backgroundColor: "var(--bg-app)", border: "none" }}
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5/page</option>
                  <option value={10}>10/page</option>
                  <option value={20}>20/page</option>
                </select>
              </div>
            </div>

          </div>

          {/* Payment History Card */}
          <div className="bg-white border rounded-3 p-4 shadow-sm" style={{ borderColor: "var(--border-color)" }}>
            <h5 className="fw-bold mb-1" style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
              Payment History
            </h5>
            <p className="small mb-3.5" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
              Log of all transaction receipts recorded under this lease
            </p>

            <div className="table-responsive border rounded-2" style={{ borderColor: "var(--border-color)" }}>
              <table className="table table-hover mb-0 align-middle text-nowrap" style={{ fontSize: "0.78rem" }}>
                <thead style={{ backgroundColor: "var(--bg-app)" }}>
                  <tr className="border-bottom" style={{ borderColor: "var(--border-color)" }}>
                    <th className="py-2.5 px-2 fw-semibold" style={{ color: "var(--text-muted)" }}>Payment ID</th>
                    <th className="py-2.5 px-2 fw-semibold" style={{ color: "var(--text-muted)" }}>Date</th>
                    <th className="py-2.5 px-2 fw-semibold text-end" style={{ color: "var(--text-muted)" }}>Amount</th>
                    <th className="py-2.5 px-2 fw-semibold" style={{ color: "var(--text-muted)" }}>Payment Mode</th>
                    <th className="py-2.5 px-2 fw-semibold" style={{ color: "var(--text-muted)" }}>Reference Number</th>
                    <th className="py-2.5 px-2 fw-semibold text-center" style={{ color: "var(--text-muted)" }}>Status</th>
                  </tr>
                </thead>
                <tbody className="border-0">
                  {paymentsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    paymentsList.map((p: any) => (
                      <tr key={p._id || p.receiptNumber} className="border-bottom" style={{ borderColor: "var(--border-color)" }}>
                        <td className="py-2 px-2 fw-bold" style={{ color: "var(--text-main)" }}>{p.receiptNumber || `PAY-${p._id?.slice(-4).toUpperCase()}`}</td>
                        <td className="py-2 px-2" style={{ color: "var(--text-primary)" }}>{formatDate(p.paymentDate)}</td>
                        <td className="py-2 px-2 text-end fw-semibold" style={{ color: "var(--text-main)" }}>
                          ₹{Number(p.amountPaid || p.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-2" style={{ color: "var(--text-primary)" }}>{p.paymentMode || 'UPI'}</td>
                        <td className="py-2 px-2" style={{ color: "var(--text-muted)" }}>{p.transactionRef || 'N/A'}</td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`badge bg-${STATUS_COLOR[p.status] || "success"} bg-opacity-10 text-${
                              STATUS_COLOR[p.status] || "success"
                            } border border-${STATUS_COLOR[p.status] || "success"} border-opacity-25 rounded-pill px-2.5 py-1`}
                            style={{ fontSize: "0.68rem", fontWeight: 600 }}
                          >
                            {p.status || "Success"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Record Payment Modal Integration */}
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

      {/* Payment Receipt Modal */}
      {showReceiptModal && selectedInvoiceForReceipt && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(4,4,4,0.6)", zIndex: 1200, backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 460 }}>
            <div className="modal-content border-0 rounded-3 overflow-hidden bg-white shadow-lg">
              
              {/* Receipt Header */}
              <div className="p-4 text-white text-center position-relative" style={{ backgroundColor: "var(--dark-section)" }}>
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={() => setShowReceiptModal(false)}
                  aria-label="Close"
                  style={{ filter: "brightness(0) invert(1)" }}
                ></button>
                <div className="rounded-circle bg-white bg-opacity-20 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-receipt fs-4 text-white"></i>
                </div>
                <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>Payment Receipt</h5>
                <p className="small mb-0 opacity-75" style={{ fontSize: "0.72rem" }}>
                  Receipt No: PAY-{selectedInvoiceForReceipt.invoiceId.startsWith("INV-") ? selectedInvoiceForReceipt.invoiceId.slice(-4).toUpperCase() : "0001"}
                </p>
              </div>

              {/* Receipt Details Body */}
              <div className="p-4" style={{ fontSize: "0.8rem" }}>
                <div className="text-center mb-4">
                  <span className="d-block mb-1" style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "0.05em" }}>AMOUNT PAID</span>
                  <span className="fs-3 fw-bold" style={{ color: "var(--text-main)" }}>
                    ₹{Number(selectedInvoiceForReceipt.paidAmount || selectedInvoiceForReceipt.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="mt-2">
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1.5 fw-semibold" style={{ fontSize: "0.7rem" }}>
                      Payment Successful
                    </span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2.5 border-top pt-3">
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "var(--text-muted)" }}>Tenant Name:</span>
                    <strong style={{ color: "var(--text-main)" }}>{user.name}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "var(--text-muted)" }}>Email Address:</span>
                    <span style={{ color: "var(--text-primary)" }}>{user.email}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "var(--text-muted)" }}>Property / Unit:</span>
                    <strong style={{ color: "var(--text-main)" }}>
                      {user.assignedProperties?.[0]?.propertyName || "Green Valley Commercial Hub"}, Unit {user.assignedUnits?.[0]?.unitNumber || "204"}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "var(--text-muted)" }}>Billing Period:</span>
                    <span style={{ color: "var(--text-primary)" }}>{selectedInvoiceForReceipt.billingPeriod}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "var(--text-muted)" }}>Transaction Date:</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatDate(selectedInvoiceForReceipt.paidDate || selectedInvoiceForReceipt.dueDate)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "var(--text-muted)" }}>Payment Mode:</span>
                    <strong style={{ color: "var(--text-main)" }}>UPI / Net Banking</strong>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-2 d-flex justify-content-between align-items-center" style={{ backgroundColor: "var(--bg-app)" }}>
                  <div>
                    <span className="d-block" style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Remaining Balance</span>
                    <strong className="text-danger" style={{ fontSize: "0.85rem" }}>₹{Number(selectedInvoiceForReceipt.pendingAmount || 0).toLocaleString()}</strong>
                  </div>
                  <span style={{ color: "var(--text-muted)" }}>Status: <strong style={{ color: "var(--text-main)" }}>{selectedInvoiceForReceipt.status}</strong></span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="px-4 py-3 bg-light border-top d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5"
                  onClick={() => alert("Receipt sent to tenant email address.")}
                  style={{ borderRadius: "6px", fontSize: "0.75rem" }}
                >
                  <i className="bi bi-envelope"></i> Email Receipt
                </button>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowReceiptModal(false)}
                    style={{ borderRadius: "6px", fontSize: "0.75rem" }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm text-white"
                    onClick={() => window.print()}
                    style={{ backgroundColor: "var(--dark-section)", borderRadius: "6px", fontSize: "0.75rem" }}
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
