"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";

interface VendorDetailViewProps {
  vendorId: string;
  onClose: () => void;
  onEdit: () => void;
  onRefreshList?: () => void;
}

export default function VendorDetailView({
  vendorId,
  onClose,
  onEdit,
  onRefreshList
}: VendorDetailViewProps) {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<"contract" | "invoice" | "payment" | "ticket" | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Quick Action Form States
  const [contractForm, setContractForm] = useState({
    contractType: "Monthly Service",
    startDate: "",
    endDate: "",
    contractValue: "",
    paymentFrequency: "Monthly",
    renewalReminderDays: "30",
    autoRenewal: "No"
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    billingPeriod: "",
    serviceMonth: "",
    invoiceAmount: "",
    taxAmount: "0",
    dueDate: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    invoiceReference: "",
    paidAmount: "",
    paymentDate: "",
    paymentMode: "Bank",
    transactionReference: ""
  });

  const [ticketForm, setTicketForm] = useState({
    issueTitle: "",
    description: "",
    priority: "Medium",
    assignedTo: ""
  });

  // Load Vendor Detail
  const loadVendor = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vendors/${vendorId}`);
      if (res.success) {
        setVendor(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [vendorId]);

  // Handle Quick Action Submission
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setActionSubmitting(true);
    try {
      let endpoint = "";
      let payload: any = {};

      if (activeAction === "contract") {
        endpoint = `/vendors/${vendor._id}/contracts`;
        payload = {
          ...contractForm,
          contractValue: Number(contractForm.contractValue) || 0,
          renewalReminderDays: Number(contractForm.renewalReminderDays) || 30
        };
      } else if (activeAction === "invoice") {
        endpoint = `/vendors/${vendor._id}/invoices`;
        payload = {
          ...invoiceForm,
          invoiceAmount: Number(invoiceForm.invoiceAmount) || 0,
          taxAmount: Number(invoiceForm.taxAmount) || 0
        };
      } else if (activeAction === "payment") {
        endpoint = `/vendors/${vendor._id}/payments`;
        payload = {
          ...paymentForm,
          paidAmount: Number(paymentForm.paidAmount) || 0
        };
      } else if (activeAction === "ticket") {
        endpoint = `/vendors/${vendor._id}/tickets`;
        payload = ticketForm;
      }

      const res = await api.post(endpoint, payload);
      if (res.success) {
        // Reset state
        setActiveAction(null);
        // Refresh local details
        await loadVendor();
        // Refresh parent list
        if (onRefreshList) onRefreshList();
        
        alert(`Successfully recorded ${activeAction}!`);
      } else {
        alert(res.error || "Failed to process action.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setActionSubmitting(false);
    }
  };

  // Calculations for display
  const activeContract = vendor?.contracts && vendor.contracts.length > 0 
    ? vendor.contracts[vendor.contracts.length - 1] 
    : null;

  // Summarize invoices
  const totalAmount = vendor?.invoices ? vendor.invoices.reduce((acc: number, inv: any) => acc + (inv.totalAmount || inv.invoiceAmount || 0), 0) : 0;
  const paidAmount = vendor?.payments ? vendor.payments.reduce((acc: number, p: any) => acc + (p.paidAmount || 0), 0) : 0;
  const pendingAmount = Math.max(0, totalAmount - paidAmount);

  // Performance
  const completedJobs = vendor?.performance?.completedJobs ?? 0;
  const pendingJobs = vendor?.performance?.pendingJobs ?? 0;
  const rating = vendor?.performance?.rating ?? 5.0;

  const initials = vendor?.vendorName 
    ? vendor.vendorName.split(" ").map((n: string) => n[0]).join("").substring(0, 3).toUpperCase() 
    : "VEN";

  // Shared Styles
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#64748b",
    letterSpacing: "0.05em",
    marginBottom: "12px",
    marginTop: "20px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "6px"
  };

  const itemLabelStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    color: "#64748b",
    fontWeight: 500,
    width: "130px",
    flexShrink: 0
  };

  const itemValueStyle: React.CSSProperties = {
    fontSize: "0.82rem",
    color: "#0f172a",
    fontWeight: 600,
    wordBreak: "break-word"
  };

  const actionModalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1200
  };

  const actionModalStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    width: "480px",
    maxWidth: "90%",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    overflow: "hidden"
  };

  if (loading) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center text-muted flex-column gap-2 p-4">
        <span className="spinner-border spinner-border-sm" style={{ color: "#0f172a" }} />
        <span style={{ fontSize: "0.85rem" }}>Loading vendor details...</span>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center text-muted p-4">
        Vendor not found.
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100 bg-white" style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Drawer Header */}
      <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom flex-shrink-0">
        <span className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>Vendor Profile</span>
        <div className="d-flex gap-2 align-items-center">
          <button
            onClick={onEdit}
            className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
            style={{ width: 28, height: 28, borderRadius: 4 }}
            title="Edit Vendor"
          >
            <i className="bi bi-pencil" style={{ fontSize: "0.75rem" }} />
          </button>
          <button
            onClick={onClose}
            className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
            style={{ width: 28, height: 28, borderRadius: 4 }}
            title="Close"
          >
            <i className="bi bi-x-lg" style={{ fontSize: "0.75rem" }} />
          </button>
        </div>
      </div>

      {/* Drawer Scrollable Body */}
      <div className="flex-grow-1 overflow-auto px-4 py-3">
        {/* Profile Avatar / Top Section */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
            style={{
              width: 54,
              height: 54,
              backgroundColor: "#0f172a",
              fontSize: "1.1rem",
              letterSpacing: "0.05em"
            }}
          >
            {initials}
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: "0.95rem" }}>{vendor.vendorName}</h6>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{vendor.vendorCode}</span>
              <span
                className={`badge px-2 py-0.5 rounded-pill ${
                  vendor.status === "Active" ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"
                }`}
                style={{ fontSize: "0.68rem", fontWeight: 700 }}
              >
                {vendor.status || "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Vendor Information */}
        <div style={sectionTitleStyle}>Vendor Information</div>
        <div className="d-flex flex-column gap-2">
          <div className="d-flex">
            <span style={itemLabelStyle}>Company Name</span>
            <span style={itemValueStyle}>{vendor.companyName || vendor.vendorName || "—"}</span>
          </div>
          <div className="d-flex">
            <span style={itemLabelStyle}>Contact Person</span>
            <span style={itemValueStyle}>{vendor.contactName || "—"}</span>
          </div>
          <div className="d-flex">
            <span style={itemLabelStyle}>Phone</span>
            <span style={itemValueStyle}>{vendor.contactNumber || vendor.mobileNumber || "—"}</span>
          </div>
          <div className="d-flex">
            <span style={itemLabelStyle}>Email</span>
            <span style={itemValueStyle}>{vendor.emailId || "—"}</span>
          </div>
          <div className="d-flex">
            <span style={itemLabelStyle}>GST Number</span>
            <span style={itemValueStyle}>{vendor.gstNumber || "—"}</span>
          </div>
          <div className="d-flex">
            <span style={itemLabelStyle}>Address</span>
            <span style={itemValueStyle}>
              {vendor.addressLine1 
                ? `${vendor.addressLine1}, ${vendor.addressLine2 ? vendor.addressLine2 + ", " : ""}${vendor.city}, ${vendor.state} - ${vendor.pincode}`
                : vendor.address || "—"}
            </span>
          </div>
        </div>

        {/* Section 2: Services Provided */}
        <div style={sectionTitleStyle}>Services Provided</div>
        <div className="d-flex flex-wrap gap-1.5 mb-2">
          <span
            className="badge bg-light text-dark border px-3 py-1.5 fw-semibold"
            style={{ fontSize: "0.75rem", borderRadius: 4 }}
          >
            {vendor.vendorCategory || "Maintenance"}
          </span>
          {vendor.services && vendor.services.map((s: any, idx: number) => (
            <span
              key={idx}
              className="badge bg-light text-dark border px-3 py-1.5 fw-semibold"
              style={{ fontSize: "0.75rem", borderRadius: 4 }}
            >
              {s.serviceName}
            </span>
          ))}
        </div>

        {/* Section 3: Contract Details */}
        <div style={sectionTitleStyle}>Contract Details</div>
        <div className="d-flex flex-column gap-2">
          <div className="d-flex">
            <span style={itemLabelStyle}>Start Date</span>
            <span style={itemValueStyle}>
              {activeContract?.startDate 
                ? new Date(activeContract.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
                : "—"}
            </span>
          </div>
          <div className="d-flex">
            <span style={itemLabelStyle}>End Date</span>
            <span style={itemValueStyle}>
              {activeContract?.endDate 
                ? new Date(activeContract.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
                : "—"}
            </span>
          </div>
          <div className="d-flex">
            <span style={itemLabelStyle}>Contract Value</span>
            <span style={itemValueStyle}>
              {activeContract?.contractValue 
                ? `₹ ${Number(activeContract.contractValue).toLocaleString("en-IN")}` 
                : "—"}
            </span>
          </div>
        </div>

        {/* Section 4: Payment Summary */}
        <div style={sectionTitleStyle}>Payment Summary</div>
        <div className="d-flex flex-column gap-2">
          <div className="d-flex">
            <span style={itemLabelStyle}>Total Amount</span>
            <span style={itemValueStyle}>₹ {totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="d-flex">
            <span style={itemLabelStyle}>Paid Amount</span>
            <span style={itemValueStyle} className="text-success">₹ {paidAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="d-flex">
            <span style={itemLabelStyle}>Pending Amount</span>
            <span style={itemValueStyle} className={pendingAmount > 0 ? "text-danger" : ""}>
              ₹ {pendingAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Section 5: Performance */}
        <div style={sectionTitleStyle}>Performance</div>
        <div className="row g-2 mb-3 mt-1">
          <div className="col-4">
            <div className="border rounded p-2 text-center bg-light">
              <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>{completedJobs}</div>
              <div className="text-muted" style={{ fontSize: "0.65rem", fontWeight: 600 }}>Completed Jobs</div>
            </div>
          </div>
          <div className="col-4">
            <div className="border rounded p-2 text-center bg-light">
              <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>{pendingJobs}</div>
              <div className="text-muted" style={{ fontSize: "0.65rem", fontWeight: 600 }}>Pending Tickets</div>
            </div>
          </div>
          <div className="col-4">
            <div className="border rounded p-2 text-center bg-light">
              <div className="fw-bold text-dark d-flex align-items-center justify-content-center gap-1" style={{ fontSize: "0.95rem" }}>
                <i className="bi bi-star-fill text-warning" style={{ fontSize: "0.75rem" }} />
                {Number(rating).toFixed(1)}
              </div>
              <div className="text-muted" style={{ fontSize: "0.65rem", fontWeight: 600 }}>Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="px-4 py-3 border-top bg-light flex-shrink-0">
        <span className="fw-bold text-muted text-uppercase mb-2 d-block" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>Quick Operations</span>
        
        <div className="d-flex flex-column gap-2">
          <div className="d-flex gap-2">
            <button
              onClick={() => setActiveAction("contract")}
              className="btn btn-sm text-white flex-grow-1 fw-semibold py-2"
              style={{ backgroundColor: "#0f172a", fontSize: "0.78rem" }}
            >
              Create Contract
            </button>
            <button
              onClick={() => setActiveAction("invoice")}
              className="btn btn-sm btn-outline-dark flex-grow-1 fw-semibold py-2"
              style={{ fontSize: "0.78rem" }}
            >
              Generate Invoice
            </button>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => {
                // Pre-fill first unpaid invoice if available
                const firstUnpaid = vendor.invoices?.find((inv: any) => {
                  let paid = 0;
                  vendor.payments?.forEach((p: any) => {
                    if (p.invoiceReference === inv.invoiceNumber) paid += p.paidAmount || 0;
                  });
                  return (inv.totalAmount || inv.invoiceAmount || 0) - paid > 0;
                });
                
                setPaymentForm(p => ({
                  ...p,
                  invoiceReference: firstUnpaid?.invoiceNumber || "",
                  paidAmount: firstUnpaid ? String((firstUnpaid.totalAmount || firstUnpaid.invoiceAmount || 0) - (vendor.payments?.filter((py: any) => py.invoiceReference === firstUnpaid.invoiceNumber).reduce((a: number, b: any) => a + (b.paidAmount || 0), 0) || 0)) : ""
                }));
                setActiveAction("payment");
              }}
              className="btn btn-sm btn-outline-dark flex-grow-1 fw-semibold py-2"
              style={{ fontSize: "0.78rem" }}
            >
              Record Payment
            </button>
            <button
              onClick={() => setActiveAction("ticket")}
              className="btn btn-sm btn-outline-dark flex-grow-1 fw-semibold py-2"
              style={{ fontSize: "0.78rem" }}
            >
              Raise Service Request
            </button>
          </div>
        </div>
      </div>

      {/* ─── QUICK OPERATIONS FORMS OVERLAYS ─────────────────────────────────── */}
      
      {/* 1. Create Contract Overlay */}
      {activeAction === "contract" && (
        <div style={actionModalOverlayStyle}>
          <div style={actionModalStyle}>
            <div className="bg-dark px-4 py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-white fw-bold" style={{ fontSize: "0.88rem" }}>Create Vendor Contract</h6>
              <button type="button" onClick={() => setActiveAction(null)} className="text-white bg-transparent border-0" style={{ fontSize: "1.1rem" }}>×</button>
            </div>
            <form onSubmit={handleActionSubmit} className="p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Contract Type</label>
                <select
                  className="form-select form-select-sm"
                  value={contractForm.contractType}
                  onChange={e => setContractForm(p => ({ ...p, contractType: e.target.value }))}
                >
                  <option value="AMC">AMC</option>
                  <option value="Monthly Service">Monthly Service</option>
                  <option value="One Time">One Time</option>
                  <option value="Supply Contract">Supply Contract</option>
                </select>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Start Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    required
                    value={contractForm.startDate}
                    onChange={e => setContractForm(p => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>End Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    required
                    value={contractForm.endDate}
                    onChange={e => setContractForm(p => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Contract Value (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Total contract amount"
                    required
                    value={contractForm.contractValue}
                    onChange={e => setContractForm(p => ({ ...p, contractValue: e.target.value }))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Payment Frequency</label>
                  <select
                    className="form-select form-select-sm"
                    value={contractForm.paymentFrequency}
                    onChange={e => setContractForm(p => ({ ...p, paymentFrequency: e.target.value }))}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Renewal Reminder Days</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={contractForm.renewalReminderDays}
                    onChange={e => setContractForm(p => ({ ...p, renewalReminderDays: e.target.value }))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Auto Renewal</label>
                  <select
                    className="form-select form-select-sm"
                    value={contractForm.autoRenewal}
                    onChange={e => setContractForm(p => ({ ...p, autoRenewal: e.target.value }))}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-2">
                <button type="button" onClick={() => setActiveAction(null)} className="btn btn-sm btn-outline-secondary px-3">Cancel</button>
                <button type="submit" disabled={actionSubmitting} className="btn btn-sm text-white px-4 fw-bold" style={{ backgroundColor: "#0f172a" }}>
                  {actionSubmitting ? "Creating..." : "Create Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Generate Invoice Overlay */}
      {activeAction === "invoice" && (
        <div style={actionModalOverlayStyle}>
          <div style={actionModalStyle}>
            <div className="bg-dark px-4 py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-white fw-bold" style={{ fontSize: "0.88rem" }}>Generate Vendor Bill/Invoice</h6>
              <button type="button" onClick={() => setActiveAction(null)} className="text-white bg-transparent border-0" style={{ fontSize: "1.1rem" }}>×</button>
            </div>
            <form onSubmit={handleActionSubmit} className="p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Invoice Number</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. INV-2026-001"
                  required
                  value={invoiceForm.invoiceNumber}
                  onChange={e => setInvoiceForm(p => ({ ...p, invoiceNumber: e.target.value }))}
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Invoice Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    required
                    value={invoiceForm.invoiceDate}
                    onChange={e => setInvoiceForm(p => ({ ...p, invoiceDate: e.target.value }))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Due Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    required
                    value={invoiceForm.dueDate}
                    onChange={e => setInvoiceForm(p => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Service Month</label>
                  <select
                    className="form-select form-select-sm"
                    required
                    value={invoiceForm.serviceMonth}
                    onChange={e => setInvoiceForm(p => ({ ...p, serviceMonth: e.target.value }))}
                  >
                    <option value="">Select Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Billing Period</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. 1 Jun - 30 Jun"
                    value={invoiceForm.billingPeriod}
                    onChange={e => setInvoiceForm(p => ({ ...p, billingPeriod: e.target.value }))}
                  />
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Bill Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Exclude tax"
                    required
                    value={invoiceForm.invoiceAmount}
                    onChange={e => setInvoiceForm(p => ({ ...p, invoiceAmount: e.target.value }))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Tax Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="e.g. 18% GST"
                    value={invoiceForm.taxAmount}
                    onChange={e => setInvoiceForm(p => ({ ...p, taxAmount: e.target.value }))}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-2">
                <button type="button" onClick={() => setActiveAction(null)} className="btn btn-sm btn-outline-secondary px-3">Cancel</button>
                <button type="submit" disabled={actionSubmitting} className="btn btn-sm text-white px-4 fw-bold" style={{ backgroundColor: "#0f172a" }}>
                  {actionSubmitting ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Record Payment Overlay */}
      {activeAction === "payment" && (
        <div style={actionModalOverlayStyle}>
          <div style={actionModalStyle}>
            <div className="bg-dark px-4 py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-white fw-bold" style={{ fontSize: "0.88rem" }}>Record Vendor Payment</h6>
              <button type="button" onClick={() => setActiveAction(null)} className="text-white bg-transparent border-0" style={{ fontSize: "1.1rem" }}>×</button>
            </div>
            <form onSubmit={handleActionSubmit} className="p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Invoice Reference</label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={paymentForm.invoiceReference}
                  onChange={e => {
                    const invNo = e.target.value;
                    const matchedInv = vendor.invoices?.find((i: any) => i.invoiceNumber === invNo);
                    const alreadyPaid = vendor.payments?.filter((py: any) => py.invoiceReference === invNo).reduce((a: number, b: any) => a + (b.paidAmount || 0), 0) || 0;
                    const remaining = matchedInv ? Math.max(0, (matchedInv.totalAmount || matchedInv.invoiceAmount || 0) - alreadyPaid) : 0;
                    
                    setPaymentForm(p => ({ 
                      ...p, 
                      invoiceReference: invNo,
                      paidAmount: remaining > 0 ? String(remaining) : ""
                    }));
                  }}
                >
                  <option value="">Select Invoice</option>
                  {vendor.invoices && vendor.invoices.map((inv: any, idx: number) => {
                    // Calc pending amount for label
                    const totalInv = inv.totalAmount || inv.invoiceAmount || 0;
                    const paid = vendor.payments?.filter((py: any) => py.invoiceReference === inv.invoiceNumber).reduce((a: number, b: any) => a + (b.paidAmount || 0), 0) || 0;
                    const remaining = totalInv - paid;
                    if (remaining <= 0) return null;
                    return (
                      <option key={idx} value={inv.invoiceNumber}>
                        {inv.invoiceNumber} (Pending: ₹{remaining.toLocaleString("en-IN")})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Paid Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Amount paid"
                    required
                    value={paymentForm.paidAmount}
                    onChange={e => setPaymentForm(p => ({ ...p, paidAmount: e.target.value }))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Payment Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    required
                    value={paymentForm.paymentDate}
                    onChange={e => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Payment Mode</label>
                  <select
                    className="form-select form-select-sm"
                    value={paymentForm.paymentMode}
                    onChange={e => setPaymentForm(p => ({ ...p, paymentMode: e.target.value }))}
                  >
                    <option value="Bank">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Transaction Reference</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="TXN ID / Cheque No"
                    required
                    value={paymentForm.transactionReference}
                    onChange={e => setPaymentForm(p => ({ ...p, transactionReference: e.target.value }))}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-2">
                <button type="button" onClick={() => setActiveAction(null)} className="btn btn-sm btn-outline-secondary px-3">Cancel</button>
                <button type="submit" disabled={actionSubmitting} className="btn btn-sm text-white px-4 fw-bold" style={{ backgroundColor: "#0f172a" }}>
                  {actionSubmitting ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Raise Service Request Overlay */}
      {activeAction === "ticket" && (
        <div style={actionModalOverlayStyle}>
          <div style={actionModalStyle}>
            <div className="bg-dark px-4 py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-white fw-bold" style={{ fontSize: "0.88rem" }}>Raise Vendor Ticket / Complaint</h6>
              <button type="button" onClick={() => setActiveAction(null)} className="text-white bg-transparent border-0" style={{ fontSize: "1.1rem" }}>×</button>
            </div>
            <form onSubmit={handleActionSubmit} className="p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Issue Title</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Lift Door Jammed, Security Guard absent"
                  required
                  value={ticketForm.issueTitle}
                  onChange={e => setTicketForm(p => ({ ...p, issueTitle: e.target.value }))}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Description</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  placeholder="Detailed description of the complaint"
                  required
                  value={ticketForm.description}
                  onChange={e => setTicketForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Priority</label>
                  <select
                    className="form-select form-select-sm"
                    value={ticketForm.priority}
                    onChange={e => setTicketForm(p => ({ ...p, priority: e.target.value }))}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold text-muted" style={{ fontSize: "0.75rem" }}>Assign To</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Staff name / department"
                    value={ticketForm.assignedTo}
                    onChange={e => setTicketForm(p => ({ ...p, assignedTo: e.target.value }))}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-2">
                <button type="button" onClick={() => setActiveAction(null)} className="btn btn-sm btn-outline-secondary px-3">Cancel</button>
                <button type="submit" disabled={actionSubmitting} className="btn btn-sm text-white px-4 fw-bold" style={{ backgroundColor: "#0f172a" }}>
                  {actionSubmitting ? "Raising..." : "Raise Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
