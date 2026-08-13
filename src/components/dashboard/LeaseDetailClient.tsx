"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/utils/api";
import RecordPaymentModal from "@/components/users/modals/RecordPaymentModal";
import { exportLeaseAgreementPdf } from "@/utils/exportLeaseAgreementPdf";
import { exportTaxInvoicePdf } from "@/utils/exportTaxInvoicePdf";

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

  // Actions loading & invoice modal states
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceMonthInput, setInvoiceMonthInput] = useState("July");
  const [invoiceYearInput, setInvoiceYearInput] = useState(2026);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      // 1. Try fetching directly from /leases/:id
      const resLease = await api.get(`/leases/${userId}`).catch(() => null);
      if (resLease && resLease.success && resLease.data) {
        const lease = resLease.data;
        const tenantUser = {
          _id: lease._id,
          name: lease.tenantName || lease.companyName || 'Tenant',
          companyName: lease.companyName || lease.tenantName || 'N/A',
          email: lease.tenantEmail || 'N/A',
          phoneNumber: lease.tenantContact || 'N/A',
          address: lease.address || 'N/A',
          assignedProperties: lease.property ? [lease.property] : [],
          assignedFloors: lease.floor ? [lease.floor] : [],
          assignedUnits: lease.units || [],
          role: lease.leaseType === 'Commercial Office' ? 'OFFICE_OWNER' : 'FLOOR_ADMIN',
          paymentStatus: lease.paymentStatus || 'Unpaid',
          agreementStatus: lease.status || 'Active',
          monthlyRent: lease.monthlyRent || 0,
        };
        setUser(tenantUser);

        setAgreement({
          _id: lease._id,
          leaseType: lease.leaseType || 'Floor Agreement',
          startDate: lease.startDate,
          endDate: lease.endDate,
          monthlyRent: lease.monthlyRent,
          totalAmount: lease.monthlyRent ? lease.monthlyRent * 12 : 0,
          status: lease.status || 'Active',
          paymentStatus: lease.paymentStatus || 'Unpaid',
          propertyName: lease.property?.propertyName || 'The Bodhivriksha',
          floorName: lease.floor?.floorName || (lease.floor?.floorNumber ? `Floor ${lease.floor?.floorNumber}` : ''),
        });

        // Also attempt to load billing invoices if available
        const resBilling = await api.get(`/users/${userId}/billing`).catch(() => null);
        if (resBilling && resBilling.success) {
          setBillingData(resBilling.data);
        }
        return;
      }

      // 2. Fallback: Fetch user profile directly
      const resUser = await api.get(`/users/${userId}`);
      if (resUser.success && resUser.data) {
        const userData = resUser.data;
        setUser(userData);

        const [resAgreement, resBilling] = await Promise.all([
          api.get(`/agreements/user/${userId}`).catch((err: any) => {
            if (err?.status !== 404 && err?.message !== 'No agreement active for this user.') {
              console.error("Error fetching agreement details:", err);
            }
            return null;
          }),
          api.get(`/users/${userId}/billing`).catch((err: any) => {
            console.error("Error fetching billing details:", err);
            return null;
          })
        ]);

        if (resAgreement && resAgreement.success && resAgreement.data) {
          setAgreement(resAgreement.data.agreements?.[0] || null);
        } else {
          setAgreement(null);
        }

        if (resBilling && resBilling.success) {
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
    const invId = (inv?.invoiceId || "").toString().toLowerCase();
    const billPeriod = (inv?.billingPeriod || "").toString().toLowerCase();
    const matchesSearch = invId.includes(query) || billPeriod.includes(query);
    const invStatus = (inv?.status || "").toString().toLowerCase();
    const matchesStatus =
      statusFilter === "All" ||
      invStatus === statusFilter.toLowerCase();
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
  const handleReceivePaymentClick = () => {
    if (!paymentAmountInput) {
      setPaymentAmountInput(String(pendingAmount || 0));
    }
    setShowPaymentModal(true);
  };

  const handlePayNowClick = (inv: any) => {
    const needed = inv.pendingAmount || inv.amount || 0;
    setPaymentAmountInput(String(needed));
    setNotesInput(`Payment for ${inv.billingPeriod || 'Invoice'} (${inv.invoiceId || 'INV'})`);
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

  // Open Generate Invoice Modal
  const handleGenerateInvoice = () => {
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
    setInvoiceMonthInput(targetMonth);
    setInvoiceYearInput(targetYear);
    setShowInvoiceModal(true);
  };

  const handleGenerateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGeneratingInvoice) return;
    setIsGeneratingInvoice(true);
    try {
      const res = await api.post("/finance/generate", {
        month: invoiceMonthInput,
        year: Number(invoiceYearInput)
      });
      if (res.success) {
        setShowInvoiceModal(false);
        alert(res.message || `Invoice for ${invoiceMonthInput} ${invoiceYearInput} generated successfully!`);
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

  const handleDownloadTaxInvoicePdf = (inv: any) => {
    exportTaxInvoicePdf({
      invoice: inv,
      user,
      agreement
    });
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

  const handleDownloadAgreementPdf = () => {
    exportLeaseAgreementPdf({
      user,
      agreement,
      billingData,
    });
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

  // Active Tab state
  const [activeTab, setActiveTab] = useState("Overview");
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Shimmer pulse loader rendering
  if (isLoading) {
    return (
      <div style={{ backgroundColor: "#F7F7F5", minHeight: "100vh", fontFamily: "var(--font-geist-sans), Inter, sans-serif" }} className="py-4 px-3 px-md-5">
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          .animate-pulse { animation: pulse 1.5s infinite ease-in-out; }
          .bg-shimmer { background-color: #EAEAE7; border-radius: 6px; }
        `}</style>
        <div className="mx-auto" style={{ maxWidth: "1320px" }}>
          <div className="d-flex justify-content-between mb-4">
            <div className="bg-shimmer animate-pulse" style={{ height: 32, width: 140 }} />
            <div className="d-flex gap-2">
              <div className="bg-shimmer animate-pulse" style={{ height: 36, width: 120 }} />
              <div className="bg-shimmer animate-pulse" style={{ height: 36, width: 140 }} />
            </div>
          </div>
          <div className="bg-white border rounded-3 p-4 mb-4 animate-pulse" style={{ height: 120, borderColor: "#E5E7EB" }}>
            <div className="bg-shimmer mb-2" style={{ height: 24, width: "30%" }} />
            <div className="bg-shimmer" style={{ height: 16, width: "20%" }} />
          </div>
          <div className="bg-white border rounded-3 p-4 animate-pulse" style={{ height: 260, borderColor: "#E5E7EB" }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-5 text-center min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: "#F7F7F5", fontFamily: "var(--font-geist-sans), Inter, sans-serif" }}>
        <div className="bg-white border rounded-3 p-4 shadow-sm" style={{ maxWidth: 450, borderColor: "#E5E7EB" }}>
          <i className="bi bi-exclamation-triangle text-warning fs-1"></i>
          <h5 className="fw-bold text-dark mt-3">Lease Agreement Not Found</h5>
          <p className="text-muted small mt-2">
            The requested user or lease agreement details could not be found in the system.
          </p>
          <Link href="/admin/leases" className="btn btn-sm mt-3 px-4 py-2 text-white" style={{ borderRadius: "8px", backgroundColor: "#111827" }}>
            Back to Leases
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic values derived from fetched data
  const tenantName = user.name || user.tenantName || "Naveen Sharma";
  const tenantEmail = user.email || "naveen@gmail.com";
  const agreementId = agreement?._id ? `AGR-${agreement._id.slice(-6).toUpperCase()}` : (user._id ? `AGR-${user._id.slice(-6).toUpperCase()}` : "AGR-46A581");
  const startDateStr = formatDate(agreement?.startDate || user?.floorAssignmentStartDate || "2026-08-12");
  const endDateStr = formatDate(agreement?.endDate || user?.floorAssignmentEndDate || "2027-08-11");
  const propName = user.assignedProperties?.[0]?.propertyName || agreement?.propertyName || "The Bodhivriksha";
  let rawFloorName = user.assignedFloors?.[0]?.floorName || (user.assignedFloors?.[0]?.floorNumber ? `Floor ${user.assignedFloors[0].floorNumber}` : "Ground Floor");
  if (rawFloorName.toLowerCase().includes("bodhivriksha")) {
    rawFloorName = rawFloorName.replace(/bodhivriksha\s*[\-\·\–]?\s*/gi, "").trim();
    if (!rawFloorName) rawFloorName = "Ground Floor";
  }
  const floorName = rawFloorName;
  const seatCount = user.assignedSeatCount || user.assignedUnits?.length || 1;
  const areaSqft = (user.assignedUnits?.reduce((sum: number, u: any) => sum + (u.sqft || 0), 0) || 0);

  // Primary status formatting helper
  const renderStatusBadge = (status: string) => {
    const s = (status || "Active").toLowerCase();
    let bg = "#DCFCE7";
    let color = "#166534";
    let label = status || "Active";

    if (s.includes("paid") && !s.includes("unpaid") && !s.includes("part")) {
      bg = "#DCFCE7"; color = "#166534";
    } else if (s.includes("pending") || s.includes("part")) {
      bg = "#FEF3C7"; color = "#92400E";
    } else if (s.includes("overdue") || s.includes("fail") || s.includes("unpaid")) {
      bg = "#FEE2E2"; color = "#991B1B";
    } else if (s.includes("cancel") || s.includes("expir")) {
      bg = "#F3F4F6"; color = "#374151";
    }

    return (
      <span
        className="d-inline-flex align-items-center gap-1.5 px-2.5 py-0.5 rounded-pill fw-bold"
        style={{ backgroundColor: bg, color: color, fontSize: "0.7rem", letterSpacing: "0.03em", lineHeight: 1.4 }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, display: "inline-block" }} />
        <span>{label.toUpperCase()}</span>
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: "#F7F7F5", minHeight: "100vh", fontFamily: "var(--font-geist-sans), 'Plus Jakarta Sans', Inter, sans-serif", color: "#111827", paddingBottom: "80px" }}>
      <div className="mx-auto px-3 px-md-4 py-3 py-md-4" style={{ maxWidth: "1320px" }}>

        {/* 2. TOP NAVIGATION */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <Link
            href="/admin/leases"
            className="d-inline-flex align-items-center gap-1.5 text-decoration-none transition-all"
            style={{ color: "#64748B", fontSize: "0.875rem", fontWeight: 500 }}
          >
            <i className="bi bi-arrow-left" style={{ fontSize: "1rem" }} />
            Back to Leases
          </Link>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleDownloadAgreementPdf}
              className="btn btn-sm bg-white d-none d-sm-inline-flex align-items-center gap-2 fw-medium px-3 py-2"
              style={{ border: "1px solid #E5E7EB", borderRadius: "8px", color: "#374151", fontSize: "0.83rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
            >
              <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: "0.95rem" }}></i>
              Download PDF
            </button>

            <button
              onClick={handleReceivePaymentClick}
              className="btn btn-sm text-white d-inline-flex align-items-center fw-semibold px-3 py-2"
              style={{ backgroundColor: "#111827", border: "1px solid #111827", borderRadius: "8px", fontSize: "0.83rem", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
            >
              + Receive Payment
            </button>

            {/* More Menu Dropdown */}
            <div className="dropdown position-relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="btn btn-sm bg-white px-2.5 py-2 d-flex align-items-center justify-content-center"
                style={{ border: "1px solid #E5E7EB", borderRadius: "8px", color: "#4B5563", fontSize: "0.9rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
              >
                <i className="bi bi-three-dots"></i>
              </button>

              {showMoreMenu && (
                <div
                  className="dropdown-menu dropdown-menu-end show border-0 shadow-lg py-2 rounded-3"
                  style={{ position: "absolute", right: 0, top: "100%", marginTop: "6px", minWidth: 200, zIndex: 1050, backgroundColor: "#FFFFFF" }}
                >
                  <button
                    className="dropdown-item py-2 px-3 small d-flex align-items-center gap-2"
                    onClick={() => { setShowMoreMenu(false); handleGenerateInvoice(); }}
                  >
                    <i className="bi bi-file-earmark-plus text-primary"></i> Generate Invoice
                  </button>
                  <button
                    className="dropdown-item py-2 px-3 small d-flex align-items-center gap-2"
                    onClick={() => { setShowMoreMenu(false); handleDownloadReceipt(); }}
                  >
                    <i className="bi bi-download text-secondary"></i> Download Statement
                  </button>
                  <button
                    className="dropdown-item py-2 px-3 small d-flex align-items-center gap-2"
                    onClick={() => { setShowMoreMenu(false); handleSendEmail(); }}
                  >
                    <i className="bi bi-envelope text-success"></i> Send Email Notice
                  </button>
                  <button
                    className="dropdown-item py-2 px-3 small d-flex align-items-center gap-2 d-sm-none"
                    onClick={() => { setShowMoreMenu(false); handleDownloadAgreementPdf(); }}
                  >
                    <i className="bi bi-file-earmark-pdf text-danger"></i> Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. LEASE HEADER */}
        <div className="bg-white rounded-3 p-3 p-md-4 mb-3 border" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            {/* Left Header */}
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                style={{ width: 48, height: 48, backgroundColor: "#111827", fontSize: "1rem", letterSpacing: "0.02em" }}
              >
                {getInitials(tenantName)}
              </div>

              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h4 className="fw-bold mb-0" style={{ fontSize: "1.15rem", color: "#111827", letterSpacing: "-0.01em" }}>
                    {tenantName}
                  </h4>
                  {renderStatusBadge(user.agreementStatus || agreement?.status || "Active")}
                </div>

                <div className="small mt-0.5" style={{ color: "#64748B", fontSize: "0.83rem" }}>
                  {tenantEmail}
                </div>

                <div className="mt-2 fw-medium" style={{ color: "#374151", fontSize: "0.83rem" }}>
                  {propName} &middot; {floorName} &middot; {seatCount} Seat{seatCount > 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Right Header */}
            <div className="text-md-end w-100 w-md-auto">
              <div className="text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                LEASE AGREEMENT
              </div>
              <div className="fw-bold" style={{ fontSize: "1rem", color: "#111827" }}>
                {agreementId}
              </div>
              <div className="small" style={{ color: "#64748B", fontSize: "0.82rem" }}>
                {startDateStr} &rarr; {endDateStr}
              </div>

              <div className="mt-2">
                <span className="fw-bold" style={{ fontSize: "1.3rem", color: "#111827" }}>
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
                <span className="d-block small" style={{ color: "#64748B", fontSize: "0.72rem" }}>
                  Contract Value
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. KPI ROW */}
        <div className="bg-white rounded-3 p-3 p-md-3 mb-4 border" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div className="row g-0 align-items-center">
            
            {/* Metric 1 */}
            <div className="col-6 col-md py-2 px-3 border-end" style={{ borderColor: "#E5E7EB" }}>
              <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem", letterSpacing: "0.03em" }}>
                Contract Value
              </span>
              <div className="fw-bold my-1" style={{ fontSize: "1.3rem", color: "#111827" }}>
                ₹{totalAmount.toLocaleString("en-IN")}
              </div>
              <span className="d-block text-muted" style={{ fontSize: "0.75rem" }}>
                Base Billing
              </span>
            </div>

            {/* Metric 2 */}
            <div className="col-6 col-md py-2 px-3 border-end-md" style={{ borderColor: "#E5E7EB" }}>
              <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem", letterSpacing: "0.03em" }}>
                Amount Paid
              </span>
              <div className="fw-bold my-1" style={{ fontSize: "1.3rem", color: "#111827" }}>
                ₹{totalPaid.toLocaleString("en-IN")}
              </div>
              <span className="d-block fw-semibold" style={{ color: "#16A34A", fontSize: "0.75rem" }}>
                {paidPercent}% Paid
              </span>
            </div>

            {/* Metric 3 */}
            <div className="col-6 col-md py-2 px-3 border-end border-top border-md-0" style={{ borderColor: "#E5E7EB" }}>
              <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem", letterSpacing: "0.03em" }}>
                Outstanding
              </span>
              <div className="fw-bold my-1" style={{ fontSize: "1.3rem", color: pendingAmount > 0 ? "#D97706" : "#111827" }}>
                ₹{pendingAmount.toLocaleString("en-IN")}
              </div>
              <span className="d-block fw-semibold" style={{ color: pendingAmount > 0 ? "#D97706" : "#64748B", fontSize: "0.75rem" }}>
                {pendingAmount > 0 ? "Due" : "Settled"}
              </span>
            </div>

            {/* Metric 4 */}
            <div className="col-6 col-md py-2 px-3 border-end-md border-top border-md-0" style={{ borderColor: "#E5E7EB" }}>
              <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem", letterSpacing: "0.03em" }}>
                Duration
              </span>
              <div className="fw-bold my-1" style={{ fontSize: "1.3rem", color: "#111827" }}>
                {durationMonths} Months
              </div>
              <span className="d-block text-muted" style={{ fontSize: "0.75rem" }}>
                {remainingDays} Days
              </span>
            </div>

            {/* Metric 5 */}
            <div className="col-12 col-md py-2 px-3 border-top border-md-0">
              <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem", letterSpacing: "0.03em" }}>
                Seats
              </span>
              <div className="fw-bold my-1" style={{ fontSize: "1.3rem", color: "#111827" }}>
                {seatCount}
              </div>
              <span className="d-block text-muted" style={{ fontSize: "0.75rem" }}>
                {seatCount > 1 ? "Seats Allocated" : "Seat Allocated"}
              </span>
            </div>

          </div>
        </div>

        {/* 5. TAB NAVIGATION */}
        <div className="mb-4 border-bottom" style={{ borderColor: "#E5E7EB" }}>
          <div className="d-flex align-items-center gap-4 overflow-x-auto text-nowrap scrollbar-none py-1">
            {["Overview", "Billing", "Payments", "Agreement", "Activity"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="btn btn-link text-decoration-none px-0 py-2 border-0 position-relative transition-all"
                  style={{
                    color: isActive ? "#111827" : "#64748B",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  {tab}
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: "#111827",
                        borderRadius: "2px 2px 0 0"
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: OVERVIEW TAB CONTENT */}
        {(activeTab === "Overview" || activeTab === "Agreement") && (
          <>
            {/* 6. PAYMENT HEALTH */}
            <div className="bg-white rounded-3 p-4 mb-4 border" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-uppercase fw-bold" style={{ fontSize: "0.75rem", letterSpacing: "0.05em", color: "#64748B" }}>
                  PAYMENT HEALTH
                </span>
                <span className="fw-bold" style={{ fontSize: "1.1rem", color: "#111827" }}>
                  {paidPercent}%
                </span>
              </div>

              <div className="fw-bold mb-2" style={{ fontSize: "1.05rem", color: "#111827" }}>
                ₹{totalPaid.toLocaleString("en-IN")} paid of ₹{totalAmount.toLocaleString("en-IN")}
              </div>

              {/* Progress Bar */}
              <div className="mb-4" style={{ height: "8px", backgroundColor: "#EAEAEA", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${paidPercent}%`,
                    height: "100%",
                    backgroundColor: "#16A34A",
                    borderRadius: "999px",
                    transition: "width 0.5s ease"
                  }}
                />
              </div>

              {/* 3 Metric Columns below bar */}
              <div className="row g-3 pt-2">
                <div className="col-4">
                  <span className="d-block text-muted small mb-1" style={{ fontSize: "0.78rem" }}>Paid</span>
                  <div className="fw-bold" style={{ fontSize: "1.05rem", color: "#111827" }}>
                    ₹{totalPaid.toLocaleString("en-IN")}
                  </div>
                  <span className="small fw-semibold text-success" style={{ fontSize: "0.75rem" }}>
                    {paidPercent}%
                  </span>
                </div>

                <div className="col-4">
                  <span className="d-block text-muted small mb-1" style={{ fontSize: "0.78rem" }}>Outstanding</span>
                  <div className="fw-bold" style={{ fontSize: "1.05rem", color: pendingAmount > 0 ? "#D97706" : "#111827" }}>
                    ₹{pendingAmount.toLocaleString("en-IN")}
                  </div>
                  <span className="small fw-semibold" style={{ color: pendingAmount > 0 ? "#D97706" : "#64748B", fontSize: "0.75rem" }}>
                    {pendingAmount > 0 ? "Due" : "Settled"}
                  </span>
                </div>

                <div className="col-4">
                  <span className="d-block text-muted small mb-1" style={{ fontSize: "0.78rem" }}>
                    {firstUnpaidInvoice ? "Next Payment" : "Last Payment"}
                  </span>
                  <div className="fw-bold" style={{ fontSize: "1.05rem", color: "#111827" }}>
                    {firstUnpaidInvoice ? formatDate(firstUnpaidInvoice.dueDate) : (paymentsList[0] ? formatDate(paymentsList[0].paymentDate) : "—")}
                  </div>
                  <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                    {firstUnpaidInvoice ? `₹${Number(firstUnpaidInvoice.pendingAmount || firstUnpaidInvoice.amount || 0).toLocaleString()}` : (paymentsList[0]?.paymentMode || "UPI")}
                  </span>
                </div>
              </div>
            </div>

            {/* 7. INFORMATION GRID */}
            <div className="bg-white rounded-3 p-4 mb-4 border" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div className="row g-4">
                
                {/* Left Column: PROPERTY DETAILS */}
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em", color: "#64748B" }}>
                    PROPERTY DETAILS
                  </h6>

                  <div className="d-flex flex-column gap-3">
                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>PROPERTY</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>{propName}</span>
                    </div>

                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>FLOOR</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>{floorName}</span>
                    </div>

                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>UNIT</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>
                        {user.assignedUnits?.map((u: any) => typeof u === "object" ? `Office ${u.unitNumber}` : `Office ${u}`).join(", ") || "—"}
                      </span>
                    </div>

                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>AREA</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>{areaSqft} SFT</span>
                    </div>

                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>LEASE TYPE</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>Commercial</span>
                    </div>

                    <div>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>ALLOCATED SEATS</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>{seatCount} Seat{seatCount > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: AGREEMENT DETAILS */}
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em", color: "#64748B" }}>
                    AGREEMENT DETAILS
                  </h6>

                  <div className="d-flex flex-column gap-3">
                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>AGREEMENT ID</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>{agreementId}</span>
                    </div>

                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>START DATE</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>{startDateStr}</span>
                    </div>

                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>END DATE</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>{endDateStr}</span>
                    </div>

                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>DURATION</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>{durationMonths} Months</span>
                    </div>

                    <div className="pb-2 border-bottom" style={{ borderColor: "#F3F4F6" }}>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>REMAINING</span>
                      <span className="fw-semibold" style={{ color: "#111827", fontSize: "0.9rem" }}>{remainingDays} Days</span>
                    </div>

                    <div>
                      <span className="d-block text-uppercase fw-semibold" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>STATUS</span>
                      <div className="mt-1">{renderStatusBadge(user.agreementStatus || agreement?.status || "Active")}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}

        {/* 8. UPCOMING BILLING SECTION */}
        {(activeTab === "Overview" || activeTab === "Billing") && (
          <div className="bg-white rounded-3 p-4 mb-4 border" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-uppercase fw-bold" style={{ fontSize: "0.75rem", letterSpacing: "0.05em", color: "#64748B" }}>
                UPCOMING BILLING
              </span>
              {activeTab === "Overview" && (
                <button
                  onClick={() => setActiveTab("Billing")}
                  className="btn btn-link p-0 text-decoration-none border-0 fw-semibold"
                  style={{ color: "#111827", fontSize: "0.82rem" }}
                >
                  View all &rarr;
                </button>
              )}
            </div>

            {/* Filter controls when viewing Billing tab */}
            {activeTab === "Billing" && (
              <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                <div className="position-relative flex-grow-1" style={{ maxWidth: 300 }}>
                  <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted" style={{ left: 10, fontSize: "0.8rem" }}></i>
                  <input
                    type="text"
                    className="form-control form-control-sm ps-4"
                    placeholder="Search invoice number or period..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ borderRadius: "6px", fontSize: "0.8rem" }}
                  />
                </div>
                <div className="d-flex gap-2">
                  {["All", "Paid", "Pending", "Overdue"].map((st) => (
                    <button
                      key={st}
                      className={`btn btn-sm ${statusFilter === st ? "btn-dark text-white" : "btn-light border"}`}
                      onClick={() => setStatusFilter(st)}
                      style={{ borderRadius: "6px", fontSize: "0.75rem" }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compact Invoice Rows */}
            <div className="d-flex flex-column gap-1">
              {(activeTab === "Overview" ? filteredInvoices.slice(0, 4) : paginatedInvoices).length === 0 ? (
                <div className="text-center py-4 text-muted small">No invoice billing schedules found matching criteria.</div>
              ) : (
                (activeTab === "Overview" ? filteredInvoices.slice(0, 4) : paginatedInvoices).map((inv: any) => {
                  const displayNo = inv.invoiceId.startsWith("INV-")
                    ? `INV-${inv.invoiceId.slice(4).padStart(6, "0")}`
                    : inv.invoiceId;

                  return (
                    <div
                      key={inv.invoiceId}
                      className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between p-3 rounded-2 transition-all border-bottom"
                      style={{ borderColor: "#F3F4F6", cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F9FAFB"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
                    >
                      {/* Left: Inv No + Period */}
                      <div className="d-flex align-items-center gap-3 mb-2 mb-sm-0">
                        <span className="fw-bold" style={{ fontSize: "0.875rem", color: "#111827", minWidth: 100 }}>
                          {displayNo}
                        </span>
                        <span className="text-secondary" style={{ fontSize: "0.83rem" }}>
                          {inv.billingPeriod}
                        </span>
                      </div>

                      {/* Right: Date, Amount, Status, Actions */}
                      <div className="d-flex align-items-center gap-3 gap-md-4 w-100 w-sm-auto justify-content-between justify-content-sm-end">
                        <span className="text-muted" style={{ fontSize: "0.8rem", minWidth: 70 }}>
                          {formatDate(inv.dueDate)}
                        </span>

                        <span className="fw-bold" style={{ fontSize: "0.9rem", color: "#111827", minWidth: 80, textAlign: "right" }}>
                          ₹{Number(inv.amount || 0).toLocaleString()}
                        </span>

                        <div>{renderStatusBadge(inv.status)}</div>

                        <div className="d-flex gap-1">
                          <button
                            onClick={() => handleDownloadTaxInvoicePdf(inv)}
                            className="btn btn-sm btn-link text-muted p-1 text-decoration-none"
                            title="Tax Invoice PDF"
                          >
                            <i className="bi bi-download"></i>
                          </button>
                          {inv.status !== "Paid" && (
                            <button
                              onClick={() => handlePayNowClick(inv)}
                              className="btn btn-sm btn-link p-1 text-decoration-none fw-semibold"
                              style={{ color: "#111827" }}
                            >
                              &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination for Billing tab */}
            {activeTab === "Billing" && totalPagesCount > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
                <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                  Showing {currentPage} of {totalPagesCount} pages ({totalFilteredCount} invoices)
                </span>
                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm btn-light border"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <button
                    className="btn btn-sm btn-light border"
                    disabled={currentPage === totalPagesCount}
                    onClick={() => setCurrentPage((p) => Math.min(totalPagesCount, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. PAYMENT ACTIVITY TIMELINE */}
        {(activeTab === "Overview" || activeTab === "Payments" || activeTab === "Activity") && (
          <div className="bg-white rounded-3 p-4 mb-4 border" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <span className="text-uppercase fw-bold" style={{ fontSize: "0.75rem", letterSpacing: "0.05em", color: "#64748B" }}>
                PAYMENT ACTIVITY
              </span>
              {activeTab === "Overview" && (
                <button
                  onClick={() => setActiveTab("Payments")}
                  className="btn btn-link p-0 text-decoration-none border-0 fw-semibold"
                  style={{ color: "#111827", fontSize: "0.82rem" }}
                >
                  View all &rarr;
                </button>
              )}
            </div>

            {/* Timeline */}
            <div className="position-relative ps-3">
              {/* Vertical timeline line */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  bottom: 12,
                  left: 7,
                  width: 2,
                  backgroundColor: "#E5E7EB"
                }}
              />

              {paymentsList.length === 0 ? (
                <div className="py-2 text-muted small">No payment activity recorded yet.</div>
              ) : (
                paymentsList.slice(0, activeTab === "Overview" ? 3 : 10).map((p: any, idx: number) => {
                  const isPaid = (p.status || "Success").toLowerCase() === "success";

                  return (
                    <div key={p._id || idx} className="position-relative ps-4 pb-4">
                      {/* Timeline dot */}
                      <span
                        style={{
                          position: "absolute",
                          left: -12,
                          top: 4,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: isPaid ? "#16A34A" : "#FFFFFF",
                          border: isPaid ? "none" : "2px solid #D97706"
                        }}
                      />

                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-1">
                        <div>
                          <div className="fw-semibold" style={{ fontSize: "0.88rem", color: "#111827" }}>
                            ₹{Number(p.amountPaid || p.amount || 0).toLocaleString("en-IN")} Payment {isPaid ? "Received" : "Due"}
                          </div>
                          <div className="small text-muted mt-0.5" style={{ fontSize: "0.78rem" }}>
                            {formatDate(p.paymentDate)} &middot; {p.paymentMode || "UPI"}
                          </div>
                          <div className="small text-secondary mt-0.5" style={{ fontSize: "0.72rem" }}>
                            Reference: {p.transactionRef || p.receiptNumber || `PAY-${(p._id || "938421").slice(-6).toUpperCase()}`}
                          </div>
                        </div>

                        <div className="mt-1 mt-sm-0">
                          {renderStatusBadge(p.status || "Success")}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 10. LEASE DOCUMENT */}
        {(activeTab === "Overview" || activeTab === "Agreement") && (
          <div className="bg-white rounded-3 p-4 mb-4 border" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div className="text-uppercase fw-bold mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em", color: "#64748B" }}>
              LEASE AGREEMENT DOCUMENT
            </div>

            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 p-3 rounded-2" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-2 d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 44, height: 50, backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5", fontSize: "0.8rem" }}
                >
                  PDF
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: "0.9rem", color: "#111827" }}>
                    {tenantName} — Lease Agreement
                  </div>
                  <div className="small text-muted mt-0.5" style={{ fontSize: "0.78rem" }}>
                    {agreementId} &middot; A4 &middot; Contract Document
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 w-100 w-sm-auto">
                <button
                  onClick={handleDownloadAgreementPdf}
                  className="btn btn-sm bg-white border fw-medium px-3 py-1.5 flex-grow-1 flex-sm-grow-0"
                  style={{ borderColor: "#E5E7EB", color: "#374151", fontSize: "0.82rem" }}
                >
                  Preview PDF
                </button>
                <button
                  onClick={handleDownloadAgreementPdf}
                  className="btn btn-sm bg-white border fw-medium px-3 py-1.5 flex-grow-1 flex-sm-grow-0"
                  style={{ borderColor: "#E5E7EB", color: "#111827", fontSize: "0.82rem" }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* STICKY MOBILE ACTION BAR (#12) */}
      <div
        className="d-md-none position-fixed bottom-0 start-0 end-0 bg-white border-top p-2.5 px-3 d-flex align-items-center gap-2 shadow-lg"
        style={{ zIndex: 1040, borderColor: "#E5E7EB" }}
      >
        <button
          onClick={handleReceivePaymentClick}
          className="btn btn-dark w-100 text-white fw-semibold py-2"
          style={{ backgroundColor: "#111827", borderRadius: "8px", fontSize: "0.875rem" }}
        >
          + Receive Payment
        </button>
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="btn btn-light border px-3 py-2"
          style={{ borderRadius: "8px" }}
        >
          <i className="bi bi-three-dots"></i>
        </button>
      </div>

      {/* MODAL INTEGRATIONS */}
      {showPaymentModal && (
        <RecordPaymentModal
          agreement={{
            agreementNumber: agreementId,
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

      {/* Receipt Modal */}
      {showReceiptModal && selectedInvoiceForReceipt && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(4,4,4,0.6)", zIndex: 1200, backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 460 }}>
            <div className="modal-content border-0 rounded-3 overflow-hidden bg-white shadow-lg">
              <div className="p-4 text-white text-center position-relative" style={{ backgroundColor: "#111827" }}>
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={() => setShowReceiptModal(false)}
                />
                <h5 className="fw-bold mb-0">Payment Receipt</h5>
                <p className="small mb-0 opacity-75">{selectedInvoiceForReceipt.invoiceId}</p>
              </div>
              <div className="p-4" style={{ fontSize: "0.85rem" }}>
                <div className="text-center mb-3">
                  <span className="d-block text-muted small">AMOUNT PAID</span>
                  <span className="fs-3 fw-bold" style={{ color: "#111827" }}>
                    ₹{Number(selectedInvoiceForReceipt.paidAmount || selectedInvoiceForReceipt.amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="d-flex flex-column gap-2 border-top pt-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Tenant:</span>
                    <strong>{tenantName}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Period:</span>
                    <span>{selectedInvoiceForReceipt.billingPeriod}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Status:</span>
                    <strong className="text-success">{selectedInvoiceForReceipt.status}</strong>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-light border-top d-flex justify-content-end gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowReceiptModal(false)}>Close</button>
                <button className="btn btn-sm btn-dark" onClick={() => window.print()}>Print</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generation Modal */}
      {showInvoiceModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(4,4,4,0.6)", zIndex: 1200, backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 460 }}>
            <div className="modal-content border-0 rounded-3 overflow-hidden bg-white shadow-lg">
              <div className="p-4 text-white text-center position-relative" style={{ backgroundColor: "#111827" }}>
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={() => setShowInvoiceModal(false)}
                />
                <h5 className="fw-bold mb-0">Generate Monthly Invoice</h5>
                <p className="small mb-0 opacity-75">Issue invoice for {tenantName}</p>
              </div>
              <form onSubmit={handleGenerateInvoiceSubmit}>
                <div className="p-4" style={{ fontSize: "0.85rem" }}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Billing Month</label>
                    <select
                      className="form-select form-select-sm"
                      value={invoiceMonthInput}
                      onChange={(e) => setInvoiceMonthInput(e.target.value)}
                    >
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Billing Year</label>
                    <select
                      className="form-select form-select-sm"
                      value={invoiceYearInput}
                      onChange={(e) => setInvoiceYearInput(Number(e.target.value))}
                    >
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="px-4 py-3 bg-light border-top d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                  <button type="submit" disabled={isGeneratingInvoice} className="btn btn-sm btn-dark text-white px-3">
                    {isGeneratingInvoice ? "Generating..." : "Generate Invoice"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

