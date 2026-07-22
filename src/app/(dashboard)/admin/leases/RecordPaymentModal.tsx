"use client";

import { useState } from "react";
import { api } from "@/utils/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface RecordPaymentModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecordPaymentModal({ user, onClose, onSuccess }: RecordPaymentModalProps) {
  const [payMonth, setPayMonth] = useState(MONTHS[new Date().getMonth()]);
  const [payYear, setPayYear] = useState(new Date().getFullYear());
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Online");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payTxnId, setPayTxnId] = useState("");
  const [payRemarks, setPayRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) {
      alert("Amount is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Fetch or provision agreement for this user (Floor Admin or Office Owner)
      const resAgr = await api.get(`/agreements/user/${user._id}`);
      if (!resAgr.success || !resAgr.data?.agreements?.[0]) {
        throw new Error(resAgr.error || "Failed to locate or provision an agreement for this user.");
      }
      const agreement = resAgr.data.agreements[0];

      // Record payment for agreement
      const res = await api.post(`/agreements/${agreement._id}/payments`, {
        amountPaid: Number(payAmount),
        paymentDate: payDate ? new Date(payDate) : undefined,
        paymentMode: payMethod,
        transactionRef: payTxnId || undefined,
        notes: payRemarks || "Recorded via admin portal",
      });

      if (res.success) {
        alert("Payment recorded successfully!");
        onSuccess();
      } else {
        alert(res.error || "Failed to record payment.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div className="bg-white rounded-3 shadow-lg overflow-hidden w-100 mx-3" style={{ maxWidth: "520px" }}>
        {/* Dark Header */}
        <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: "var(--dark-section)" }}>
          <h6 className="fw-bold mb-0 text-white" style={{ fontSize: "1rem" }}>
            Record Payment
          </h6>
          <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose} style={{ fontSize: "0.8rem" }}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4" style={{ maxHeight: "72vh", overflowY: "auto" }}>
            {/* Personnel Overview */}
            <div className="p-3 bg-light rounded-3 mb-3 border">
              <div className="fw-bold text-dark small">{user.name}</div>
              <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{user.email}</div>
              <hr className="my-2 opacity-10" />
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small" style={{ fontSize: "0.75rem" }}>Monthly Dues:</span>
                <span className="fw-bold text-primary small">₹{(user.monthlyManagementAmount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="row g-3">
              {/* Month */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">Month</label>
                <select
                  className="form-select border shadow-none"
                  style={{ fontSize: "0.85rem", borderRadius: "6px" }}
                  value={payMonth}
                  onChange={(e) => setPayMonth(e.target.value)}
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">Year</label>
                <input
                  type="number"
                  className="form-control border shadow-none"
                  style={{ fontSize: "0.85rem", borderRadius: "6px" }}
                  value={payYear}
                  onChange={(e) => setPayYear(Number(e.target.value))}
                  required
                />
              </div>

              {/* Amount Paid */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">Amount Paid (₹)</label>
                <input
                  type="number"
                  className="form-control border shadow-none"
                  style={{ fontSize: "0.85rem", borderRadius: "6px" }}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">Payment Method</label>
                <select
                  className="form-select border shadow-none"
                  style={{ fontSize: "0.85rem", borderRadius: "6px" }}
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="Online">Online</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Payment Date */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">Payment Date</label>
                <input
                  type="date"
                  className="form-control border shadow-none"
                  style={{ fontSize: "0.85rem", borderRadius: "6px" }}
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                />
              </div>

              {/* Transaction ID */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">Transaction ID / Reference</label>
                <input
                  type="text"
                  className="form-control border shadow-none"
                  style={{ fontSize: "0.85rem", borderRadius: "6px" }}
                  placeholder="Optional txn reference ID"
                  value={payTxnId}
                  onChange={(e) => setPayTxnId(e.target.value)}
                />
              </div>

              {/* Remarks */}
              <div className="col-12">
                <label className="form-label fw-bold text-muted small">Remarks</label>
                <textarea
                  className="form-control border shadow-none"
                  style={{ fontSize: "0.85rem", borderRadius: "6px" }}
                  rows={2}
                  placeholder="Optional payment notes"
                  value={payRemarks}
                  onChange={(e) => setPayRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-top d-flex gap-2 justify-content-end bg-light">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary fw-bold px-3 py-2"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ fontSize: "0.85rem", borderRadius: "4px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm fw-bold text-white px-4 py-2"
              disabled={isSubmitting}
              style={{ fontSize: "0.85rem", borderRadius: "4px", backgroundColor: "var(--dark-section)" }}
            >
              {isSubmitting ? "Recording..." : "Record Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
