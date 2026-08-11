"use client";

import React, { useState } from "react";
import { api } from "@/utils/api";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAccountModal({ isOpen, onClose, onSuccess }: CreateAccountModalProps) {
  // viewMode: 'FORM' (Sectioned Form), 'VERIFY' (OTP Verification), 'SUCCESS' (Verified & Created Confirmation)
  const [viewMode, setViewMode] = useState<"FORM" | "VERIFY" | "SUCCESS">("FORM");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [createdAccountData, setCreatedAccountData] = useState<any>(null);

  const [accountType, setAccountType] = useState<"PROPERTY" | "COWORKING">("PROPERTY");
  
  const [orgDetails, setOrgDetails] = useState({
    name: "",
    code: "",
    industry: "Real Estate & Property Management",
    businessCategory: "Commercial Office"
  });

  const [adminDetails, setAdminDetails] = useState({
    name: "",
    email: "",
    phone: "",
    password: "123456"
  });

  const [contactDetails, setContactDetails] = useState({
    address: "",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    pincode: "",
    gstNumber: "",
    panNumber: "",
    taxId: ""
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setViewMode("FORM");
    setError("");
    setInfoMsg("");
    setOtpCode("");
    setCreatedAccountData(null);
    setAccountType("PROPERTY");
    setOrgDetails({ name: "", code: "", industry: "Real Estate & Property Management", businessCategory: "Commercial Office" });
    setAdminDetails({ name: "", email: "", phone: "", password: "123456" });
    setContactDetails({ address: "", city: "Hyderabad", state: "Telangana", country: "India", pincode: "", gstNumber: "", panNumber: "", taxId: "" });
  };

  // STEP 1: Send Verification OTP (NO Account created in database yet!)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgDetails.name.trim()) {
      setError("Please enter the Organization / Company Name.");
      return;
    }
    if (!adminDetails.name.trim() || !adminDetails.email.trim()) {
      setError("Please enter the Primary Admin Name and Email.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await api.post('/saas/request-otp', {
        email: adminDetails.email.trim(),
        adminName: adminDetails.name.trim()
      });

      if (response && response.success) {
        if (response.otpDev) setOtpCode(response.otpDev); // Dev snippet auto-fill
        setInfoMsg(`Verification OTP code sent to ${adminDetails.email}. No account created yet.`);
        setViewMode("VERIFY");
      } else {
        setError(response?.error || "Failed to dispatch verification OTP.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification OTP. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & ONLY THEN Create Account in Database
  const handleVerifyAndCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP verification code.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await api.post('/saas/verify-and-create', {
        email: adminDetails.email.trim(),
        otp: otpCode.trim(),
        accountType,
        orgDetails,
        adminDetails,
        contactDetails
      });

      if (response && response.success) {
        setCreatedAccountData(response.data);
        setViewMode("SUCCESS");
        onSuccess();
      } else {
        setError(response?.error || "OTP Verification failed. Account was NOT created.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed. Check OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setInfoMsg("");
    setLoading(true);
    try {
      const response = await api.post('/saas/resend-otp', {
        email: adminDetails.email.trim(),
        adminName: adminDetails.name.trim()
      });

      if (response && response.success) {
        setInfoMsg(`A new verification code was sent to ${adminDetails.email}`);
        if (response.otpDev) setOtpCode(response.otpDev);
      } else {
        setError(response?.error || "Failed to resend OTP.");
      }
    } catch (err: any) {
      setError(err.message || "Error resending OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(15, 23, 42, 0.68)", backdropFilter: "blur(6px)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: 840 }}>
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          
          {/* Modal Header */}
          <div className="modal-header border-0 bg-dark text-white p-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 text-warning bg-warning bg-opacity-10"
                style={{ width: 44, height: 44 }}
              >
                <i className="bi bi-building-add" style={{ fontSize: "1.35rem" }}></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: "1.15rem" }}>
                  Provision SaaS Organization Account
                </h5>
                <span className="text-secondary extra-small" style={{ color: "#94a3b8" }}>
                  {viewMode === "FORM" ? "Step 1: Fill Details & Request OTP" :
                   viewMode === "VERIFY" ? "Step 2: Verify OTP to Create Account" : "Step 3: Account Provisioned"}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white shadow-none"
              onClick={() => { resetForm(); onClose(); }}
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4" style={{ maxHeight: "calc(85vh - 110px)", overflowY: "auto", background: "#f8fafc" }}>
            {error && (
              <div className="alert alert-danger py-2 px-3 extra-small rounded-3 mb-3 border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {error}
              </div>
            )}

            {infoMsg && (
              <div className="alert alert-info py-2 px-3 extra-small rounded-3 mb-3 border-0 bg-info bg-opacity-10 text-info d-flex align-items-center">
                <i className="bi bi-info-circle-fill me-2" />
                {infoMsg}
              </div>
            )}

            {/* VIEWMODE 1: SECTION-BASED SINGLE FORM */}
            {viewMode === "FORM" && (
              <form onSubmit={handleRequestOtp} className="d-flex flex-column gap-4">

                {/* SECTION 1: Account Type Selection */}
                <div className="bg-white p-4 rounded-4 border shadow-sm">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                    <i className="bi bi-grid-fill text-warning" style={{ fontSize: "1.1rem" }} />
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                      1. Account Infrastructure Type
                    </h6>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div
                        className={`card h-100 p-3 border-2 rounded-4 text-center cursor-pointer transition-all ${
                          accountType === "PROPERTY" ? "border-warning bg-warning bg-opacity-10 shadow-sm" : "border-light bg-light"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setAccountType("PROPERTY");
                          setOrgDetails(prev => ({ ...prev, businessCategory: "Commercial Office" }));
                        }}
                      >
                        <div className="mx-auto mb-2 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center text-warning" style={{ width: 52, height: 52 }}>
                          <i className="bi bi-building" style={{ fontSize: "1.5rem" }}></i>
                        </div>
                        <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Property Management Account</h6>
                        <p className="extra-small text-secondary mb-0">
                          For real estate owners, developers, commercial towers &amp; property portfolios.
                        </p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div
                        className={`card h-100 p-3 border-2 rounded-4 text-center cursor-pointer transition-all ${
                          accountType === "COWORKING" ? "border-warning bg-warning bg-opacity-10 shadow-sm" : "border-light bg-light"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setAccountType("COWORKING");
                          setOrgDetails(prev => ({ ...prev, businessCategory: "Co-working Space" }));
                        }}
                      >
                        <div className="mx-auto mb-2 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center text-primary" style={{ width: 52, height: 52 }}>
                          <i className="bi bi-grid-3x3-gap-fill" style={{ fontSize: "1.5rem" }}></i>
                        </div>
                        <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Co-working Space Account</h6>
                        <p className="extra-small text-secondary mb-0">
                          For flex space operators, hot desks, dedicated seats &amp; shared workspace hubs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Organization & Entity Details (Strictly 2 Fields Per Row) */}
                <div className="bg-white p-4 rounded-4 border shadow-sm">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                    <i className="bi bi-building text-warning" style={{ fontSize: "1.1rem" }} />
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                      2. Organization &amp; Entity Profile
                    </h6>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Organization / Company Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Apex Infra Ltd / WorkSpace Hub"
                        value={orgDetails.name}
                        onChange={(e) => setOrgDetails({ ...orgDetails, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Organization Code / Domain</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. APEX-HYD"
                        value={orgDetails.code}
                        onChange={(e) => setOrgDetails({ ...orgDetails, code: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Industry</label>
                      <select
                        className="form-select form-select-sm"
                        value={orgDetails.industry}
                        onChange={(e) => setOrgDetails({ ...orgDetails, industry: e.target.value })}
                      >
                        <option value="Real Estate & Property Management">Real Estate &amp; Property Management</option>
                        <option value="Co-Working & Shared Workspace">Co-Working &amp; Shared Workspace</option>
                        <option value="IT & Tech Park">IT &amp; Tech Park</option>
                        <option value="Commercial Hospitality">Commercial Hospitality</option>
                        <option value="Corporate Portfolio">Corporate Portfolio</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Business Category</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Commercial Office / Co-working"
                        value={orgDetails.businessCategory}
                        onChange={(e) => setOrgDetails({ ...orgDetails, businessCategory: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Primary Administrator Account (Strictly 2 Fields Per Row) */}
                <div className="bg-white p-4 rounded-4 border shadow-sm">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                    <i className="bi bi-person-badge-fill text-warning" style={{ fontSize: "1.1rem" }} />
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                      3. Primary Owner &amp; Administrator Details
                    </h6>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Admin Full Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. John Doe"
                        value={adminDetails.name}
                        onChange={(e) => setAdminDetails({ ...adminDetails, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Admin Work Email *</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        placeholder="admin@company.com"
                        value={adminDetails.email}
                        onChange={(e) => setAdminDetails({ ...adminDetails, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Contact Phone Number</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="+91 98765 43210"
                        value={adminDetails.phone}
                        onChange={(e) => setAdminDetails({ ...adminDetails, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Initial Admin Password (6 Digits) *</label>
                      <input
                        type="password"
                        maxLength={6}
                        className="form-control form-control-sm font-monospace"
                        placeholder="123456"
                        value={adminDetails.password}
                        onChange={(e) => setAdminDetails({ ...adminDetails, password: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Contact & Business Identifiers (Strictly 2 Fields Per Row) */}
                <div className="bg-white p-4 rounded-4 border shadow-sm">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                    <i className="bi bi-geo-alt-fill text-warning" style={{ fontSize: "1.1rem" }} />
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                      4. Contact &amp; Tax Compliance Identifiers
                    </h6>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Registered Office Address</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Financial District, Nanakramguda"
                        value={contactDetails.address}
                        onChange={(e) => setContactDetails({ ...contactDetails, address: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Pincode / Postal Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="500032"
                        value={contactDetails.pincode}
                        onChange={(e) => setContactDetails({ ...contactDetails, pincode: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">City</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Hyderabad"
                        value={contactDetails.city}
                        onChange={(e) => setContactDetails({ ...contactDetails, city: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">State / Region</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Telangana"
                        value={contactDetails.state}
                        onChange={(e) => setContactDetails({ ...contactDetails, state: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Country</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="India"
                        value={contactDetails.country}
                        onChange={(e) => setContactDetails({ ...contactDetails, country: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">GST Number (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase"
                        placeholder="36AAAAA0000A1Z5"
                        value={contactDetails.gstNumber}
                        onChange={(e) => setContactDetails({ ...contactDetails, gstNumber: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">PAN Number (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase"
                        placeholder="ABCDE1234F"
                        value={contactDetails.panNumber}
                        onChange={(e) => setContactDetails({ ...contactDetails, panNumber: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label extra-small fw-bold">Tax ID / CIN</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase"
                        placeholder="U72200TG2026PTC"
                        value={contactDetails.taxId}
                        onChange={(e) => setContactDetails({ ...contactDetails, taxId: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Submit Button */}
                <div className="d-flex justify-content-end mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-warning rounded-pill px-5 py-2.5 fw-bold text-dark shadow-sm d-inline-flex align-items-center gap-2"
                  >
                    {loading ? <span className="spinner-border spinner-border-sm me-1"/> : <i className="bi bi-paperplane-fill" />}
                    Send Verification OTP Code
                  </button>
                </div>

              </form>
            )}

            {/* VIEWMODE 2: OTP VERIFICATION & DB PROVISIONING */}
            {viewMode === "VERIFY" && (
              <div className="bg-white p-4 rounded-4 border shadow-sm">
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle mb-2 p-3" style={{ width: 64, height: 64 }}>
                    <i className="bi bi-shield-lock-fill" style={{ fontSize: "2rem" }} />
                  </div>
                  <h5 className="fw-bold text-dark mb-1">Verify OTP &amp; Provision Account</h5>
                  <p className="extra-small text-secondary mb-1">
                    A 6-digit verification code was sent to <strong>{adminDetails.email}</strong>.
                  </p>
                  <span className="badge bg-danger bg-opacity-10 text-danger extra-small px-3 py-1 font-monospace">
                    No account is created in database until OTP is verified.
                  </span>
                </div>

                <form onSubmit={handleVerifyAndCreate} className="mx-auto" style={{ maxWidth: 360 }}>
                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-muted text-uppercase text-center d-block">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-control form-control-lg text-center font-monospace fw-bold shadow-none"
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      style={{ height: 52, fontSize: "1.6rem", letterSpacing: "8px", borderRadius: 14, background: "#f8fafc", border: "1.5px solid #cbd5e1" }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-100 btn-warning rounded-pill py-2.5 fw-bold text-dark shadow-sm mb-3"
                    style={{ height: 46 }}
                  >
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-circle-fill me-1" />}
                    Verify OTP &amp; Create Account
                  </button>

                  <div className="d-flex align-items-center justify-content-between extra-small">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-muted text-decoration-none"
                      onClick={() => setViewMode("FORM")}
                    >
                      &larr; Back to Form
                    </button>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-primary text-decoration-none fw-bold"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEWMODE 3: FINAL VERIFIED SUCCESS STATE */}
            {viewMode === "SUCCESS" && (
              <div className="bg-white p-4 rounded-4 border shadow-sm text-center py-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3 p-3" style={{ width: 72, height: 72 }}>
                  <i className="bi bi-patch-check-fill" style={{ fontSize: "2.6rem" }} />
                </div>
                <h4 className="fw-bold text-dark mb-1">Account Provisioned &amp; Activated!</h4>
                <p className="text-secondary extra-small mb-4">
                  Organization <strong>{orgDetails.name}</strong> was created and activated in the database after successful OTP verification.
                </p>

                <div className="bg-light p-3 rounded-4 border text-start mb-4 mx-auto" style={{ maxWidth: 480 }}>
                  <div className="extra-small fw-bold text-uppercase text-muted mb-2 border-bottom pb-1">Verified Account Credentials</div>
                  <div className="row g-2 extra-small">
                    <div className="col-5"><strong>Organization:</strong></div>
                    <div className="col-7 fw-bold text-dark">{orgDetails.name}</div>
                    <div className="col-5"><strong>Account Type:</strong></div>
                    <div className="col-7">{accountType === "COWORKING" ? "Co-working Space" : "Property Management"}</div>
                    <div className="col-5"><strong>Admin Email:</strong></div>
                    <div className="col-7 font-monospace text-primary">{adminDetails.email}</div>
                    <div className="col-5"><strong>Status:</strong></div>
                    <div className="col-7"><span className="badge bg-success">Active &amp; Verified</span></div>
                    <div className="col-5"><strong>Initial Password:</strong></div>
                    <div className="col-7 font-monospace fw-bold">{adminDetails.password}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-warning rounded-pill px-5 py-2.5 fw-bold text-dark shadow-sm"
                  onClick={() => { resetForm(); onClose(); }}
                >
                  Done &amp; View Accounts List
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
