"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";

export default function InvoicePrintPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [inv, setInv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/payments/${id}`);
        if (res.success && res.data) {
          setInv(res.data);
        } else {
          setError(res.error || "Failed to load payment details");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while loading payment details");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  useEffect(() => {
    if (inv) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [inv]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-white" style={{ minHeight: "80vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !inv) {
    return (
      <div className="container p-5 text-center bg-white" style={{ minHeight: "80vh" }}>
        <h5 className="text-danger mb-3">{error || "Payment record not found"}</h5>
        <button className="btn btn-sm btn-dark" onClick={() => router.push("/admin/payments")}>
          Back to Payments
        </button>
      </div>
    );
  }

  const leaseObj = inv.lease || inv.leaseId;
  const tenantName = inv.tenantName || leaseObj?.tenantName || inv.user?.name || inv.tenantId?.name || "—";
  const propertyName = leaseObj?.property?.propertyName || "—";
  const unitNumber = leaseObj?.units?.[0]?.unitNumber || "—";
  const floorName = leaseObj?.floor?.floorName || "—";
  const propertyAddress = leaseObj?.property?.address || "—";
  const leaseId = leaseObj?._id ? `LSE-${leaseObj._id.toString().slice(-6).toUpperCase()}` : "—";
  const billingPeriod = inv.month && inv.year ? `${inv.month} ${inv.year}` : "—";

  const invoiceDate = inv.invoiceDate 
    ? new Date(inv.invoiceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
    : (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
    
  const dueDate = inv.dueDate 
    ? new Date(inv.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
    : "—";
    
  const invoiceNumber = inv.invoiceNumber || (inv._id ? `INV-${inv._id.toString().slice(-6).toUpperCase()}` : "—");
  
  const rentAmount = Number(leaseObj?.rentAmount || 0);
  const maintenanceCharges = Number(leaseObj?.maintenanceCharges || 0);
  const subTotal = rentAmount + maintenanceCharges > 0 ? (rentAmount + maintenanceCharges) : Number(inv.amount || 0);
  const totalAmount = subTotal;
  const paidAmount = Number(inv.paidAmount || 0);
  const amountDue = Math.max(0, totalAmount - paidAmount);

  const paymentDate = inv.paymentDate 
    ? new Date(inv.paymentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
    : (inv.status === "Paid" && inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
    
  const paymentMethod = inv.paymentMethod || "—";
  const transactionId = inv.transactionId || "—";
  const paymentReference = inv.paymentReference || (inv._id ? `PAY-${inv._id.toString().slice(-6).toUpperCase()}` : "—");

  return (
    <div style={{ backgroundColor: "#ffffff", color: "var(--text-primary)", minHeight: "100vh", padding: "40px" }}>
      <div 
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "30px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff"
        }}
        className="invoice-card"
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded text-warning fw-bold"
              style={{ width: "36px", height: "36px", fontSize: "1.2rem" }}
            >
              🏢
            </div>
            <div>
              <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#040404" }}>ANVAYA360</div>
              <div className="text-muted" style={{ fontSize: "0.72rem" }}>All in one App</div>
            </div>
          </div>
          <div className="text-end">
            <h1 className="fw-extrabold m-0 text-dark" style={{ fontSize: "1.5rem", letterSpacing: "0.05em" }}>INVOICE</h1>
            <div className="text-muted small"># {invoiceNumber}</div>
          </div>
        </div>

        {/* Info Section */}
        <div className="row g-3 mb-4">
          <div className="col-4">
            <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
              Billed From
            </div>
            <div className="fw-bold text-dark small" style={{ fontSize: "0.85rem" }}>
              Anvaya360 Services Pvt Ltd
            </div>
            <div className="text-muted mt-1 lh-base" style={{ fontSize: "0.74rem" }}>
              Suite 501, 5th Floor, Valley Towers,<br />
              Sector 62, Noida, UP - 201301<br />
              GSTIN: 09AAHCA9081B1ZX<br />
              Email: billing@anvaya360.com
            </div>
          </div>
          <div className="col-4">
            <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
              Billed To
            </div>
            <div className="fw-bold text-dark small" style={{ fontSize: "0.85rem" }}>
              {tenantName}
            </div>
            <div className="text-muted mt-1 lh-base" style={{ fontSize: "0.74rem" }}>
              {propertyName}<br />
              Unit {unitNumber} ({floorName})<br />
              {propertyAddress}<br />
              Email: {inv.tenantId?.email || inv.user?.email || leaseObj?.tenantEmail || "—"}
            </div>
          </div>
          <div className="col-4">
            <table className="w-100 text-muted" style={{ fontSize: "0.74rem" }}>
              <tbody>
                <tr>
                  <td className="py-1">Invoice Date</td>
                  <td className="py-1 fw-bold text-dark text-end">: {invoiceDate}</td>
                </tr>
                <tr>
                  <td className="py-1">Due Date</td>
                  <td className="py-1 fw-bold text-dark text-end">: {dueDate}</td>
                </tr>
                <tr>
                  <td className="py-1">Billing Period</td>
                  <td className="py-1 fw-bold text-dark text-end">: {billingPeriod}</td>
                </tr>
                <tr>
                  <td className="py-1">Lease ID</td>
                  <td className="py-1 fw-bold text-dark text-end">: {leaseId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table className="table table-sm table-borderless align-middle mb-4" style={{ fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#F9F7F3" }}>
              <th className="py-2 px-3 text-muted fw-bold text-uppercase" style={{ fontSize: "0.68rem" }}>Description</th>
              <th className="py-2 px-3 text-muted fw-bold text-uppercase text-end" style={{ fontSize: "0.68rem" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-bottom" style={{ borderColor: "var(--border-color)" }}>
              <td className="py-2 px-3 text-muted">Monthly Rent</td>
              <td className="py-2 px-3 text-dark fw-bold text-end">{rentAmount.toFixed(2)}</td>
            </tr>
            <tr className="border-bottom" style={{ borderColor: "var(--border-color)" }}>
              <td className="py-2 px-3 text-muted">Maintenance Charges</td>
              <td className="py-2 px-3 text-dark fw-bold text-end">{maintenanceCharges.toFixed(2)}</td>
            </tr>
            <tr className="border-bottom" style={{ borderColor: "var(--border-color)" }}>
              <td className="py-2 px-3 text-muted">Other Charges</td>
              <td className="py-2 px-3 text-dark fw-bold text-end">0.00</td>
            </tr>
            <tr className="border-bottom" style={{ borderColor: "var(--border-color)" }}>
              <td className="py-2 px-3 fw-bold text-dark">Sub Total</td>
              <td className="py-2 px-3 fw-bold text-dark text-end">{subTotal.toFixed(2)}</td>
            </tr>
            <tr className="border-bottom" style={{ borderColor: "var(--border-color)" }}>
              <td className="py-2 px-3 text-muted">Tax (0%)</td>
              <td className="py-2 px-3 text-muted text-end">0.00</td>
            </tr>
            <tr style={{ backgroundColor: "#F9F7F3" }}>
              <td className="py-2 px-3 fw-extrabold text-dark">Total Invoice Amount</td>
              <td className="py-2 px-3 fw-extrabold text-success text-end" style={{ fontSize: "0.85rem" }}>
                ₹ {subTotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Summary Box */}
        <div className="d-flex justify-content-end mb-4">
          <div style={{ width: "220px" }}>
            <div className="d-flex justify-content-between align-items-center mb-1 text-muted" style={{ fontSize: "0.78rem" }}>
              <span className="fw-semibold">Amount Paid</span>
              <span className="fw-bold text-dark">₹ {paidAmount.toFixed(2)}</span>
            </div>
            <div
              className="d-flex justify-content-between align-items-center text-white px-3 py-2 rounded-2 fw-bold"
              style={{ backgroundColor: "#10B981", fontSize: "0.8rem" }}
            >
              <span>Amount Due</span>
              <span>₹ {amountDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border-top pt-3">
          <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
            Payment Details
          </div>
          <table className="w-100 text-muted" style={{ fontSize: "0.78rem" }}>
            <tbody>
              <tr>
                <td className="py-1" style={{ width: "140px" }}>Payment Date</td>
                <td className="py-1 fw-bold text-dark">: {paymentDate}</td>
              </tr>
              <tr>
                <td className="py-1">Payment Mode</td>
                <td className="py-1 fw-bold text-dark">: {paymentMethod}</td>
              </tr>
              <tr>
                <td className="py-1">Transaction ID</td>
                <td className="py-1 fw-bold text-dark">: {transactionId}</td>
              </tr>
              <tr>
                <td className="py-1">Payment Reference</td>
                <td className="py-1 fw-bold text-dark">: {paymentReference}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Thank You message */}
        <div className="text-center text-success fw-bold mt-4" style={{ fontSize: "0.9rem" }}>
          Thank you for your payment!
        </div>
      </div>

      {/* Floating Back Button for non-print view */}
      <div className="text-center mt-4 d-print-none">
        <button 
          onClick={() => router.push("/admin/payments")} 
          className="btn btn-sm btn-outline-secondary px-4 py-2 rounded-3"
          style={{ fontSize: "0.8rem", fontWeight: "600" }}
        >
          Back to Payments
        </button>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            padding: 0 !important;
          }
          .invoice-card {
            border: none !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .d-print-none {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
