"use client";

import { useState, useEffect } from "react";
import { api, getStoredUser } from "@/utils/api";

const FIELD_STYLE: React.CSSProperties = {
  borderRadius: "6px",
  border: "1px solid var(--text-muted)",
  fontSize: "0.88rem",
  padding: "8px 12px",
  width: "100%",
  outline: "none",
  backgroundColor: "var(--bg-card)",
  color: "var(--text-main)",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

export default function UnitModal({ isOpen, onClose, onSave, editData }: any) {
  const user = getStoredUser();
  const isCoWorking = ['COWORKING_ADMIN', 'COWORKING ADMIN', 'Coworking Admin', 'COWORKING_TENANT'].includes(user?.role) || user?.workspaceType === 'COWORKING';

  const [properties, setProperties] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    property: "",
    floor: "",
    floorNumber: "",
    unitNumber: "",
    unitName: "",
    sqft: "",
    unitType: "Standard",
    unitStatus: "Available",
    seatCount: "",
    occupiedSeatCount: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalUnitSqft, setOriginalUnitSqft] = useState(0);
  const [originalFloorId, setOriginalFloorId] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          property: editData.property?._id || editData.property || "",
          floor: editData.floor?._id || editData.floor || "",
          floorNumber: editData.floorNumber || "",
          unitNumber: editData.unitNumber || "",
          unitName: editData.unitName || "",
          sqft: editData.sqft || "",
          unitType: editData.unitType || "Standard",
          unitStatus: editData.unitStatus || "Available",
          seatCount: editData.seatCount != null ? String(editData.seatCount) : "",
          occupiedSeatCount: editData.occupiedSeatCount != null ? String(editData.occupiedSeatCount) : ""
        });
        setOriginalUnitSqft(editData.sqft || 0);
        setOriginalFloorId(editData.floor?._id || editData.floor || "");
        if (editData.property?._id || editData.property) {
          fetchFloors(editData.property?._id || editData.property);
        }
      } else {
        setFormData({
          property: "", floor: "", floorNumber: "", unitNumber: "", unitName: "",
          sqft: "", unitType: "Standard", unitStatus: "Available",
          seatCount: "", occupiedSeatCount: ""
        });
        setFloors([]);
        setOriginalUnitSqft(0);
        setOriginalFloorId("");
      }
    }
  }, [editData, isOpen]);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      if (response.success && Array.isArray(response.data)) {
        setProperties(response.data);
        if (response.data.length === 1 && !formData.property) {
          const autoPropId = response.data[0]._id;
          setFormData(prev => ({ ...prev, property: autoPropId }));
          fetchFloors(autoPropId);
        }
      }
    } catch (err) { console.error(err); }
  };

  const fetchFloors = async (propertyId: string) => {
    try {
      const response = await api.get(`/floors?property=${propertyId}&limit=100`);
      if (response.success && Array.isArray(response.data)) {
        setFloors(response.data);
        if (response.data.length === 1 && !formData.floor) {
          const autoFloor = response.data[0];
          setFormData(prev => ({
            ...prev,
            floor: autoFloor._id,
            floorNumber: autoFloor.floorNumber
          }));
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "property") {
      fetchFloors(value);
      setFormData(prev => ({ ...prev, [name]: value, floor: "", floorNumber: "" }));
    } else if (name === "floor") {
      const selectedF = floors.find(f => f._id === value);
      setFormData(prev => ({ ...prev, [name]: value, floorNumber: selectedF ? selectedF.floorNumber : "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const selectedProperty = properties.find(p => p._id === formData.property);
  const selectedFloor = floors.find(f => f._id === formData.floor);
  const unitSqft = Number(formData.sqft) || 0;

  const isSameFloor = formData.floor === originalFloorId;
  const floorTotalSft = Number(selectedFloor?.totalSft || 0);

  // Existing allocated SFT on floor (prior to current edit/input)
  const existingAllocatedFloorSft = selectedFloor
    ? Math.max(0, (selectedFloor.occupiedSft || (selectedFloor.totalSft - (selectedFloor.availableSft ?? selectedFloor.totalSft))) - (isSameFloor ? originalUnitSqft : 0))
    : 0;

  // Total allocated SFT including the new unit area entered in the form
  const totalAllocatedSft = existingAllocatedFloorSft + unitSqft;

  // Maximum SFT available for a new unit before user types
  const availableSftBeforeInput = Math.max(0, floorTotalSft - existingAllocatedFloorSft);

  // Remaining SFT on floor after entering current unit's SFT
  const remainingFloorSft = floorTotalSft - totalAllocatedSft;

  // Occupancy projection percentage
  const occupancyPercentage = floorTotalSft > 0 ? Math.min(100, Math.round((totalAllocatedSft / floorTotalSft) * 100)) : 0;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (selectedFloor && floorTotalSft > 0 && unitSqft > availableSftBeforeInput) {
      alert(`Unit area (${unitSqft.toLocaleString()} SFT) cannot exceed available floor space (${availableSftBeforeInput.toLocaleString()} SFT).`);
      return;
    }
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div className="bg-white rounded-3 shadow-lg overflow-hidden w-100 mx-3" style={{ maxWidth: '800px' }}>
        {/* Dark Header */}
        <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#2d3748' }}>
          <h6 className="fw-bold mb-0 text-white" style={{ fontSize: '1rem' }}>
            {editData ? "Edit Unit Details" : "Add New Unit"}
          </h6>
          <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose} style={{ fontSize: '0.8rem' }}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>

            {/* Property and Floor Information Section */}
            <div className="mb-4">
              <span className="fw-bold text-dark d-block mb-3" style={{ fontSize: '0.88rem' }}>
                <i className="bi bi-building text-primary me-2"></i>
                {isCoWorking ? "Property Information" : (properties.length > 1 ? "Property & Floor Information" : "Floor Information")}
              </span>
              <div className="row g-3">
                {properties.length > 1 && (
                  <div className={isCoWorking ? "col-12" : "col-md-6"}>
                    <label style={LABEL_STYLE}>Select Property *</label>
                    <select
                      name="property"
                      value={formData.property}
                      onChange={handleChange}
                      required
                      disabled={!!editData}
                      style={FIELD_STYLE}
                    >
                      <option value="">Select Property...</option>
                      {properties.map(p => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                    </select>
                  </div>
                )}

                {!isCoWorking && (
                  <div className={properties.length > 1 ? "col-md-6" : "col-12"}>
                    <label style={LABEL_STYLE}>
                      Select Floor (Optional)
                      {floors.length === 1 && <span className="text-muted ms-1 small fw-normal">(Auto-selected)</span>}
                    </label>
                    <select
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      disabled={!formData.property || !!editData}
                      style={{
                        ...FIELD_STYLE,
                        backgroundColor: (!formData.property || !!editData) ? "#f3f4f6" : FIELD_STYLE.backgroundColor
                      }}
                    >
                      <option value="">No Floor / Direct Property &amp; Co-working Workspace</option>
                      {floors.map(f => <option key={f._id} value={f._id}>{f.floorName || `Floor ${f.floorNumber}`}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {!isCoWorking && selectedFloor && (
                <div className="d-flex flex-wrap gap-3 mt-3 p-3 bg-light rounded border">
                  <div className="flex-fill">
                    <div className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>Floor Total SFT</div>
                    <div className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>{floorTotalSft.toLocaleString()} SFT</div>
                  </div>
                  <div className="flex-fill border-start ps-3">
                    <div className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>Allocated SFT</div>
                    <div className="fw-bold text-primary" style={{ fontSize: '0.88rem' }}>
                      {totalAllocatedSft.toLocaleString()} SFT
                      {unitSqft > 0 && <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.75rem' }}>(+ {unitSqft.toLocaleString()})</span>}
                    </div>
                  </div>
                  <div className="flex-fill border-start ps-3">
                    <div className="text-muted small fw-bold" style={{ fontSize: '0.7rem' }}>Remaining Floor SFT</div>
                    <div className={`fw-bold ${remainingFloorSft < 0 ? 'text-danger' : 'text-success'}`} style={{ fontSize: '0.88rem' }}>
                      {remainingFloorSft.toLocaleString()} SFT
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Unit Specification Section */}
            <div className="mb-4 pt-2 border-top">
              <span className="fw-bold text-dark d-block mb-3 mt-3" style={{ fontSize: '0.88rem' }}>
                <i className="bi bi-ui-checks-grid text-primary me-2"></i>Unit Specifications
              </span>
              <div className="row g-3">
                <div className="col-md-6">
                  <label style={LABEL_STYLE}>Unit Number *</label>
                  <input type="text" name="unitNumber" value={formData.unitNumber} onChange={handleChange} placeholder="e.g., 501" required style={FIELD_STYLE} />
                </div>
                <div className="col-md-6">
                  <label style={LABEL_STYLE}>Unit Name (Optional)</label>
                  <input type="text" name="unitName" value={formData.unitName} onChange={handleChange} placeholder="e.g., Office 501" style={FIELD_STYLE} />
                </div>

                <div className="col-md-6">
                  <label style={LABEL_STYLE}>Unit Type</label>
                  <select name="unitType" value={formData.unitType} onChange={handleChange} style={FIELD_STYLE}>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Cabin">Cabin</option>
                    <option value="Retail">Retail</option>
                    <option value="Shared Workspace">Shared Workspace</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label style={LABEL_STYLE}>Status</label>
                  <select name="unitStatus" value={formData.unitStatus} onChange={handleChange} style={FIELD_STYLE}>
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label style={LABEL_STYLE}>Area (SFT) *</label>
                  <div className="position-relative">
                    <input
                      type="number"
                      name="sqft"
                      value={formData.sqft}
                      onChange={handleChange}
                      placeholder="Enter SFT Area"
                      min="1"
                      required
                      style={{
                        ...FIELD_STYLE,
                        borderColor: selectedFloor && floorTotalSft > 0 && unitSqft > availableSftBeforeInput ? "#ef4444" : FIELD_STYLE.borderColor
                      }}
                    />
                    <span className="position-absolute text-muted small" style={{ right: 12, top: "50%", transform: "translateY(-50%)", fontWeight: 600 }}>SFT</span>
                  </div>
                  {selectedFloor && floorTotalSft > 0 && unitSqft > availableSftBeforeInput && (
                    <div className="text-danger small mt-1 fw-bold">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      Exceeds available floor area ({availableSftBeforeInput.toLocaleString()} SFT remaining)!
                    </div>
                  )}
                </div>

                {!isCoWorking && selectedFloor && (
                  <div className="col-md-6">
                    <label style={LABEL_STYLE}>Remaining Floor SFT</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        value={remainingFloorSft.toLocaleString()}
                        readOnly
                        style={{ ...FIELD_STYLE, backgroundColor: "var(--bg-app)", color: remainingFloorSft < 0 ? "#ef4444" : "#16a34a", fontWeight: 700 }}
                      />
                      <span className="position-absolute text-muted small" style={{ right: 12, top: "50%", transform: "translateY(-50%)", fontWeight: 600 }}>SFT</span>
                    </div>
                  </div>
                )}



                {!isCoWorking && selectedFloor && (
                  <div className="col-12 mt-2">
                    <label className="d-flex justify-content-between w-100 mb-1" style={LABEL_STYLE}>
                      <span>Floor Occupancy Projection</span>
                      <span>{occupancyPercentage > 100 ? 100 : occupancyPercentage}%</span>
                    </label>
                    <div className="progress" style={{ height: '8px', borderRadius: 4 }}>
                      <div
                        className={`progress-bar ${occupancyPercentage > 90 ? 'bg-danger' : occupancyPercentage > 75 ? 'bg-warning' : 'bg-primary'}`}
                        role="progressbar"
                        style={{ width: `${occupancyPercentage > 100 ? 100 : occupancyPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 border-top d-flex gap-2 justify-content-end bg-light">
            <button type="button" className="btn btn-sm btn-outline-secondary fw-bold px-3 py-2" onClick={onClose} disabled={isSubmitting} style={{ fontSize: '0.85rem', borderRadius: '4px' }}>Cancel</button>
            <button
              type="submit"
              className="btn btn-sm fw-bold text-white px-4 py-2"
              disabled={
                isSubmitting ||
                (selectedFloor ? unitSqft > availableSftBeforeInput : false) ||
                (!!formData.seatCount && !!formData.occupiedSeatCount &&
                  Number(formData.occupiedSeatCount) > Number(formData.seatCount))
              }
              style={{ fontSize: '0.85rem', borderRadius: '4px', backgroundColor: 'var(--dark-section)' }}
            >
              {isSubmitting ? "Saving..." : (editData ? 'Update Unit' : 'Create Unit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
