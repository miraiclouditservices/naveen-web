"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { CalendarDays, Send, ShieldAlert, Award, FileText, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function EmployeeLeaves() {
    const [user, setUser] = useState<any>(null);
    const [balances, setBalances] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [compOffs, setCompOffs] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Apply leave form state
    const [leaveTypeId, setLeaveTypeId] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchLeaveData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const parsed = JSON.parse(userStr);
            setUser(parsed);

            if (parsed.employeeId) {
                // Fetch leave balances
                const balRes = await api.get(`/attendance/leaves/balances?employeeId=${parsed.employeeId}`);
                if (balRes.success && balRes.data) {
                    setBalances(balRes.data);
                }

                // Fetch leave types
                const typesRes = await api.get(`/attendance/leaves/types`);
                if (typesRes.success && typesRes.data) {
                    setLeaveTypes(typesRes.data);
                    if (typesRes.data.length > 0) {
                        setLeaveTypeId(typesRes.data[0]._id);
                    }
                }

                // Fetch leave requests
                const reqRes = await api.get(`/attendance/leaves/requests?employeeId=${parsed.employeeId}`);
                if (reqRes.success && reqRes.data) {
                    setRequests(reqRes.data);
                }

                // Fetch comp-offs
                const compRes = await api.get(`/attendance/leaves/comp-off?employeeId=${parsed.employeeId}`);
                if (compRes.success && compRes.data) {
                    setCompOffs(compRes.data);
                }

                // Fetch upcoming holidays
                const holRes = await api.get(`/attendance/holidays`);
                if (holRes.success && holRes.data) {
                    // Sort holidays and take next few
                    const sortedHols = holRes.data
                        .filter((h: any) => new Date(h.date) >= new Date())
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 5);
                    setHolidays(sortedHols);
                }
            }
        } catch (err) {
            console.error("Error loading leave data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveData();
    }, []);

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.employeeId || !leaveTypeId || !fromDate || !toDate || !reason) {
            alert("Please fill in all fields.");
            return;
        }

        const start = new Date(fromDate);
        const end = new Date(toDate);
        if (end < start) {
            alert("To Date cannot be before From Date.");
            return;
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        setSubmitting(true);
        try {
            const payload = {
                employeeId: user.employeeId,
                leaveTypeId,
                fromDate,
                toDate,
                totalDays,
                reason,
                status: "PENDING"
            };

            const res = await api.post("/attendance/leaves/apply", payload);
            if (res.success) {
                alert(`Successfully applied for ${totalDays} day(s) of leave!`);
                setFromDate("");
                setToDate("");
                setReason("");
                fetchLeaveData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to submit leave request.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Time Off & Leaves</h3>
                    <p className="text-muted small mb-0">Check balances, request leaves, and track holidays.</p>
                </div>
                <button className="btn btn-light rounded-3 shadow-sm" onClick={fetchLeaveData}>
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Leave Balances Grid */}
            <div className="row g-3 mb-4">
                {balances.length === 0 ? (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm p-4 text-center rounded-4 bg-white">
                            <p className="text-muted mb-0">No active leave balances allocated to your account.</p>
                        </div>
                    </div>
                ) : (
                    balances.map((bal) => (
                        <div key={bal._id} className="col-12 col-md-4">
                            <div className="card border-0 shadow-sm p-4 bg-white rounded-4 hover-scale">
                                <span className="text-muted small fw-bold uppercase mb-1 d-block">{bal.leaveTypeId?.name || "Leave Balance"}</span>
                                <h3 className="fw-bold text-dark mb-2">{bal.available} Days</h3>
                                <div className="d-flex justify-content-between text-muted small border-top pt-2 mt-2">
                                    <span>Used: <strong>{bal.used}</strong></span>
                                    <span>Pending: <strong>{bal.pending}</strong></span>
                                    <span>Allocated: <strong>{bal.allocated}</strong></span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="row g-4">
                {/* Apply Leave Form */}
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-4 mb-4">
                        <h5 className="fw-bold text-dark mb-3">Apply for Leave</h5>
                        <form onSubmit={handleApplyLeave}>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold uppercase">Leave Type</label>
                                <select
                                    className="form-select rounded-3 border-light"
                                    value={leaveTypeId}
                                    onChange={(e) => setLeaveTypeId(e.target.value)}
                                    required
                                >
                                    {leaveTypes.map((t) => (
                                        <option key={t._id} value={t._id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="form-label text-muted small fw-bold uppercase">From Date</label>
                                    <input
                                        type="date"
                                        className="form-control rounded-3 border-light"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label text-muted small fw-bold uppercase">To Date</label>
                                    <input
                                        type="date"
                                        className="form-control rounded-3 border-light"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold uppercase">Reason / Remarks</label>
                                <textarea
                                    className="form-control rounded-3 border-light"
                                    rows={3}
                                    placeholder="Briefly state the reason for leave"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="btn text-white rounded-3 px-4 py-2 w-100 d-flex align-items-center justify-content-center gap-2"
                                style={{ backgroundColor: "#1E2A78" }}
                                disabled={submitting}
                            >
                                <Send size={16} />
                                <span className="fw-semibold">Submit Leave Application</span>
                            </button>
                        </form>
                    </div>

                    {/* My Requests List */}
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
                        <h5 className="fw-bold text-dark mb-3">My Leave Requests</h5>
                        <div className="d-flex flex-column gap-3">
                            {requests.length === 0 ? (
                                <p className="text-muted small mb-0 text-center py-3">No leave applications raised yet.</p>
                            ) : (
                                requests.map((r) => (
                                    <div key={r._id} className="p-3 rounded-3 border border-light bg-light small">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold text-dark">{r.leaveTypeId?.name || "Leave"}</span>
                                            <span
                                                className={`badge rounded-pill ${
                                                    r.status === "APPROVED" ? "bg-success-subtle text-success" :
                                                    r.status === "REJECTED" ? "bg-danger-subtle text-danger" : "bg-warning-subtle text-warning"
                                                }`}
                                            >
                                                {r.status}
                                            </span>
                                        </div>
                                        <p className="text-muted mb-1">
                                            <strong>Duration:</strong> {new Date(r.fromDate).toLocaleDateString([], { month: "short", day: "numeric" })} to {new Date(r.toDate).toLocaleDateString([], { month: "short", day: "numeric" })} ({r.totalDays} Days)
                                        </p>
                                        <p className="text-muted mb-0"><strong>Reason:</strong> {r.reason}</p>
                                        {r.approverRemarks && (
                                            <div className="mt-2 pt-2 border-top text-muted-50">
                                                <strong>Approver remarks:</strong> {r.approverRemarks}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-5">
                    {/* Compensatory Offs (Comp-Off) */}
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-4 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-dark mb-0">Compensatory Offs (Comp-Off)</h5>
                            <Award size={20} style={{ color: "#1E2A78" }} />
                        </div>
                        <p className="text-muted small">Earn comp-offs automatically by working extra hours or holidays.</p>
                        <div className="d-flex flex-column gap-2">
                            {compOffs.length === 0 ? (
                                <p className="text-muted small mb-0 py-2">No compensatory off balance earned.</p>
                            ) : (
                                compOffs.map((c) => (
                                    <div key={c._id} className="d-flex justify-content-between align-items-center p-2.5 rounded border border-light small bg-light">
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0.5">Earned: {new Date(c.date).toLocaleDateString()}</h6>
                                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>OT Mins: {c.otMinutes} mins (Expires: {new Date(c.expiryDate).toLocaleDateString()})</span>
                                        </div>
                                        <span
                                            className={`badge rounded-pill ${
                                                c.status === "AVAILABLE" ? "bg-success" : "bg-secondary"
                                            }`}
                                        >
                                            {c.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Upcoming Holidays */}
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-dark mb-0">Holidays Calendar</h5>
                            <CalendarDays size={20} style={{ color: "#1E2A78" }} />
                        </div>
                        <div className="d-flex flex-column gap-2.5">
                            {holidays.length === 0 ? (
                                <p className="text-muted small mb-0">No upcoming holidays scheduled.</p>
                            ) : (
                                holidays.map((h) => (
                                    <div key={h._id} className="d-flex justify-content-between align-items-center p-2 rounded border border-light small bg-light">
                                        <div>
                                            <h6 className="mb-0 fw-bold small text-dark">{h.name}</h6>
                                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>{new Date(h.date).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}</span>
                                        </div>
                                        <span className="badge bg-secondary text-uppercase" style={{ fontSize: "0.68rem" }}>{h.type}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
