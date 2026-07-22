"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { ChevronLeft, ChevronRight, Calendar, Users, Save, X } from "lucide-react";

interface Employee {
    _id: string;
    empCode: string;
    name: string;
    department?: string;
}

interface ShiftAssignment {
    employeeId: string;
    date: string;
    shiftCode: string;
}

export default function ShiftCalendar() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showRosterModal, setShowRosterModal] = useState(false);
    const [rosterForm, setRosterForm] = useState({
        shiftId: "",
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        employeeIds: [] as string[]
    });

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
    };

    const days = getDaysInMonth(currentDate);

    const fetchData = async () => {
        try {
            setLoading(true);
            const empRes = await api.get("/attendance/employees");
            if (empRes.success) setEmployees(empRes.data);

            const shiftRes = await api.get("/attendance/shifts");
            if (shiftRes.success) setShifts(shiftRes.data);

            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
            
            const assignRes = await api.get(`/attendance/shift-assignments?fromDate=${startOfMonth}&toDate=${endOfMonth}`);
            if (assignRes.success) setAssignments(assignRes.data);
        } catch (err) {
            console.error("Error loading roster calendar:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleSaveRoster = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rosterForm.employeeIds.length === 0) {
            alert("Please select at least one employee!");
            return;
        }
        if (!rosterForm.shiftId) {
            alert("Please select a shift!");
            return;
        }

        try {
            const res = await api.post("/attendance/shift-assignments/bulk", rosterForm);
            if (res.success) {
                alert("Roster shift schedules updated successfully!");
                setShowRosterModal(false);
                setRosterForm({
                    shiftId: "",
                    fromDate: new Date().toISOString().split("T")[0],
                    toDate: new Date().toISOString().split("T")[0],
                    employeeIds: []
                });
                fetchData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to update roster schedule");
        }
    };

    const getShiftCode = (empId: string, day: Date) => {
        const dayStr = day.toISOString().split("T")[0];
        const match = assignments.find(a => a.employeeId === empId && a.date.startsWith(dayStr));
        return match ? match.shiftCode : "GEN";
    };

    return (
        <div className="container-fluid py-4" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-app)", minHeight: "100vh" }}>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>Shift Calendar</h2>
                    <p className="mb-0" style={{ color: "var(--text-muted)" }}>Schedule, map, and view employee shift logs dynamically.</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                        onClick={handlePrevMonth}
                    >
                        <ChevronLeft size={16} />
                        <span>Prev</span>
                    </button>
                    <div className="btn bg-white border d-flex align-items-center gap-2 font-monospace fw-bold">
                        <Calendar size={16} />
                        <span>{currentDate.toLocaleDateString([], { month: "long", year: "numeric" })}</span>
                    </div>
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                        onClick={handleNextMonth}
                    >
                        <span>Next</span>
                        <ChevronRight size={16} />
                    </button>
                    <button
                        className="btn d-flex align-items-center gap-2 ms-2"
                        style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }}
                        onClick={() => {
                            setRosterForm({
                                shiftId: "",
                                fromDate: new Date().toISOString().split("T")[0],
                                toDate: new Date().toISOString().split("T")[0],
                                employeeIds: []
                            });
                            setShowRosterModal(true);
                        }}
                    >
                        <Users size={16} />
                        <span>Bulk Roster Scheduler</span>
                    </button>
                </div>
            </div>

            {/* Matrix View */}
            <div className="card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" style={{ color: "var(--dark-section)" }} role="status"></div>
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ maxHeight: "600px" }}>
                            <table className="table table-bordered mb-0 align-middle text-center small">
                                <thead className="bg-light sticky-top">
                                    <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                                        <th className="px-3 py-2 text-start bg-white" style={{ minWidth: "180px", borderRight: "2px solid var(--border-color)" }}>Employee</th>
                                        {days.map((day, idx) => (
                                            <th key={idx} className="px-2 py-2" style={{ minWidth: "45px" }}>
                                                <div>{day.getDate()}</div>
                                                <div className="text-muted" style={{ fontSize: "0.65rem" }}>{day.toLocaleDateString([], { weekday: "short" }).toUpperCase().slice(0, 2)}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp._id}>
                                            <td className="px-3 py-2 text-start fw-bold bg-white" style={{ borderRight: "2px solid var(--border-color)", color: "var(--text-main)" }}>
                                                <div>{emp.name}</div>
                                                <span className="small text-muted font-monospace">{emp.empCode}</span>
                                            </td>
                                            {days.map((day, dIdx) => {
                                                const code = getShiftCode(emp._id, day);
                                                let badgeStyle = { backgroundColor: "#f3f4f6", color: "#374151" };
                                                if (code === "WO") badgeStyle = { backgroundColor: "#fee2e2", color: "#dc2626" };
                                                if (code === "NIGHT") badgeStyle = { backgroundColor: "#ecfeff", color: "#0891b2" };
                                                if (code === "FLEX") badgeStyle = { backgroundColor: "#fffbeb", color: "#d97706" };

                                                return (
                                                    <td key={dIdx} className="px-1 py-2">
                                                        <span className="badge font-monospace" style={{ ...badgeStyle, fontSize: "0.7rem", padding: "4px 6px" }}>
                                                            {code}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Roster Planner Modal */}
            {showRosterModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <form className="modal-content" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }} onSubmit={handleSaveRoster}>
                            <div className="modal-header border-bottom border-light">
                                <h5 className="modal-title fw-bold" style={{ color: "var(--text-main)" }}>Roster Shift Planner</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRosterModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Select Shift</label>
                                        <select
                                            className="form-select"
                                            required
                                            value={rosterForm.shiftId}
                                            onChange={(e) => setRosterForm({ ...rosterForm, shiftId: e.target.value })}
                                        >
                                            <option value="">-- Choose Shift Definition --</option>
                                            {shifts.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                            <option value="WO">Weekly Off (WO)</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">From Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            required
                                            value={rosterForm.fromDate}
                                            onChange={(e) => setRosterForm({ ...rosterForm, fromDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold">To Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            required
                                            value={rosterForm.toDate}
                                            onChange={(e) => setRosterForm({ ...rosterForm, toDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Select Target Employees</label>
                                        <div className="border rounded p-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                            {employees.map((emp) => (
                                                <div className="form-check mb-2" key={emp._id}>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`roster-emp-${emp._id}`}
                                                        checked={rosterForm.employeeIds.includes(emp._id)}
                                                        onChange={(e) => {
                                                            const ids = e.target.checked
                                                                ? [...rosterForm.employeeIds, emp._id]
                                                                : rosterForm.employeeIds.filter(id => id !== emp._id);
                                                            setRosterForm({ ...rosterForm, employeeIds: ids });
                                                        }}
                                                    />
                                                    <label className="form-check-label small" htmlFor={`roster-emp-${emp._id}`}>
                                                        {emp.name} ({emp.empCode})
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRosterModal(false)}>Cancel</button>
                                <button type="submit" className="btn" style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }}>Schedule Shift</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
