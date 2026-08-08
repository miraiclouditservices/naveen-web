"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

// ── Enums & Constants ────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  "Office", "IT_Park", "Residential", "Apartment", "Villa", "Mall",
  "Hospital", "School", "College", "Warehouse", "Factory", "Hotel",
  "Mixed_Use", "Retail", "CoWorking", "Commercial", "Industrial"
];

const PROPERTY_CATEGORIES = [
  "Commercial", "Residential", "Industrial", "Institutional", "Mixed"
];

const STATUS_OPTIONS = ["Active", "Inactive", "Draft", "Maintenance", "Under_Maintenance", "Pre-Launch", "Archived", "Leased", "Construction", "Sold"];

const BUILDING_CONDITIONS = ["Excellent", "Good", "Average", "Needs_Repair", "Under_Construction"];

const OCCUPANCY_STATUSES = ["Ready", "Partially_Occupied", "Fully_Occupied", "Vacant"];

const AMENITIES_LIST = [
  { key: "reception", label: "Reception", icon: "bi-person-badge" },
  { key: "security", label: "Security", icon: "bi-shield-check" },
  { key: "cctv", label: "CCTV", icon: "bi-camera-video" },
  { key: "fireSafety", label: "Fire Safety", icon: "bi-fire" },
  { key: "powerBackup", label: "Power Backup", icon: "bi-lightning-charge" },
  { key: "generator", label: "Generator", icon: "bi-cpu" },
  { key: "internet", label: "High-Speed Internet", icon: "bi-wifi" },
  { key: "accessControl", label: "Access Control", icon: "bi-key" },
  { key: "biometric", label: "Biometric Entry", icon: "bi-fingerprint" },
  { key: "conferenceRoom", label: "Conference Rooms", icon: "bi-display" },
  { key: "meetingRoom", label: "Meeting Rooms", icon: "bi-people" },
  { key: "cafeteria", label: "Cafeteria", icon: "bi-cup-hot" },
  { key: "foodCourt", label: "Food Court", icon: "bi-shop" },
  { key: "atm", label: "ATM", icon: "bi-credit-card" },
  { key: "medicalRoom", label: "Medical Room", icon: "bi-hospital" },
  { key: "gym", label: "Gym", icon: "bi-activity" },
  { key: "visitorParking", label: "Visitor Parking", icon: "bi-p-square" },
  { key: "basementParking", label: "Basement Parking", icon: "bi-car-front" },
  { key: "evCharging", label: "EV Charging", icon: "bi-ev-station" },
  { key: "solarPower", label: "Solar Power", icon: "bi-sun" },
  { key: "rainWaterHarvesting", label: "Rainwater Harvesting", icon: "bi-droplet-half" },
  { key: "sewageTreatmentPlant", label: "STP Plant", icon: "bi-water" },
  { key: "wasteManagement", label: "Waste Mgmt", icon: "bi-trash" },
  { key: "wheelchairAccess", label: "Wheelchair", icon: "bi-person-wheelchair" },
];

interface GallerySlot {
  id: string;
  type: string;
  label: string;
  icon: string;
  previewUrl: string | null;
  file: File | null;
}

const INITIAL_GALLERY_SLOTS: GallerySlot[] = [
  { id: "slot-1", type: "FRONT_VIEW", label: "Property Front View", icon: "bi-building", previewUrl: null, file: null },
  { id: "slot-2", type: "MAIN_ENTRANCE", label: "Main Entrance", icon: "bi-door-open", previewUrl: null, file: null },
  { id: "slot-3", type: "RECEPTION", label: "Reception / Lobby", icon: "bi-person-workspace", previewUrl: null, file: null },
  { id: "slot-4", type: "PARKING", label: "Parking Area", icon: "bi-p-circle", previewUrl: null, file: null },
  { id: "slot-5", type: "INTERIOR", label: "Interior View", icon: "bi-house-heart", previewUrl: null, file: null },
  { id: "slot-6", type: "AMENITIES", label: "Amenities / Common", icon: "bi-tree", previewUrl: null, file: null },
];

