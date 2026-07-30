"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { CalendarDays, Plus, Clock, FileText, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function EmployeeAttendance() {
    const [user, setUser] = useState<any>(null);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [logs, setLogs] = useState<any[]>([]);
    const [corrections, setCorrections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [correctionDate, setCorrectionDate] = useState("");
    const [correctionType, setCorrectionType] = useState("MISSED_IN");
    const [requestedInTime, setRequestedInTime] = useState("");
    const [requestedOutTime, setRequestedOutTime] = useState("");
    const [reason, setReason] = useState("");

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const parsed = JSON.parse(userStr);
            setUser(parsed);

            if (parsed.employeeId) {
                // Fetch logs for selected month range
                const fromDate = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
                const toDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

                const logRes = await api.get(`/attendance/logs?employeeId=${parsed.employeeId}&fromDate=${fromDate}&toDate=${toDate}`);
                if (logRes.success && logRes.data) {
                    setLogs(logRes.data);
                }

                // Fetch correction requests
                const correctionRes = await api.get(`/attendance/corrections`);
                if (correctionRes.success && correctionRes.data) {
                    // Filter corrections for this employee
                    const userCorrections = correctionRes.data.filter((c: any) => c.employeeId?._id === parsed.employeeId);
                    setCorrections(userCorrections);
                }
            }
        } catch (err) {
            console.error("Error loading attendance logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, [selectedMonth, selectedYear]);

    const openCorrectionModal = (dateStr: string) => {
        setCorrectionDate(dateStr);
        setRequestedInTime("");
        setRequestedOutTime("");
        setReason("");
        setCorrectionType("MISSED_IN");
        setIsModalOpen(true);
    };

    const handleApplyCorrection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.employeeId || !reason) {
            alert("Please provide all required fields");
            return;
        }

        setSubmitting(true);
        try {
            // Build requestedIn & requestedOut dates by merging correctionDate and time
            let requestedIn: string | undefined;
            let requestedOut: string | undefined;

            if (requestedInTime) {
                requestedIn = new Date(`${correctionDate}T${requestedInTime}`).toISOString();
            }
            if (requestedOutTime) {
                requestedOut = new Date(`${correctionDate}T${requestedOutTime}`).toISOString();
            }

            const payload = {
                employeeId: user.employeeId,
                date: new Date(correctionDate).toISOString(),
                type: correctionType,
                requestedIn,
                requestedOut,
                reason
            };

            const res = await api.post("/attendance/corrections", payload);
            if (res.success) {
                alert("Correction request submitted successfully!");
                setIsModalOpen(false);
                fetchAttendanceData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to submit correction request.");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to render calendar timeline list for selected month
    const renderTimeline = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const timelineDays = [];

        for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(selectedYear, selectedMonth, d);
            const dateStr = currentDate.toISOString().split("T")[0];
            
            // Find existing log
            const log = logs.find(l => {
                const logDate = new Date(l.date).toISOString().split("T")[0];
                return logDate === dateStr;
            });

            // Find existing correction request for this date
            const correction = corrections.find(c => {
                const cDate = new Date(c.date).toISOString().split("T")[0];
                return cDate === dateStr;
            });

            const dayName = currentDate.toLocaleDateString([], { weekday: "short" });

            timelineDays.push({
                date: dateStr,
                dayNumber: d,
                dayName,
                log,
                correction
            });
        }

        return (
            <div className="d-flex flex-column gap-3">
                {timelineDays.map((day) => {
                    const status = day.log?.status || "ABSENT";
                    const isToday = new Date().toISOString().split("T")[0] === day.date;
                    const canCorrect = status === "ABSENT" || status === "LATE" || status === "MISSING_PUNCH" || !day.log?.checkIn || !day.log?.checkOut;

                    return (
                        <div
                            key={day.date}
                            className="card border-0 shadow-sm p-3 bg-white rounded-4 transition-all hover-scale"
                            style={{ borderLeft: isToday ? "5px solid #1E2A78" : "none" }}
                        >
                            <div className="d-flex flex-column flex-md-row justify-content-between align-md-center gap-3">
                                {/* Date and Status */}
                                <div className="d-flex align-items-center gap-3">
                                    <div className="text-center rounded-3 p-2" style={{ backgroundColor: "#F4F5FA", minWidth: "55px" }}>
                                        <h5 className="fw-bold text-dark mb-0">{day.dayNumber}</h5>
                                        <span className="text-muted small fw-semibold uppercase">{day.dayName}</span>
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span
                                                className="badge rounded-pill px-2.5 py-1 small fw-bold"
                                                style={{
                                                    backgroundColor:
                                                        status === "PRESENT" ? "#e2fbe8" :
                                                        status === "LATE" ? "#fffbeb" :
                                                        status === "LEAVE" ? "#f3e8ff" : "#fef2f2",
                                                    color:
                                                        status === "PRESENT" ? "#16a34a" :
                                                        status === "LATE" ? "#d97706" :
                                                        status === "LEAVE" ? "#7c3aed" : "#dc2626"
                                                }}
                                            >
                                                {status}
                                            </span>
                                            {day.log?.isManual && <span className="badge bg-secondary rounded-pill small">Regularized</span>}
                                        </div>
                                        <div className="text-muted small mt-1">
                                            {day.log?.checkIn ? (
                                                <span className="d-inline-flex align-items-center gap-1 me-3">
                                                    <Clock size={12} /> IN: {new Date(day.log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            ) : null}
                                            {day.log?.checkOut ? (
                                                <span className="d-inline-flex align-items-center gap-1">
                                                    <Clock size={12} /> OUT: {new Date(day.log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            ) : null}
                                            {!day.log?.checkIn && !day.log?.checkOut && <span className="text-danger small">No Punch Records</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions / Correction Status */}
                                <div className="d-flex align-items-center gap-2 ms-auto ms-md-0">
                                    {day.correction ? (
                                        <div
                                            className="d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 small fw-bold"
                                            style={{
                                                backgroundColor:
                                                    day.correction.status === "APPROVED" ? "#e2fbe8" :
                                                    day.correction.status === "REJECTED" ? "#fef2f2" : "#fffbeb",
                                                color:
                                                    day.correction.status === "APPROVED" ? "#16a34a" :
                                                    day.correction.status === "REJECTED" ? "#dc2626" : "#d97706"
                                            }}
                                        >
                                            {day.correction.status === "APPROVED" && <CheckCircle2 size={14} />}
                                            {day.correction.status === "REJECTED" && <XCircle size={14} />}
                                            {day.correction.status === "PENDING" && <AlertCircle size={14} />}
                                            <span>Correction {day.correction.status}</span>
                                        </div>
                                    ) : (
                                        canCorrect && !isToday && (
                                            <button
                                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 rounded-3 py-1.5"
                                                onClick={() => openCorrectionModal(day.date)}
                                                style={{ color: "#1E2A78", borderColor: "#1E2A78" }}
                                            >
                                                <Plus size={14} />
                                                <span className="small fw-semibold">Regularize</span>
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{ fontFamily: "'Manrope', sans-serif" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold text-dark mb-1">My Attendance Calendar</h3>
                    <p className="text-muted small mb-0">Track monthly shifts, check times, and request regularizations.</p>
                </div>
                
                {/* Month/Year selectors */}
                <div className="d-flex gap-2">
                    <select
                        className="form-select rounded-3 border-light shadow-sm"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        style={{ width: "130px" }}
                    >
                        {months.map((m, idx) => (
                            <option key={idx} value={idx}>{m}</option>
                        ))}
                    </select>
                    <select
                        className="form-select rounded-3 border-light shadow-sm"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        style={{ width: "90px" }}
                    >
                        {[2025, 2026, 2027].map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button className="btn btn-light rounded-3 shadow-sm" onClick={fetchAttendanceData}>
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <div className="row g-4">
                    {/* Month Timeline List */}
                    <div className="col-12 col-lg-8">
                        {renderTimeline()}
                    </div>

                    {/* Pending Regularizations Sidebar Summary */}
                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
                            <h5 className="fw-bold text-dark mb-3">Correction History</h5>
                            <div className="d-flex flex-column gap-3">
                                {corrections.length === 0 ? (
                                    <p className="text-muted small mb-0">No regularizations raised yet.</p>
                                ) : (
                                    corrections.map((c) => (
                                        <div key={c._id} className="p-3 rounded-3 border border-light bg-light small">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="fw-bold text-dark">{new Date(c.date).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                                                <span
                                                    className={`badge rounded-pill ${
                                                        c.status === "APPROVED" ? "bg-success-subtle text-success" :
                                                        c.status === "REJECTED" ? "bg-danger-subtle text-danger" : "bg-warning-subtle text-warning"
                                                    }`}
                                                >
                                                    {c.status}
                                                </span>
                                            </div>
                                            <p className="text-muted mb-1"><strong>Type:</strong> {c.type}</p>
                                            <p className="text-muted mb-2"><strong>Reason:</strong> {c.reason}</p>
                                            {c.requestedIn && (
                                                <span className="d-block text-muted mb-0.5">IN: {new Date(c.requestedIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            )}
                                            {c.requestedOut && (
                                                <span className="d-block text-muted">OUT: {new Date(c.requestedOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Raise Correction Modal */}
            {isModalOpen && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg p-3">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold text-dark">Raise Attendance Regularization</h5>
                                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleApplyCorrection}>
                                <div className="modal-body py-2">
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold uppercase">Correction Date</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 border-light bg-light fw-bold"
                                            value={new Date(correctionDate).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
                                            readOnly
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold uppercase">Correction Type</label>
                                        <select
                                            className="form-select rounded-3 border-light"
                                            value={correctionType}
                                            onChange={(e) => setCorrectionType(e.target.value)}
                                            required
                                        >
                                            <option value="MISSED_IN">Missed Check-In</option>
                                            <option value="MISSED_OUT">Missed Check-Out</option>
                                            <option value="WRONG_TIME">Wrong Timing Recorded</option>
                                            <option value="WFH_REGULARIZE">WFH Regularization</option>
                                        </select>
                                    </div>
                                    <div className="row g-3 mb-3">
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold uppercase">Proposed In Time</label>
                                            <input
                                                type="time"
                                                className="form-control rounded-3 border-light"
                                                value={requestedInTime}
                                                onChange={(e) => setRequestedInTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold uppercase">Proposed Out Time</label>
                                            <input
                                                type="time"
                                                className="form-control rounded-3 border-light"
                                                value={requestedOutTime}
                                                onChange={(e) => setRequestedOutTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold uppercase">Reason / Justification</label>
                                        <textarea
                                            className="form-control rounded-3 border-light"
                                            rows={3}
                                            placeholder="Please provide details (e.g. Server issue, Client site visit, etc.)"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light rounded-3 px-4" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button
                                        type="submit"
                                        className="btn text-white rounded-3 px-4"
                                        style={{ backgroundColor: "#1E2A78" }}
                                        disabled={submitting}
                                    >
                                        {submitting ? "Submitting..." : "Submit Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
