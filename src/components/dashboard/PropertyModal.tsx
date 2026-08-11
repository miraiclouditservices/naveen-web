"use client";

import { useState, useEffect } from "react";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: any) => Promise<void> | void;
  editData?: any;
  account?: any;
}

const FIELD_STYLE: React.CSSProperties = {
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "0.88rem",
  padding: "9px 14px",
  width: "100%",
  outline: "none",
  backgroundColor: "#ffffff",
  color: "#1e293b",
  transition: "all 0.2s ease"
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 700,
  color: "#334155",
  marginBottom: 6,
};

const AMENITIES_LIST = [
  { key: "reception", label: "Reception Desk", icon: "bi-person-badge" },
  { key: "security", label: "24/7 Security", icon: "bi-shield-check" },
  { key: "cctv", label: "CCTV Surveillance", icon: "bi-camera-video" },
  { key: "powerBackup", label: "Power Backup", icon: "bi-lightning-charge" },
  { key: "internet", label: "High-Speed Internet", icon: "bi-wifi" },
  { key: "conferenceRoom", label: "Conference & Meeting Rooms", icon: "bi-people" },
  { key: "cafeteria", label: "Cafeteria / Food Court", icon: "bi-cup-hot" },
  { key: "visitorParking", label: "Visitor & Basement Parking", icon: "bi-car-front" },
  { key: "fireSafety", label: "Fire Safety System", icon: "bi-fire" },
  { key: "evCharging", label: "EV Charging Stations", icon: "bi-ev-station" },
  { key: "gym", label: "Gym & Fitness", icon: "bi-activity" },
  { key: "wheelchairAccess", label: "Wheelchair Access", icon: "bi-person-wheelchair" },
];

