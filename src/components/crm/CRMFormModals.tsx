import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import SearchableSelect from "@/components/common/SearchableSelect";

interface CRMFormModalsProps {
  activeModal: "lead" | "contact" | "company" | "deal" | "activity" | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editMode: boolean;

  // Lead Form
  leadForm: any;
  setLeadForm: (val: any) => void;

  // Contact Form
  contactForm: any;
  setContactForm: (val: any) => void;
  companies: any[];

  // Company Form
  companyForm: any;
  setCompanyForm: (val: any) => void;

  // Deal Form
  dealForm: any;
  setDealForm: (val: any) => void;
  leads: any[];

  // Activity Form
  activityForm: any;
  setActivityForm: (val: any) => void;

  // Users List
  users?: any[];
}

export default function CRMFormModals({
  activeModal,
  onClose,
  onSubmit,
  editMode,
  leadForm,
  setLeadForm,
  contactForm,
  setContactForm,
  companies,
  companyForm,
  setCompanyForm,
  dealForm,
  setDealForm,
  leads,
  activityForm,
  setActivityForm,
  users = []
}: CRMFormModalsProps) {

  // Local steps for Leads, Contacts, Deals, and Accounts (1, 2, 3)
  const [leadStep, setLeadStep] = useState<number>(1);
  const [contactStep, setContactStep] = useState<number>(1);
  const [dealStep, setDealStep] = useState<number>(1);
  const [accountStep, setAccountStep] = useState<number>(1);

  // Validation Errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset steps when active modal changes
  useEffect(() => {
    setLeadStep(1);
    setContactStep(1);
    setDealStep(1);
    setAccountStep(1);
    setErrors({});
  }, [activeModal]);

  // Local state for dynamic deals dropdown
  const [dealsList, setDealsList] = useState<any[]>([]);

  useEffect(() => {
    if (activeModal === "contact") {
      api.get("/crm/deals?limit=300")
        .then(res => {
          if (res && res.success) {
            setDealsList(res.data || []);
          }
        })
        .catch(err => console.error("Error fetching deals for contact form:", err));
    }
  }, [activeModal]);

  // Property-First Dropdowns Fetching
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [floorsList, setFloorsList] = useState<any[]>([]);
  const [unitsList, setUnitsList] = useState<any[]>([]);
  const [contactsList, setContactsList] = useState<any[]>([]);

  useEffect(() => {
    api.get("/properties?limit=1000")
      .then(res => {
        if (res && res.success) setPropertiesList(res.data || []);
      })
      .catch(err => console.error("Error fetching properties:", err));
  }, []);

  // Fetch floors when selected property changes
  const activePropertyId =
    activeModal === "lead" ? leadForm?.propertyId :
      activeModal === "contact" ? contactForm?.propertyId :
        activeModal === "deal" ? dealForm?.propertyId : "";

  useEffect(() => {
    if (activePropertyId) {
      api.get(`/floors?property=${activePropertyId}&limit=1000`)
        .then(res => {
          if (res && res.success) setFloorsList(res.data || []);
        })
        .catch(err => console.error("Error fetching floors:", err));
    } else {
      setFloorsList([]);
    }
  }, [activePropertyId]);

  // Fetch units when selected floor changes
  const activeFloorId =
    activeModal === "contact" ? contactForm?.floorId :
      activeModal === "deal" ? dealForm?.floorId : "";

  useEffect(() => {
    if (activeFloorId) {
      api.get(`/units?floor=${activeFloorId}&limit=1000`)
        .then(res => {
          if (res && res.success) setUnitsList(res.data || []);
        })
        .catch(err => console.error("Error fetching units:", err));
    } else {
      setUnitsList([]);
    }
  }, [activeFloorId]);

  // Fetch contacts for selected account
  const activeAccountId = dealForm?.account_id || "";
  useEffect(() => {
    if (activeAccountId) {
      api.get(`/crm/contacts?account_id=${activeAccountId}&limit=500`)
        .then(res => {
          if (res && res.success) setContactsList(res.data || []);
        })
        .catch(err => console.error("Error fetching contacts for deal:", err));
    } else {
      setContactsList([]);
    }
  }, [activeAccountId]);

  if (!activeModal) return null;

  const labelStyle: React.CSSProperties = {
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "3px",
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "6px",
    fontSize: "0.82rem",
    color: "var(--text-primary)",
    padding: "8px 12px",
    width: "100%",
    boxShadow: "none",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const getInputStyle = (fieldName: string, customStyles?: React.CSSProperties) => {
    const style: React.CSSProperties = {
      ...inputStyle,
      ...customStyles
    };
    if (errors[fieldName]) {
      delete style.border;
      delete style.borderColor;
    }
    return style;
  };

  const handleInputChange = (formName: "lead" | "contact" | "company" | "deal" | "activity", field: string, value: any) => {
    if (formName === "lead") setLeadForm({ ...leadForm, [field]: value });
    else if (formName === "contact") setContactForm({ ...contactForm, [field]: value });
    else if (formName === "company") setCompanyForm({ ...companyForm, [field]: value });
    else if (formName === "deal") setDealForm({ ...dealForm, [field]: value });
    else if (formName === "activity") setActivityForm({ ...activityForm, [field]: value });

    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateCurrentStep = (stepToValidate?: number) => {
    const newErrors: { [key: string]: string } = {};
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);

    const currentStep = stepToValidate !== undefined ? stepToValidate : (
      activeModal === "lead" ? leadStep :
        activeModal === "contact" ? contactStep :
          activeModal === "company" ? accountStep : 1
    );

    if (activeModal === "lead" && currentStep === 1) {
      if (!leadForm.lead_name?.trim()) newErrors.lead_name = "Lead Name is required";

      if (!leadForm.phone?.trim()) {
        newErrors.phone = "Mobile Number is required";
      } else if (!isValidPhone(leadForm.phone.trim())) {
        newErrors.phone = "Enter a valid 10-digit mobile number";
      }

      if (!leadForm.email?.trim()) {
        newErrors.email = "Email Address is required";
      } else if (!isValidEmail(leadForm.email.trim())) {
        newErrors.email = "Enter a valid email address";
      }
    }

    if (activeModal === "contact" && currentStep === 1) {
      if (!contactForm.name?.trim()) newErrors.name = "Full Name is required";

      if (!contactForm.phone?.trim()) {
        newErrors.phone = "Mobile Number is required";
      } else if (!isValidPhone(contactForm.phone.trim())) {
        newErrors.phone = "Enter a valid 10-digit mobile number";
      }

      if (contactForm.email?.trim() && !isValidEmail(contactForm.email.trim())) {
        newErrors.email = "Enter a valid email address";
      }

      if (contactForm.alternatePhone?.trim() && !isValidPhone(contactForm.alternatePhone.trim())) {
        newErrors.alternatePhone = "Enter a valid 10-digit alternate phone number";
      }

      if (contactForm.whatsapp?.trim() && !isValidPhone(contactForm.whatsapp.trim())) {
        newErrors.whatsapp = "Enter a valid 10-digit WhatsApp number";
      }
    }
    if (activeModal === "contact" && currentStep === 2) {
      // Company / Account is optional now
    }

    if (activeModal === "company") {
      if (currentStep === 1) {
        if (!companyForm.company_name?.trim()) newErrors.company_name = "Company Name is required";
      } else if (currentStep === 2) {
        if (companyForm.email?.trim() && !isValidEmail(companyForm.email.trim())) {
          newErrors.email = "Enter a valid email address";
        }
        if (companyForm.phone?.trim() && !isValidPhone(companyForm.phone.trim())) {
          newErrors.phone = "Enter a valid 10-digit phone number";
        }
        if (companyForm.whatsapp?.trim() && !isValidPhone(companyForm.whatsapp.trim())) {
          newErrors.whatsapp = "Enter a valid 10-digit WhatsApp number";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderStepIndicator = (currentStep: number, totalSteps: number, stepLabels: string[], onStepClick: (step: number) => void) => {
    return (
      <div
        className="d-flex align-items-center justify-content-between px-5 py-3 border-bottom position-relative"
        style={{ userSelect: "none", backgroundColor: "var(--bg-card)" }}
      >
        {/* Track Line */}
        <div
          className="position-absolute"
          style={{
            height: "4px",
            backgroundColor: "var(--border-color)",
            left: "15%",
            right: "15%",
            top: "37%",
            transform: "translateY(-50%)",
            zIndex: 1
          }}
        />
        {/* Progress Line */}
        <div
          className="position-absolute"
          style={{
            height: "4px",
            backgroundColor: "var(--dark-section)",
            left: "15%",
            width: `${((currentStep - 1) / (totalSteps - 1)) * 70}%`,
            top: "37%",
            transform: "translateY(-50%)",
            zIndex: 2,
            transition: "width 0.3s ease"
          }}
        />

        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div
              key={stepNum}
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 3, cursor: "pointer", width: "80px" }}
              onClick={() => onStepClick(stepNum)}
            >
              <div
                className="d-flex align-items-center justify-content-center fw-bold shadow-sm"
                style={{
                  width: isActive ? "28px" : "22px",
                  height: isActive ? "28px" : "22px",
                  borderRadius: "50%",
                  backgroundColor: isActive || isCompleted ? "var(--dark-section)" : "var(--border-color)",
                  color: "var(--bg-card)",
                  fontSize: isActive ? "0.8rem" : "0.7rem",
                  border: "2px solid var(--bg-card)",
                  transition: "all 0.3s ease",
                  transform: isActive ? "scale(1.15)" : "scale(1)"
                }}
              >
                {stepNum}
              </div>
              <span
                className="text-center mt-1"
                style={{
                  fontSize: "0.7rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  width: "120px",
                  display: "block",
                  transition: "all 0.3s ease"
                }}
              >
                {stepLabels[idx]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        zIndex: 1200,
        backdropFilter: "blur(4px)"
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: 640 }}>
        <div
          className="modal-content border-0 overflow-hidden"
          style={{ borderRadius: "12px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
        >
          <form onSubmit={(e) => {
            if (!validateCurrentStep()) {
              e.preventDefault();
              return;
            }
            if (activeModal === "lead" && leadStep < 3) {
              e.preventDefault();
              setLeadStep(prev => prev + 1);
              return;
            }
            if (activeModal === "contact" && contactStep < 3) {
              e.preventDefault();
              setContactStep(prev => prev + 1);
              return;
            }
            if (activeModal === "deal" && dealStep < 3) {
              e.preventDefault();
              setDealStep(prev => prev + 1);
              return;
            }
            if (activeModal === "company" && accountStep < 3) {
              e.preventDefault();
              setAccountStep(prev => prev + 1);
              return;
            }
            onSubmit(e);
          }}>
            {/* Header */}
            <div
              className="d-flex align-items-center justify-content-between px-4 py-3 bg-dark"
            >
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "0.9rem" }}>
                {editMode ? `Edit ${activeModal.toUpperCase()}` : `Add New ${activeModal.toUpperCase()}`}
              </h5>
              <button
                type="button"
                className="text-white bg-transparent border-0"
                onClick={onClose}
                style={{ fontSize: "1.2rem", lineHeight: 1, cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {/* Orange Step Indicator for Leads */}
            {activeModal === "lead" && renderStepIndicator(
              leadStep,
              3,
              ["Basic Details", "Lead Details", "Preview & Save"],
              (step) => {
                if (step < leadStep) {
                  setLeadStep(step);
                } else if (validateCurrentStep()) {
                  setLeadStep(step);
                }
              }
            )}

            {/* Orange Step Indicator for Contacts */}
            {activeModal === "contact" && renderStepIndicator(
              contactStep,
              3,
              ["Personal Details", "Company & Address", "Preview & Save"],
              (step) => {
                if (step < contactStep) {
                  setContactStep(step);
                } else if (validateCurrentStep()) {
                  setContactStep(step);
                }
              }
            )}

            {/* Orange Step Indicator for Deals */}
            {activeModal === "deal" && renderStepIndicator(
              dealStep,
              3,
              ["Deal Info", "Associated Lead", "Pipeline & Probability"],
              (step) => {
                if (step < dealStep) {
                  setDealStep(step);
                } else if (validateCurrentStep()) {
                  setDealStep(step);
                }
              }
            )}
            {activeModal === "company" && renderStepIndicator(
              accountStep,
              3,
              ["Company & Legal", "Contact & Address & Owner", "Preview & Save"],
              (step) => {
                if (step < accountStep) {
                  setAccountStep(step);
                } else if (validateCurrentStep()) {
                  setAccountStep(step);
                }
              }
            )}

            {/* Scrollable Form Body Container */}
            <div
              className="px-4 py-3" style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}
            >              {/* ── LEAD FORM ── */}
              {activeModal === "lead" && (
                <div>
                  {leadStep === 1 && (
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label style={labelStyle}>Lead Name / Contact Person <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.lead_name ? "is-invalid" : ""}`}
                          style={getInputStyle("lead_name")}
                          required
                          placeholder="e.g. John Doe"
                          value={leadForm.lead_name || ""}
                          onChange={e => handleInputChange("lead", "lead_name", e.target.value)}
                        />
                        {errors.lead_name && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.lead_name}</div>}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Company Name</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. Acme Corp"
                          value={leadForm.companyName || ""}
                          onChange={e => handleInputChange("lead", "companyName", e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Mobile Number <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                          style={getInputStyle("phone")}
                          required
                          placeholder="e.g. +91 9876543210"
                          value={leadForm.phone || ""}
                          onChange={e => handleInputChange("lead", "phone", e.target.value)}
                        />
                        {errors.phone && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.phone}</div>}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Email Address <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? "is-invalid" : ""}`}
                          style={getInputStyle("email")}
                          required
                          placeholder="e.g. john@acme.com"
                          value={leadForm.email || ""}
                          onChange={e => handleInputChange("lead", "email", e.target.value)}
                        />
                        {errors.email && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.email}</div>}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Designation</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. Director, Manager"
                          value={leadForm.designation || ""}
                          onChange={e => handleInputChange("lead", "designation", e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Industry</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. Software, Real Estate"
                          value={leadForm.industry || ""}
                          onChange={e => handleInputChange("lead", "industry", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {leadStep === 2 && (
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label style={labelStyle}>Interested Property</label>
                        <SearchableSelect
                          options={propertiesList.map(p => ({ id: p._id, label: p.propertyName }))}
                          value={leadForm.propertyId || ""}
                          onChange={val => {
                            setLeadForm({ ...leadForm, propertyId: val, floorId: "", unitId: "" });
                            if (errors.propertyId) {
                              setErrors(prev => {
                                const copy = { ...prev };
                                delete copy.propertyId;
                                return copy;
                              });
                            }
                          }}
                          placeholder="— Select Property —"
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Interested Floor</label>
                        <SearchableSelect
                          options={floorsList.map(f => ({ id: f._id, label: f.floorName || `Floor ${f.floorNumber}` }))}
                          value={leadForm.floorId || ""}
                          disabled={!leadForm.propertyId}
                          onChange={val => {
                            setLeadForm({ ...leadForm, floorId: val, unitId: "" });
                            if (errors.floorId) {
                              setErrors(prev => {
                                const copy = { ...prev };
                                delete copy.floorId;
                                return copy;
                              });
                            }
                          }}
                          placeholder="— Select Floor —"
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Requirement Type</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={leadForm.requirementType || "Office Space"}
                          onChange={e => handleInputChange("lead", "requirementType", e.target.value)}
                        >
                          <option value="Office Space">Office Space</option>
                          <option value="Retail">Retail</option>
                          <option value="Warehouse">Warehouse</option>
                          <option value="Coworking">Coworking</option>
                          <option value="Residential">Residential</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Required Area (SFT)</label>
                        <input
                          type="number"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. 5000"
                          value={leadForm.requiredArea || ""}
                          onChange={e => handleInputChange("lead", "requiredArea", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Lead Source</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={leadForm.source || "Website"}
                          onChange={e => handleInputChange("lead", "source", e.target.value)}
                        >
                          <option value="Website">Website</option>
                          <option value="Referral">Referral</option>
                          <option value="Walk-in">Walk-in</option>
                          <option value="Campaign">Campaign</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Priority Level</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={leadForm.priority || "Medium"}
                          onChange={e => handleInputChange("lead", "priority", e.target.value)}
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="High">High Priority</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Lead Status</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={leadForm.status || "New"}
                          onChange={e => handleInputChange("lead", "status", e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Site Visit">Site Visit</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Sales Owner / Assigned Agent</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={leadForm.owner_id || ""}
                          onChange={e => handleInputChange("lead", "owner_id", e.target.value)}
                        >
                          <option value="">— Select Owner —</option>
                          {users.map((u: any) => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Follow-up Date</label>
                        <input
                          type="date"
                          className="form-control"
                          style={inputStyle}
                          value={leadForm.nextFollowUp ? leadForm.nextFollowUp.split('T')[0] : ""}
                          onChange={e => handleInputChange("lead", "nextFollowUp", e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label style={labelStyle}>Description / Notes</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          style={inputStyle}
                          placeholder="Internal representative notes regarding this prospect..."
                          value={leadForm.notes || ""}
                          onChange={e => handleInputChange("lead", "notes", e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {leadStep === 3 && (
                    <div className="d-flex flex-column gap-3">
                      <div className="p-3 rounded border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                        <h6 className="fw-bold mb-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                          <i className="bi bi-person-fill" style={{ color: "var(--text-muted)" }}></i> Basic Details
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Lead Name</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.lead_name || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Company Name</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.companyName || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Phone Number</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.phone || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Email Address</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.email || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Designation</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.designation || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Industry</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.industry || "—"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                        <h6 className="fw-bold mb-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                          <i className="bi bi-geo-alt-fill" style={{ color: "var(--text-muted)" }}></i> Lead Details & Location
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Interested Property</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {propertiesList.find(p => p._id === leadForm.propertyId)?.propertyName || "—"}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Interested Floor</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {floorsList.find(f => f._id === leadForm.floorId)?.floorName || 
                               (floorsList.find(f => f._id === leadForm.floorId)?.floorNumber ? `Floor ${floorsList.find(f => f._id === leadForm.floorId)?.floorNumber}` : "—")}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Requirement Type</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.requirementType || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Required Area</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.requiredArea ? `${leadForm.requiredArea} SFT` : "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Lead Source</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.source || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Priority Level</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.priority || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Lead Status</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{leadForm.status || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Sales Owner / Agent</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {users.find((u: any) => u._id === leadForm.owner_id)?.name || "—"}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Follow-up Date</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {leadForm.nextFollowUp ? new Date(leadForm.nextFollowUp).toLocaleDateString("en-IN") : "—"}
                            </span>
                          </div>
                          <div className="col-12">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Description / Notes</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{leadForm.notes || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── CONTACT FORM ── */}
              {activeModal === "contact" && (
                <div>
                  {contactStep === 1 && (
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label style={labelStyle}>Full Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? "is-invalid" : ""}`}
                          style={getInputStyle("name")}
                          required
                          placeholder="Enter contact name"
                          value={contactForm.name || ""}
                          onChange={e => handleInputChange("contact", "name", e.target.value)}
                        />
                        {errors.name && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.name}</div>}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Contact Type</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={contactForm.contact_type || "Tenant"}
                          onChange={e => handleInputChange("contact", "contact_type", e.target.value)}
                        >
                          <option value="Tenant">Tenant</option>
                          <option value="Owner">Owner</option>
                          <option value="Employee">Employee</option>
                          <option value="Partner">Partner</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Gender</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={contactForm.gender || ""}
                          onChange={e => handleInputChange("contact", "gender", e.target.value)}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          style={inputStyle}
                          value={contactForm.dob ? contactForm.dob.split('T')[0] : ""}
                          onChange={e => handleInputChange("contact", "dob", e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Mobile Number <span className="text-danger">*</span></label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted border-end-0" style={{ fontSize: "0.75rem", borderTopLeftRadius: "6px", borderBottomLeftRadius: "6px", padding: "8px 12px", borderColor: "var(--border-color)" }}>+91</span>
                          <input
                            type="text"
                            className={`form-control border-start-0 ${errors.phone ? "is-invalid" : ""}`}
                            style={getInputStyle("phone", { borderRadius: "0 6px 6px 0", width: "auto", flex: "1 1 auto" })}
                            required
                            placeholder="Enter mobile number"
                            value={contactForm.phone || ""}
                            onChange={e => handleInputChange("contact", "phone", e.target.value)}
                          />
                        </div>
                        {errors.phone && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.phone}</div>}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Alternate Phone</label>
                        <input
                          type="text"
                          className={`form-control ${errors.alternatePhone ? "is-invalid" : ""}`}
                          style={getInputStyle("alternatePhone")}
                          placeholder="Optional phone number"
                          value={contactForm.alternatePhone || ""}
                          onChange={e => handleInputChange("contact", "alternatePhone", e.target.value)}
                        />
                        {errors.alternatePhone && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.alternatePhone}</div>}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Email Address</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? "is-invalid" : ""}`}
                          style={getInputStyle("email")}
                          placeholder="example@company.com"
                          value={contactForm.email || ""}
                          onChange={e => handleInputChange("contact", "email", e.target.value)}
                        />
                        {errors.email && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.email}</div>}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>WhatsApp Number</label>
                        <input
                          type="text"
                          className={`form-control ${errors.whatsapp ? "is-invalid" : ""}`}
                          style={getInputStyle("whatsapp")}
                          placeholder="WhatsApp contact"
                          value={contactForm.whatsapp || ""}
                          onChange={e => handleInputChange("contact", "whatsapp", e.target.value)}
                        />
                        {errors.whatsapp && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.whatsapp}</div>}
                      </div>
                    </div>
                  )}

                  {contactStep === 2 && (
                    <div className="row g-2">
                      <div className="col-md-12">
                        <label style={labelStyle}>Company / Account</label>
                        <SearchableSelect
                          options={companies ? companies.map(c => ({ id: c._id, label: c.company_name || c.name })) : []}
                          value={contactForm.account_id || ""}
                          hasError={!!errors.account_id}
                          onChange={val => {
                            handleInputChange("contact", "account_id", val);
                          }}
                          placeholder="— Select B2B Account —"
                        />
                        {errors.account_id && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.account_id}</div>}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Designation</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. Director, Finance Manager"
                          value={contactForm.designation || ""}
                          onChange={e => handleInputChange("contact", "designation", e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Department</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. Accounts, Operations"
                          value={contactForm.department || ""}
                          onChange={e => handleInputChange("contact", "department", e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Linked Property</label>
                        <SearchableSelect
                          options={propertiesList.map(p => ({ id: p._id, label: p.propertyName }))}
                          value={contactForm.propertyId || ""}
                          onChange={val => {
                            setContactForm({ ...contactForm, propertyId: val, floorId: "", unitId: "" });
                            if (errors.propertyId) {
                              setErrors(prev => {
                                const copy = { ...prev };
                                delete copy.propertyId;
                                return copy;
                              });
                            }
                          }}
                          placeholder="— Select Property —"
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Linked Floor</label>
                        <SearchableSelect
                          options={floorsList.map(f => ({ id: f._id, label: f.floorName || `Floor ${f.floorNumber}` }))}
                          value={contactForm.floorId || ""}
                          disabled={!contactForm.propertyId}
                          onChange={val => {
                            setContactForm({ ...contactForm, floorId: val, unitId: "" });
                            if (errors.floorId) {
                              setErrors(prev => {
                                const copy = { ...prev };
                                delete copy.floorId;
                                return copy;
                              });
                            }
                          }}
                          placeholder="— Select Floor —"
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Address Line 1</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter street address"
                          value={contactForm.address || ""}
                          onChange={e => handleInputChange("contact", "address", e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Address Line 2</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Apartment / Building"
                          value={contactForm.address2 || ""}
                          onChange={e => handleInputChange("contact", "address2", e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label style={labelStyle}>City</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter city"
                          value={contactForm.city || ""}
                          onChange={e => handleInputChange("contact", "city", e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label style={labelStyle}>State</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter state"
                          value={contactForm.state || ""}
                          onChange={e => handleInputChange("contact", "state", e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label style={labelStyle}>Country</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter country"
                          value={contactForm.country || ""}
                          onChange={e => handleInputChange("contact", "country", e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label style={labelStyle}>Pincode</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter pincode"
                          value={contactForm.pincode || ""}
                          onChange={e => handleInputChange("contact", "pincode", e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label style={labelStyle}>Status</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={contactForm.status || "Active"}
                          onChange={e => handleInputChange("contact", "status", e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label style={labelStyle}>Priority Level</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={contactForm.priority || "Medium"}
                          onChange={e => handleInputChange("contact", "priority", e.target.value)}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label style={labelStyle}>Assigned Employee</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={contactForm.assigned_to || ""}
                          onChange={e => handleInputChange("contact", "assigned_to", e.target.value)}
                        >
                          <option value="">Select owner</option>
                          {users.map((u: any) => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12">
                        <label style={labelStyle}>Customer Notes</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          style={inputStyle}
                          placeholder="Add customer notes..."
                          value={contactForm.notes || ""}
                          onChange={e => handleInputChange("contact", "notes", e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {contactStep === 3 && (
                    <div className="d-flex flex-column gap-3">
                      <div className="p-3 rounded border" style={{ backgroundColor: "white", borderColor: "var(--border-color)" }}>
                        <h6 className="fw-bold mb-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                          <i className="bi bi-person-fill" style={{ color: "var(--text-muted)" }}></i> Basic Details
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Full Name</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.name || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Contact Type</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.contact_type || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Phone Number</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.phone || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Email Address</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.email || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Gender</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.gender || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Date of Birth</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {contactForm.dob ? new Date(contactForm.dob).toLocaleDateString("en-IN") : "—"}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Alternate Phone</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.alternatePhone || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>WhatsApp Number</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.whatsapp || "—"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{ backgroundColor: "white", borderColor: "var(--border-color)" }}>
                        <h6 className="fw-bold mb-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                          <i className="bi bi-geo-alt-fill" style={{ color: "var(--text-muted)" }}></i> Company & Space Details
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>B2B Account / Company</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {companies.find(c => c._id === contactForm.account_id)?.company_name || companies.find(c => c._id === contactForm.account_id)?.name || "—"}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Designation</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.designation || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Department</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.department || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Linked Property</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {propertiesList.find(p => p._id === contactForm.propertyId)?.propertyName || "—"}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Linked Floor</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {floorsList.find(f => f._id === contactForm.floorId)?.floorName || 
                               (floorsList.find(f => f._id === contactForm.floorId)?.floorNumber ? `Floor ${floorsList.find(f => f._id === contactForm.floorId)?.floorNumber}` : "—")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{ backgroundColor: "white", borderColor: "var(--border-color)" }}>
                        <h6 className="fw-bold mb-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                          <i className="bi bi-info-circle-fill" style={{ color: "var(--text-muted)" }}></i> Address & Additional Details
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-12">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Address</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {[
                                contactForm.address,
                                contactForm.address2,
                                contactForm.city,
                                contactForm.state,
                                contactForm.country,
                                contactForm.pincode
                              ].filter(Boolean).join(", ") || "—"}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Status</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.status || "Active"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Priority Level</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{contactForm.priority || "Medium"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Assigned Employee</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {users.find((u: any) => u._id === contactForm.assigned_to)?.name || "—"}
                            </span>
                          </div>
                          <div className="col-12">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Customer Notes</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{contactForm.notes || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── COMPANY FORM ── */}
              {activeModal === "company" && (
                <div>
                  {accountStep === 1 && (
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label style={labelStyle}>Company Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className={`form-control ${errors.company_name ? "is-invalid" : ""}`}
                          style={getInputStyle("company_name")}
                          required
                          placeholder="Enter company name"
                          value={companyForm.company_name || ""}
                          onChange={e => handleInputChange("company", "company_name", e.target.value)}
                        />
                        {errors.company_name && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.company_name}</div>}
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Account Type <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          required
                          value={companyForm.account_type || "Customer"}
                          onChange={e => handleInputChange("company", "account_type", e.target.value)}
                        >
                          <option value="Customer">Customer</option>
                          <option value="Partner">Partner</option>
                          <option value="Vendor">Vendor</option>
                          <option value="Enterprise">Enterprise</option>
                          <option value="Corporate">Corporate</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Industry Category</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={companyForm.industry || "Other"}
                          onChange={e => handleInputChange("company", "industry", e.target.value)}
                        >
                          <option value="Real Estate">Real Estate</option>
                          <option value="IT">IT</option>
                          <option value="Finance">Finance</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Retail">Retail</option>
                          <option value="Education">Education</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Website URL</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. https://company.com"
                          value={companyForm.website || ""}
                          onChange={e => handleInputChange("company", "website", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Registration Number</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter registration number"
                          value={companyForm.registration_number || ""}
                          onChange={e => handleInputChange("company", "registration_number", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>GST Number</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. 36AAAAA0000A1Z5"
                          value={companyForm.gst_number || ""}
                          onChange={e => handleInputChange("company", "gst_number", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>PAN Number</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter PAN number"
                          value={companyForm.pan_number || ""}
                          onChange={e => handleInputChange("company", "pan_number", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Tax ID</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter Tax ID"
                          value={companyForm.tax_id || ""}
                          onChange={e => handleInputChange("company", "tax_id", e.target.value)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label style={labelStyle}>Company Size</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={companyForm.company_size || "1-10"}
                          onChange={e => handleInputChange("company", "company_size", e.target.value)}
                        >
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="200+">200+</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label style={labelStyle}>Employee Count</label>
                        <input
                          type="number"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. 25"
                          value={companyForm.employee_count || 0}
                          onChange={e => handleInputChange("company", "employee_count", parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label style={labelStyle}>Annual Revenue (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. 5000000"
                          value={companyForm.annual_revenue || 0}
                          onChange={e => handleInputChange("company", "annual_revenue", parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div className="col-12">
                        <label style={labelStyle}>Business Category</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. SaaS provider, Logistics"
                          value={companyForm.business_category || ""}
                          onChange={e => handleInputChange("company", "business_category", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {accountStep === 2 && (
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label style={labelStyle}>Primary Contact Name</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Enter contact name"
                          value={companyForm.contact_name || ""}
                          onChange={e => handleInputChange("company", "contact_name", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Designation</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. Facility Manager / Director"
                          value={companyForm.designation || ""}
                          onChange={e => handleInputChange("company", "designation", e.target.value)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label style={labelStyle}>Mobile Number</label>
                        <input
                          type="text"
                          className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                          style={getInputStyle("phone")}
                          placeholder="Enter mobile number"
                          value={companyForm.phone || ""}
                          onChange={e => handleInputChange("company", "phone", e.target.value)}
                        />
                        {errors.phone && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.phone}</div>}
                      </div>

                      <div className="col-md-4">
                        <label style={labelStyle}>Email Address</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? "is-invalid" : ""}`}
                          style={getInputStyle("email")}
                          placeholder="example@company.com"
                          value={companyForm.email || ""}
                          onChange={e => handleInputChange("company", "email", e.target.value)}
                        />
                        {errors.email && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.email}</div>}
                      </div>

                      <div className="col-md-4">
                        <label style={labelStyle}>WhatsApp</label>
                        <input
                          type="text"
                          className={`form-control ${errors.whatsapp ? "is-invalid" : ""}`}
                          style={getInputStyle("whatsapp")}
                          placeholder="WhatsApp number"
                          value={companyForm.whatsapp || ""}
                          onChange={e => handleInputChange("company", "whatsapp", e.target.value)}
                        />
                        {errors.whatsapp && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.whatsapp}</div>}
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Address Line 1</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Apartment, unit, suite"
                          value={companyForm.address || ""}
                          onChange={e => handleInputChange("company", "address", e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label style={labelStyle}>Address Line 2</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Building, street, area"
                          value={companyForm.address2 || ""}
                          onChange={e => handleInputChange("company", "address2", e.target.value)}
                        />
                      </div>

                      <div className="col-md-3">
                        <label style={labelStyle}>City</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="City name"
                          value={companyForm.city || ""}
                          onChange={e => handleInputChange("company", "city", e.target.value)}
                        />
                      </div>

                      <div className="col-md-3">
                        <label style={labelStyle}>State</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="State name"
                          value={companyForm.state || ""}
                          onChange={e => handleInputChange("company", "state", e.target.value)}
                        />
                      </div>

                      <div className="col-md-3">
                        <label style={labelStyle}>Country</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Country name"
                          value={companyForm.country || ""}
                          onChange={e => handleInputChange("company", "country", e.target.value)}
                        />
                      </div>

                      <div className="col-md-3">
                        <label style={labelStyle}>Pincode</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="Pincode"
                          value={companyForm.pincode || ""}
                          onChange={e => handleInputChange("company", "pincode", e.target.value)}
                        />
                      </div>

                      <div className="col-md-4">
                        <label style={labelStyle}>Account Owner</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={companyForm.owner_id || ""}
                          onChange={e => handleInputChange("company", "owner_id", e.target.value)}
                        >
                          <option value="">Select Employee</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label style={labelStyle}>Source</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={companyForm.source || "Direct"}
                          onChange={e => handleInputChange("company", "source", e.target.value)}
                        >
                          <option value="Website">Website</option>
                          <option value="Referral">Referral</option>
                          <option value="Campaign">Campaign</option>
                          <option value="Direct">Direct</option>
                          <option value="Partner">Partner</option>
                        </select>
                      </div>

                      <div className="col-md-2">
                        <label style={labelStyle}>Priority</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={companyForm.priority || "Medium"}
                          onChange={e => handleInputChange("company", "priority", e.target.value)}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <div className="col-md-2">
                        <label style={labelStyle}>Status</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={companyForm.status || "Active"}
                          onChange={e => handleInputChange("company", "status", e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label style={labelStyle}>Description & Notes</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          style={inputStyle}
                          placeholder="Add account information..."
                          value={companyForm.notes || ""}
                          onChange={e => handleInputChange("company", "notes", e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {accountStep === 3 && (
                    <div className="d-flex flex-column gap-3">
                      {/* Card 1: Company Profile */}
                      <div className="p-3 rounded border" style={{ backgroundColor: "white", borderColor: "var(--border-color)" }}>
                        <h6 className="fw-bold mb-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                          <i className="bi bi-building" style={{ color: "var(--text-muted)" }}></i> Company Profile
                        </h6>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div 
                            className="rounded bg-light border d-flex align-items-center justify-content-center"
                            style={{ width: "48px", height: "48px", minWidth: "48px" }}
                          >
                            <i className="bi bi-building text-muted" style={{ fontSize: "1.5rem" }}></i>
                          </div>
                          <div>
                            <span className="fw-bold text-dark d-block" style={{ fontSize: "1rem" }}>{companyForm.company_name || "—"}</span>
                            <span className="badge px-2 py-0.5 mt-1 fw-semibold" style={{ fontSize: "0.7rem", backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "10px" }}>
                              {companyForm.account_type || "Customer"}
                            </span>
                          </div>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Industry</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.industry || "—"}</span>
                          </div>
                          <div className="col-md-4">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Website</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.website || "—"}</span>
                          </div>
                          <div className="col-md-4">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Company Size</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.company_size || "—"}</span>
                          </div>
                          <div className="col-md-4">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Employee Count</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.employee_count || "0"}</span>
                          </div>
                          <div className="col-md-4">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Annual Revenue</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {companyForm.annual_revenue ? `₹${companyForm.annual_revenue.toLocaleString("en-IN")}` : "—"}
                            </span>
                          </div>
                          <div className="col-md-4">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Business Category</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.business_category || "—"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Legal Details */}
                      <div className="p-3 rounded border" style={{ backgroundColor: "white", borderColor: "var(--border-color)" }}>
                        <h6 className="fw-bold mb-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                          <i className="bi bi-shield-check" style={{ color: "var(--text-muted)" }}></i> Legal & Registration
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Registration Number</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.registration_number || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>GST Number</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.gst_number || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>PAN Number</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.pan_number || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Tax ID</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.tax_id || "—"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Contact & Address Details */}
                      <div className="p-3 rounded border" style={{ backgroundColor: "white", borderColor: "var(--border-color)" }}>
                        <h6 className="fw-bold mb-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                          <i className="bi bi-person-badge" style={{ color: "var(--text-muted)" }}></i> Contact & Address Details
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Primary Contact Name</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.contact_name || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Designation</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.designation || "—"}</span>
                          </div>
                          <div className="col-md-4">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Mobile Number</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.phone || "—"}</span>
                          </div>
                          <div className="col-md-4">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Email Address</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.email || "—"}</span>
                          </div>
                          <div className="col-md-4">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>WhatsApp</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.whatsapp || "—"}</span>
                          </div>
                          <div className="col-12">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Address</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {[
                                companyForm.address,
                                companyForm.address2,
                                companyForm.city,
                                companyForm.state,
                                companyForm.country,
                                companyForm.pincode
                              ].filter(Boolean).join(", ") || "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card 4: CRM settings & Notes */}
                      <div className="p-3 rounded border" style={{ backgroundColor: "white", borderColor: "var(--border-color)" }}>
                        <h6 className="fw-bold mb-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                          <i className="bi bi-gear" style={{ color: "var(--text-muted)" }}></i> CRM Ownership & Notes
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Account Owner</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {users.find(u => u._id === companyForm.owner_id)?.name || "—"}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Source</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.source || "—"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Priority</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.priority || "Medium"}</span>
                          </div>
                          <div className="col-md-6">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Status</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{companyForm.status || "Active"}</span>
                          </div>
                          <div className="col-12">
                            <span className="d-block" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Description & Notes</span>
                            <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{companyForm.notes || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── DEAL FORM ── */}
              {activeModal === "deal" && (
                <div>
                  {dealStep === 1 && (
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label style={labelStyle}>Deal Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          required
                          placeholder="e.g. Block B 4th Floor Lease"
                          value={dealForm.name || ""}
                          onChange={e => setDealForm({ ...dealForm, name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Deal Valuation Amount (₹) <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          style={inputStyle}
                          required
                          placeholder="e.g. 1500000"
                          value={dealForm.amount || ""}
                          onChange={e => setDealForm({ ...dealForm, amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Deal Type</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={dealForm.deal_type || "New Lease"}
                          onChange={e => setDealForm({ ...dealForm, deal_type: e.target.value })}
                        >
                          <option value="New Lease">New Lease</option>
                          <option value="Renewal">Renewal</option>
                          <option value="Purchase">Purchase</option>
                          <option value="Service">Service</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Contract Duration</label>
                        <input
                          type="text"
                          className="form-control"
                          style={inputStyle}
                          placeholder="e.g. 12 Months, 3 Years"
                          value={dealForm.contract_duration || ""}
                          onChange={e => setDealForm({ ...dealForm, contract_duration: e.target.value })}
                        />
                      </div>
                      <div className="col-md-12">
                        <label style={labelStyle}>Assigned Owner</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={dealForm.owner || ""}
                          onChange={e => setDealForm({ ...dealForm, owner: e.target.value })}
                        >
                          <option value="">— Select Owner —</option>
                          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {dealStep === 2 && (
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label style={labelStyle}>B2B Account <span className="text-danger">*</span></label>
                        <SearchableSelect
                          options={companies.map(c => ({ id: c._id, label: c.company_name || c.name }))}
                          value={dealForm.account_id || ""}
                          hasError={!!errors.account_id}
                          onChange={val => {
                            setDealForm({ ...dealForm, account_id: val, contact_id: "" });
                            if (errors.account_id) {
                              setErrors(prev => {
                                const copy = { ...prev };
                                delete copy.account_id;
                                return copy;
                              });
                            }
                          }}
                          placeholder="— Select Account —"
                        />
                        {errors.account_id && <div className="invalid-feedback d-block" style={{ fontSize: "0.7rem" }}>{errors.account_id}</div>}
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Contact Person</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={dealForm.contact_id || ""}
                          disabled={!dealForm.account_id}
                          onChange={e => setDealForm({ ...dealForm, contact_id: e.target.value })}
                        >
                          <option value="">— Select Contact —</option>
                          {contactsList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label style={labelStyle}>Associated Lead (Optional)</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={dealForm.lead_id || ""}
                          onChange={e => setDealForm({ ...dealForm, lead_id: e.target.value })}
                        >
                          <option value="">— Select Source Lead —</option>
                          {leads.map(l => <option key={l._id} value={l._id}>{l.lead_name || l.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {dealStep === 3 && (
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label style={labelStyle}>Property</label>
                        <SearchableSelect
                          options={propertiesList.map(p => ({ id: p._id, label: p.propertyName }))}
                          value={dealForm.propertyId || ""}
                          onChange={val => {
                            setDealForm({ ...dealForm, propertyId: val, floorId: "", unitId: "" });
                          }}
                          placeholder="— Select Property —"
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Floor</label>
                        <SearchableSelect
                          options={floorsList.map(f => ({ id: f._id, label: f.floorName || `Floor ${f.floorNumber}` }))}
                          value={dealForm.floorId || ""}
                          disabled={!dealForm.propertyId}
                          onChange={val => {
                            setDealForm({ ...dealForm, floorId: val, unitId: "" });
                          }}
                          placeholder="— Select Floor —"
                        />
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Pipeline Stage</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={dealForm.stage || "New"}
                          onChange={e => setDealForm({ ...dealForm, stage: e.target.value })}
                        >
                          <option value="New">New</option>
                          <option value="Site Visit">Site Visit</option>
                          <option value="Discussion">Discussion</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={labelStyle}>Deal Status</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          value={dealForm.status || "Open"}
                          onChange={e => setDealForm({ ...dealForm, status: e.target.value })}
                        >
                          <option value="Open">Open</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label style={labelStyle}>Expected Close Date</label>
                        <input
                          type="date"
                          className="form-control"
                          style={inputStyle}
                          value={dealForm.expectedCloseDate ? dealForm.expectedCloseDate.split('T')[0] : ""}
                          onChange={e => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}



              {/* ── ACTIVITY FORM ── */}
              {activeModal === "activity" && (
                <div className="row g-2">
                  <div className="col-md-6">
                    <label style={labelStyle}>Activity Type <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      style={inputStyle}
                      value={activityForm.type}
                      onChange={e => setActivityForm({ ...activityForm, type: e.target.value })}
                    >
                      <option value="Call">Phone Call</option>
                      <option value="Meeting">Face-to-face Meeting</option>
                      <option value="Email">Email Thread</option>
                      <option value="WhatsApp">WhatsApp Message</option>
                      <option value="Note">System Note</option>
                      <option value="Demo">Site Demo</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Activity Title <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      style={inputStyle}
                      required
                      placeholder="e.g. Initial intro call"
                      value={activityForm.title}
                      onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      style={inputStyle}
                      required
                      value={activityForm.date}
                      onChange={e => setActivityForm({ ...activityForm, date: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Time</label>
                    <input
                      type="time"
                      className="form-control"
                      style={inputStyle}
                      value={activityForm.time}
                      onChange={e => setActivityForm({ ...activityForm, time: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>Detailed Conversation Summary</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      style={inputStyle}
                      placeholder="Describe what was discussed, client feedback, next steps..."
                      value={activityForm.description}
                      onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <div
              className="d-flex align-items-center justify-content-between px-4 py-3 border-top"
              style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
            >
              <div>
                {/* Back button for multi-step */}
                {activeModal === "lead" && leadStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-white border fw-bold px-3 py-1.5"
                    style={{ borderRadius: "6px", fontSize: "0.8rem" }}
                    onClick={() => setLeadStep(prev => prev - 1)}
                  >
                    Back
                  </button>
                )}
                {activeModal === "contact" && contactStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-white border fw-bold px-3 py-1.5"
                    style={{ borderRadius: "6px", fontSize: "0.8rem" }}
                    onClick={() => setContactStep(prev => prev - 1)}
                  >
                    Back
                  </button>
                )}
                {activeModal === "deal" && dealStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-white border fw-bold px-3 py-1.5"
                    style={{ borderRadius: "6px", fontSize: "0.8rem" }}
                    onClick={() => setDealStep(prev => prev - 1)}
                  >
                    Back
                  </button>
                )}
                {activeModal === "company" && accountStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-white border fw-bold px-3 py-1.5"
                    style={{ borderRadius: "6px", fontSize: "0.8rem" }}
                    onClick={() => setAccountStep(prev => prev - 1)}
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-white border fw-bold px-3 py-1.5"
                  style={{ borderRadius: "6px", fontSize: "0.8rem" }}
                  onClick={onClose}
                >
                  Cancel
                </button>

                {/* Render Next or Submit */}
                {activeModal === "lead" && leadStep < 3 ? (
                  <button
                    type="submit"
                    className="btn btn-dark btn-sm fw-bold px-3 py-1.5"
                    style={{ backgroundColor: "var(--text-primary)", borderRadius: "6px", fontSize: "0.78rem", color: "var(--bg-card)" }}
                  >
                    Next
                  </button>
                ) : activeModal === "contact" && contactStep < 3 ? (
                  <button
                    type="submit"
                    className="btn btn-dark btn-sm fw-bold px-3 py-1.5"
                    style={{ backgroundColor: "var(--text-primary)", borderRadius: "6px", fontSize: "0.78rem", color: "var(--bg-card)" }}
                  >
                    Next
                  </button>
                ) : activeModal === "deal" && dealStep < 3 ? (
                  <button
                    type="submit"
                    className="btn btn-dark btn-sm fw-bold px-3 py-1.5"
                    style={{ backgroundColor: "var(--text-primary)", borderRadius: "6px", fontSize: "0.78rem", color: "var(--bg-card)" }}
                  >
                    Next
                  </button>
                ) : activeModal === "company" && accountStep < 3 ? (
                  <button
                    type="submit"
                    className="btn btn-dark btn-sm fw-bold px-3 py-1.5"
                    style={{ backgroundColor: "var(--text-primary)", borderRadius: "6px", fontSize: "0.78rem", color: "var(--bg-card)" }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-dark btn-sm fw-bold px-3 py-1.5"
                    style={{ backgroundColor: "var(--text-primary)", borderRadius: "6px", fontSize: "0.78rem", color: "var(--bg-card)" }}
                  >
                    {activeModal === "company" ? "Save Account" : "Save Record"}
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