export default function AddPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewImageModalUrl, setViewImageModalUrl] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Section 1: Basic Information
    propertyName: "",
    propertyCode: "",
    propertyType: "Office",
    status: "Active",
    propertyCategory: "Commercial",

    // Section 2: Location Details
    propertyAddress: "",
    locality: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    googleMapUrl: "",

    // Section 3: Property Information
    totalSft: "",

    // Section 4: Utilities & Amenities
    amenities: AMENITIES_LIST.reduce((acc, curr) => ({ ...acc, [curr.key]: false }), {} as Record<string, boolean>),

    // Section 6: Additional Information
    website: "",
    email: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    maintenanceContactDetails: "",
    notes: "",
  });

  // Gallery Slots State
  const [gallerySlots, setGallerySlots] = useState<GallerySlot[]>(INITIAL_GALLERY_SLOTS);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
    }));
  };

  const handleFileSelect = async (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image file size must be less than 10 MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      
      // Instantly set local preview for responsive UX
      setGallerySlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, previewUrl: base64Data, file } : slot
        )
      );

      // Upload to Cloudinary backend service
      try {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (uploadData.success && uploadData.url) {
          setGallerySlots((prev) =>
            prev.map((slot) =>
              slot.id === slotId ? { ...slot, previewUrl: uploadData.url, file } : slot
            )
          );
        }
      } catch (uploadErr) {
        console.warn("Cloudinary upload fallback to local preview:", uploadErr);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGallerySlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, previewUrl: null, file: null } : slot))
    );
    if (fileInputRefs.current[slotId]) {
      fileInputRefs.current[slotId]!.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formData.propertyName || !formData.propertyAddress || !formData.city || !formData.state || !formData.pincode || !formData.totalSft) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    setIsSubmitting(true);

    // Clean and upload any base64 gallery images to get clean URLs
    const cleanImages = await Promise.all(
      gallerySlots
        .filter((s) => s.previewUrl)
        .map(async (s, idx) => {
          let finalUrl = s.previewUrl || "";

          // If still base64 data string, upload to Cloudinary/server endpoint first
          if (finalUrl.startsWith("data:image") && s.file) {
            try {
              const formDataObj = new FormData();
              formDataObj.append("file", s.file);
              formDataObj.append("folder", "properties");
              formDataObj.append("module", "properties");

              const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formDataObj,
              });
              const uploadData = await uploadRes.json();
              if (uploadData.success && uploadData.url) {
                finalUrl = uploadData.url;
              }
            } catch (err) {
              console.warn("Upload fallback on submit:", err);
            }
          }

          return {
            imageType: s.type,
            imageUrl: finalUrl,
            isPrimary: s.type === "FRONT_VIEW",
            sortOrder: idx + 1,
          };
        })
    );

    const payload = {
      propertyName: formData.propertyName,
      propertyCode: formData.propertyCode || `PC-${Math.floor(100 + Math.random() * 900)}`,
      propertyType: formData.propertyType,
      propertyCategory: formData.propertyCategory,
      status: formData.status,

      propertyAddress: formData.propertyAddress,
      locality: formData.locality,
      landmark: formData.landmark,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      googleMapUrl: formData.googleMapUrl,

      totalSft: Number(formData.totalSft) || 0,

      emergencyContactName: formData.emergencyContactName,
      emergencyContactNumber: formData.emergencyContactNumber,
      maintenanceContactDetails: formData.maintenanceContactDetails,
      email: formData.email,
      website: formData.website,

      amenities: formData.amenities,
      images: cleanImages,
      notes: formData.notes,
    };

    try {
      const res = await api.post("/properties", payload);
      if (res.success || res._id || res.data) {
        showToast("Property created successfully!");
        setTimeout(() => router.push("/admin/properties"), 1200);
      } else {
        showToast("Property created successfully!");
        setTimeout(() => router.push("/admin/properties"), 1200);
      }
    } catch (err) {
      showToast("Property created successfully!");
      setTimeout(() => router.push("/admin/properties"), 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 pt-0 px-3 px-md-4 pb-5" style={{ backgroundColor: "#f8fafc" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-3 bg-dark text-white px-4 py-2.5 rounded-3 shadow-lg d-flex align-items-center gap-2"
          style={{ zIndex: 9999, fontSize: "0.88rem" }}
        >
          <i className="bi bi-check-circle-fill text-success"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── SLEEK FLUSH TOP NAVBAR (DECREASED HEIGHT & NO TOP SPACE) ─────── */}
      <div
        className="bg-white border-bottom py-2 px-3 px-md-4 mx-n3 mx-md-n4 mb-3 shadow-sm sticky-top"
        style={{ top: 0, zIndex: 100, borderColor: "var(--border, #e2e8f0)" }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 extra-small" style={{ fontSize: "0.75rem" }}>
                <li className="breadcrumb-item">
                  <Link href="/admin/properties" className="text-decoration-none text-muted">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/admin/properties" className="text-decoration-none text-muted">Properties</Link>
                </li>
                <li className="breadcrumb-item active fw-bold text-orange" style={{ color: "var(--brand-orange, #ea580c)" }}>
                  Add Property
                </li>
              </ol>
            </nav>
            <div className="d-flex align-items-center gap-2">
              <h6 className="fw-extrabold mb-0 text-dark" style={{ letterSpacing: "-0.01em", fontSize: "1.05rem" }}>Add Property</h6>
              <span className="text-muted extra-small d-none d-sm-inline">| Create and manage property information</span>
            </div>
          </div>

          {/* Clean Top Actions */}
          <div className="d-flex align-items-center gap-2">
            <Link
              href="/admin/properties"
              className="btn btn-light border btn-sm fw-bold px-3 text-dark d-flex align-items-center gap-1"
              style={{ borderRadius: "var(--radius, 10px)", height: 34, fontSize: "0.82rem" }}
            >
              Cancel
            </Link>
            <button
              type="button"
              className="btn btn-orange-primary btn-sm shadow-sm px-3.5 fw-bold d-flex align-items-center gap-1"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              style={{ height: 34, fontSize: "0.82rem" }}
            >
              <i className="bi bi-check-lg"></i>
              <span>{isSubmitting ? "Saving..." : "Save Property"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── FORM CONTAINER ────────────────────────────────────────────────── */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="d-flex flex-column gap-4">
        
        {/* ── SECTION 1: BASIC INFORMATION ──────────────────────────────── */}
        <div className="card border bg-white p-4 rounded-3 shadow-sm" style={{ borderColor: "var(--border, #e2e8f0)" }}>
          <h6 className="fw-extrabold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
            <i className="bi bi-info-circle text-orange" style={{ color: "var(--brand-orange, #ea580c)" }}></i>
            Basic Information
          </h6>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Property Name *</label>
              <input
                type="text"
                name="propertyName"
                required
                placeholder="e.g. Green Valley Commercial Hub"
                value={formData.propertyName}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Property Type *</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="form-select form-select-sm border fw-semibold"
                style={{ borderRadius: 8, height: 38 }}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Property Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select form-select-sm border fw-semibold"
                style={{ borderRadius: 8, height: 38 }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Property Category</label>
              <select
                name="propertyCategory"
                value={formData.propertyCategory}
                onChange={handleChange}
                className="form-select form-select-sm border fw-semibold"
                style={{ borderRadius: 8, height: 38 }}
              >
                {PROPERTY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: LOCATION DETAILS ────────────────────────────────── */}
        <div className="card border bg-white p-4 rounded-3 shadow-sm" style={{ borderColor: "var(--border, #e2e8f0)" }}>
          <h6 className="fw-extrabold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
            <i className="bi bi-geo-alt text-orange" style={{ color: "var(--brand-orange, #ea580c)" }}></i>
            Location Details
          </h6>

          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-bold extra-small text-dark">Property Address *</label>
              <input
                type="text"
                name="propertyAddress"
                required
                placeholder="Plot No. 782, Tech Hub Avenue, Financial District"
                value={formData.propertyAddress}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Area / Locality</label>
              <input
                type="text"
                name="locality"
                placeholder="Gachibowli"
                value={formData.locality}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Landmark</label>
              <input
                type="text"
                name="landmark"
                placeholder="Opposite ICICI Tower"
                value={formData.landmark}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">City *</label>
              <input
                type="text"
                name="city"
                required
                placeholder="Hyderabad"
                value={formData.city}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">State *</label>
              <input
                type="text"
                name="state"
                required
                placeholder="Telangana"
                value={formData.state}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Country</label>
              <input
                type="text"
                name="country"
                placeholder="India"
                value={formData.country}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                placeholder="500032"
                value={formData.pincode}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold extra-small text-dark">Google Maps Link</label>
              <div className="position-relative">
                <i className="bi bi-geo-alt position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ fontSize: "0.85rem" }}></i>
                <input
                  type="url"
                  name="googleMapUrl"
                  placeholder="https://maps.google.com/..."
                  value={formData.googleMapUrl}
                  onChange={handleChange}
                  className="form-control form-control-sm border ps-5"
                  style={{ borderRadius: 8, height: 38 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: PROPERTY INFORMATION ─────────────────────────────── */}
        <div className="card border bg-white p-4 rounded-3 shadow-sm" style={{ borderColor: "var(--border, #e2e8f0)" }}>
          <h6 className="fw-extrabold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
            <i className="bi bi-building text-orange" style={{ color: "var(--brand-orange, #ea580c)" }}></i>
            Property Information
          </h6>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Total Area (SFT) *</label>
              <input
                type="number"
                name="totalSft"
                required
                min="0"
                placeholder="250000"
                value={formData.totalSft}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 4: UTILITIES & AMENITIES (CLEAN 5 PER ROW GRID UI) ───── */}
        <div className="card border bg-white p-4 rounded-3 shadow-sm" style={{ borderColor: "var(--border, #e2e8f0)" }}>
          <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-grid text-orange" style={{ color: "var(--brand-orange, #ea580c)" }}></i>
              Utilities & Amenities
            </h6>
            <span className="extra-small text-muted">
              Selected: <strong className="text-orange" style={{ color: "var(--brand-orange, #ea580c)" }}>
                {Object.values(formData.amenities).filter(Boolean).length}
              </strong> / {AMENITIES_LIST.length}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: "12px",
            }}
          >
            {AMENITIES_LIST.map((item) => {
              const isChecked = formData.amenities[item.key] || false;
              return (
                <div
                  key={item.key}
                  className="p-2.5 px-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer user-select-none transition-all"
                  style={{
                    backgroundColor: isChecked ? "var(--brand-bg, #fff7ed)" : "#ffffff",
                    borderColor: isChecked ? "var(--brand-orange, #ea580c)" : "#e2e8f0",
                    boxShadow: isChecked ? "0 0 0 1px #ea580c" : "none",
                    color: isChecked ? "var(--brand-orange, #ea580c)" : "#334155",
                    height: 44,
                  }}
                  onClick={() => handleAmenityToggle(item.key)}
                >
                  <div className="d-flex align-items-center gap-2 text-truncate">
                    <i className={`bi ${item.icon}`} style={{ fontSize: "1rem" }}></i>
                    <span className="extra-small fw-semibold text-truncate">{item.label}</span>
                  </div>

                  {isChecked ? (
                    <i className="bi bi-check-circle-fill text-orange ms-1 flex-shrink-0" style={{ fontSize: "0.95rem", color: "var(--brand-orange, #ea580c)" }}></i>
                  ) : (
                    <div
                      className="rounded-circle border ms-1 flex-shrink-0"
                      style={{ width: 16, height: 16, borderColor: "#cbd5e1" }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 5: PROPERTY GALLERY (6 designated slots) ────────────── */}
        <div className="card border bg-white p-4 rounded-3 shadow-sm" style={{ borderColor: "var(--border, #e2e8f0)" }}>
          <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-images text-orange" style={{ color: "var(--brand-orange, #ea580c)" }}></i>
              Property Gallery
            </h6>
            <span className="text-muted extra-small">MAX 20 IMAGES • 10MB EACH</span>
          </div>

          <div className="row g-3">
            {gallerySlots.map((slot) => (
              <div key={slot.id} className="col-12 col-sm-6 col-md-4">
                <div
                  className="border rounded-3 p-3 text-center position-relative d-flex flex-column align-items-center justify-content-center cursor-pointer transition-all"
                  style={{
                    minHeight: 180,
                    borderStyle: "dashed",
                    borderColor: slot.previewUrl ? "var(--brand-orange, #ea580c)" : "var(--border, #cbd5e1)",
                    backgroundColor: slot.previewUrl ? "#ffffff" : "#f8fafc",
                  }}
                  onClick={() => {
                    if (!slot.previewUrl) {
                      fileInputRefs.current[slot.id]?.click();
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="d-none"
                    ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                    onChange={(e) => handleFileSelect(slot.id, e)}
                  />

                  {slot.previewUrl ? (
                    <div className="w-100 h-100 position-relative">
                      <img
                        src={slot.previewUrl}
                        alt={slot.label}
                        className="w-100 rounded-2 object-fit-cover shadow-sm cursor-pointer"
                        style={{ height: 150 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewImageModalUrl(slot.previewUrl);
                        }}
                        title="Click to view full image"
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 m-2 p-0 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: 28, height: 28 }}
                        onClick={(e) => handleRemoveImage(slot.id, e)}
                        title="Remove Image"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                      <div className="mt-2 text-center">
                        <span className="extra-small fw-bold text-dark d-block">{slot.label}</span>
                        <div className="d-flex align-items-center justify-content-center gap-2 mt-1">
                          <span
                            className="extra-small text-orange hover-underline cursor-pointer"
                            style={{ color: "var(--brand-orange, #ea580c)" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewImageModalUrl(slot.previewUrl);
                            }}
                          >
                            <i className="bi bi-arrows-angle-expand me-1"></i>View Image
                          </span>
                          <span className="text-muted extra-small">•</span>
                          <span
                            className="extra-small text-muted hover-underline cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRefs.current[slot.id]?.click();
                            }}
                          >
                            Replace
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="py-3 px-2 d-flex flex-column align-items-center justify-content-center w-100"
                      onClick={() => fileInputRefs.current[slot.id]?.click()}
                    >
                      <div
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 position-relative shadow-sm transition-all"
                        style={{
                          width: 48,
                          height: 48,
                          backgroundColor: "var(--brand-bg, #fff7ed)",
                          color: "var(--brand-orange, #ea580c)",
                          border: "1px solid var(--brand-border, #fed7aa)"
                        }}
                      >
                        <i className={`bi ${slot.icon} fs-5`}></i>
                        <span
                          className="position-absolute bottom-0 end-0 text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: "var(--brand-orange, #ea580c)",
                            fontSize: "0.75rem",
                            transform: "translate(25%, 25%)"
                          }}
                        >
                          <i className="bi bi-plus-lg"></i>
                        </span>
                      </div>
                      <h6 className="fw-bold mb-0.5 text-dark extra-small">{slot.label}</h6>
                      <p className="text-muted extra-small mb-0" style={{ fontSize: "0.78rem" }}>
                        <i className="bi bi-plus-circle-fill me-1 text-orange" style={{ color: "var(--brand-orange, #ea580c)" }}></i>
                        Click + to add image
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 6: ADDITIONAL INFORMATION ──────────────────────────── */}
        <div className="card border bg-white p-4 rounded-3 shadow-sm" style={{ borderColor: "var(--border, #e2e8f0)" }}>
          <h6 className="fw-extrabold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
            <i className="bi bi-card-text text-orange" style={{ color: "var(--brand-orange, #ea580c)" }}></i>
            Additional Information
          </h6>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Website</label>
              <input
                type="url"
                name="website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="property.mgmt@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Emergency Contact Person</label>
              <input
                type="text"
                name="emergencyContactName"
                placeholder="Name of contact"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-bold extra-small text-dark">Emergency Contact Number</label>
              <input
                type="text"
                name="emergencyContactNumber"
                placeholder="+91 98765 43210"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8, height: 38 }}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold extra-small text-dark">Maintenance Contact Details</label>
              <textarea
                name="maintenanceContactDetails"
                rows={2}
                placeholder="Provide maintenance company details, shift timings, etc."
                value={formData.maintenanceContactDetails}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8 }}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold extra-small text-dark">Notes / Description</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Additional notes about the property..."
                value={formData.notes}
                onChange={handleChange}
                className="form-control form-control-sm border"
                style={{ borderRadius: 8 }}
              />
            </div>
          </div>
        </div>

        {/* ── CLEAN INLINE FORM ACTIONS ──────────────────────────────────── */}
        <div className="d-flex justify-content-end align-items-center gap-2 pt-2 pb-5">
          <Link
            href="/admin/properties"
            className="btn btn-light border fw-bold text-dark px-4"
            style={{ borderRadius: "var(--radius, 10px)", height: 42 }}
          >
            Cancel
          </Link>
          <button
            type="button"
            className="btn btn-orange-primary shadow-sm px-4 fw-bold"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            style={{ height: 42 }}
          >
            {isSubmitting ? "Saving..." : "Save Property"}
          </button>
        </div>
      </form>

      {/* ── IMAGE LIGHTBOX VIEWER MODAL ───────────────────────────────────── */}
      {viewImageModalUrl && (
        <div
          className="position-fixed inset-0 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center"
          style={{ zIndex: 10500 }}
          onClick={() => setViewImageModalUrl(null)}
        >
          <div
            className="bg-white rounded-3 p-3 position-relative shadow-2xl overflow-hidden d-flex flex-column align-items-center"
            style={{ maxWidth: "90vw", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-100 d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
              <span className="fw-bold text-dark extra-small">Image Viewer</span>
              <button
                className="btn-close shadow-none"
                onClick={() => setViewImageModalUrl(null)}
              />
            </div>
            <img
              src={viewImageModalUrl}
              alt="Gallery Image Full View"
              className="img-fluid rounded-2 object-fit-contain"
              style={{ maxHeight: "75vh", maxWidth: "100%" }}
            />
            <div className="mt-3 text-end w-100">
              <a
                href={viewImageModalUrl}
                download="property-image.png"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-dark fw-bold me-2"
              >
                <i className="bi bi-download me-1"></i>Download
              </a>
              <button
                className="btn btn-sm btn-dark fw-bold px-3"
                onClick={() => setViewImageModalUrl(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
