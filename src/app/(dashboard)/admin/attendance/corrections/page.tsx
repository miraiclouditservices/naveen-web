"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Plus, Check, X, FileText, AlertCircle } from "lucide-react";

interface Correction {
    _id: string;
    employeeId: {
        _id: string;
        name: string;
        empCode: string;
    };
    date: string;
    requestedIn?: string;
    requestedOut?: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    approverRemarks?: string;
}

export default function Corrections() {
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyForm, setApplyForm] = useState({
        employeeId: "",
        date: new Date().toISOString().split("T")[0],
        requestedIn: "",
        requestedOut: "",
        reason: ""
    });

    const [selectedRequest, setSelectedRequest] = useState<Correction | null>(null);
    const [approverRemarks, setApproverRemarks] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const parsed = JSON.parse(userStr);
                setUserProfile(parsed);
            }

            const empRes = await api.get("/attendance/employees");
            if (empRes.success) setEmployees(empRes.data);

            const corrRes = await api.get("/attendance/corrections");
            if (corrRes.success) setCorrections(corrRes.data);
        } catch (err) {
            console.error("Error loading corrections data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApplyCorrection = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...applyForm,
                requestedIn: applyForm.requestedIn ? new Date(`${applyForm.date}T${applyForm.requestedIn}`) : undefined,
                requestedOut: applyForm.requestedOut ? new Date(`${applyForm.date}T${applyForm.requestedOut}`) : undefined
            };

            const res = await api.post("/attendance/corrections", payload);
            if (res.success) {
                alert("Punch regularization request submitted!");
                setShowApplyModal(false);
                setApplyForm({
                    employeeId: "",
                    date: new Date().toISOString().split("T")[0],
                    requestedIn: "",
                    requestedOut: "",
                    reason: ""
                });
                fetchData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to submit request");
        }
    };

    const handleApprove = async (id: string, status: "APPROVED" | "REJECTED") => {
        try {
            const res = await api.post(`/attendance/corrections/${id}/approve`, {
                status,
                remarks: approverRemarks
            });
            if (res.success) {
                alert(`Request ${status.toLowerCase()} successfully!`);
                setSelectedRequest(null);
                setApproverRemarks("");
                fetchData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to resolve request");
        }
    };

    const isHR = userProfile?.role === "HR_ADMIN" || userProfile?.role === "SUPER_ADMIN";

    return (
        <div className="container-fluid py-4" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-app)", minHeight: "100vh" }}>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>Punch Corrections</h2>
                    <p className="mb-0" style={{ color: "var(--text-muted)" }}>Request regularizations for missing punches or check-in corrections.</p>
                </div>
                <button
                    className="btn d-flex align-items-center gap-2"
                    style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }}
                    onClick={() => {
                        setApplyForm({
                            employeeId: userProfile?.employeeId || "",
                            date: new Date().toISOString().split("T")[0],
                            requestedIn: "09:00",
                            requestedOut: "18:00",
                            reason: ""
                        });
                        setShowApplyModal(true);
                    }}
                >
                    <Plus size={16} />
                    <span>Apply for Regularization</span>
                </button>
            </div>

            {/* List */}
            <div className="card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" style={{ color: "var(--dark-section)" }} role="status"></div>
                        </div>
                    ) : corrections.length === 0 ? (
                        <p className="text-center py-5 mb-0 text-muted">No regularization requests logged.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0 table-hover">
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-muted)" }}>
                                        <th className="px-4 py-3 small text-uppercase">Employee</th>
                                        <th className="px-4 py-3 small text-uppercase">Target Date</th>
                                        <th className="px-4 py-3 small text-uppercase">Requested Times</th>
                                        <th className="px-4 py-3 small text-uppercase">Reason</th>
                                        <th className="px-4 py-3 small text-uppercase">Status</th>
                                        {isHR && <th className="px-4 py-3 small text-uppercase text-end">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {corrections.map((corr) => {
                                        let badgeColor = { backgroundColor: "#fffbeb", color: "#d97706" }; // PENDING
                                        if (corr.status === "APPROVED") badgeColor = { backgroundColor: "#e2fbe8", color: "#16a34a" };
                                        if (corr.status === "REJECTED") badgeColor = { backgroundColor: "#fef2f2", color: "#dc2626" };

                                        return (
                                            <tr key={corr._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                                <td className="px-4 py-3 fw-bold" style={{ color: "var(--text-main)" }}>
                                                    {corr.employeeId.name} <span className="small text-muted font-monospace">({corr.employeeId.empCode})</span>
                                                </td>
                                                <td className="px-4 py-3 small">{new Date(corr.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 small">
                                                    IN: {corr.requestedIn ? new Date(corr.requestedIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"} | 
                                                    OUT: {corr.requestedOut ? new Date(corr.requestedOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                </td>
                                                <td className="px-4 py-3 small text-truncate" style={{ maxWidth: "200px" }}>{corr.reason}</td>
                                                <td className="px-4 py-3">
                                                    <span className="badge small" style={badgeColor}>{corr.status}</span>
                                                </td>
                                                {isHR && (
                                                    <td className="px-4 py-3 text-end">
                                                        {corr.status === "PENDING" ? (
                                                            <button className="btn btn-sm btn-outline-dark" onClick={() => setSelectedRequest(corr)}>
                                                                Resolve
                                                            </button>
                                                        ) : (
                                                            <span className="small text-muted">Resolved</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Apply Regularization Modal */}
            {showApplyModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <form className="modal-content" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }} onSubmit={handleApplyCorrection}>
                            <div className="modal-header border-bottom border-light">
                                <h5 className="modal-title fw-bold" style={{ color: "var(--text-main)" }}>Request Regularization</h5>
                                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Select Employee Profile</label>
                                        <select
                                            className="form-select"
                                            required
                                            value={applyForm.employeeId}
                                            onChange={(e) => setApplyForm({ ...applyForm, employeeId: e.target.value })}
                                        >
                                            <option value="">-- Choose Profile --</option>
                                            {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name} ({emp.empCode})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Missed Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            required
                                            value={applyForm.date}
                                            onChange={(e) => setApplyForm({ ...applyForm, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">Requested Check In</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={applyForm.requestedIn}
                                            onChange={(e) => setApplyForm({ ...applyForm, requestedIn: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">Requested Check Out</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={applyForm.requestedOut}
                                            onChange={(e) => setApplyForm({ ...applyForm, requestedOut: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Reason for Regularization</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            required
                                            placeholder="E.g. System issue, forgotten card..."
                                            value={applyForm.reason}
                                            onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
                                <button type="submit" className="btn" style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }}>Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Resolve Request Modal */}
            {selectedRequest && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                            <div className="modal-header border-bottom border-light">
                                <h5 className="modal-title fw-bold" style={{ color: "var(--text-main)" }}>Resolve Regularization</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)}></button>
                            </div>
                            <div className="modal-body p-4 small">
                                <p className="mb-2"><strong>Employee:</strong> {selectedRequest.employeeId.name}</p>
                                <p className="mb-2"><strong>Requested Date:</strong> {new Date(selectedRequest.date).toLocaleDateString()}</p>
                                <p className="mb-3"><strong>Reason:</strong> "{selectedRequest.reason}"</p>

                                <label className="form-label small fw-bold">Approver Remarks</label>
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    value={approverRemarks}
                                    onChange={(e) => setApproverRemarks(e.target.value)}
                                    placeholder="Enter review notes..."
                                />
                            </div>
                            <div className="modal-footer border-top border-light">
                                <button type="button" className="btn btn-outline-danger" onClick={() => handleApprove(selectedRequest._id, "REJECTED")}>
                                    Reject
                                </button>
                                <button type="button" className="btn" style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }} onClick={() => handleApprove(selectedRequest._id, "APPROVED")}>
                                    Approve & Regularize
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
