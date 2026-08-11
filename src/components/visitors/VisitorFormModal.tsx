"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/utils/api";
import { ModalMode } from "@/components/dashboard/AssetModal";

interface VisitorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editData?: any;
  mode: ModalMode;
}

const ID_PROOF_TYPES = ["Aadhar", "PAN", "Driving License", "Passport", "Other"];
const PURPOSE_OPTIONS = ["Meeting", "Delivery", "Interview", "Maintenance", "Personal", "Other"];
const STATUS_OPTIONS = ["Checked-In", "Checked-Out"];

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: string; msg: string }> = {
  "Checked-In": { bg: "#dbeafe", color: "#1e40af", icon: "bi-door-open-fill", msg: "Visitor is currently inside the building." },
  "Checked-Out": { bg: "var(--border-color)", color: "var(--text-primary)", icon: "bi-door-closed-fill", msg: "Visitor has checked out." },
};

const APPROVAL_CFG = {
  "Property Level": { icon: "bi-building", bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", label: "Property Owner Approval" },
  "Floor Level": { icon: "bi-layers", bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", label: "Floor Owner / Admin Approval" },
  "Office Level": { icon: "bi-door-open", bg: "#fdf4ff", border: "#e9d5ff", color: "#7e22ce", label: "Office Owner Approval" },
} as const;
type ApprovalLevel = keyof typeof APPROVAL_CFG;

const EMPTY = {
  visitorName: "", visitorContactNumber: "", address: "",
  idProofType: "Aadhar", idNumber: "", vehicleNumber: "",
  personToMeet: "", purposeOfVisit: "Meeting",
  visitDate: new Date().toISOString().split("T")[0],
  inTime: "", outTime: "", status: "Checked-In",
};

export default function VisitorFormModal({ isOpen, onClose, onSave, editData, mode }: VisitorFormModalProps) {
  const [formData, setFormData] = useState<any>({ ...EMPTY });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [properties, setProperties] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selProp, setSelProp] = useState("");
  const [selFloor, setSelFloor] = useState("");
  const [selUnit, setSelUnit] = useState("");

  // Searchable Dropdowns State & Refs
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");
  const propertyContainerRef = useRef<HTMLDivElement>(null);

  const [showFloorDropdown, setShowFloorDropdown] = useState(false);
  const [floorSearch, setFloorSearch] = useState("");
  const floorContainerRef = useRef<HTMLDivElement>(null);

  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [unitSearch, setUnitSearch] = useState("");
  const unitContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (propertyContainerRef.current && !propertyContainerRef.current.contains(target)) {
        setShowPropertyDropdown(false);
      }
      if (floorContainerRef.current && !floorContainerRef.current.contains(target)) {
        setShowFloorDropdown(false);
      }
      if (unitContainerRef.current && !unitContainerRef.current.contains(target)) {
        setShowUnitDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const approvalLevel: ApprovalLevel =
    selUnit ? "Office Level" : selFloor ? "Floor Level" : "Property Level";

  const apc = APPROVAL_CFG[approvalLevel];
  const ss = STATUS_STYLE[formData.status] || STATUS_STYLE["Checked-In"];
  const isRO = mode === "view";
  const set = (k: string, v: any) => setFormData((p: any) => ({ ...p, [k]: v }));

  const [currentUser, setCurrentUser] = useState<any>(null);
  const isOwner = currentUser?.role === 'Owner' || currentUser?.role === 'OFFICE_OWNER';

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      api.get("/properties"),
      api.get("/auth/me")
    ]).then(([propRes, meRes]) => {
      if (propRes.success) setProperties(propRes.data);
      if (meRes.success) setCurrentUser(meRes.data);
    }).catch(() => { });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (editData && (mode === "edit" || mode === "view")) {
      setFormData({ ...EMPTY, ...editData });
      const pId = editData.property?._id || editData.property || "";
      const fId = editData.floor?._id || editData.floor || "";
      const uId = editData.unit?._id || editData.unit || "";
      setSelProp(pId); setSelFloor(fId); setSelUnit(uId);
      if (pId) api.get(`/floors?property=${pId}`).then(r => { if (r.success) setFloors(r.data); }).catch(() => { });
      if (fId) api.get(`/units?floor=${fId}`).then(r => { if (r.success) setUnits(r.data); }).catch(() => { });
    } else {
      const now = new Date();
      setFormData({ ...EMPTY, visitDate: now.toISOString().split("T")[0], inTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) });
      if (isOwner && currentUser) {
        const assignedUnit = currentUser.assignedUnits?.[0];
        const pId = (currentUser.assignedProperties?.[0]?._id || currentUser.assignedProperties?.[0] || assignedUnit?.property?._id || assignedUnit?.property || "").toString();
        const fId = (currentUser.assignedFloors?.[0]?._id || currentUser.assignedFloors?.[0] || assignedUnit?.floor?._id || assignedUnit?.floor || "").toString();
        const uId = (assignedUnit?._id || "").toString();
        setSelProp(pId);
        setSelFloor(fId);
        setSelUnit(uId);
      } else {
        setSelProp(""); setSelFloor(""); setSelUnit(""); setFloors([]); setUnits([]);
      }
    }
  }, [isOpen, editData, mode, currentUser, isOwner]);

  const handlePropertyChange = async (id: string) => {
    setSelProp(id); setSelFloor(""); setSelUnit(""); setFloors([]); setUnits([]);
    if (!id) return;
    Promise.all([
      api.get(`/units?property=${id}`),
      api.get(`/floors?property=${id}`)
    ]).then(([unitRes, floorRes]) => {
      if (unitRes.success) setUnits(unitRes.data);
      if (floorRes.success) setFloors(floorRes.data);
    }).catch(() => { });
  };

  const handleUnitSelect = (unitObj: any) => {
    setSelUnit(unitObj._id);
    const fId = unitObj.floor?._id || unitObj.floor || "";
    if (fId) setSelFloor(fId.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRO) { onClose(); return; }

    let finalProp = selProp;
    let finalFloor = selFloor;
    let finalUnit = selUnit;

    if (isOwner && currentUser) {
      const assignedUnit = currentUser.assignedUnits?.[0];
      finalProp = (currentUser.assignedProperties?.[0]?._id || currentUser.assignedProperties?.[0] || assignedUnit?.property?._id || assignedUnit?.property || "").toString();
      finalFloor = (currentUser.assignedFloors?.[0]?._id || currentUser.assignedFloors?.[0] || assignedUnit?.floor?._id || assignedUnit?.floor || "").toString();
      finalUnit = (assignedUnit?._id || "").toString();
    }

    if (!finalProp) { alert("Property is required."); return; }
    setIsSubmitting(true);
    try {
      onSave({
        ...formData,
        property: finalProp || undefined,
        floor: finalFloor || undefined,
        unit: finalUnit || undefined,
        approvalLevel: isOwner ? "Office Level" : approvalLevel,
        ...(editData?._id ? { _id: editData._id } : {}),
      });
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const selPropObj = properties.find(p => p._id === selProp);
  const selFloorObj = floors.find(f => f._id === selFloor);
  const selUnitObj = units.find(u => u._id === selUnit);

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1100, backdropFilter: "blur(6px)" }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 820 }}>
        <div
          className="modal-content border-0 overflow-hidden"
          style={{ borderRadius: "10px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
        >
          {/* Header */}
          <div
            className="d-flex align-items-center justify-content-between px-4 py-3"
            style={{ backgroundColor: "var(--text-primary)" }}
          >
            <div className="d-flex align-items-center gap-2">
              <h5 className="mb-0 text-white fw-semibold" style={{ fontSize: "1rem" }}>
                {mode === "create" ? "Register New Visitor" : mode === "edit" ? "Edit Visitor Details" : "Visitor Details"}
              </h5>
              {mode !== "create" && (
                <span className="badge rounded-pill px-3 py-1" style={{ fontSize: "0.72rem", background: ss.bg, color: ss.color }}>
                  <i className={`bi ${ss.icon} me-1`} />{formData.status}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none", border: "none", color: "var(--text-muted)",
                fontSize: "1.4rem", cursor: "pointer", lineHeight: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--bg-card)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div style={{ padding: "24px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>

              {/* Approval Level Indicator */}
              {(selProp || (mode !== "create" && formData.approvalLevel)) && (
                <div style={{
                  background: apc.bg, border: `1.5px solid ${apc.border}`,
                  borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
                  display: "flex", alignItems: "center", gap: "12px",
                }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: apc.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`bi ${apc.icon}`} style={{ color: apc.color, fontSize: "1.1rem" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: apc.color }}>Approval Routing</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: apc.color, marginTop: "1px" }}>{apc.label}</div>
                    <div style={{ fontSize: "0.7rem", color: apc.color + "bb", marginTop: "1px" }}>
                      {approvalLevel === "Property Level" && "Visitor request notification → Property Owner"}
                      {approvalLevel === "Floor Level" && "Visitor request notification → Floor Owner / Admin"}
                      {approvalLevel === "Office Level" && "Visitor request notification → Office Owner"}
                    </div>
                  </div>
                  <span style={{ background: apc.color, color: "var(--bg-card)", borderRadius: "20px", padding: "3px 12px", fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {approvalLevel}
                  </span>
                </div>
              )}



              <div className="row g-3">
                {/* Section 1: Personal Information */}
                <div className="col-12">
                  <h6 className="fw-bold mb-1 d-flex align-items-center" style={{ fontSize: "0.9rem", color: "var(--dark-section)" }}>
                    <i className="bi bi-person-fill text-primary me-2"></i>
                    Personal Information
                  </h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Visitor Name *</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    required
                    disabled={isRO}
                    placeholder="Full name..."
                    value={formData.visitorName}
                    onChange={e => set("visitorName", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Contact Number *</label>
                  <input
                    type="tel"
                    className="form-control bg-white"
                    required
                    disabled={isRO}
                    placeholder="Mobile..."
                    value={formData.visitorContactNumber}
                    onChange={e => set("visitorContactNumber", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">ID Proof Type</label>
                  <select
                    className="form-select bg-white"
                    disabled={isRO}
                    value={formData.idProofType}
                    onChange={e => set("idProofType", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    {ID_PROOF_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">ID Number</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    disabled={isRO}
                    placeholder="ID number..."
                    value={formData.idNumber}
                    onChange={e => set("idNumber", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">Vehicle No (optional)</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    disabled={isRO}
                    placeholder="e.g. TS09AB1234"
                    value={formData.vehicleNumber}
                    onChange={e => set("vehicleNumber", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  />
                </div>

                {/* Section 2: Visiting Location */}
                {!isOwner && (
                  <>
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold mb-1 d-flex align-items-center" style={{ fontSize: "0.9rem", color: "var(--dark-section)" }}>
                        <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                        Visiting Location
                      </h6>
                    </div>

                    {/* Property / Building Dropdown */}
                    <div className="col-md-6 position-relative" ref={propertyContainerRef}>
                      <label className="form-label small fw-semibold text-dark">Property / Building *</label>
                      <div
                        className="form-control bg-white d-flex justify-content-between align-items-center"
                        onClick={() => !isRO && setShowPropertyDropdown(prev => !prev)}
                        style={{
                          fontSize: "0.85rem", padding: "8px 12px",
                          cursor: isRO ? "not-allowed" : "pointer",
                          border: "1px solid #ced4da", borderRadius: "0.375rem", userSelect: "none"
                        }}
                      >
                        <span>
                          {selPropObj ? selPropObj.propertyName : "Select Property..."}
                        </span>
                        {!isRO && (
                          <i className={`bi bi-chevron-${showPropertyDropdown ? "up" : "down"} text-muted`} style={{ fontSize: "0.75rem" }} />
                        )}
                      </div>

                      {showPropertyDropdown && !isRO && (
                        <div
                          className="bg-white rounded-3 shadow-lg border p-2 position-absolute"
                          style={{
                            top: "100%", left: 12, right: 12, zIndex: 1050,
                            marginTop: "4px", maxHeight: "280px", display: "flex", flexDirection: "column"
                          }}
                        >
                          <div className="position-relative mb-2">
                            <input
                              type="text"
                              className="form-control form-control-sm ps-3"
                              placeholder="Search property..."
                              value={propertySearch}
                              onChange={e => setPropertySearch(e.target.value)}
                              style={{ fontSize: "0.8rem", height: "32px", paddingRight: "28px" }}
                              autoFocus
                            />
                            {propertySearch && (
                              <button
                                type="button"
                                onClick={() => setPropertySearch("")}
                                className="position-absolute border-0 bg-transparent text-muted"
                                style={{ right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem" }}
                              >
                                ×
                              </button>
                            )}
                          </div>

                          <div className="overflow-auto flex-grow-1" style={{ maxHeight: "180px" }}>
                            {(() => {
                              const filtered = properties.filter(p =>
                                p.propertyName?.toLowerCase().includes(propertySearch.toLowerCase())
                              );
                              if (filtered.length === 0) {
                                return <div className="text-muted text-center py-2 small">No matches found</div>;
                              }
                              return filtered.map(p => (
                                <div
                                  key={p._id}
                                  onClick={() => {
                                    handlePropertyChange(p._id);
                                    setShowPropertyDropdown(false);
                                    setPropertySearch("");
                                  }}
                                  className="px-3 py-2 rounded-2 small"
                                  style={{
                                    cursor: "pointer",
                                    backgroundColor: selProp === p._id ? "var(--border-color)" : "transparent",
                                    color: selProp === p._id ? "var(--dark-section)" : "var(--text-primary)",
                                    fontWeight: selProp === p._id ? 600 : 400,
                                  }}
                                  onMouseEnter={e => {
                                    if (selProp !== p._id) {
                                      e.currentTarget.style.backgroundColor = "var(--bg-app)";
                                      e.currentTarget.style.color = "var(--text-main)";
                                    }
                                  }}
                                  onMouseLeave={e => {
                                    if (selProp !== p._id) {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                      e.currentTarget.style.color = "var(--text-primary)";
                                    }
                                  }}
                                >
                                  {p.propertyName}
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                      {selPropObj && (
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          <i className="bi bi-geo-alt me-1" style={{ color: "var(--dark-section)" }} />
                          {selPropObj.propertyAddress} · {selPropObj.propertyType}
                        </div>
                      )}
                    </div>

                    {/* Office / Unit Dropdown */}
                    <div className="col-md-6 position-relative" ref={unitContainerRef}>
                      <label className="form-label small fw-semibold text-dark">Office / Unit</label>
                      <div
                        className={`form-control d-flex justify-content-between align-items-center ${!selProp ? "bg-white text-muted" : "bg-white"}`}
                        onClick={() => {
                          if (selProp && !isRO) {
                            setShowUnitDropdown(prev => !prev);
                          }
                        }}
                        style={{
                          fontSize: "0.85rem", padding: "8px 12px",
                          cursor: (!selProp || isRO) ? "not-allowed" : "pointer",
                          border: "1px solid #ced4da", borderRadius: "0.375rem", userSelect: "none"
                        }}
                      >
                        <span>
                          {(() => {
                            if (!selProp) return "Select Property first";
                            const unitObj = units.find(u => u._id === selUnit);
                            return unitObj ? `Unit ${unitObj.unitNumber}${unitObj.ownerName ? ` — ${unitObj.ownerName}` : ""} (${unitObj.unitStatus})` : "Select Office / Unit...";
                          })()}
                        </span>
                        {!isRO && selProp && (
                          <i className={`bi bi-chevron-${showUnitDropdown ? "up" : "down"} text-muted`} style={{ fontSize: "0.75rem" }} />
                        )}
                      </div>

                      {showUnitDropdown && selProp && !isRO && (
                        <div
                          className="bg-white rounded-3 shadow-lg border p-2 position-absolute"
                          style={{
                            top: "100%", left: 12, right: 12, zIndex: 1050,
                            marginTop: "4px", maxHeight: "280px", display: "flex", flexDirection: "column"
                          }}
                        >
                          <div className="position-relative mb-2">
                            <input
                              type="text"
                              className="form-control form-control-sm ps-3"
                              placeholder="Search unit..."
                              value={unitSearch}
                              onChange={e => setUnitSearch(e.target.value)}
                              style={{ fontSize: "0.8rem", height: "32px", paddingRight: "28px" }}
                              autoFocus
                            />
                            {unitSearch && (
                              <button
                                type="button"
                                onClick={() => setUnitSearch("")}
                                className="position-absolute border-0 bg-transparent text-muted"
                                style={{ right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem" }}
                              >
                                ×
                              </button>
                            )}
                          </div>

                          <div className="overflow-auto flex-grow-1" style={{ maxHeight: "180px" }}>
                            {(() => {
                              const filteredUnits = units.filter(u => {
                                const label = `Unit ${u.unitNumber}${u.ownerName ? ` — ${u.ownerName}` : ""} (${u.unitStatus})`;
                                return label.toLowerCase().includes(unitSearch.toLowerCase());
                              });

                              if (filteredUnits.length === 0) {
                                return <div className="text-muted text-center py-2 small">No matches found</div>;
                              }
                              return filteredUnits.map(u => {
                                const label = `Unit ${u.unitNumber}${u.ownerName ? ` — ${u.ownerName}` : ""} (${u.unitStatus})`;
                                const isSelected = selUnit === u._id;
                                return (
                                  <div
                                    key={u._id}
                                    onClick={() => {
                                      handleUnitSelect(u);
                                      setShowUnitDropdown(false);
                                      setUnitSearch("");
                                    }}
                                    className="px-3 py-2 rounded-2 small"
                                    style={{
                                      cursor: "pointer",
                                      backgroundColor: isSelected ? "var(--border-color)" : "transparent",
                                      color: isSelected ? "var(--dark-section)" : "var(--text-primary)",
                                      fontWeight: isSelected ? 600 : 400,
                                    }}
                                    onMouseEnter={e => {
                                      if (!isSelected) {
                                        e.currentTarget.style.backgroundColor = "var(--bg-app)";
                                        e.currentTarget.style.color = "var(--text-main)";
                                      }
                                    }}
                                    onMouseLeave={e => {
                                      if (!isSelected) {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.color = "var(--text-primary)";
                                      }
                                    }}
                                  >
                                    {label}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                      {selUnitObj && (
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          <i className="bi bi-door-open me-1" />
                          {selUnitObj.sqft ? `${selUnitObj.sqft} sqft · ` : ""}{selUnitObj.unitType || "Office"}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Section 3: Visit Details */}
                <div className="col-12 mt-4">
                  <h6 className="fw-bold mb-1 d-flex align-items-center" style={{ fontSize: "0.9rem", color: "var(--dark-section)" }}>
                    <i className="bi bi-calendar-event-fill text-primary me-2"></i>
                    Visit Information
                  </h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Person to Meet *</label>
                  <input
                    type="text"
                    className="form-control bg-white"
                    required
                    disabled={isRO}
                    placeholder="Name of host..."
                    value={formData.personToMeet}
                    onChange={e => set("personToMeet", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Purpose of Visit *</label>
                  <select
                    className="form-select bg-white"
                    disabled={isRO}
                    value={formData.purposeOfVisit}
                    onChange={e => set("purposeOfVisit", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    {PURPOSE_OPTIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">Visit Date</label>
                  <input
                    type="date"
                    className="form-control bg-white"
                    disabled={isRO}
                    value={formData.visitDate}
                    onChange={e => set("visitDate", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">In-Time</label>
                  <input
                    type="time"
                    className="form-control bg-white"
                    disabled={isRO}
                    value={formData.inTime}
                    onChange={e => set("inTime", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-dark">Out-Time (optional)</label>
                  <input
                    type="time"
                    className="form-control bg-white"
                    disabled={isRO}
                    value={formData.outTime || ""}
                    onChange={e => set("outTime", e.target.value)}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  />
                </div>

                {/* Section 4: Status (edit only) */}
                {mode !== "create" && (
                  <>
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold mb-1 d-flex align-items-center" style={{ fontSize: "0.9rem", color: "var(--dark-section)" }}>
                        <i className="bi bi-shield-lock-fill text-primary me-2"></i>
                        Security Approval Status
                      </h6>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">Status</label>
                      <select
                        className="form-select bg-white"
                        disabled={isRO}
                        value={formData.status}
                        onChange={e => set("status", e.target.value)}
                        style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>

                    {formData.status === "Rejected" && (
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold text-dark">Rejection Reason</label>
                        <input
                          type="text"
                          className="form-control bg-white"
                          disabled={isRO}
                          placeholder="Reason..."
                          value={formData.rejectionReason || ""}
                          onChange={e => set("rejectionReason", e.target.value)}
                          style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="d-flex justify-content-between align-items-center px-4 py-4" style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-app)" }}>
              {/* Approval pill */}
              <div className="d-flex align-items-center gap-2">
                <i className={`bi ${apc.icon}`} style={{ color: apc.color, fontSize: "0.9rem" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: apc.color }}>
                  {selProp ? apc.label : "Select a property to determine approval routing"}
                </span>
              </div>
              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  onClick={onClose}
                  disabled={isSubmitting}
                  style={{ fontSize: "0.85rem", borderRadius: "6px" }}
                >
                  {isRO ? "Close" : "Cancel"}
                </button>

                {!isRO && (
                  <button
                    type="submit"
                    className="btn btn-primary px-5 fw-bold text-white shadow-sm border-0"
                    disabled={isSubmitting}
                    style={{ backgroundColor: "var(--dark-section)", fontSize: "0.85rem", borderRadius: "6px" }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving...
                      </>
                    ) : mode === "create" ? (
                      "Register Visitor"
                    ) : (
                      "Update Visitor"
                    )}
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
