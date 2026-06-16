"use client";
import React from "react";

const PAYMENT_MODES = [
  { label: "UPI", icon: "📱" },
  { label: "Cash", icon: "💵" },
  { label: "Bank Transfer", icon: "🏦" },
  { label: "Cheque", icon: "📄" },
  { label: "Card", icon: "💳" },
  { label: "Other", icon: "⚙️" },
];

interface RecordPaymentModalProps {
  agreement: any;
  amountInput: string;
  setAmountInput: (v: string) => void;
  dateInput: string;
  setDateInput: (v: string) => void;
  modeInput: string;
  setModeInput: (v: string) => void;
  refInput: string;
  setRefInput: (v: string) => void;
  notesInput: string;
  setNotesInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const fmt = (n?: number) =>
  n != null ? "₹" + n.toLocaleString("en-IN") : "₹0";

export default function RecordPaymentModal({
  agreement,
  amountInput,
  setAmountInput,
  dateInput,
  setDateInput,
  modeInput,
  setModeInput,
  refInput,
  setRefInput,
  notesInput,
  setNotesInput,
  onSubmit,
  onClose,
  isSubmitting,
}: RecordPaymentModalProps) {
  const total = agreement?.totalAmount || 0;
  const paid = agreement?.paidAmount || 0;
  const pending = agreement?.pendingAmount || total - paid;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15,23,42,0.65)",
          backdropFilter: "blur(8px)",
          zIndex: 1199,
        }}
      />

      {/* ── Modal Shell ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            maxHeight: "90vh",
            backgroundColor: "#ffffff",
            borderRadius: 20,
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            overflow: "hidden",
            pointerEvents: "all",
            fontFamily: "var(--font-geist-sans, Inter, sans-serif)",
            display: "flex",
            flexDirection: "column",
          }}
        >

          {/* ── HEADER ── */}
          <div
            style={{
              background: "#343a40",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h5
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "#fff",
                  letterSpacing: "-0.01em",
                }}
              >
                Record Payment
              </h5>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 2,
                }}
              >
                {agreement?.agreementNumber || "Agreement"} ·{" "}
                {agreement?.paymentType || "Monthly"}
              </p>
            </div>
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#fff",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                opacity: 0.8,
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.8")}
            >
              ×
            </button>
          </div>

          {/* ── FINANCIAL SUMMARY BANNER ── */}
          <div
            style={{
              background: "#f8faff",
              borderBottom: "1px solid #e8eef8",
              padding: "16px 24px",
            }}
          >
            {/* 3-column stat row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                marginBottom: 14,
              }}
            >
              {/* Total */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  Total Amount
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#1e293b",
                  }}
                >
                  {fmt(total)}
                </div>
              </div>

              {/* Paid */}
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#16a34a",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  Paid
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#15803d",
                  }}
                >
                  {fmt(paid)}
                </div>
              </div>

              {/* Pending */}
              <div
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: 8,
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#ea580c",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  Pending
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#c2410c",
                  }}
                >
                  {fmt(pending)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                  Payment Progress
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: paidPct >= 100 ? "#16a34a" : paidPct >= 50 ? "#0266e8" : "#ea580c",
                  }}
                >
                  {paidPct}% Paid
                </span>
              </div>
              <div
                style={{
                  height: 7,
                  background: "#e2e8f0",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(paidPct, 100)}%`,
                    background:
                      paidPct >= 100
                        ? "linear-gradient(90deg,#16a34a,#22c55e)"
                        : paidPct >= 50
                        ? "linear-gradient(90deg,#0266e8,#60a5fa)"
                        : "linear-gradient(90deg,#f97316,#fb923c)",
                    borderRadius: 99,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── FORM BODY ── */}
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", flexGrow: 1 }}>

              {/* Row 1: Amount + Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                {/* Amount */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#343a40",
                      marginBottom: 6,
                    }}
                  >
                    Amount (₹) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "0.9rem",
                        pointerEvents: "none",
                      }}
                    >
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={pending}
                      value={amountInput}
                      onChange={e => setAmountInput(e.target.value)}
                      placeholder={String(pending || 0)}
                      style={{
                        width: "100%",
                        paddingLeft: 26,
                        paddingRight: 12,
                        paddingTop: 8,
                        paddingBottom: 8,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        border: "1px solid #cbd5e0",
                        borderRadius: 8,
                        outline: "none",
                        background: "#ffffff",
                        color: "#1e293b",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#0266e8")}
                      onBlur={e => (e.target.style.borderColor = "#cbd5e0")}
                    />
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 4 }}>
                    Max: {fmt(pending)}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#343a40",
                      marginBottom: 6,
                    }}
                  >
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={e => setDateInput(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "0.9rem",
                      border: "1px solid #cbd5e0",
                      borderRadius: 8,
                      outline: "none",
                      background: "#ffffff",
                      color: "#1e293b",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#0266e8")}
                    onBlur={e => (e.target.style.borderColor = "#cbd5e0")}
                  />
                </div>
              </div>

              {/* Payment Mode Pills */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#343a40",
                    marginBottom: 8,
                  }}
                >
                  Payment Mode *
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PAYMENT_MODES.map(({ label, icon }) => {
                    const isActive = modeInput === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setModeInput(label)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: isActive ? "1.5px solid #0266e8" : "1px solid #cbd5e0",
                          background: isActive ? "#eff6ff" : "#fff",
                          color: isActive ? "#0266e8" : "#4a5568",
                          fontSize: "0.8rem",
                          fontWeight: isActive ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem" }}>{icon}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transaction Ref */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#343a40",
                    marginBottom: 6,
                  }}
                >
                  Transaction / Reference No.
                </label>
                <input
                  type="text"
                  value={refInput}
                  onChange={e => setRefInput(e.target.value)}
                  placeholder="e.g. UTR123456789, CHQ-00421"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "0.9rem",
                    border: "1px solid #cbd5e0",
                    borderRadius: 8,
                    outline: "none",
                    background: "#ffffff",
                    color: "#1e293b",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#0266e8")}
                  onBlur={e => (e.target.style.borderColor = "#cbd5e0")}
                />
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 4 }}>
                  Auto-generated receipt ID if left blank.
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#343a40",
                    marginBottom: 6,
                  }}
                >
                  Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  placeholder="e.g. Partial payment for June, paid via NEFT"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "0.9rem",
                    border: "1px solid #cbd5e0",
                    borderRadius: 8,
                    outline: "none",
                    background: "#ffffff",
                    color: "#1e293b",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#0266e8")}
                  onBlur={e => (e.target.style.borderColor = "#cbd5e0")}
                />
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div
              style={{
                background: "#f8faff",
                borderTop: "1px solid #cbd5e0",
                padding: "14px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              {/* Left hint */}
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                🔒 Payment is recorded securely
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e0",
                    background: "#fff",
                    color: "#4a5568",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#f1f5f9";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: isSubmitting ? "#94a3b8" : "#0266e8",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(255,255,255,0.4)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                      Recording…
                    </>
                  ) : (
                    <>Confirm Payment</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