export default function PropertyModal({ isOpen, onClose, onSave, editData, account }: PropertyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isCoworking = account?.account_type === "COWORKING" || account?.account_type === "Partner";

  const [formData, setFormData] = useState<any>({
    propertyName: "",
    propertyCode: "",
    building: "",
    propertyCategory: "Commercial",
    status: "Active",
    propertyAddress: "",
    area: "",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    pincode: "500032",
    totalSft: 12000,
    images: [],
    amenities: {
      reception: true,
      security: true,
      cctv: true,
      powerBackup: true,
      internet: true,
      conferenceRoom: false,
      cafeteria: false,
      visitorParking: true,
      fireSafety: true,
      evCharging: false,
      gym: false,
      wheelchairAccess: false
    }
  });

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (editData) {
        setFormData({
          propertyName: editData.propertyName ?? "",
          propertyCode: editData.propertyCode ?? "",
          building: editData.building ?? editData.propertyName ?? "",
          propertyCategory: editData.propertyCategory ?? "Commercial",
          status: editData.status ?? "Active",
          propertyAddress: editData.propertyAddress ?? editData.location ?? "",
          area: editData.area ?? editData.locality ?? "",
          city: editData.city ?? "Hyderabad",
          state: editData.state ?? "Telangana",
          country: editData.country ?? "India",
          pincode: editData.pincode ?? "500032",
          totalSft: editData.totalSft ?? 12000,
          images: Array.isArray(editData.images)
            ? editData.images.map((img: any) => typeof img === "string" ? img : img?.imageUrl || img?.thumbnailUrl || "").filter(Boolean)
            : [],
          amenities: {
            reception: true,
            security: true,
            cctv: true,
            powerBackup: true,
            internet: true,
            conferenceRoom: false,
            cafeteria: false,
            visitorParking: true,
            fireSafety: true,
            evCharging: false,
            gym: false,
            wheelchairAccess: false,
            ...(editData.amenities || {})
          }
        });
      } else {
        setFormData({
          propertyName: "",
          propertyCode: "",
          building: "",
          propertyCategory: isCoworking ? "Commercial" : "Commercial",
          status: "Active",
          propertyAddress: account?.address ?? "",
          area: "",
          city: account?.city ?? "Hyderabad",
          state: account?.state ?? "Telangana",
          country: account?.country ?? "India",
          pincode: account?.pincode ?? "500032",
          totalSft: 12000,
          images: [],
          amenities: {
            reception: true,
            security: true,
            cctv: true,
            powerBackup: true,
            internet: true,
            conferenceRoom: false,
            cafeteria: false,
            visitorParking: true,
            fireSafety: true,
            evCharging: false,
            gym: false,
            wheelchairAccess: false
          }
        });
      }
    }
  }, [editData, isOpen, account, isCoworking]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const resultStr = event.target.result as string;
            setFormData((prev: any) => ({
              ...prev,
              images: [...(prev.images || []), resultStr]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData({
      ...formData,
      images: (formData.images || []).filter((_: string, idx: number) => idx !== indexToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyName || !formData.propertyName.trim()) {
      setError("Please enter Property / Workspace Name.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      delete payload._id;
      delete payload.orgId;
      delete payload.accountId;
      delete payload.createdBy;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;

      const formattedImages = (payload.images || []).map((img: any) =>
        typeof img === "string"
          ? { imageUrl: img, thumbnailUrl: img, imageType: "FRONT_VIEW", isPrimary: false, sortOrder: 1 }
          : img
      );

      await onSave({
        ...payload,
        images: formattedImages,
        propertyType: isCoworking ? "CoWorking" : "Commercial",
        totalFloors: 1,
        totalBasements: 0,
        totalUnits: 0,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 9999,
      }}
    >
      <div className="bg-white rounded-3 shadow-lg overflow-hidden w-100 mx-3" style={{ maxWidth: "760px" }}>
        
        {/* Modal Header */}
        <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#2d3748" }}>
          <h6 className="fw-bold mb-0 text-white" style={{ fontSize: "1rem" }}>
            {account ? `Add Property / Workspace for ${account.company_name}` : editData ? "Edit Property" : "Add Property"}
          </h6>
          <button
            type="button"
            className="btn-close btn-close-white shadow-none"
            onClick={onClose}
            style={{ fontSize: "0.8rem" }}
          ></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>
            
            {error && (
              <div className="alert alert-danger py-2 px-3 extra-small rounded-3 mb-3 border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {error}
              </div>
            )}

            {/* Section 1: Property Information */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-building text-primary" style={{ fontSize: "1.1rem" }} />
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                Property Information
              </h6>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label style={LABEL_STYLE}>Property / Hub Name *</label>
                <input
                  type="text"
                  required
                  placeholder={isCoworking ? "e.g. Innov8 Hitech Hub" : "e.g. Apex Tower A"}
                  value={formData.propertyName ?? ""}
                  onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                  style={FIELD_STYLE}
                />
              </div>

              <div className="col-md-6">
                <label style={LABEL_STYLE}>Building / Tower Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tower 1 / Block B"
                  value={formData.building ?? ""}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  style={FIELD_STYLE}
                />
              </div>

              <div className="col-md-6">
                <label style={LABEL_STYLE}>Property Code (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if blank (e.g. ANVA-545560)"
                  value={formData.propertyCode ?? ""}
                  onChange={(e) => setFormData({ ...formData, propertyCode: e.target.value })}
                  style={FIELD_STYLE}
                />
              </div>

              <div className="col-md-6">
                <label style={LABEL_STYLE}>Property Status *</label>
                <select
                  value={formData.status ?? "Active"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={FIELD_STYLE}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Section 2: Location Details */}
            <div className="d-flex align-items-center gap-2 mb-3 border-top pt-3">
              <i className="bi bi-geo-alt text-primary" style={{ fontSize: "1.1rem" }} />
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                Location Details
              </h6>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label style={LABEL_STYLE}>Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Full street address"
                  value={formData.propertyAddress ?? ""}
                  onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                  style={FIELD_STYLE}
                />
              </div>

              <div className="col-md-6">
                <label style={LABEL_STYLE}>Area / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Financial District"
                  value={formData.area ?? ""}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  style={FIELD_STYLE}
                />
              </div>

              <div className="col-md-6">
                <label style={LABEL_STYLE}>City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad"
                  value={formData.city ?? ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={FIELD_STYLE}
                />
              </div>

              <div className="col-md-6">
                <label style={LABEL_STYLE}>State *</label>
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={formData.state ?? ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  style={FIELD_STYLE}
                />
              </div>

              <div className="col-md-6">
                <label style={LABEL_STYLE}>Country</label>
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.country ?? ""}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  style={FIELD_STYLE}
                />
              </div>

              <div className="col-md-6">
                <label style={LABEL_STYLE}>Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="Pincode"
                  value={formData.pincode ?? ""}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  style={FIELD_STYLE}
                />
              </div>
            </div>

            {/* Section 3: Building Details */}
            <div className="d-flex align-items-center gap-2 mb-3 border-top pt-3">
              <i className="bi bi-grid-3x3-gap text-primary" style={{ fontSize: "1.1rem" }} />
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                Building Details
              </h6>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label style={LABEL_STYLE}>Total Area (Sq. Ft) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.totalSft ?? 0}
                  onChange={(e) => setFormData({ ...formData, totalSft: parseInt(e.target.value) || 0 })}
                  style={FIELD_STYLE}
                />
              </div>

              <div className="col-md-6">
                <label style={LABEL_STYLE}>Property Category</label>
                <select
                  value={formData.propertyCategory ?? "Commercial"}
                  onChange={(e) => setFormData({ ...formData, propertyCategory: e.target.value })}
                  style={FIELD_STYLE}
                >
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Institutional">Institutional</option>
                  <option value="Mixed">Mixed-Use</option>
                </select>
              </div>
            </div>

            {/* Section 4: Property Photos & Image Upload */}
            <div className="d-flex align-items-center gap-2 mb-3 border-top pt-3">
              <i className="bi bi-cloud-arrow-up text-primary" style={{ fontSize: "1.1rem" }} />
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                Upload Property Photos
              </h6>
            </div>

            <div className="bg-light p-3 rounded-3 border mb-4">
              <div className="border-2 border-dashed rounded-3 p-4 text-center bg-white position-relative" style={{ borderStyle: "dashed", borderColor: "#cbd5e1" }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                  style={{ zIndex: 5, cursor: "pointer" }}
                />
                <div>
                  <div className="mx-auto rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary mb-2" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-cloud-upload" style={{ fontSize: "1.5rem" }} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
                    Click to Upload Property Images
                  </h6>
                  <span className="extra-small text-muted">
                    Supports JPG, PNG, WEBP, GIF (Select multiple files from computer)
                  </span>
                </div>
              </div>

              {/* Uploaded Files Gallery */}
              {formData.images && formData.images.length > 0 && (
                <div className="mt-3 pt-2 border-top">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="extra-small fw-bold text-dark">
                      Uploaded Property Photos ({formData.images.length})
                    </span>
                    <button
                      type="button"
                      className="btn btn-xs btn-link text-danger text-decoration-none p-0 extra-small"
                      onClick={() => setFormData({ ...formData, images: [] })}
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {formData.images.map((imgSrc: string, idx: number) => (
                      <div key={idx} className="position-relative rounded-3 overflow-hidden border shadow-sm bg-white" style={{ width: 90, height: 70 }}>
                        <img
                          src={imgSrc}
                          alt={`Uploaded ${idx + 1}`}
                          className="w-100 h-100 object-fit-cover"
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-xs position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center m-1 rounded-circle"
                          style={{ width: 22, height: 22, zIndex: 10 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                        >
                          <i className="bi bi-x" style={{ fontSize: "0.9rem" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Amenities & Features */}
            <div className="d-flex align-items-center gap-2 mb-3 border-top pt-3">
              <i className="bi bi-stars text-warning" style={{ fontSize: "1.1rem" }} />
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                Amenities &amp; Features
              </h6>
            </div>

            <div className="row g-2">
              {AMENITIES_LIST.map((item) => {
                const isSelected = !!formData.amenities?.[item.key];
                return (
                  <div key={item.key} className="col-md-6">
                    <div
                      className="d-flex align-items-center gap-2 px-3 py-2 cursor-pointer transition-all"
                      style={{
                        borderRadius: "999px",
                        border: isSelected ? "1.5px solid #000000" : "1px solid #e2e8f0",
                        backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                        color: isSelected ? "#000000" : "#64748b",
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                      }}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          amenities: {
                            ...(formData.amenities || {}),
                            [item.key]: !isSelected
                          }
                        })
                      }
                    >
                      <input
                        className="form-check-input ms-0 me-1 shadow-none cursor-pointer"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }}
                        style={{ width: 16, height: 16 }}
                      />
                      <i className={`bi ${item.icon} ${isSelected ? "text-primary fw-bold" : "text-muted"}`} style={{ fontSize: "0.95rem" }} />
                      <span>{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-4 py-3 border-top d-flex gap-2 justify-content-end bg-light">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary fw-bold px-4 py-2"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ fontSize: "0.85rem", borderRadius: "4px" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm fw-bold text-white px-4 py-2"
              style={{
                fontSize: "0.85rem",
                borderRadius: "4px",
                backgroundColor: "var(--button-primary, #1e293b)",
              }}
            >
              {isSubmitting ? "Creating..." : editData ? "Save Changes" : "Create Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
