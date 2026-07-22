"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: any) => void;
  editData?: any;
}

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

export default function PropertyModal({ isOpen, onClose, onSave, editData }: PropertyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    propertyName: "",
    propertyCode: "",
    propertyType: "Office",
    status: "Active",
    propertyAddress: "",
    area: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    totalSft: 10000
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          propertyName: editData.propertyName || "",
          propertyCode: editData.propertyCode || "",
          propertyType: editData.propertyType || "Office",
          status: editData.status || "Active",
          propertyAddress: editData.propertyAddress || editData.location || "",
          area: editData.area || "",
          city: editData.city || "",
          state: editData.state || "",
          country: editData.country || "India",
          pincode: editData.pincode || "",
          totalSft: editData.totalSft || 10000
        });
      } else {
        setFormData({
          propertyName: "",
          propertyCode: "",
          propertyType: "Office",
          status: "Active",
          propertyAddress: "",
          area: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
          totalSft: 10000
        });
      }
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await onSave({ 
      ...formData, 
      totalFloors: 1,
      totalBasements: 0,
      totalUnits: 0,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div className="bg-white rounded-3 shadow-lg overflow-hidden w-100 mx-3" style={{ maxWidth: '700px' }}>
        <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#2d3748' }}>
          <h6 className="fw-bold mb-0 text-white" style={{ fontSize: '1rem' }}>
            {editData ? "Edit Property" : "Add Property"}
          </h6>
          <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose} style={{ fontSize: '0.8rem' }}></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            
            {/* Basic Info */}
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <label style={LABEL_STYLE}>Property Name *</label>
                <input 
                  type="text" required 
                  placeholder="e.g. Green Valley Commercial"
                  value={formData.propertyName} 
                  onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                  style={FIELD_STYLE}
                />
              </div>
              <div className="col-md-4">
                <label style={LABEL_STYLE}>Property Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. PC-001"
                  value={formData.propertyCode} 
                  onChange={(e) => setFormData({...formData, propertyCode: e.target.value})}
                  style={FIELD_STYLE}
                />
              </div>
              <div className="col-md-6">
                <label style={LABEL_STYLE}>Property Type *</label>
                <select 
                  value={formData.propertyType} 
                  onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  style={FIELD_STYLE}
                >
                  <option>Office</option>
                  <option>IT Park</option>
                  <option>Commercial</option>
                  <option>Residential</option>
                  <option>Mixed Use</option>
                  <option>Industrial</option>
                </select>
              </div>
              <div className="col-md-6">
                <label style={LABEL_STYLE}>Property Status *</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={FIELD_STYLE}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            {/* Location Details */}
            <h6 className="fw-bold mb-3 border-bottom pb-2">Location Details</h6>
            <div className="row g-3 mb-4">
              <div className="col-12">
                <label style={LABEL_STYLE}>Property Address *</label>
                <input 
                  type="text" required 
                  placeholder="Full street address"
                  value={formData.propertyAddress} 
                  onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
                  style={FIELD_STYLE}
                />
              </div>
              <div className="col-md-6">
                <label style={LABEL_STYLE}>Area / Locality</label>
                <input 
                  type="text" 
                  placeholder="e.g. Downtown"
                  value={formData.area} 
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  style={FIELD_STYLE}
                />
              </div>
              <div className="col-md-6">
                <label style={LABEL_STYLE}>City *</label>
                <input 
                  type="text" required 
                  placeholder="e.g. Bangalore"
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  style={FIELD_STYLE}
                />
              </div>
              <div className="col-md-4">
                <label style={LABEL_STYLE}>State *</label>
                <input 
                  type="text" required 
                  placeholder="State"
                  value={formData.state} 
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  style={FIELD_STYLE}
                />
              </div>
              <div className="col-md-4">
                <label style={LABEL_STYLE}>Country</label>
                <input 
                  type="text" 
                  placeholder="Country"
                  value={formData.country} 
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  style={FIELD_STYLE}
                />
              </div>
              <div className="col-md-4">
                <label style={LABEL_STYLE}>Pincode *</label>
                <input 
                  type="text" required 
                  placeholder="Pincode"
                  value={formData.pincode} 
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  style={FIELD_STYLE}
                />
              </div>
            </div>

            {/* Building Details */}
            <h6 className="fw-bold mb-3 border-bottom pb-2">Building Details</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label style={LABEL_STYLE}>Total Area (SFT) *</label>
                <input 
                  type="number" required min="0"
                  value={formData.totalSft} 
                  onChange={(e) => setFormData({...formData, totalSft: parseInt(e.target.value) || 0})}
                  style={FIELD_STYLE}
                />
              </div>
            </div>

          </div>
          
          <div className="px-4 py-3 border-top d-flex gap-2 justify-content-end bg-light">
            <button 
              type="button" className="btn btn-sm btn-outline-secondary fw-bold px-3 py-2" 
              onClick={onClose} disabled={isSubmitting} style={{ fontSize: '0.85rem', borderRadius: '4px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" className="btn btn-sm fw-bold text-white px-4 py-2"
              disabled={isSubmitting}
              style={{ fontSize: '0.85rem', borderRadius: '4px', backgroundColor: 'var(--dark-section)' }}
            >
              {isSubmitting ? "Saving..." : "Save Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
