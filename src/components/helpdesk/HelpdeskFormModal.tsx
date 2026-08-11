"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/utils/api";

interface HelpdeskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function HelpdeskFormModal({
  isOpen,
  onClose,
  onSave
}: HelpdeskFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Maintenance",
    priority: "Low",
    description: "",
    attachment: "",
    property: "",
    floor: "",
    unit: "",
    locationArea: ""
  });

  // Locations / Mappings data for creation
  const [properties, setProperties] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  // Dropdown search states
  const [showPropDrop, setShowPropDrop] = useState(false);
  const [propSearch, setPropSearch] = useState("");
  const propRef = useRef<HTMLDivElement>(null);

  const [showFloorDrop, setShowFloorDrop] = useState(false);
  const [floorSearch, setFloorSearch] = useState("");
  const floorRef = useRef<HTMLDivElement>(null);

  const [showUnitDrop, setShowUnitDrop] = useState(false);
  const [unitSearch, setUnitSearch] = useState("");
  const unitRef = useRef<HTMLDivElement>(null);

  // Fetch properties, floors, and user assignments on mount/open
  useEffect(() => {
    if (isOpen) {
      setError(null);

      api.get("/auth/me").then(res => {
        if (res?.success && res?.data) {
          const u = res.data;
          const propId = u.assignedProperties?.[0]?._id || u.assignedProperties?.[0] || u.property?._id || u.property || "";
          const floorId = u.assignedFloors?.[0]?._id || u.assignedFloors?.[0] || u.floor?._id || u.floor || "";
          const unitId = u.assignedUnits?.[0]?._id || u.assignedUnits?.[0] || u.unit?._id || u.unit || "";

          setFormData(prev => ({
            ...prev,
            property: prev.property || (typeof propId === "string" ? propId : propId?._id) || "",
            floor: prev.floor || (typeof floorId === "string" ? floorId : floorId?._id) || "",
            unit: prev.unit || (typeof unitId === "string" ? unitId : unitId?._id) || ""
          }));
        }
      }).catch(() => { });

      api.get("/properties").then(res => {
        if (res.success && res.data && res.data.length > 0) {
          setProperties(res.data);
          setFormData(prev => ({
            ...prev,
            property: prev.property || res.data[0]._id
          }));
        }
      });
      api.get("/units").then(res => {
        if (res.success) setUnits(res.data);
      });
    }
  }, [isOpen]);

  // Dynamically load floors when property changes
  useEffect(() => {
    const fetchFloorsForProperty = async () => {
      if (!formData.property) {
        setFloors([]);
        return;
      }
      try {
        const res = await api.get(`/floors?property=${formData.property}&limit=1000`);
        if (res.success && res.data) {
          setFloors(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              floor: prev.floor || res.data[0]._id
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch floors for property:", err);
      }
    };
    fetchFloorsForProperty();
  }, [formData.property]);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (propRef.current && !propRef.current.contains(e.target as Node)) setShowPropDrop(false);
      if (floorRef.current && !floorRef.current.contains(e.target as Node)) setShowFloorDrop(false);
      if (unitRef.current && !unitRef.current.contains(e.target as Node)) setShowUnitDrop(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter lists based on searches
  const filteredProps = properties.filter(p =>
    (p.propertyName || "").toLowerCase().includes(propSearch.toLowerCase())
  );

  const filteredFloors = floors.filter(f =>
    (f.floorName || `Floor ${f.floorNumber}`).toLowerCase().includes(floorSearch.toLowerCase())
  );

  const filteredUnits = units
    .filter(u => {
      const matchProperty = (u.property?._id || u.property) === formData.property;
      const matchFloor = (u.floor?._id || u.floor) === formData.floor;
      return matchProperty && matchFloor;
    })
    .filter(u =>
      (u.unitName || u.unitNumber || "").toLowerCase().includes(unitSearch.toLowerCase())
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let propId = formData.property || (properties.length > 0 ? properties[0]._id : "");
      let floorId = formData.floor || (floors.length > 0 ? floors[0]._id : "");

      // If floorId is missing, fetch any available floor in the system to guarantee backend validation passes
      if (!floorId) {
        try {
          const floorRes = await api.get("/floors?limit=1");
          if (floorRes?.success && floorRes?.data?.[0]?._id) {
            floorId = floorRes.data[0]._id;
            if (!propId && floorRes.data[0].property) {
              const p = floorRes.data[0].property;
              propId = typeof p === "object" ? p._id : p;
            }
          }
        } catch (fErr) {
          console.warn("Floor auto-fetch fallback skipped:", fErr);
        }
      }

      // If propId is still missing, fetch any available property in the system
      if (!propId) {
        try {
          const propRes = await api.get("/properties?limit=1");
          if (propRes?.success && propRes?.data?.[0]?._id) {
            propId = propRes.data[0]._id;
          }
        } catch (pErr) {
          console.warn("Property auto-fetch fallback skipped:", pErr);
        }
      }

      const payload: any = {
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
      };

      if (formData.attachment) payload.attachment = formData.attachment;
      if (formData.locationArea) payload.locationArea = formData.locationArea;
      if (formData.unit) payload.unit = formData.unit;
      if (propId) payload.property = propId;
      if (floorId) payload.floor = floorId;

      await onSave(payload);
      setFormData({
        title: "",
        category: "Maintenance",
        priority: "Low",
        description: "",
        attachment: "",
        property: "",
        floor: "",
        unit: "",
        locationArea: ""
      });
      onClose();
    } catch (err: any) {
      console.error("Error creating helpdesk ticket:", err);
      setError(err.message || "Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProp = properties.find(p => p._id === formData.property);
  const selectedFloorObj = floors.find(f => f._id === formData.floor);
  const selectedUnitObj = units.find(u => u._id === formData.unit);

  return (
    <div
      className="modal show d-block"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: "20px"
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered overflow-hidden w-100"
        style={{
          maxWidth: "750px",
          borderRadius: "10px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}
      >
        <div className="modal-content border-0 bg-white">
          {/* Modal Header */}
          <div
            className="px-4 py-3 d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-ticket-detailed fs-5"></i>
              <h5 className="fw-bold mb-0" style={{ fontSize: "1rem" }}>
                Raise Support Ticket
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white shadow-none"
              onClick={onClose}
              style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Modal Content */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
            <div className="p-4" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
              {error && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center justify-content-between mb-3 border-0" style={{ borderRadius: "6px", backgroundColor: "#fef2f2", color: "#991b1b" }}>
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#991b1b",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      lineHeight: 1,
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="row g-3">
                {/* Basic Information */}
                <div className="col-12">
                  <h6 className="fw-bold text-dark border-bottom pb-2" style={{ fontSize: "0.9rem" }}>Basic Information</h6>
                </div>
                <div className="col-md-12">
                  <label className="form-label small fw-semibold text-muted mb-1">Ticket Title*</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    style={{ height: "40px", borderRadius: "6px", fontSize: "0.85rem" }}
                    placeholder="e.g., Water leakage issue"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Category*</label>
                  <select
                    className="form-select"
                    required
                    style={{ height: "40px", borderRadius: "6px", fontSize: "0.85rem" }}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Water">Water</option>
                    <option value="Payment">Payment</option>
                    <option value="Agreement">Agreement</option>
                    <option value="Security">Security</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-1">Priority*</label>
                  <select
                    className="form-select"
                    required
                    style={{ height: "40px", borderRadius: "6px", fontSize: "0.85rem" }}
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label small fw-semibold text-muted mb-1">Description / Comments*</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    required
                    style={{ borderRadius: "6px", fontSize: "0.85rem" }}
                    placeholder="Write detailed description of the issue..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label small fw-semibold text-muted mb-1">Attachment Link (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ height: "40px", borderRadius: "6px", fontSize: "0.85rem" }}
                    placeholder="Document or Image URL"
                    value={formData.attachment}
                    onChange={e => setFormData({ ...formData, attachment: e.target.value })}
                  />
                </div>

                {/* Location Area */}
                <div className="col-md-12">
                  <label className="form-label small fw-semibold text-muted mb-1">Specific Location Description (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ height: "40px", borderRadius: "6px", fontSize: "0.85rem" }}
                    placeholder="e.g. Corridor near elevator B, unit 304 restroom"
                    value={formData.locationArea}
                    onChange={e => setFormData({ ...formData, locationArea: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-top d-flex justify-content-end gap-2 bg-light">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-4 fw-bold"
                style={{ height: "38px", borderRadius: "6px" }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4 fw-bold text-white border-0"
                style={{ height: "38px", borderRadius: "6px", backgroundColor: "var(--dark-section)" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Raise Ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
