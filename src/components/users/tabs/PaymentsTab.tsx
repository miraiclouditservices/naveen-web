"use client";
import React from "react";

interface PaymentsTabProps {
  viewUser: any;
  agreementData: any;
  loadingAgreement: boolean;
  generateInstallments: (user: any, agr: any, payments: any[]) => any[];
  onRecordPayment: (agr: any, amount: string) => void;
}

export default function PaymentsTab({
  viewUser,
  agreementData,
  loadingAgreement,
  generateInstallments,
  onRecordPayment,
}: PaymentsTabProps) {
  const activeAgr = agreementData?.agreements?.[0] || null;
  const paymentsList = activeAgr?.payments || [];
  const installments = generateInstallments(viewUser, activeAgr, paymentsList);

  const startStr = activeAgr?.startDate || viewUser?.floorAssignmentStartDate;
  const endStr = activeAgr?.endDate || viewUser?.floorAssignmentEndDate;
  const term = startStr && endStr
    ? (() => {
        const s = new Date(startStr);
        const e = new Date(endStr);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return 12;
        return Math.max((e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1, 1);
      })()
    : 12;

  const totalAmount = activeAgr?.totalAmount || viewUser?.totalAgreementAmount || ((viewUser?.monthlyManagementAmount || 0) * term);
  const paymentType = activeAgr?.paymentType || viewUser?.paymentType || "Monthly";
  const totalPaid = activeAgr?.totalPaid || 0;
  const pendingAmount = activeAgr?.pendingAmount || Math.max(0, totalAmount - totalPaid);
  const intervalMonths = paymentType.includes("Quarterly") ? 3 : paymentType.includes("Half-Yearly") ? 6 : paymentType.includes("Yearly") ? 12 : 1;
  const numInst = Math.max(1, Math.ceil(term / intervalMonths));
  const instAmount = Math.ceil(totalAmount / numInst);

  const displayAgr = activeAgr || {
    _id: "virtual-agreement",
    agreementNumber: `AGB-VRT-${viewUser._id?.slice(-6).toUpperCase() || "NEW"}`,
    paymentType,
    totalAmount,
    pendingAmount,
    installmentAmount: instAmount,
    payments: [],
  };

  // Replace AGR- with AGB- dynamically for display if needed
  const displayAgrNo = (displayAgr.agreementNumber || "").replace("AGR-", "AGB-");

  const statusColors: Record<string, string> = {
    Paid: "bg-success bg-opacity-10 text-success",
    Partial: "bg-warning bg-opacity-10 text-warning",
    "Partial Paid": "bg-warning bg-opacity-10 text-warning",
    "Partially Paid": "bg-warning bg-opacity-10 text-warning",
    Pending: "bg-danger bg-opacity-10 text-danger",
  };

  const getStatusText = (status: string) => {
    if (status === "Partial" || status === "Partial Paid" || status === "Partially Paid") {
      return "Partially Paid";
    }
    return status;
  };

  return (
    <div className="text-start d-flex flex-column gap-4">
      {/* 4 Top Bento Cards */}
      <div className="row g-3">
        {[
          { 
            label: "Total Agreement", 
            subLabel: "Agreement Amount", 
            value: agreementData?.summary?.totalAmount || totalAmount, 
            color: "#1a73e8", 
            bgColor: "#e8f0fe", 
            icon: "bi bi-file-earmark-text", 
            isCount: false,
            valColor: "text-dark"
          },
          { 
            label: "Total Paid", 
            subLabel: "Amount Paid", 
            value: agreementData?.summary?.totalPaid || totalPaid, 
            color: "#137333", 
            bgColor: "#e6f4ea", 
            icon: "bi bi-wallet2", 
            isCount: false,
            valColor: "text-success"
          },
          { 
            label: "Pending Balance", 
            subLabel: "Remaining Amount", 
            value: agreementData?.summary?.totalPending || pendingAmount, 
            color: "#c5221f", 
            bgColor: "#fce8e6", 
            icon: "bi bi-info-circle", 
            isCount: false,
            valColor: "text-danger"
          },
          { 
            label: "Active Agreements", 
            subLabel: "Total Agreements", 
            value: agreementData?.summary?.activeCount || 1, 
            color: "#a142f4", 
            bgColor: "#f3e8fd", 
            icon: "bi bi-file-earmark-check", 
            isCount: true,
            valColor: "text-dark"
          },
        ].map((s, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-3">
            <div className="bg-white border rounded-4 p-4 d-flex flex-column gap-2" style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: "40px", height: "40px", backgroundColor: s.bgColor, color: s.color }}>
                <i className={`${s.icon} fs-5`} />
              </div>
              <div className="mt-2">
                <div className="text-muted small fw-medium mb-1" style={{ fontSize: "0.82rem" }}>{s.label}</div>
                <div className={`fw-bold ${s.valColor}`} style={{ fontSize: "1.6rem", fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.03em" }}>
                  {s.isCount ? s.value : `₹ ${Number(s.value || 0).toLocaleString("en-IN")}`}
                </div>
                <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>{s.subLabel}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Installment Schedule Card */}
      <div className="bg-white border rounded-4 p-4" style={{ borderColor: "#e2e8f0" }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center justify-content-center rounded-3 bg-light" style={{ width: "36px", height: "36px" }}>
              <i className="bi bi-calendar3 text-primary fs-5" />
            </div>
            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.05rem" }}>Installment Schedule</h5>
          </div>
        </div>
        {installments.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderColor: "#f1f5f9" }}>
                <thead>
                  <tr className="border-bottom">
                    {["Invoice No", "Due Date", "Amount", "Paid", "Balance", "Status"].map(h => (
                      <th key={h} className="bg-light border-0 py-3 px-3 text-muted fw-bold" style={{ fontSize: "0.75rem" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {installments.map((inst) => (
                    <tr key={inst.invoiceNo} className="border-bottom">
                      <td className="py-3 px-3 fw-bold text-dark" style={{ fontSize: "0.82rem" }}>{inst.invoiceNo}</td>
                      <td className="py-3 px-3 text-muted" style={{ fontSize: "0.82rem" }}>{inst.dueDate}</td>
                      <td className="py-3 px-3 fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>₹ {Number(inst.amount || 0).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 fw-semibold text-success" style={{ fontSize: "0.85rem" }}>
                        {inst.paid > 0 ? `₹ ${Number(inst.paid).toLocaleString("en-IN")}` : "₹ 0"}
                      </td>
                      <td className="py-3 px-3 fw-semibold text-danger" style={{ fontSize: "0.85rem" }}>
                        {inst.balance > 0 ? `₹ ${Number(inst.balance).toLocaleString("en-IN")}` : "₹ 0"}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`badge rounded-pill px-3 py-1.5 ${statusColors[inst.status] || "bg-danger bg-opacity-10 text-danger"}`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                          {getStatusText(inst.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sub-panel below Installment Schedule Table */}
            <div className="mt-4 p-3 rounded-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#f4f7fd", border: "1px solid #e2e8f0" }}>
              {[
                { label: "Total Due", value: `₹ ${Number(totalAmount).toLocaleString("en-IN")}`, icon: "bi bi-file-earmark-text", color: "#1a73e8", bgColor: "#e8f0fe" },
                { label: "Total Paid", value: `₹ ${Number(totalPaid).toLocaleString("en-IN")}`, icon: "bi bi-wallet2", color: "#137333", bgColor: "#e6f4ea" },
                { label: "Remaining Balance", value: `₹ ${Number(pendingAmount).toLocaleString("en-IN")}`, icon: "bi bi-info-circle", color: "#c5221f", bgColor: "#fce8e6" },
                { label: "Next Due Date", value: installments.find(inst => inst.balance > 0)?.dueDate || "—", icon: "bi bi-calendar3", color: "#a142f4", bgColor: "#f3e8fd" },
              ].map((item, idx, arr) => (
                <React.Fragment key={idx}>
                  <div className="d-flex align-items-center gap-3 flex-grow-1 px-3">
                    <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: "36px", height: "36px", backgroundColor: item.bgColor, color: item.color }}>
                      <i className={`${item.icon} fs-5`} />
                    </div>
                    <div>
                      <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{item.label}</div>
                      <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>{item.value}</div>
                    </div>
                  </div>
                  {idx < arr.length - 1 && (
                    <div style={{ width: "1px", height: "32px", backgroundColor: "#cbd5e0" }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-folder2-open d-block fs-2 mb-2 opacity-40" />
            <span className="small">No installment details available. Configure assignment dates first.</span>
          </div>
        )}
      </div>

      {/* Payment History Card */}
      {loadingAgreement ? (
        <div className="text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2" />Loading payment history...
        </div>
      ) : (
        <div className="bg-white border rounded-4 p-4" style={{ borderColor: "#e2e8f0" }}>
          <div className="d-flex align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center justify-content-center rounded-3 bg-light" style={{ width: "36px", height: "36px" }}>
                <i className="bi bi-receipt text-primary fs-5" />
              </div>
              <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.05rem" }}>Payment History — {displayAgrNo}</h5>
            </div>
          </div>
          {displayAgr.payments?.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ borderColor: "#f1f5f9" }}>
                  <thead>
                    <tr className="border-bottom">
                      {["Payment Date", "Payment ID", "Paid Amount", "Mode of Payment", "Transaction ID", "Status", "Receipt"].map(h => (
                        <th key={h} className="bg-light border-0 py-3 px-3 text-muted fw-bold" style={{ fontSize: "0.75rem" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayAgr.payments.map((p: any) => (
                      <tr key={p._id} className="border-bottom">
                        <td className="py-3 px-3 text-muted" style={{ fontSize: "0.82rem" }}>
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3 px-3 fw-bold text-dark" style={{ fontSize: "0.82rem" }}>{p.receiptNumber || "—"}</td>
                        <td className="py-3 px-3 fw-bold text-success" style={{ fontSize: "0.85rem" }}>₹ {(p.amountPaid || p.amount || 0).toLocaleString("en-IN")}</td>
                        <td className="py-3 px-3 text-muted" style={{ fontSize: "0.82rem" }}>{p.paymentMode || "—"}</td>
                        <td className="py-3 px-3 text-muted text-truncate" style={{ fontSize: "0.82rem", maxWidth: "130px" }} title={p.transactionRef}>{p.transactionRef || "—"}</td>
                        <td className="py-3 px-3">
                          <span className={`badge rounded-pill px-3 py-1.5 ${
                            (p.status === "Paid" || p.status === "Success" || p.status === "Confirmed") 
                              ? "bg-success bg-opacity-10 text-success" 
                              : "bg-warning bg-opacity-10 text-warning"
                          }`} style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                            {(p.status === "Paid" || p.status === "Success" || p.status === "Confirmed") ? "Success" : "Partially Paid"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <a href="#" className="text-decoration-none text-primary d-inline-flex align-items-center gap-1 fw-semibold" style={{ fontSize: "0.82rem" }}>
                            Download <i className="bi bi-download" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-start mt-3 text-muted small" style={{ fontSize: "0.78rem" }}>
                Showing 1 to {displayAgr.payments.length} of {displayAgr.payments.length} entries
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-folder2-open d-block fs-2 mb-2 opacity-40" />
              <span className="small">No payments recorded yet for this agreement.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
