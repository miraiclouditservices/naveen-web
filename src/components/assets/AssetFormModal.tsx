"use client";
import React, { useState, useEffect, useRef } from "react";
import { api } from "@/utils/api";

const ASSET_CATEGORIES = [
  "HVAC Systems",
  "Electrical Systems",
  "Power Backup Systems",
  "Security Systems",
  "Fire & Safety Equipment",
  "Plumbing & Water Systems",
  "Elevator & Escalator Systems",
  "Building Infrastructure",
  "Furniture & Fixtures",
  "IT & Networking Equipment",
  "CCTV & Surveillance",
  "Access Control Systems",
  "Kitchen Equipment",
  "Laundry Equipment",
  "Cleaning Equipment",
  "Gardening & Landscaping",
  "Energy Management Systems",
  "Solar & Renewable Energy",
  "Generator & UPS",
  "Transformer & Electrical Panels",
  "Lighting Systems",
  "Parking & Vehicle Equipment",
  "EV Charging Systems",
  "Office Equipment",
  "Communication Equipment",
  "Medical & Emergency Equipment",
  "Water Treatment Systems",
  "Waste Management Equipment",
  "Miscellaneous / Others"
];

interface AssetFormModalProps {
  mode: "create" | "edit";
  editData?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

function buildForm(data?: any) {
  const formatDate = (date: any) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return {
    _id: data?._id || undefined,
    
    // 1. Asset Basic Information
    assetName: data?.assetName || data?.assetDescription || "",
    assetCode: data?.assetCode || "",
    category: data?.category || "Miscellaneous / Others",
    subCategory: data?.subCategory || "",
    assetType: data?.assetType || "",
    brandName: data?.brandName || data?.makeBrand || data?.make || "",
    modelNumber: data?.modelNumber || "",
    serialNumber: data?.serialNumber || "",
    assetDescription: data?.assetDescription || "",

    // 2. Asset Ownership & Location
    companyName: data?.companyName || "",
    property: typeof data?.property === "object" ? data.property?._id : data?.property || "",
    buildingName: data?.buildingName || "",
    floorNumber: data?.floorNumber !== undefined ? String(data.floorNumber) : "",
    unit: typeof data?.unit === "object" ? data.unit?._id : data?.unit || "",
    department: data?.department || "",
    assetOwner: data?.assetOwner || "",
    assignedPerson: data?.assignedPerson || "",
    serviceLocation: data?.serviceLocation || data?.assetLocation || "",

    // 3. Purchase Details
    purchaseDate: formatDate(data?.purchaseDate),
    purchaseVendor: typeof data?.purchaseVendor === "object" ? data.purchaseVendor?._id : data?.purchaseVendor || "",
    purchaseInvoiceNumber: data?.purchaseInvoiceNumber || "",
    purchaseAmount: data?.purchaseAmount !== undefined ? String(data.purchaseAmount) : "",
    taxAmount: data?.taxAmount !== undefined ? String(data.taxAmount) : "",
    totalPurchaseCost: data?.totalPurchaseCost !== undefined ? String(data.totalPurchaseCost) : "",
    warrantyStartDate: formatDate(data?.warrantyStartDate),
    warrantyEndDate: formatDate(data?.warrantyEndDate),

    // 4. Asset Status & Condition
    assetStatus: data?.assetStatus || "Active",
    assetCondition: data?.assetCondition || "Good",
    installationDate: formatDate(data?.installationDate),

    // 5. Vendor Assignment Fields (Active Partner)
    vendor: typeof data?.vendor === "object" ? data.vendor?._id : data?.vendor || "",
    vendorName: data?.vendorName || "",
    vendorId: data?.vendorId || "",
    serviceCategory: data?.serviceCategory || "",
    contactName: data?.contactName || "",
    contactNumber: data?.contactNumber || "",
    vendorEmail: data?.vendorEmail || "",
    vendorGst: data?.vendorGst || "",
    contractReferenceNumber: data?.contractReferenceNumber || "",

    // 6. AMC Contract Form
    amcId: data?.amcId || "",
    amcType: data?.amcType || "Comprehensive",
    amcStartDate: formatDate(data?.amcStartDate),
    amcEndDate: formatDate(data?.amcEndDate),
    amcDuration: data?.amcDuration || "",
    contractValue: data?.contractValue !== undefined ? String(data.contractValue) : "",
    amcTaxAmount: data?.amcTaxAmount !== undefined ? String(data.amcTaxAmount) : "",
    totalContractAmount: data?.totalContractAmount !== undefined ? String(data.totalContractAmount) : "",

    // 7. Billing Details
    billingFrequency: data?.billingFrequency || "Yearly",
    invoiceGenerationDate: formatDate(data?.invoiceGenerationDate),
    paymentDueDays: data?.paymentDueDays !== undefined ? String(data.paymentDueDays) : "30",
    paymentTerms: data?.paymentTerms || "",

    // 8. Service Schedule
    maintenanceFrequency: data?.maintenanceFrequency || "Monthly",
    servicesIncluded: data?.servicesIncluded !== undefined ? String(data.servicesIncluded) : "4",
    nextServiceDate: formatDate(data?.nextServiceDate),
    slaResponseTime: data?.slaResponseTime || "",
    slaResolutionTime: data?.slaResolutionTime || "",

    // 9. AMC Payment Fields
    amcInvoiceNumber: data?.amcInvoiceNumber || "",
    amcInvoiceDate: formatDate(data?.amcInvoiceDate),
    billingPeriod: data?.billingPeriod || "",
    invoiceAmount: data?.invoiceAmount !== undefined ? String(data.invoiceAmount) : "",
    paidAmount: data?.paidAmount !== undefined ? String(data.paidAmount) : "",
    pendingAmount: data?.pendingAmount !== undefined ? String(data.pendingAmount) : "",
    paymentDate: formatDate(data?.paymentDate),
    paymentMode: data?.paymentMode || "",
    transactionReference: data?.transactionReference || "",
    paymentStatus: data?.paymentStatus || "Pending",

    // 10. Service Requests & History (Arrays)
    serviceRequests: data?.serviceRequests || [],
    maintenanceHistory: data?.maintenanceHistory || [],

    // 12. Asset Disposal Fields
    disposalDate: formatDate(data?.disposalDate),
    disposalReason: data?.disposalReason || "",
    disposalType: data?.disposalType || "",
    saleValue: data?.saleValue !== undefined ? String(data.saleValue) : "",
    approvedBy: data?.approvedBy || "",
    disposalDocument: data?.disposalDocument || "",
  };
}

export default function AssetFormModal({
  mode,
  editData,
  onSubmit,
  onClose,
  isSubmitting = false,
}: AssetFormModalProps) {
  const [formData, setFormData] = useState(() => buildForm(editData));
  const [activeTab, setActiveTab] = useState("basic");
  
  // Select Options State
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(ASSET_CATEGORIES);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Expanded Inline Form States (For Service Tickets / Maintenance Logs)
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    issueTitle: "",
    problemDescription: "",
    priority: "Medium",
    assignedTechnician: "",
    dueDate: "",
  });

  const [showAddMh, setShowAddMh] = useState(false);
  const [newMh, setNewMh] = useState({
    serviceDate: new Date().toISOString().split("T")[0],
    serviceType: "Preventive",
    technician: "",
    problemFound: "",
    actionTaken: "",
    partsReplaced: "",
    materialCost: "",
    labourCost: "",
    nextServiceDate: "",
  });

  // Dropdown UI States
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryContainerRef = useRef<HTMLDivElement>(null);

  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");
  const propertyContainerRef = useRef<HTMLDivElement>(null);

  const [showFloorDropdown, setShowFloorDropdown] = useState(false);
  const [floorSearch, setFloorSearch] = useState("");
  const floorContainerRef = useRef<HTMLDivElement>(null);

  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [unitSearch, setUnitSearch] = useState("");
  const unitContainerRef = useRef<HTMLDivElement>(null);

  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const vendorContainerRef = useRef<HTMLDivElement>(null);

  const [showPVendorDropdown, setShowPVendorDropdown] = useState(false);
  const [pVendorSearch, setPVendorSearch] = useState("");
  const pVendorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (categoryContainerRef.current && !categoryContainerRef.current.contains(target)) setShowCategoryDropdown(false);
      if (propertyContainerRef.current && !propertyContainerRef.current.contains(target)) setShowPropertyDropdown(false);
      if (floorContainerRef.current && !floorContainerRef.current.contains(target)) setShowFloorDropdown(false);
      if (unitContainerRef.current && !unitContainerRef.current.contains(target)) setShowUnitDropdown(false);
      if (vendorContainerRef.current && !vendorContainerRef.current.contains(target)) setShowVendorDropdown(false);
      if (pVendorContainerRef.current && !pVendorContainerRef.current.contains(target)) setShowPVendorDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setFormData(buildForm(editData));
  }, [editData]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [propRes, unitRes, vendorRes, catRes] = await Promise.all([
          api.get("/properties"),
          api.get("/units"),
          api.get("/vendors?limit=1000"),
          api.get("/assets/categories").catch(() => null),
        ]);
        if (propRes.success) setProperties(propRes.data);
        if (unitRes.success) setUnits(unitRes.data);
        if (vendorRes.success) setVendors(vendorRes.data);
        if (catRes && catRes.success && catRes.data && catRes.data.length > 0) {
          const names = catRes.data.map((c: any) => c.categoryName);
          setDynamicCategories(names);
        }
      } catch (err) {
        console.error("Failed to fetch form options:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchFloors = async () => {
      if (!formData.property) {
        setFloors([]);
        return;
      }
      try {
        const res = await api.get(`/floors?property=${formData.property}&limit=1000`);
        if (res.success) setFloors(res.data);
      } catch (err) {
        console.error("Failed to fetch floors:", err);
      }
    };
    fetchFloors();
  }, [formData.property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Real-time calculated totals
      if (name === "purchaseAmount" || name === "taxAmount") {
        const amt = parseFloat(updated.purchaseAmount) || 0;
        const tax = parseFloat(updated.taxAmount) || 0;
        updated.totalPurchaseCost = String(amt + tax);
      }
      if (name === "contractValue" || name === "amcTaxAmount") {
        const val = parseFloat(updated.contractValue) || 0;
        const tax = parseFloat(updated.amcTaxAmount) || 0;
        updated.totalContractAmount = String(val + tax);
      }
      if (name === "invoiceAmount" || name === "paidAmount") {
        const inv = parseFloat(updated.invoiceAmount) || 0;
        const paid = parseFloat(updated.paidAmount) || 0;
        updated.pendingAmount = String(inv - paid);
        if (inv > 0) {
          if (inv - paid <= 0) updated.paymentStatus = "Paid";
          else if (paid > 0) updated.paymentStatus = "Partial";
          else updated.paymentStatus = "Pending";
        }
      }
      return updated;
    });
  };

  const handleAddTicket = () => {
    if (!newTicket.issueTitle) return;
    setFormData(prev => ({
      ...prev,
      serviceRequests: [...prev.serviceRequests, { ...newTicket, status: "Open", createdDate: new Date().toISOString() }]
    }));
    setNewTicket({ issueTitle: "", problemDescription: "", priority: "Medium", assignedTechnician: "", dueDate: "" });
    setShowAddTicket(false);
  };

  const handleAddMh = () => {
    const mat = parseFloat(newMh.materialCost) || 0;
    const lab = parseFloat(newMh.labourCost) || 0;
    const total = mat + lab;

    setFormData(prev => ({
      ...prev,
      maintenanceHistory: [...prev.maintenanceHistory, { ...newMh, materialCost: mat, labourCost: lab, totalServiceCost: total }]
    }));
    setNewMh({
      serviceDate: new Date().toISOString().split("T")[0],
      serviceType: "Preventive",
      technician: "",
      problemFound: "",
      actionTaken: "",
      partsReplaced: "",
      materialCost: "",
      labourCost: "",
      nextServiceDate: "",
    });
    setShowAddMh(false);
  };

  const handleRemoveTicket = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceRequests: prev.serviceRequests.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleRemoveMh = (index: number) => {
    setFormData(prev => ({
      ...prev,
      maintenanceHistory: prev.maintenanceHistory.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Numeric casts
    const payload = {
      ...formData,
      floorNumber: formData.floorNumber !== "" ? Number(formData.floorNumber) : undefined,
      purchaseAmount: formData.purchaseAmount !== "" ? Number(formData.purchaseAmount) : 0,
      taxAmount: formData.taxAmount !== "" ? Number(formData.taxAmount) : 0,
      contractValue: formData.contractValue !== "" ? Number(formData.contractValue) : 0,
      amcTaxAmount: formData.amcTaxAmount !== "" ? Number(formData.amcTaxAmount) : 0,
      invoiceAmount: formData.invoiceAmount !== "" ? Number(formData.invoiceAmount) : 0,
      paidAmount: formData.paidAmount !== "" ? Number(formData.paidAmount) : 0,
      paymentDueDays: formData.paymentDueDays !== "" ? Number(formData.paymentDueDays) : 30,
      servicesIncluded: formData.servicesIncluded !== "" ? Number(formData.servicesIncluded) : 4,
      saleValue: formData.saleValue !== "" ? Number(formData.saleValue) : 0,

      property: formData.property || undefined,
      unit: formData.unit || undefined,
      vendor: formData.vendor || undefined,
      purchaseVendor: formData.purchaseVendor || undefined,
    };

    // Clean up empty fields to avoid casting issues in Mongoose
    if (!payload.assetCode) delete payload.assetCode;
    if (!payload.property) delete payload.property;
    if (!payload.unit) delete payload.unit;
    if (!payload.vendor) delete payload.vendor;
    if (!payload.purchaseVendor) delete payload.purchaseVendor;

    onSubmit(payload);
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "4px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.03em"
  };

  const inputStyle: React.CSSProperties = {
    fontSize: "0.825rem",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-app)",
    color: "var(--text-primary)",
    outline: "none"
  };

  const tabs = [
    { id: "basic", label: "1. Asset & Location", icon: "bi-info-circle" },
    { id: "purchase", label: "2. Purchase & Vendor SLA", icon: "bi-cart-check" },
    { id: "amc", label: "3. AMC Contract", icon: "bi-shield-check" },
    { id: "ledger", label: "4. Payments Ledger", icon: "bi-credit-card" },
    { id: "operations", label: "5. Operations & Logs", icon: "bi-tools" },
  ];

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1100, backdropFilter: "blur(8px)" }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 900 }}>
        <div
          className="modal-content border-0 overflow-hidden shadow-2xl"
          style={{ borderRadius: "16px", backgroundColor: "var(--bg-card)" }}
        >
          {/* Header */}
          <div
            className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div>
              <h5 className="mb-0 fw-bold text-gradient" style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>
                {mode === "create" ? "Add Enterprise Asset" : `Edit Asset: ${formData.assetName || "Details"}`}
              </h5>
              <p className="mb-0 text-muted small" style={{ fontSize: "0.75rem" }}>
                Configure comprehensive specifications, warranty timelines, and AMC service partners.
              </p>
            </div>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              style={{ filter: "var(--close-filter)" }}
            />
          </div>

          {/* Sleek Tab Bar */}
          <div className="d-flex bg-light px-3 py-2 gap-1 border-bottom" style={{ borderColor: "var(--border-color)" }}>
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-2 border-0 px-3 py-2 fw-semibold transition-all rounded-3`}
                style={{
                  fontSize: "0.8rem",
                  backgroundColor: activeTab === t.id ? "var(--text-primary)" : "transparent",
                  color: activeTab === t.id ? "var(--bg-card)" : "var(--text-muted)",
                }}
                onClick={() => setActiveTab(t.id)}
              >
                <i className={`bi ${t.icon}`} />
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Scrollable Body Container */}
            <div
              className="px-4 py-4"
              style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto", minHeight: "420px" }}
            >
              {loadingOptions ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
                  <div className="spinner-border spinner-border-sm mb-3" />
                  <span className="small">Fetching properties, units, and categories...</span>
                </div>
              ) : (
                <div>
                  {/* --- TAB 1: BASIC & LOCATION --- */}
                  {activeTab === "basic" && (
                    <div className="animate-fade-in">
                      <h6 className="fw-bold mb-3 text-uppercase small text-muted" style={{ letterSpacing: "0.05em" }}>
                        1. Asset Basic Information
                      </h6>
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label style={labelStyle}>Asset Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="assetName"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Passenger Lift - 1"
                            value={formData.assetName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>Asset Code / Asset ID</label>
                          <input
                            type="text"
                            name="assetCode"
                            className="form-control"
                            style={inputStyle}
                            placeholder="AST-XXXXX (Auto-generated if blank)"
                            value={formData.assetCode}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4 position-relative" ref={categoryContainerRef}>
                          <label style={labelStyle}>Asset Category <span className="text-danger">*</span></label>
                          <div
                            className="form-control d-flex justify-content-between align-items-center"
                            style={{ ...inputStyle, cursor: "pointer" }}
                            onClick={() => setShowCategoryDropdown(prev => !prev)}
                          >
                            <span>{formData.category}</span>
                            <i className="bi bi-chevron-down text-muted small" />
                          </div>
                          {showCategoryDropdown && (
                            <div className="dropdown-menu show shadow-lg border p-2 position-absolute w-100 mt-1 rounded-3 bg-white" style={{ zIndex: 1050, maxHeight: "250px", overflowY: "auto" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm mb-2"
                                placeholder="Filter category..."
                                value={categorySearch}
                                onChange={e => setCategorySearch(e.target.value)}
                                style={{ fontSize: "0.75rem" }}
                              />
                              {dynamicCategories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).map(c => (
                                <button
                                  key={c}
                                  type="button"
                                  className="dropdown-item rounded px-3 py-1.5 small text-start w-100"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, category: c }));
                                    setShowCategoryDropdown(false);
                                    setCategorySearch("");
                                  }}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Asset Sub Category</label>
                          <input
                            type="text"
                            name="subCategory"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Passenger Transport"
                            value={formData.subCategory}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Asset Type</label>
                          <input
                            type="text"
                            name="assetType"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Traction Elevator"
                            value={formData.assetType}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Brand Name</label>
                          <input
                            type="text"
                            name="brandName"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Otis"
                            value={formData.brandName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Model Number</label>
                          <input
                            type="text"
                            name="modelNumber"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Gen2-S"
                            value={formData.modelNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Serial Number</label>
                          <input
                            type="text"
                            name="serialNumber"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. OT-88231-M"
                            value={formData.serialNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-12">
                          <label style={labelStyle}>Asset Description</label>
                          <textarea
                            name="assetDescription"
                            className="form-control"
                            rows={2}
                            style={inputStyle}
                            placeholder="Describe the asset specification, capacity, or custom remarks..."
                            value={formData.assetDescription}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3 text-uppercase small text-muted pt-2" style={{ letterSpacing: "0.05em" }}>
                        2. Asset Ownership & Location
                      </h6>
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label style={labelStyle}>Company / Organization <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="companyName"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Anvaya360 Corp"
                            value={formData.companyName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 position-relative" ref={propertyContainerRef}>
                          <label style={labelStyle}>Property <span className="text-danger">*</span></label>
                          <div
                            className="form-control d-flex justify-content-between align-items-center"
                            style={{ ...inputStyle, cursor: "pointer" }}
                            onClick={() => setShowPropertyDropdown(prev => !prev)}
                          >
                            <span>{properties.find(p => p._id === formData.property)?.propertyName || "Select Property..."}</span>
                            <i className="bi bi-chevron-down text-muted small" />
                          </div>
                          {showPropertyDropdown && (
                            <div className="dropdown-menu show shadow-lg border p-2 position-absolute w-100 mt-1 rounded-3 bg-white" style={{ zIndex: 1050, maxHeight: "250px", overflowY: "auto" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm mb-2"
                                placeholder="Filter property..."
                                value={propertySearch}
                                onChange={e => setPropertySearch(e.target.value)}
                                style={{ fontSize: "0.75rem" }}
                              />
                              {properties.filter(p => p.propertyName?.toLowerCase().includes(propertySearch.toLowerCase())).map(p => (
                                <button
                                  key={p._id}
                                  type="button"
                                  className="dropdown-item rounded px-3 py-1.5 small text-start w-100"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, property: p._id, floorNumber: "", unit: "" }));
                                    setShowPropertyDropdown(false);
                                    setPropertySearch("");
                                  }}
                                >
                                  {p.propertyName}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Building Name</label>
                          <input
                            type="text"
                            name="buildingName"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Block A"
                            value={formData.buildingName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4 position-relative" ref={floorContainerRef}>
                          <label style={labelStyle}>Floor Level</label>
                          <div
                            className={`form-control d-flex justify-content-between align-items-center ${!formData.property ? "text-muted" : ""}`}
                            style={{ ...inputStyle, cursor: formData.property ? "pointer" : "not-allowed" }}
                            onClick={() => formData.property && setShowFloorDropdown(prev => !prev)}
                          >
                            <span>
                              {(() => {
                                if (!formData.property) return "Select Property first";
                                const floorObj = floors.find(f => String(f.floorNumber) === String(formData.floorNumber));
                                return floorObj ? (floorObj.floorName || `Floor ${floorObj.floorNumber}`) : (formData.floorNumber ? `Floor ${formData.floorNumber}` : "Select Floor...");
                              })()}
                            </span>
                            <i className="bi bi-chevron-down text-muted small" />
                          </div>
                          {showFloorDropdown && formData.property && (
                            <div className="dropdown-menu show shadow-lg border p-2 position-absolute w-100 mt-1 rounded-3 bg-white" style={{ zIndex: 1050, maxHeight: "250px", overflowY: "auto" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm mb-2"
                                placeholder="Filter floor..."
                                value={floorSearch}
                                onChange={e => setFloorSearch(e.target.value)}
                                style={{ fontSize: "0.75rem" }}
                              />
                              {floors.filter(f => (f.floorName || `Floor ${f.floorNumber}`).toLowerCase().includes(floorSearch.toLowerCase())).map(f => (
                                <button
                                  key={f._id}
                                  type="button"
                                  className="dropdown-item rounded px-3 py-1.5 small text-start w-100"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, floorNumber: String(f.floorNumber), unit: "" }));
                                    setShowFloorDropdown(false);
                                    setFloorSearch("");
                                  }}
                                >
                                  {f.floorName || `Floor ${f.floorNumber}`}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4 position-relative" ref={unitContainerRef}>
                          <label style={labelStyle}>Unit / Space</label>
                          <div
                            className={`form-control d-flex justify-content-between align-items-center ${!formData.floorNumber ? "text-muted" : ""}`}
                            style={{ ...inputStyle, cursor: formData.floorNumber ? "pointer" : "not-allowed" }}
                            onClick={() => formData.floorNumber && setShowUnitDropdown(prev => !prev)}
                          >
                            <span>
                              {(() => {
                                if (!formData.floorNumber) return "Select Floor first";
                                const unitObj = units.find(u => u._id === formData.unit);
                                return unitObj ? `${unitObj.unitNumber} (${unitObj.unitType})` : "Select Unit...";
                              })()}
                            </span>
                            <i className="bi bi-chevron-down text-muted small" />
                          </div>
                          {showUnitDropdown && formData.floorNumber && (
                            <div className="dropdown-menu show shadow-lg border p-2 position-absolute w-100 mt-1 rounded-3 bg-white" style={{ zIndex: 1050, maxHeight: "250px", overflowY: "auto" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm mb-2"
                                placeholder="Filter unit..."
                                value={unitSearch}
                                onChange={e => setUnitSearch(e.target.value)}
                                style={{ fontSize: "0.75rem" }}
                              />
                              {units.filter(u => (u.property === formData.property || u.property?._id === formData.property) && String(u.floorNumber) === String(formData.floorNumber))
                                    .filter(u => `${u.unitNumber} (${u.unitType})`.toLowerCase().includes(unitSearch.toLowerCase())).map(u => (
                                <button
                                  key={u._id}
                                  type="button"
                                  className="dropdown-item rounded px-3 py-1.5 small text-start w-100"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, unit: u._id }));
                                    setShowUnitDropdown(false);
                                    setUnitSearch("");
                                  }}
                                >
                                  {u.unitNumber} ({u.unitType})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Department</label>
                          <input
                            type="text"
                            name="department"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Operations / Admin"
                            value={formData.department}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Asset Owner</label>
                          <input
                            type="text"
                            name="assetOwner"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Landlord / Corporate"
                            value={formData.assetOwner}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Assigned Person</label>
                          <input
                            type="text"
                            name="assignedPerson"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Facilities Manager"
                            value={formData.assignedPerson}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-8">
                          <label style={labelStyle}>Specific Service Location</label>
                          <input
                            type="text"
                            name="serviceLocation"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Ground Floor Main Entrance Lobby"
                            value={formData.serviceLocation}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Installation Date</label>
                          <input
                            type="date"
                            name="installationDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.installationDate}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3 text-uppercase small text-muted pt-2" style={{ letterSpacing: "0.05em" }}>
                        3. Asset Lifecycle Status
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label style={labelStyle}>Asset Status <span className="text-danger">*</span></label>
                          <select
                            name="assetStatus"
                            className="form-select"
                            style={inputStyle}
                            value={formData.assetStatus}
                            onChange={handleChange}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Under Maintenance">Under Maintenance</option>
                            <option value="Disposed">Disposed</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>Asset Condition</label>
                          <select
                            name="assetCondition"
                            className="form-select"
                            style={inputStyle}
                            value={formData.assetCondition}
                            onChange={handleChange}
                          >
                            <option value="New">New</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Damaged">Damaged</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- TAB 2: PURCHASE & VENDOR SLA --- */}
                  {activeTab === "purchase" && (
                    <div className="animate-fade-in">
                      <h6 className="fw-bold mb-3 text-uppercase small text-muted" style={{ letterSpacing: "0.05em" }}>
                        1. Asset Purchase Details
                      </h6>
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <label style={labelStyle}>Purchase Date</label>
                          <input
                            type="date"
                            name="purchaseDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.purchaseDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4 position-relative" ref={pVendorContainerRef}>
                          <label style={labelStyle}>Purchase Vendor Partner</label>
                          <div
                            className="form-control d-flex justify-content-between align-items-center"
                            style={{ ...inputStyle, cursor: "pointer" }}
                            onClick={() => setShowPVendorDropdown(prev => !prev)}
                          >
                            <span>{vendors.find(v => v._id === formData.purchaseVendor)?.vendorName || "Select Vendor..."}</span>
                            <i className="bi bi-chevron-down text-muted small" />
                          </div>
                          {showPVendorDropdown && (
                            <div className="dropdown-menu show shadow-lg border p-2 position-absolute w-100 mt-1 rounded-3 bg-white" style={{ zIndex: 1050, maxHeight: "250px", overflowY: "auto" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm mb-2"
                                placeholder="Filter vendors..."
                                value={pVendorSearch}
                                onChange={e => setPVendorSearch(e.target.value)}
                                style={{ fontSize: "0.75rem" }}
                              />
                              {vendors.filter(v => v.vendorName?.toLowerCase().includes(pVendorSearch.toLowerCase())).map(v => (
                                <button
                                  key={v._id}
                                  type="button"
                                  className="dropdown-item rounded px-3 py-1.5 small text-start w-100"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, purchaseVendor: v._id }));
                                    setShowPVendorDropdown(false);
                                    setPVendorSearch("");
                                  }}
                                >
                                  {v.vendorName}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Purchase Invoice Number</label>
                          <input
                            type="text"
                            name="purchaseInvoiceNumber"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. INV-10029"
                            value={formData.purchaseInvoiceNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Purchase Amount (₹)</label>
                          <input
                            type="number"
                            name="purchaseAmount"
                            className="form-control"
                            style={inputStyle}
                            placeholder="0.00"
                            value={formData.purchaseAmount}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Tax Amount (₹)</label>
                          <input
                            type="number"
                            name="taxAmount"
                            className="form-control"
                            style={inputStyle}
                            placeholder="0.00"
                            value={formData.taxAmount}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Total Purchase Cost (₹)</label>
                          <input
                            type="text"
                            name="totalPurchaseCost"
                            className="form-control bg-light"
                            style={{ ...inputStyle, fontWeight: "bold" }}
                            value={formData.totalPurchaseCost}
                            readOnly
                            placeholder="Auto-calculated"
                          />
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>Warranty Start Date</label>
                          <input
                            type="date"
                            name="warrantyStartDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.warrantyStartDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>Warranty End Date</label>
                          <input
                            type="date"
                            name="warrantyEndDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.warrantyEndDate}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3 text-uppercase small text-muted pt-2" style={{ letterSpacing: "0.05em" }}>
                        2. Active SLA Service Partner
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6 position-relative" ref={vendorContainerRef}>
                          <label style={labelStyle}>Vendor Name <span className="text-danger">*</span></label>
                          <div
                            className="form-control d-flex justify-content-between align-items-center"
                            style={{ ...inputStyle, cursor: "pointer" }}
                            onClick={() => setShowVendorDropdown(prev => !prev)}
                          >
                            <span>{vendors.find(v => v._id === formData.vendor)?.vendorName || "Select Active Partner..."}</span>
                            <i className="bi bi-chevron-down text-muted small" />
                          </div>
                          {showVendorDropdown && (
                            <div className="dropdown-menu show shadow-lg border p-2 position-absolute w-100 mt-1 rounded-3 bg-white" style={{ zIndex: 1050, maxHeight: "250px", overflowY: "auto" }}>
                              <input
                                type="text"
                                className="form-control form-control-sm mb-2"
                                placeholder="Filter vendors..."
                                value={vendorSearch}
                                onChange={e => setVendorSearch(e.target.value)}
                                style={{ fontSize: "0.75rem" }}
                              />
                              {vendors.filter(v => v.vendorName?.toLowerCase().includes(vendorSearch.toLowerCase())).map(v => (
                                <button
                                  key={v._id}
                                  type="button"
                                  className="dropdown-item rounded px-3 py-1.5 small text-start w-100"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      vendor: v._id,
                                      vendorName: v.vendorName || "",
                                      vendorId: v.vendorCode || v.vendorId || "VEN-" + v._id.substring(18).toUpperCase(),
                                      contactName: v.contactPerson || v.contactName || "",
                                      contactNumber: v.mobileNumber || v.contactNumber || "",
                                      vendorEmail: v.email || v.emailId || "",
                                      vendorGst: v.gstNumber || "",
                                      serviceCategory: v.vendorCategory || ""
                                    }));
                                    setShowVendorDropdown(false);
                                    setVendorSearch("");
                                  }}
                                >
                                  {v.vendorName}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>Vendor ID Reference</label>
                          <input
                            type="text"
                            name="vendorId"
                            className="form-control bg-light"
                            style={inputStyle}
                            value={formData.vendorId}
                            readOnly
                            placeholder="Auto-populated"
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Service Category <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="serviceCategory"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Elevators Maintenance"
                            value={formData.serviceCategory}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Contact Person</label>
                          <input
                            type="text"
                            name="contactName"
                            className="form-control"
                            style={inputStyle}
                            placeholder="Vendor contact liaison"
                            value={formData.contactName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Mobile Number</label>
                          <input
                            type="text"
                            name="contactNumber"
                            className="form-control"
                            style={inputStyle}
                            placeholder="Phone number"
                            value={formData.contactNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Email Address</label>
                          <input
                            type="email"
                            name="vendorEmail"
                            className="form-control"
                            style={inputStyle}
                            placeholder="Email address"
                            value={formData.vendorEmail}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>GST Number</label>
                          <input
                            type="text"
                            name="vendorGst"
                            className="form-control"
                            style={inputStyle}
                            placeholder="Vendor GSTIN"
                            value={formData.vendorGst}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Contract Ref Number</label>
                          <input
                            type="text"
                            name="contractReferenceNumber"
                            className="form-control"
                            style={inputStyle}
                            placeholder="SLA contract number"
                            value={formData.contractReferenceNumber}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- TAB 3: AMC CONTRACT & BILLING --- */}
                  {activeTab === "amc" && (
                    <div className="animate-fade-in">
                      <h6 className="fw-bold mb-3 text-uppercase small text-muted" style={{ letterSpacing: "0.05em" }}>
                        1. AMC Contract Details
                      </h6>
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <label style={labelStyle}>AMC ID / Contract ID <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            name="amcId"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. AMC/2026/992"
                            value={formData.amcId}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>AMC Type <span className="text-danger">*</span></label>
                          <select
                            name="amcType"
                            className="form-select"
                            style={inputStyle}
                            value={formData.amcType}
                            onChange={handleChange}
                          >
                            <option value="Comprehensive">Comprehensive (Parts Included)</option>
                            <option value="Non Comprehensive">Non Comprehensive (Labour Only)</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>AMC Duration</label>
                          <input
                            type="text"
                            name="amcDuration"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. 12 Months"
                            value={formData.amcDuration}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>AMC Start Date <span className="text-danger">*</span></label>
                          <input
                            type="date"
                            name="amcStartDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.amcStartDate}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>AMC End Date <span className="text-danger">*</span></label>
                          <input
                            type="date"
                            name="amcEndDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.amcEndDate}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Contract Value (₹) <span className="text-danger">*</span></label>
                          <input
                            type="number"
                            name="contractValue"
                            className="form-control"
                            style={inputStyle}
                            placeholder="0.00"
                            value={formData.contractValue}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Tax Amount (₹)</label>
                          <input
                            type="number"
                            name="amcTaxAmount"
                            className="form-control"
                            style={inputStyle}
                            placeholder="0.00"
                            value={formData.amcTaxAmount}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Total Contract Amount (₹)</label>
                          <input
                            type="text"
                            name="totalContractAmount"
                            className="form-control bg-light"
                            style={{ ...inputStyle, fontWeight: "bold" }}
                            value={formData.totalContractAmount}
                            readOnly
                            placeholder="Auto-calculated"
                          />
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3 text-uppercase small text-muted pt-2" style={{ letterSpacing: "0.05em" }}>
                        2. Contract Billing & Invoicing Terms
                      </h6>
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <label style={labelStyle}>Billing Frequency <span className="text-danger">*</span></label>
                          <select
                            name="billingFrequency"
                            className="form-select"
                            style={inputStyle}
                            value={formData.billingFrequency}
                            onChange={handleChange}
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Half Yearly">Half Yearly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Invoice Generation Date</label>
                          <input
                            type="date"
                            name="invoiceGenerationDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.invoiceGenerationDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Payment Due Days</label>
                          <input
                            type="number"
                            name="paymentDueDays"
                            className="form-control"
                            style={inputStyle}
                            placeholder="30"
                            value={formData.paymentDueDays}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-12">
                          <label style={labelStyle}>Payment Terms & SLA Penalties</label>
                          <input
                            type="text"
                            name="paymentTerms"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Net 30, 2% interest on delay, 10% SLA penalty"
                            value={formData.paymentTerms}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3 text-uppercase small text-muted pt-2" style={{ letterSpacing: "0.05em" }}>
                        3. Operations & Preventative Maintenance Schedule
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label style={labelStyle}>Maintenance Frequency <span className="text-danger">*</span></label>
                          <select
                            name="maintenanceFrequency"
                            className="form-select"
                            style={inputStyle}
                            value={formData.maintenanceFrequency}
                            onChange={handleChange}
                          >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Services Included (Yearly)</label>
                          <input
                            type="number"
                            name="servicesIncluded"
                            className="form-control"
                            style={inputStyle}
                            placeholder="4"
                            value={formData.servicesIncluded}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Next Service Date</label>
                          <input
                            type="date"
                            name="nextServiceDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.nextServiceDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>SLA Response Time</label>
                          <input
                            type="text"
                            name="slaResponseTime"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. 2 Hours for critical failures"
                            value={formData.slaResponseTime}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>SLA Resolution Time</label>
                          <input
                            type="text"
                            name="slaResolutionTime"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. 24 Hours to restore operation"
                            value={formData.slaResolutionTime}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- TAB 4: AMC PAYMENT LEDGER --- */}
                  {activeTab === "ledger" && (
                    <div className="animate-fade-in">
                      <h6 className="fw-bold mb-3 text-uppercase small text-muted" style={{ letterSpacing: "0.05em" }}>
                        1. AMC Invoice Information
                      </h6>
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <label style={labelStyle}>Invoice Number</label>
                          <input
                            type="text"
                            name="amcInvoiceNumber"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. V-99321"
                            value={formData.amcInvoiceNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Invoice Date</label>
                          <input
                            type="date"
                            name="amcInvoiceDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.amcInvoiceDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Billing Period</label>
                          <input
                            type="text"
                            name="billingPeriod"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Q1-2026"
                            value={formData.billingPeriod}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <h6 className="fw-bold mb-3 text-uppercase small text-muted pt-2" style={{ letterSpacing: "0.05em" }}>
                        2. Payments & Transaction Records
                      </h6>
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <label style={labelStyle}>Invoice Amount (₹)</label>
                          <input
                            type="number"
                            name="invoiceAmount"
                            className="form-control"
                            style={inputStyle}
                            placeholder="0.00"
                            value={formData.invoiceAmount}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Paid Amount (₹)</label>
                          <input
                            type="number"
                            name="paidAmount"
                            className="form-control"
                            style={inputStyle}
                            placeholder="0.00"
                            value={formData.paidAmount}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Pending Balance (₹)</label>
                          <input
                            type="text"
                            name="pendingAmount"
                            className="form-control bg-light"
                            style={{ ...inputStyle, fontWeight: "bold" }}
                            value={formData.pendingAmount}
                            readOnly
                            placeholder="Auto-calculated"
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Payment Date</label>
                          <input
                            type="date"
                            name="paymentDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.paymentDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Payment Mode</label>
                          <select
                            name="paymentMode"
                            className="form-select"
                            style={inputStyle}
                            value={formData.paymentMode}
                            onChange={handleChange}
                          >
                            <option value="">Select Mode...</option>
                            <option value="NEFT/RTGS">NEFT / RTGS</option>
                            <option value="UPI">UPI</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Cash">Cash</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Transaction Reference</label>
                          <input
                            type="text"
                            name="transactionReference"
                            className="form-control"
                            style={inputStyle}
                            placeholder="Txn ID or Cheque No"
                            value={formData.transactionReference}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label style={labelStyle}>Payment Status</label>
                          <select
                            name="paymentStatus"
                            className="form-select"
                            style={inputStyle}
                            value={formData.paymentStatus}
                            onChange={handleChange}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Partial">Partial</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- TAB 5: OPERATIONS & SERVICE HISTORY --- */}
                  {activeTab === "operations" && (
                    <div className="animate-fade-in">
                      {/* Section 1: Asset Disposal */}
                      <h6 className="fw-bold mb-3 text-uppercase small text-muted" style={{ letterSpacing: "0.05em" }}>
                        1. Asset Disposal Record
                      </h6>
                      <div className="row g-3 mb-4 p-3 border rounded-3 bg-light">
                        <div className="col-md-4">
                          <label style={labelStyle}>Disposal Date</label>
                          <input
                            type="date"
                            name="disposalDate"
                            className="form-control"
                            style={inputStyle}
                            value={formData.disposalDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Disposal Reason</label>
                          <input
                            type="text"
                            name="disposalReason"
                            className="form-control"
                            style={inputStyle}
                            placeholder="e.g. Beyond economic repair"
                            value={formData.disposalReason}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Disposal Type</label>
                          <select
                            name="disposalType"
                            className="form-select"
                            style={inputStyle}
                            value={formData.disposalType}
                            onChange={handleChange}
                          >
                            <option value="">Select Option...</option>
                            <option value="Scrapped">Scrapped</option>
                            <option value="Sold">Sold</option>
                            <option value="Donated">Donated</option>
                            <option value="Stolen/Lost">Stolen / Lost</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Sale Value (₹)</label>
                          <input
                            type="number"
                            name="saleValue"
                            className="form-control"
                            style={inputStyle}
                            placeholder="0.00"
                            value={formData.saleValue}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Approved By</label>
                          <input
                            type="text"
                            name="approvedBy"
                            className="form-control"
                            style={inputStyle}
                            placeholder="Approving authority"
                            value={formData.approvedBy}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <label style={labelStyle}>Disposal Document Reference</label>
                          <input
                            type="text"
                            name="disposalDocument"
                            className="form-control"
                            style={inputStyle}
                            placeholder="Document link or ID"
                            value={formData.disposalDocument}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Section 2: Active Tickets / Service Requests */}
                      <div className="d-flex justify-content-between align-items-center mb-3 pt-2">
                        <h6 className="fw-bold mb-0 text-uppercase small text-muted" style={{ letterSpacing: "0.05em" }}>
                          2. Service Requests & Active Tickets ({formData.serviceRequests.length})
                        </h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary px-3 py-1 fw-bold"
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => setShowAddTicket(prev => !prev)}
                        >
                          <i className={`bi ${showAddTicket ? "bi-dash-lg" : "bi-plus-lg"} me-1`} />
                          {showAddTicket ? "Collapse Sub-form" : "Add Ticket"}
                        </button>
                      </div>

                      {showAddTicket && (
                        <div className="card border-primary-subtle p-3 mb-4 rounded-3 shadow-sm bg-white">
                          <h6 className="small fw-bold text-primary mb-3">Create New SLA Service Ticket</h6>
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <label style={labelStyle}>Issue / Ticket Title *</label>
                              <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                placeholder="e.g. Elevator doors stuck"
                                value={newTicket.issueTitle}
                                onChange={e => setNewTicket(prev => ({ ...prev, issueTitle: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-3">
                              <label style={labelStyle}>Priority</label>
                              <select
                                className="form-select"
                                style={inputStyle}
                                value={newTicket.priority}
                                onChange={e => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label style={labelStyle}>Due Date</label>
                              <input
                                type="date"
                                className="form-control"
                                style={inputStyle}
                                value={newTicket.dueDate}
                                onChange={e => setNewTicket(prev => ({ ...prev, dueDate: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-6">
                              <label style={labelStyle}>Assigned Technician</label>
                              <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                placeholder="e.g. Suresh Kumar (Otis)"
                                value={newTicket.assignedTechnician}
                                onChange={e => setNewTicket(prev => ({ ...prev, assignedTechnician: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-6">
                              <label style={labelStyle}>Problem Description</label>
                              <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                placeholder="Details about the breakdown..."
                                value={newTicket.problemDescription}
                                onChange={e => setNewTicket(prev => ({ ...prev, problemDescription: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-sm btn-light px-3" onClick={() => setShowAddTicket(false)}>Cancel</button>
                            <button type="button" className="btn btn-sm btn-primary px-4 fw-bold" onClick={handleAddTicket} disabled={!newTicket.issueTitle}>
                              Append Ticket
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        {formData.serviceRequests.length === 0 ? (
                          <div className="text-center py-3 text-muted border border-dashed rounded-3 small">
                            No active tickets recorded for this asset lifecycle.
                          </div>
                        ) : (
                          <div className="table-responsive border rounded-3 bg-white">
                            <table className="table mb-0 align-middle table-sm" style={{ fontSize: "0.8rem" }}>
                              <thead className="table-light">
                                <tr>
                                  <th className="py-2 px-3">Ticket ID</th>
                                  <th>Issue</th>
                                  <th>Priority</th>
                                  <th>Technician</th>
                                  <th>Due Date</th>
                                  <th>Status</th>
                                  <th className="text-end">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {formData.serviceRequests.map((t: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="py-2 px-3 fw-bold">{t.ticketId || "Pending"}</td>
                                    <td>{t.issueTitle}</td>
                                    <td>
                                      <span className={`badge ${
                                        t.priority === 'Critical' ? 'bg-danger text-white' :
                                        t.priority === 'High' ? 'bg-warning text-dark' :
                                        t.priority === 'Medium' ? 'bg-primary text-white' : 'bg-secondary text-white'
                                      }`}>
                                        {t.priority}
                                      </span>
                                    </td>
                                    <td>{t.assignedTechnician || "Unassigned"}</td>
                                    <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A"}</td>
                                    <td>
                                      <span className="badge bg-info-subtle text-info">{t.status || "Open"}</span>
                                    </td>
                                    <td className="text-end px-3">
                                      <button type="button" className="btn btn-link text-danger p-0" onClick={() => handleRemoveTicket(idx)}>
                                        <i className="bi bi-trash small" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Section 3: Maintenance History Ledger */}
                      <div className="d-flex justify-content-between align-items-center mb-3 pt-2">
                        <h6 className="fw-bold mb-0 text-uppercase small text-muted" style={{ letterSpacing: "0.05em" }}>
                          3. Maintenance History Ledger ({formData.maintenanceHistory.length})
                        </h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary px-3 py-1 fw-bold"
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => setShowAddMh(prev => !prev)}
                        >
                          <i className={`bi ${showAddMh ? "bi-dash-lg" : "bi-plus-lg"} me-1`} />
                          {showAddMh ? "Collapse Sub-form" : "Add Service Record"}
                        </button>
                      </div>

                      {showAddMh && (
                        <div className="card border-success-subtle p-3 mb-4 rounded-3 shadow-sm bg-white">
                          <h6 className="small fw-bold text-success mb-3">Record Preventative / Breakdown Service Log</h6>
                          <div className="row g-3 mb-3">
                            <div className="col-md-3">
                              <label style={labelStyle}>Service Date *</label>
                              <input
                                type="date"
                                className="form-control"
                                style={inputStyle}
                                value={newMh.serviceDate}
                                onChange={e => setNewMh(prev => ({ ...prev, serviceDate: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-3">
                              <label style={labelStyle}>Service Type</label>
                              <select
                                className="form-select"
                                style={inputStyle}
                                value={newMh.serviceType}
                                onChange={e => setNewMh(prev => ({ ...prev, serviceType: e.target.value }))}
                              >
                                <option value="Preventive">Preventive</option>
                                <option value="Breakdown">Breakdown</option>
                                <option value="Calibration">Calibration</option>
                                <option value="Audit">Safety Audit</option>
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label style={labelStyle}>Technician Name</label>
                              <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                placeholder="e.g. Ramesh Chandra"
                                value={newMh.technician}
                                onChange={e => setNewMh(prev => ({ ...prev, technician: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-3">
                              <label style={labelStyle}>Next Service Date</label>
                              <input
                                type="date"
                                className="form-control"
                                style={inputStyle}
                                value={newMh.nextServiceDate}
                                onChange={e => setNewMh(prev => ({ ...prev, nextServiceDate: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-6">
                              <label style={labelStyle}>Problem Found</label>
                              <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                placeholder="Remarks about issue found..."
                                value={newMh.problemFound}
                                onChange={e => setNewMh(prev => ({ ...prev, problemFound: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-6">
                              <label style={labelStyle}>Action Taken</label>
                              <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                placeholder="Detail what actions were completed..."
                                value={newMh.actionTaken}
                                onChange={e => setNewMh(prev => ({ ...prev, actionTaken: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-4">
                              <label style={labelStyle}>Parts Replaced</label>
                              <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                placeholder="e.g. Door pulleys replaced"
                                value={newMh.partsReplaced}
                                onChange={e => setNewMh(prev => ({ ...prev, partsReplaced: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-4">
                              <label style={labelStyle}>Material Cost (₹)</label>
                              <input
                                type="number"
                                className="form-control"
                                style={inputStyle}
                                placeholder="0"
                                value={newMh.materialCost}
                                onChange={e => setNewMh(prev => ({ ...prev, materialCost: e.target.value }))}
                              />
                            </div>
                            <div className="col-md-4">
                              <label style={labelStyle}>Labour Cost (₹)</label>
                              <input
                                type="number"
                                className="form-control"
                                style={inputStyle}
                                placeholder="0"
                                value={newMh.labourCost}
                                onChange={e => setNewMh(prev => ({ ...prev, labourCost: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-sm btn-light px-3" onClick={() => setShowAddMh(false)}>Cancel</button>
                            <button type="button" className="btn btn-sm btn-success px-4 fw-bold text-white" onClick={handleAddMh}>
                              Append Record
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        {formData.maintenanceHistory.length === 0 ? (
                          <div className="text-center py-3 text-muted border border-dashed rounded-3 small">
                            No service records logged in the maintenance ledger yet.
                          </div>
                        ) : (
                          <div className="table-responsive border rounded-3 bg-white">
                            <table className="table mb-0 align-middle table-sm" style={{ fontSize: "0.8rem" }}>
                              <thead className="table-light">
                                <tr>
                                  <th className="py-2 px-3">Service Date</th>
                                  <th>Type</th>
                                  <th>Technician</th>
                                  <th>Parts Replaced</th>
                                  <th>Material Cost</th>
                                  <th>Labour Cost</th>
                                  <th>Total Cost</th>
                                  <th className="text-end">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {formData.maintenanceHistory.map((h: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="py-2 px-3 fw-semibold">{h.serviceDate ? new Date(h.serviceDate).toLocaleDateString() : "N/A"}</td>
                                    <td>{h.serviceType}</td>
                                    <td>{h.technician || "N/A"}</td>
                                    <td>{h.partsReplaced || "None"}</td>
                                    <td>₹{(h.materialCost || 0).toLocaleString()}</td>
                                    <td>₹{(h.labourCost || 0).toLocaleString()}</td>
                                    <td className="fw-bold">₹{((h.materialCost || 0) + (h.labourCost || 0)).toLocaleString()}</td>
                                    <td className="text-end px-3">
                                      <button type="button" className="btn btn-link text-danger p-0" onClick={() => handleRemoveMh(idx)}>
                                        <i className="bi bi-trash small" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top" style={{ borderColor: "var(--border-color)" }}>
              <div className="text-muted small">
                {activeTab === "basic" && "Step 1 of 5: Specifications & Site Assignment"}
                {activeTab === "purchase" && "Step 2 of 5: Financial Costing & Warranty"}
                {activeTab === "amc" && "Step 3 of 5: AMC Contract Duration & Scheduling"}
                {activeTab === "ledger" && "Step 4 of 5: Payments & Transaction Records"}
                {activeTab === "operations" && "Step 5 of 5: Maintenance Records & Disposal Logs"}
              </div>
              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-4 fw-semibold rounded-3"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary px-5 fw-bold text-white shadow-sm border-0 rounded-3"
                  disabled={isSubmitting || loadingOptions}
                  style={{ backgroundColor: "var(--text-primary)" }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : mode === "create" ? (
                    "Save Asset & AMC"
                  ) : (
                    "Update Asset & AMC"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
