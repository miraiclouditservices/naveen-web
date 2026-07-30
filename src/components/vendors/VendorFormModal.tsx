"use client";
import React, { useState, useEffect } from "react";

interface VendorFormModalProps {
  mode: "create" | "edit" | "view";
  editData?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

interface VendorFormState {
  // Basic Info
  vendorName: string;
  companyName: string;
  vendorType: string;
  vendorCategory: string;
  contactName: string;
  contactNumber: string;
  emergencyNumber: string;
  emailId: string;
  website: string;
  gstNumber: string;
  panNumber: string;
  msmeNumber: string;
  registrationNumber: string;
  businessType: string;
  yearsOfExperience: string;

  // Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  billingAddress: string;
  serviceAddress: string;
  locationCoordinates: string;

  // Bank
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;

  // Documents
  gstCertificateUrl: string;
  panUrl: string;
  agreementUrl: string;
  insuranceUrl: string;
  licenseUrl: string;
  bankDetailsUrl: string;
  otherDocumentsUrl: string;

  status: string;
}

const EMPTY_FORM: VendorFormState = {
  vendorName: "",
  companyName: "",
  vendorType: "Company",
  vendorCategory: "Maintenance",
  contactName: "",
  contactNumber: "",
  emergencyNumber: "",
  emailId: "",
  website: "",
  gstNumber: "",
  panNumber: "",
  msmeNumber: "",
  registrationNumber: "",
  businessType: "",
  yearsOfExperience: "",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  billingAddress: "",
  serviceAddress: "",
  locationCoordinates: "",

  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",

  gstCertificateUrl: "",
  panUrl: "",
  agreementUrl: "",
  insuranceUrl: "",
  licenseUrl: "",
  bankDetailsUrl: "",
  otherDocumentsUrl: "",

  status: "Active",
};

const buildForm = (mode: string, editData?: any): VendorFormState => {
  if (mode !== "create" && editData) {
    return {
      vendorName: editData.vendorName || "",
      companyName: editData.companyName || "",
      vendorType: editData.vendorType || "Company",
      vendorCategory: editData.vendorCategory || "Maintenance",
      contactName: editData.contactName || "",
      contactNumber: editData.contactNumber || editData.mobileNumber || "",
      emergencyNumber: editData.emergencyNumber || "",
      emailId: editData.emailId || editData.email || "",
      website: editData.website || "",
      gstNumber: editData.gstNumber || "",
      panNumber: editData.panNumber || "",
      msmeNumber: editData.msmeNumber || "",
      registrationNumber: editData.registrationNumber || "",
      businessType: editData.businessType || "",
      yearsOfExperience: editData.yearsOfExperience ? String(editData.yearsOfExperience) : "",

      addressLine1: editData.addressLine1 || "",
      addressLine2: editData.addressLine2 || "",
      city: editData.city || "",
      state: editData.state || "",
      country: editData.country || "India",
      pincode: editData.pincode || "",
      billingAddress: editData.billingAddress || "",
      serviceAddress: editData.serviceAddress || "",
      locationCoordinates: editData.locationCoordinates || "",

      accountHolderName: editData.accountHolderName || "",
      bankName: editData.bankName || "",
      accountNumber: editData.accountNumber || "",
      ifscCode: editData.ifscCode || "",
      upiId: editData.upiId || "",

      gstCertificateUrl: editData.gstCertificateUrl || "",
      panUrl: editData.panUrl || "",
      agreementUrl: editData.agreementUrl || "",
      insuranceUrl: editData.insuranceUrl || "",
      licenseUrl: editData.licenseUrl || "",
      bankDetailsUrl: editData.bankDetailsUrl || "",
      otherDocumentsUrl: editData.otherDocumentsUrl || "",

      status: editData.status || "Active",
    };
  }
  return { ...EMPTY_FORM };
};

export default function VendorFormModal({
  mode,
  editData,
  onSubmit,
  onClose,
  isSubmitting = false,
}: VendorFormModalProps) {
  const [form, setForm] = useState<VendorFormState>(() => buildForm(mode, editData));
  const [activeTab, setActiveTab] = useState<"basic" | "address" | "bank" | "docs">("basic");
  
  const isView = mode === "view";

  const set = (key: keyof VendorFormState, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
  };

  useEffect(() => {
    setForm(buildForm(mode, editData));
  }, [mode, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) {
      onClose();
      return;
    }
    
    // Basic form validation for required fields
    if (!form.vendorName || !form.contactName || !form.contactNumber || !form.emailId) {
      setActiveTab("basic");
      alert("Please fill in all required fields in the Basic Info tab.");
      return;
    }

    const payload = {
      ...form,
      yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
      _id: editData?._id
    };

    onSubmit(payload);
  };

  const title =
    mode === "create" ? "Add New Vendor" :
    mode === "edit"   ? "Edit Vendor" :
                        "Vendor Details";

  // Shared Styles
  const inputStyle: React.CSSProperties = {
    backgroundColor: "#f8fafc",
    border: "1px solid var(--border-light)",
    borderRadius: "6px",
    fontSize: "0.85rem",
    color: "#1e293b",
    padding: "8px 12px",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-body)",
    marginBottom: "5px",
    display: "block",
  };

