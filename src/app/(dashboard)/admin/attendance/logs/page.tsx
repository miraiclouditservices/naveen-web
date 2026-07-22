"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Search, Download, Eye, MapPin, Smartphone, Laptop, Calendar } from "lucide-react";

interface Log {
    _id: string;
    employeeId: {
        _id: string;
        name: string;
        empCode: string;
        department?: string;
    };
    shiftId?: {
        name: string;
    };
    date: string;
    checkIn?: string;
    checkOut?: string;
    workingMinutes?: number;
    overtimeMinutes?: number;
    status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "LEAVE" | "WEEK_OFF" | "HOLIDAY";
    ip?: string;
    device?: string;
    address?: string;
}

export default function AttendanceLogs() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

    // Modal state for metadata check
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const empRes = await api.get("/attendance/employees");
            if (empRes.success) setEmployees(empRes.data);

            const logRes = await api.get(`/attendance/logs?employeeId=${selectedEmployee}&fromDate=${fromDate}&toDate=${toDate}`);
            if (logRes.success) setLogs(logRes.data);
        } catch (err) {
            console.error("Error loading logs data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedEmployee, fromDate, toDate]);

    const handleExportCSV = () => {
        if (logs.length === 0) {
            alert("No log data to export!");
            return;
        }

        const headers = ["Employee Code", "Employee Name", "Date", "Status", "Check In", "Check Out", "Working Hours", "OT Hours", "IP Address", "Device"];
        const rows = logs.map(log => [
            log.employeeId.empCode,
            log.employeeId.name,
            new Date(log.date).toLocaleDateString(),
            log.status,
            log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : "-",
            log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : "-",
            log.workingMinutes ? (log.workingMinutes / 60).toFixed(2) : "0",
            log.overtimeMinutes ? (log.overtimeMinutes / 60).toFixed(2) : "0",
            log.ip || "-",
            log.device || "-"
        ]);

        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_logs_${fromDate}_to_${toDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container-fluid py-4" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-app)", minHeight: "100vh" }}>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>Daily Attendance Logs</h2>
                    <p className="mb-0" style={{ color: "var(--text-muted)" }}>Search, filter, check geolocation tracking maps, and download CSV reports.</p>
                </div>
                <button
                    className="btn d-flex align-items-center gap-2"
                    style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }}
                    onClick={handleExportCSV}
                >
                    <Download size={16} />
                    <span>Export CSV Report</span>
                </button>
            </div>

            {/* Filter toolbar */}
            <div className="card mb-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                <div className="card-body p-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-bold text-muted mb-1">Search Employee</label>
                            <select
                                className="form-select"
                                style={{ border: "1px solid var(--border-color)" }}
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                            >
                                <option value="">-- View All Employees --</option>
                                {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name} ({emp.empCode})</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-4">
                            <label className="form-label small fw-bold text-muted mb-1">From Date</label>
                            <input
                                type="date"
                                className="form-control"
                                style={{ border: "1px solid var(--border-color)" }}
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>
                        <div className="col-6 col-md-4">
                            <label className="form-label small fw-bold text-muted mb-1">To Date</label>
                            <input
                                type="date"
                                className="form-control"
                                style={{ border: "1px solid var(--border-color)" }}
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" style={{ color: "var(--dark-section)" }} role="status"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <p className="text-center py-5 mb-0 text-muted">No attendance logs found for current filter dates.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0 table-hover">
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-muted)" }}>
                                        <th className="px-4 py-3 small text-uppercase">Code</th>
                                        <th className="px-4 py-3 small text-uppercase">Employee</th>
                                        <th className="px-4 py-3 small text-uppercase">Date</th>
                                        <th className="px-4 py-3 small text-uppercase">Check In</th>
                                        <th className="px-4 py-3 small text-uppercase">Check Out</th>
                                        <th className="px-4 py-3 small text-uppercase">Status</th>
                                        <th className="px-4 py-3 small text-uppercase">Working Hours</th>
                                        <th className="px-4 py-3 small text-uppercase text-end">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        let statusBadge = { backgroundColor: "#e2fbe8", color: "#16a34a" }; // PRESENT
                                        if (log.status === "ABSENT") statusBadge = { backgroundColor: "#fee2e2", color: "#dc2626" };
                                        if (log.status === "LATE") statusBadge = { backgroundColor: "#fffbeb", color: "#d97706" };
                                        if (log.status === "HALF_DAY") statusBadge = { backgroundColor: "#fff7ed", color: "#ea580c" };
                                        if (log.status === "LEAVE") statusBadge = { backgroundColor: "rgba(4,4,4,0.06)", color: "var(--dark-section)" };
                                        if (log.status === "WEEK_OFF" || log.status === "HOLIDAY") statusBadge = { backgroundColor: "#f3f4f6", color: "#374151" };

                                        return (
                                            <tr key={log._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                                <td className="px-4 py-3 font-monospace fw-bold">{log.employeeId.empCode}</td>
                                                <td className="px-4 py-3 fw-bold" style={{ color: "var(--text-main)" }}>{log.employeeId.name}</td>
                                                <td className="px-4 py-3 small">{new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="px-4 py-3 small">{log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                                                <td className="px-4 py-3 small">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                                                <td className="px-4 py-3">
                                                    <span className="badge small" style={statusBadge}>{log.status}</span>
                                                </td>
                                                <td className="px-4 py-3 small fw-bold">
                                                    {log.workingMinutes ? `${(log.workingMinutes / 60).toFixed(1)} hrs` : "0.0 hrs"}
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    <button className="btn btn-sm btn-light border p-2" onClick={() => setSelectedLog(log)}>
                                                        <Eye size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                            <div className="modal-header border-bottom border-light">
                                <h5 className="modal-title fw-bold" style={{ color: "var(--text-main)" }}>Punch Details & Metadata</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedLog(null)}></button>
                            </div>
                            <div className="modal-body p-4 small">
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between pb-2 border-bottom">
                                        <span className="text-muted">Employee:</span>
                                        <strong className="text-dark">{selectedLog.employeeId.name} ({selectedLog.employeeId.empCode})</strong>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom">
                                        <span className="text-muted">Date:</span>
                                        <strong className="text-dark">{new Date(selectedLog.date).toLocaleDateString()}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom">
                                        <span className="text-muted">Punch IP Address:</span>
                                        <strong className="font-monospace text-dark">{selectedLog.ip || "192.168.1.1"}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom">
                                        <span className="text-muted">Device Details:</span>
                                        <strong className="text-dark">{selectedLog.device || "Chrome on Windows"}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between pb-2 border-bottom">
                                        <span className="text-muted">GPS Address Location:</span>
                                        <strong className="text-dark text-end">{selectedLog.address || "Connaught Place, New Delhi"}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Computed Overtime:</span>
                                        <strong className="text-success">{selectedLog.overtimeMinutes ? `${(selectedLog.overtimeMinutes / 60).toFixed(1)} hrs` : "0.0 hrs"}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
