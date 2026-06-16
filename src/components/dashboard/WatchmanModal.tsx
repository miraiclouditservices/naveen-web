"use client";

import { useState, useEffect } from "react";

interface WatchmanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (watchman: any) => void;
  offices: string[];
  editData?: any;
}

export default function WatchmanModal({ isOpen, onClose, onSave, offices, editData }: WatchmanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    badgeId: "",
    phone: "",
    office: "",
    shift: "Morning (6AM–2PM)",
    status: "On Duty",
    emergencyContact: ""
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        name: "",
        badgeId: "",
        phone: "",
        office: offices[0] || "",
        shift: "Morning (6AM–2PM)",
        status: "On Duty",
        emergencyContact: ""
      });
    }
  }, [editData, isOpen, offices]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-3 shadow">
          <div className="modal-header border-bottom-0 p-4">
            <h5 className="modal-title fw-bold">{editData ? 'Edit Staff Details' : 'Register New Watchman'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 pt-0">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label small fw-bold text-muted">FULL NAME</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">BADGE ID</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.badgeId}
                    onChange={(e) => setFormData({...formData, badgeId: e.target.value})}
                    placeholder="e.g. SEC-001"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">PHONE NUMBER</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">ASSIGN OFFICE</label>
                  <select 
                    className="form-select"
                    value={formData.office}
                    onChange={(e) => setFormData({...formData, office: e.target.value})}
                    required
                  >
                    {offices.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">SHIFT</label>
                  <select 
                    className="form-select"
                    value={formData.shift}
                    onChange={(e) => setFormData({...formData, shift: e.target.value})}
                  >
                    <option>Morning (6AM–2PM)</option>
                    <option>Evening (2PM–10PM)</option>
                    <option>Night (10PM–6AM)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">INITIAL STATUS</label>
                  <select 
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option>On Duty</option>
                    <option>Off Duty</option>
                    <option>On Leave</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">EMERGENCY CONTACT (NAME & NUMBER)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    placeholder="e.g. John Doe - 9876543210"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-top-0 p-4 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary rounded-pill px-4">
                {editData ? 'Update Record' : 'Register Staff'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