  const tabStyle = (tab: typeof activeTab): React.CSSProperties => {
    const isActive = activeTab === tab;
    return {
      padding: "10px 16px",
      fontSize: "0.85rem",
      fontWeight: isActive ? 600 : 500,
      color: isActive ? "var(--dark-heading)" : "var(--text-muted)",
      borderBottom: isActive ? "2px solid var(--dark-heading)" : "2px solid transparent",
      background: "none",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      cursor: "pointer",
      transition: "all 0.15s",
    };
  };

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        zIndex: 1100,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: 720 }}
      >
        <div
          className="modal-content border-0 overflow-hidden"
          style={{ borderRadius: "12px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
        >
          {/* Header */}
          <div
            className="d-flex align-items-center justify-content-between px-4 py-3 bg-dark"
          >
            <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "0.95rem" }}>
              {title}
            </h5>
            <button
              type="button"
              onClick={onClose}
              className="text-white bg-transparent border-0"
              style={{ fontSize: "1.3rem", lineHeight: 1, cursor: "pointer" }}
            >
              ×
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="d-flex border-bottom px-3 bg-light">
            <button type="button" style={tabStyle("basic")} onClick={() => setActiveTab("basic")}>
              1. Basic Info
            </button>
            <button type="button" style={tabStyle("address")} onClick={() => setActiveTab("address")}>
              2. Address
            </button>
            <button type="button" style={tabStyle("bank")} onClick={() => setActiveTab("bank")}>
              3. Bank Details
            </button>
            <button type="button" style={tabStyle("docs")} onClick={() => setActiveTab("docs")}>
              4. Documents
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div
              className="px-4 py-4"
              style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}
            >
              {/* --- TAB 1: BASIC INFO --- */}
              {activeTab === "basic" && (
                <div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Vendor Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="e.g. ABC Facility Services"
                        required
                        readOnly={isView}
                        value={form.vendorName}
                        onChange={e => set("vendorName", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Legal entity name"
                        readOnly={isView}
                        value={form.companyName}
                        onChange={e => set("companyName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label style={labelStyle}>Vendor Type</label>
                      <select
                        className="form-select"
                        style={inputStyle}
                        disabled={isView}
                        value={form.vendorType}
                        onChange={e => set("vendorType", e.target.value)}
                      >
                        <option value="Company">Company</option>
                        <option value="Individual">Individual</option>
                        <option value="Agency">Agency</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label style={labelStyle}>Vendor Category <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        style={inputStyle}
                        disabled={isView}
                        value={form.vendorCategory}
                        onChange={e => set("vendorCategory", e.target.value)}
                      >
                        <option value="Security">Security</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="AMC">AMC</option>
                        <option value="IT Support">IT Support</option>
                        <option value="Transport">Transport</option>
                        <option value="Supplier">Supplier</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label style={labelStyle}>Status</label>
                      <select
                        className="form-select"
                        style={inputStyle}
                        disabled={isView}
                        value={form.status}
                        onChange={e => set("status", e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <hr className="my-4 text-muted" />

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Contact Person <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Point of contact name"
                        required
                        readOnly={isView}
                        value={form.contactName}
                        onChange={e => set("contactName", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Mobile Number <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="10-digit mobile number"
                        required
                        readOnly={isView}
                        value={form.contactNumber}
                        onChange={e => set("contactNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Alternate Number</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Landline or backup number"
                        readOnly={isView}
                        value={form.emergencyNumber}
                        onChange={e => set("emergencyNumber", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className="form-control"
                        style={inputStyle}
                        placeholder="vendor@company.com"
                        required
                        readOnly={isView}
                        value={form.emailId}
                        onChange={e => set("emailId", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Website URL</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="https://www.vendor.com"
                        readOnly={isView}
                        value={form.website}
                        onChange={e => set("website", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>GST Number</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="15-digit GSTIN"
                        readOnly={isView}
                        value={form.gstNumber}
                        onChange={e => set("gstNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label style={labelStyle}>PAN Number</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="10-digit PAN"
                        readOnly={isView}
                        value={form.panNumber}
                        onChange={e => set("panNumber", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label style={labelStyle}>MSME Registration Number</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Udyam registration no"
                        readOnly={isView}
                        value={form.msmeNumber}
                        onChange={e => set("msmeNumber", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label style={labelStyle}>Business License/Reg No</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Registration / license no"
                        readOnly={isView}
                        value={form.registrationNumber}
                        onChange={e => set("registrationNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Business Type</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="e.g. Proprietorship, LLP, Pvt Ltd"
                        readOnly={isView}
                        value={form.businessType}
                        onChange={e => set("businessType", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Years of Experience</label>
                      <input
                        type="number"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Total years in business"
                        readOnly={isView}
                        value={form.yearsOfExperience}
                        onChange={e => set("yearsOfExperience", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 2: ADDRESS DETAILS --- */}
              {activeTab === "address" && (
                <div>
                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label style={labelStyle}>Address Line 1</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Flat, Office Room, Street name"
                        readOnly={isView}
                        value={form.addressLine1}
                        onChange={e => set("addressLine1", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label style={labelStyle}>Address Line 2</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Locality, Landmark"
                        readOnly={isView}
                        value={form.addressLine2}
                        onChange={e => set("addressLine2", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>City</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="City"
                        readOnly={isView}
                        value={form.city}
                        onChange={e => set("city", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>State</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="State"
                        readOnly={isView}
                        value={form.state}
                        onChange={e => set("state", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Country</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Country"
                        readOnly={isView}
                        value={form.country}
                        onChange={e => set("country", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Pincode</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="6-digit PIN code"
                        readOnly={isView}
                        value={form.pincode}
                        onChange={e => set("pincode", e.target.value)}
                      />
                    </div>
                  </div>

                  <hr className="my-4 text-muted" />

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Billing Address (If different)</label>
                      <textarea
                        className="form-control"
                        style={{ ...inputStyle, resize: "none" }}
                        rows={2}
                        placeholder="Complete billing address with GST info"
                        readOnly={isView}
                        value={form.billingAddress}
                        onChange={e => set("billingAddress", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Service Location Address (If different)</label>
                      <textarea
                        className="form-control"
                        style={{ ...inputStyle, resize: "none" }}
                        rows={2}
                        placeholder="Address where service is physically rendered"
                        readOnly={isView}
                        value={form.serviceAddress}
                        onChange={e => set("serviceAddress", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-12">
                      <label style={labelStyle}>GPS Coordinates (Latitude, Longitude)</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="e.g. 17.4485, 78.3741 (useful for emergency tracking)"
                        readOnly={isView}
                        value={form.locationCoordinates}
                        onChange={e => set("locationCoordinates", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 3: BANK DETAILS --- */}
              {activeTab === "bank" && (
                <div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-12">
                      <label style={labelStyle}>Account Holder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Name as listed in bank passbook"
                        readOnly={isView}
                        value={form.accountHolderName}
                        onChange={e => set("accountHolderName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Bank Name</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="e.g. HDFC Bank, ICICI Bank"
                        readOnly={isView}
                        value={form.bankName}
                        onChange={e => set("bankName", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Account Number</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Bank account number"
                        readOnly={isView}
                        value={form.accountNumber}
                        onChange={e => set("accountNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>IFSC Code</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="11-character IFSC code"
                        readOnly={isView}
                        value={form.ifscCode}
                        onChange={e => set("ifscCode", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>UPI ID (VPA)</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="e.g. vendor@okaxis"
                        readOnly={isView}
                        value={form.upiId}
                        onChange={e => set("upiId", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 4: DOCUMENTS --- */}
              {activeTab === "docs" && (
                <div>
                  <p className="text-muted mb-4" style={{ fontSize: "0.8rem" }}>
                    Provide links or attachments names for vendor verification documents. In a real production deployment, this maps to cloud storage buckets.
                  </p>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>GST Registration Certificate</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Doc URL or file description"
                        readOnly={isView}
                        value={form.gstCertificateUrl}
                        onChange={e => set("gstCertificateUrl", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>PAN Card copy</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Doc URL or file description"
                        readOnly={isView}
                        value={form.panUrl}
                        onChange={e => set("panUrl", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Signed Agreement Document</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Doc URL or file description"
                        readOnly={isView}
                        value={form.agreementUrl}
                        onChange={e => set("agreementUrl", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Insurance Copy</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Doc URL or file description"
                        readOnly={isView}
                        value={form.insuranceUrl}
                        onChange={e => set("insuranceUrl", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Trade License / Registration</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Doc URL or file description"
                        readOnly={isView}
                        value={form.licenseUrl}
                        onChange={e => set("licenseUrl", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Bank Details Verification / Cancelled Cheque</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="Doc URL or cancelled cheque image"
                        readOnly={isView}
                        value={form.bankDetailsUrl}
                        onChange={e => set("bankDetailsUrl", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label style={labelStyle}>Other Documents / Certifications</label>
                      <input
                        type="text"
                        className="form-control"
                        style={inputStyle}
                        placeholder="URLs or filenames of other uploaded files"
                        readOnly={isView}
                        value={form.otherDocumentsUrl}
                        onChange={e => set("otherDocumentsUrl", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Buttons */}
            <div className="d-flex justify-content-between px-4 py-3 bg-light border-top">
              {/* Back / Next buttons */}
              <div>
                {activeTab === "address" && (
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setActiveTab("basic")}>
                    ← Back
                  </button>
                )}
                {activeTab === "bank" && (
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setActiveTab("address")}>
                    ← Back
                  </button>
                )}
                {activeTab === "docs" && (
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setActiveTab("bank")}>
                    ← Back
                  </button>
                )}
              </div>

              <div className="d-flex gap-2">
                {activeTab !== "docs" ? (
                  <button
                    type="button"
                    className="btn btn-sm text-white"
                    style={{ backgroundColor: "var(--dark-heading)" }}
                    onClick={() => {
                      if (activeTab === "basic") setActiveTab("address");
                      else if (activeTab === "address") setActiveTab("bank");
                      else if (activeTab === "bank") setActiveTab("docs");
                    }}
                  >
                    Next Tab →
                  </button>
                ) : null}

                {!isView ? (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-sm btn-outline-secondary px-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm text-white px-4 fw-bold"
                      style={{ backgroundColor: "var(--dark-heading)" }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="spinner-border spinner-border-sm me-2" />
                      ) : null}
                      {mode === "create" ? "SUBMIT" : "UPDATE"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-sm text-white px-5 fw-bold"
                    style={{ backgroundColor: "var(--dark-heading)" }}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
