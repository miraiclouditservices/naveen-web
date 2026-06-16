"use client";

import { useState } from "react";
import WatchmanModal from "@/components/dashboard/WatchmanModal";

export default function WatchmenPage() {
  const [watchmen, setWatchmen] = useState([
    { id: 1, name: "Raj Kumar", badgeId: "SEC-101", phone: "+91 98765 43210", office: "Tech Park Tower", shift: "Morning (6AM–2PM)", status: "On Duty", emergencyContact: "Anita (Wife) - 9123456789" },
    { id: 2, name: "Suresh Yadav", badgeId: "SEC-102", phone: "+91 87654 32109", office: "Tech Park Tower", shift: "Evening (2PM–10PM)", status: "On Duty", emergencyContact: "Mahesh - 8123456789" },
    { id: 3, name: "Mohan Singh", badgeId: "SEC-201", phone: "+91 76543 21098", office: "Business Hub", shift: "Night (10PM–6AM)", status: "Off Duty", emergencyContact: "Brother - 7123456789" },
    { id: 4, name: "Amit Sharma", badgeId: "SEC-301", phone: "+91 65432 10987", office: "Enterprise Centre", shift: "Morning (6AM–2PM)", status: "On Duty", emergencyContact: "Pooja - 6123456789" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const offices = ["Tech Park Tower", "Business Hub", "Enterprise Centre", "Commerce Block"];

  const handleSave = (data: any) => {
    if (editData) {
      setWatchmen(watchmen.map(w => w.id === editData.id ? { ...data, id: w.id } : w));
    } else {
      setWatchmen([...watchmen, { ...data, id: Date.now() }]);
    }
    setEditData(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this staff member from the roster?")) {
      setWatchmen(watchmen.filter(w => w.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setWatchmen(watchmen.map(w => {
      if (w.id === id) {
        return { ...w, status: w.status === "On Duty" ? "Off Duty" : "On Duty" };
      }
      return w;
    }));
  };

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0 text-dark">Security Staff</h4>
          <p className="text-muted small mb-0">Managing {watchmen.length} active personnel</p>
        </div>
        <button 
          className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => { setEditData(null); setIsModalOpen(true); }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <i className="bi bi-person-plus me-2"></i>Add Watchman
        </button>
      </div>

      <div className="card border rounded-3 bg-white">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted small fw-bold text-uppercase py-3 px-4 border-bottom-0">Staff Member</th>
                  <th className="text-muted small fw-bold text-uppercase py-3 px-4 border-bottom-0">Assignment</th>
                  <th className="text-muted small fw-bold text-uppercase py-3 px-4 border-bottom-0">Shift</th>
                  <th className="text-muted small fw-bold text-uppercase py-3 px-4 border-bottom-0">Status</th>
                  <th className="text-muted small fw-bold text-uppercase py-3 px-4 border-bottom-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchmen.map((person) => (
                  <tr key={person.id}>
                    <td className="px-4 py-3 border-light">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-person-badge fs-5"></i>
                        </div>
                        <div>
                          <p className="fw-bold text-dark mb-0">{person.name}</p>
                          <p className="text-muted small mb-0">{person.badgeId} · {person.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-light">
                      <p className="fw-medium mb-0">{person.office}</p>
                    </td>
                    <td className="px-4 py-3 border-light">
                      <p className="text-muted small mb-0">{person.shift}</p>
                    </td>
                    <td className="px-4 py-3 border-light">
                      <div className="form-check form-switch p-0 d-flex align-items-center gap-2">
                        <input 
                          className="form-check-input ms-0" 
                          type="checkbox" 
                          role="switch" 
                          checked={person.status === 'On Duty'}
                          onChange={() => toggleStatus(person.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span className={`badge ${person.status === 'On Duty' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'} rounded-pill px-3 py-2 fw-medium`}>
                          {person.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-light text-end">
                      <button className="btn btn-sm btn-light rounded-pill me-2" onClick={() => { setEditData(person); setIsModalOpen(true); }}>
                        <i className="bi bi-pencil text-primary"></i>
                      </button>
                      <button className="btn btn-sm btn-light rounded-pill" onClick={() => handleDelete(person.id)}>
                        <i className="bi bi-trash text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <WatchmanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
        offices={offices}
        editData={editData}
      />
    </div>
  );
}
