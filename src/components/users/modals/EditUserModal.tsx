"use client";
import React from "react";

interface EditUserModalProps {
  editForm: any;
  setEditForm: (val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const FIELD = (label: string, children: React.ReactNode, col = "col-md-6") => (
  <div className={col}>
    <label className="form-label fw-semibold small text-muted">{label}</label>
    {children}
  </div>
);

export default function EditUserModal({
  editForm,
  setEditForm,
  onSubmit,
  onClose,
  isSubmitting,
}: EditUserModalProps) {
  const set = (key: string, val: any) => setEditForm({ ...editForm, [key]: val });
  const isOwner = editForm.role === "OFFICE_OWNER" || editForm.role === "Owner";

  const getTermMonths = () => {
    if (!editForm.floorAssignmentStartDate || !editForm.floorAssignmentEndDate) return 12;
    const start = new Date(editForm.floorAssignmentStartDate);
    const end = new Date(editForm.floorAssignmentEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 12;
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    return Math.max(diffMonths, 1);
  };

  const getTermDays = () => {
    if (!editForm.floorAssignmentStartDate || !editForm.floorAssignmentEndDate) return 365;
    const start = new Date(editForm.floorAssignmentStartDate);
    const end = new Date(editForm.floorAssignmentEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 365;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const termMonths = getTermMonths();
  const termDays = getTermDays();
  const termQuarters = Math.max(1, Math.ceil(termMonths / 3));

  const totalAgreementAmt = editForm.totalAgreementAmount || 0;
  const dailyAmt = totalAgreementAmt > 0 && termDays > 0 ? Math.round((totalAgreementAmt / termDays) * 100) / 100 : 0;
  const monthlyAmt = totalAgreementAmt > 0 && termMonths > 0 ? Math.round((totalAgreementAmt / termMonths) * 100) / 100 : 0;
  const quarterlyAmt = totalAgreementAmt > 0 && termQuarters > 0 ? Math.round((totalAgreementAmt / termQuarters) * 100) / 100 : 0;

  const getCalculatedNextDueDate = () => {
    if (!editForm.floorAssignmentStartDate) return "N/A";
    const start = new Date(editForm.floorAssignmentStartDate);
    if (isNaN(start.getTime())) return "N/A";
    let nextDue = new Date(start);
    if (editForm.paymentType === 'Quarterly') {
      nextDue.setMonth(nextDue.getMonth() + 3);
    } else if (editForm.paymentType === 'Daily Wise') {
      nextDue.setDate(nextDue.getDate() + 1);
    } else if (editForm.paymentType === 'Custom Days Wise') {
      nextDue.setDate(nextDue.getDate() + 30); // Default custom days 30
    } else {
      // Monthly
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    return nextDue.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  React.useEffect(() => {
    const months = getTermMonths();
    const monthlyAmtVal = editForm.totalAgreementAmount > 0 && months > 0 ? Math.round(editForm.totalAgreementAmount / months) : 0;
    if (editForm.monthlyManagementAmount !== monthlyAmtVal) {
      setEditForm((prev: any) => ({
        ...prev,
        monthlyManagementAmount: monthlyAmtVal
      }));
    }
  }, [editForm.totalAgreementAmount, editForm.floorAssignmentStartDate, editForm.floorAssignmentEndDate]);

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(15,23,42,0.65)", zIndex: 1100, backdropFilter: "blur(8px)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4 overflow-hidden bg-white">

          {/* Header */}
          <div className="modal-header border-0 px-4 py-3 bg-light d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, backgroundColor: "rgba(1,74,173,0.1)" }}
              >
                <i className="hgi-stroke hgi-pencil-line-01 text-primary" />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: "1rem" }}>
                  Edit User Profile
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: "0.72rem" }}>
                  Update user details and agreement settings
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: "50%", border: "none",
                background: "transparent", cursor: "pointer", fontSize: "1.1rem",
                color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="modal-body p-4" style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>

              {/* Section: Personal Info */}
              <p className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>
                Personal Information
              </p>
              <div className="row g-3 mb-4">
                {FIELD("Full Name", <input type="text" className="form-control" required value={editForm.name} onChange={e => set("name", e.target.value)} />)}
                {FIELD("Official Email", <input type="email" className="form-control" required value={editForm.email} onChange={e => set("email", e.target.value)} />)}
                {FIELD("Mobile Number", <input type="text" className="form-control" value={editForm.phoneNumber} onChange={e => set("phoneNumber", e.target.value)} />)}
                {FIELD("Alternate / Emergency Contact", <input type="text" className="form-control" value={editForm.emergencyNumber} onChange={e => set("emergencyNumber", e.target.value)} />)}
                {FIELD("Residential / Office Address",
                  <input type="text" className="form-control" value={editForm.address} onChange={e => set("address", e.target.value)} />,
                  "col-12"
                )}
              </div>

              {/* Section: Agreement Settings */}
              <p className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>
                Agreement Settings
              </p>
              <div className="row g-3">
                {FIELD("Agreement Status",
                  <select className="form-select" value={editForm.agreementStatus} onChange={e => set("agreementStatus", e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Expired">Expired</option>
                  </select>
                )}

                {FIELD("Agreement Start Date",
                  <input type="date" className="form-control" value={editForm.floorAssignmentStartDate ? editForm.floorAssignmentStartDate.split('T')[0] : ''} onChange={e => set("floorAssignmentStartDate", e.target.value)} />
                )}

                {FIELD("Agreement End Date",
                  <input type="date" className="form-control" value={editForm.floorAssignmentEndDate ? editForm.floorAssignmentEndDate.split('T')[0] : ''} onChange={e => set("floorAssignmentEndDate", e.target.value)} />
                )}

                {FIELD("Total Agreement Amount",
                  <input type="number" className="form-control" value={editForm.totalAgreementAmount} onChange={e => set("totalAgreementAmount", Number(e.target.value))} />
                )}

                {FIELD("Payment Frequency",
                  <select className="form-select" value={editForm.paymentType} onChange={e => set("paymentType", e.target.value)}>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Daily Wise">Daily Wise</option>
                    <option value="Custom Days Wise">Custom Days Wise</option>
                  </select>
                )}

                {FIELD("Payment Due Day (Day of Month)",
                  <input type="number" className="form-control" min={1} max={31} value={editForm.paymentDueDay} onChange={e => set("paymentDueDay", Number(e.target.value))} />
                )}

                {/* Calculation breakdown */}
                <div className="col-12 mt-2">
                  <div className="p-3 bg-light rounded-3 border">
                    <span className="small text-muted d-block mb-1">Calculated Agreement Details</span>
                    <div className="d-flex flex-wrap gap-4 text-dark small">
                      <div>
                        Duration: <strong>{termDays} Days / {termMonths} Months</strong>
                      </div>
                      <div>
                        Monthly Amount: <strong>₹{monthlyAmt.toLocaleString()}</strong>
                      </div>
                      <div>
                        Quarterly Amount: <strong>₹{quarterlyAmt.toLocaleString()}</strong>
                      </div>
                      <div>
                        Daily Amount: <strong>₹{dailyAmt.toLocaleString()}</strong>
                      </div>
                      <div>
                        Next Due Date: <strong>{getCalculatedNextDueDate()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-4 py-3 bg-light d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 fw-bold"
                style={{ backgroundColor: "#014aad", borderColor: "#014aad" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
