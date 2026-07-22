"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Plus, Edit2, Trash2, Calendar, RefreshCw, X } from "lucide-react";

interface Holiday {

    _id: string;
    name: string;
    date: string;
    type: "Paid" | "Unpaid";
    description?: string;
}

export default function HolidayCalendar() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editHoliday, setEditHoliday] = useState<Partial<Holiday> | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/attendance/holidays");
            if (res.success) setHolidays(res.data);
        } catch (err) {
            console.error("Error loading holiday calendar:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editHoliday) return;

        try {
            const isEdit = !!editHoliday._id;
            const res = isEdit
                ? await api.put(`/attendance/holidays/${editHoliday._id}`, editHoliday)
                : await api.post("/attendance/holidays", editHoliday);

            if (res.success) {
                alert(`Holiday ${isEdit ? "updated" : "added"} successfully!`);
                setShowModal(false);
                setEditHoliday(null);
                fetchData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to save holiday");
        }
    };

    const handleDeleteHoliday = async (id: string) => {
        if (!confirm("Are you sure you want to remove this holiday?")) return;
        try {
            const res = await api.delete(`/attendance/holidays/${id}`);
            if (res.success) {
                alert("Holiday removed successfully!");
                fetchData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to remove holiday");
        }
    };

    const handleCloneYear = async () => {
        const year = prompt("Enter target year to clone current list to (e.g. 2027):");
        if (!year) return;

        try {
            const res = await api.post("/attendance/holidays/clone-year", { targetYear: parseInt(year) });
            if (res.success) {
                alert(`Successfully duplicated calendar items to year ${year}!`);
                fetchData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to clone holiday calendar");
        }
    };

    // Group holidays by month
    const groupedHolidays = holidays.reduce((acc, h) => {
        const dateObj = new Date(h.date);
        const monthName = dateObj.toLocaleDateString([], { month: "long" });
        if (!acc[monthName]) acc[monthName] = [];
        acc[monthName].push(h);
        return acc;
    }, {} as Record<string, Holiday[]>);

    return (
        <div className="container-fluid py-4" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-app)", minHeight: "100vh" }}>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>Holiday Calendar</h2>
                    <p className="mb-0" style={{ color: "var(--text-muted)" }}>Official paid and unpaid company calendar list.</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                        onClick={handleCloneYear}
                    >
                        <RefreshCw size={16} />
                        <span>Clone Year Calendar</span>
                    </button>
                    <button
                        className="btn d-flex align-items-center gap-2"
                        style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }}
                        onClick={() => {
                            setEditHoliday({
                                name: "",
                                date: new Date().toISOString().split("T")[0],
                                type: "Paid",
                                description: ""
                            });
                            setShowModal(true);
                        }}
                    >
                        <Plus size={16} />
                        <span>Add Holiday</span>
                    </button>
                </div>
            </div>

            {/* List View */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: "var(--dark-section)" }} role="status"></div>
                </div>
            ) : Object.keys(groupedHolidays).length === 0 ? (
                <div className="card p-5 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                    <p className="mb-0 text-muted">No holidays defined. Create a new one to begin!</p>
                </div>
            ) : (
                <div className="row g-4">
                    {Object.entries(groupedHolidays).map(([month, items]) => (
                        <div key={month} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                                <div className="card-header bg-transparent border-bottom py-3 px-4">
                                    <h5 className="fw-bold mb-0" style={{ color: "var(--text-main)" }}>{month}</h5>
                                </div>
                                <div className="card-body p-4 d-flex flex-column gap-3">
                                    {items.map((item) => (
                                        <div key={item._id} className="d-flex justify-content-between align-items-start pb-2 border-bottom border-light">
                                            <div>
                                                <h6 className="fw-bold mb-1 small text-dark">{item.name}</h6>
                                                <span className="small text-muted font-monospace">{new Date(item.date).toLocaleDateString([], { day: "numeric" })} {month.slice(0, 3)}</span>
                                                {item.type === "Paid" ? (
                                                    <span className="badge bg-success-subtle text-success ms-2 small">Paid</span>
                                                ) : (
                                                    <span className="badge bg-secondary-subtle text-secondary ms-2 small">Unpaid</span>
                                                )}
                                            </div>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm btn-light border p-1"
                                                    onClick={() => {
                                                        setEditHoliday(item);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button className="btn btn-sm btn-light border p-1 text-danger" onClick={() => handleDeleteHoliday(item._id)}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Holiday Dialog Modal */}
            {showModal && editHoliday && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <form className="modal-content" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }} onSubmit={handleSaveHoliday}>
                            <div className="modal-header border-bottom border-light">
                                <h5 className="modal-title fw-bold" style={{ color: "var(--text-main)" }}>
                                    {editHoliday._id ? "Edit Holiday" : "New Holiday Entry"}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Holiday Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={editHoliday.name || ""}
                                            onChange={(e) => setEditHoliday({ ...editHoliday, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">Select Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            required
                                            value={editHoliday.date ? editHoliday.date.split("T")[0] : ""}
                                            onChange={(e) => setEditHoliday({ ...editHoliday, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">Type</label>
                                        <select
                                            className="form-select"
                                            value={editHoliday.type || "Paid"}
                                            onChange={(e: any) => setEditHoliday({ ...editHoliday, type: e.target.value })}
                                        >
                                            <option value="Paid">Paid</option>
                                            <option value="Unpaid">Unpaid</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Description (Optional)</label>
                                        <textarea
                                            className="form-control"
                                            rows={2}
                                            value={editHoliday.description || ""}
                                            onChange={(e) => setEditHoliday({ ...editHoliday, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn" style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }}>Save Holiday</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
