"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Plus, Search, Edit3, Trash2, UserPlus, X, Filter } from "lucide-react";

interface Employee {
    _id: string;
    empCode: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
    designation?: string;
    gender?: string;
    status: "ACTIVE" | "INACTIVE" | "TERMINATED";
    managerId?: any;
    shiftId?: any;
    policyId?: any;
    grossSalary?: number;
}
export default function EmployeeDirectory() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editEmployee, setEditEmployee] = useState<Partial<Employee> | null>(null);

    const [departments, setDepartments] = useState<string[]>(["All"]);

    const loadInitialMetadata = async () => {
        try {
            const shiftRes = await api.get("/attendance/shifts");
            if (shiftRes.success) setShifts(shiftRes.data);

            const policyRes = await api.get("/attendance/policies");
            if (policyRes.success) setPolicies(policyRes.data);

            // Run an initial load of all employees to extract unique departments for the filter dropdown
            const empRes = await api.get("/attendance/employees");
            if (empRes.success) {
                const depts = ["All", ...new Set(empRes.data.map((e: any) => e.department).filter(Boolean))];
                setDepartments(depts as string[]);
            }
        } catch (err) {
            console.error("Error loading initial metadata:", err);
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.append("search", searchQuery.trim());
            if (selectedDept && selectedDept !== "All") params.append("department", selectedDept);
            if (selectedStatus && selectedStatus !== "All") params.append("status", selectedStatus);

            const res = await api.get(`/attendance/employees?${params.toString()}`);
            if (res.success) setEmployees(res.data);
        } catch (err) {
            console.error("Error loading employee data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialMetadata();
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [searchQuery, selectedDept, selectedStatus]);

    const handleSaveEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editEmployee) return;

        try {
            const isEdit = !!editEmployee._id;
            const res = isEdit
                ? await api.put(`/attendance/employees/${editEmployee._id}`, editEmployee)
                : await api.post("/attendance/employees", editEmployee);

            if (res.success) {
                alert(`Employee ${isEdit ? "updated" : "registered"} successfully!`);
                setShowModal(false);
                setEditEmployee(null);
                fetchEmployees();
                loadInitialMetadata(); // refresh departments list
            }
        } catch (err: any) {
            alert(err.message || "Failed to save employee profile");
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm("Are you sure you want to delete this employee profile?")) return;
        try {
            const res = await api.delete(`/attendance/employees/${id}`);
            if (res.success) {
                alert("Employee profile deleted successfully!");
                fetchEmployees();
                loadInitialMetadata(); // refresh departments list
            }
        } catch (err: any) {
            alert(err.message || "Failed to delete employee profile");
        }
    };

    return (
        <div className="container-fluid py-4" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-app)", minHeight: "100vh" }}>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>Employee Directory</h2>
                    <p className="mb-0" style={{ color: "var(--text-muted)" }}>Manage active rosters, designations, and department shifts.</p>
                </div>
                <button
                    className="btn d-flex align-items-center gap-2"
                    style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }}
                    onClick={() => {
                        setEditEmployee({
                            empCode: "",
                            name: "",
                            email: "",
                            phone: "",
                            department: "Engineering",
                            designation: "Software Engineer",
                            gender: "Male",
                            status: "ACTIVE",
                            grossSalary: 0
                        });
                        setShowModal(true);
                    }}
                >
                    <UserPlus size={18} />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Filter toolbar */}
            <div className="card mb-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                <div className="card-body p-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-12 col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent" style={{ border: "1px solid var(--border-color)", borderRight: "none" }}>
                                    <Search size={16} style={{ color: "var(--text-muted)" }} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ border: "1px solid var(--border-color)", borderLeft: "none" }}
                                    placeholder="Search by name, code or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-nowrap" style={{ color: "var(--text-muted)" }}>Dept:</span>
                                <select
                                    className="form-select"
                                    style={{ border: "1px solid var(--border-color)" }}
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
                                    {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-nowrap" style={{ color: "var(--text-muted)" }}>Status:</span>
                                <select
                                    className="form-select"
                                    style={{ border: "1px solid var(--border-color)" }}
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="TERMINATED">Terminated</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className="card" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" style={{ color: "var(--dark-section)" }} role="status"></div>
                        </div>
                    ) : employees.length === 0 ? (
                        <p className="text-center py-5 mb-0" style={{ color: "var(--text-muted)" }}>No employees matching parameters.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0 table-hover">
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-muted)" }}>
                                        <th className="px-4 py-3 small text-uppercase">Code</th>
                                        <th className="px-4 py-3 small text-uppercase">Employee</th>
                                        <th className="px-4 py-3 small text-uppercase">Contact Info</th>
                                        <th className="px-4 py-3 small text-uppercase">Department / Role</th>
                                        <th className="px-4 py-3 small text-uppercase">Current Shift</th>
                                        <th className="px-4 py-3 small text-uppercase">Status</th>
                                        <th className="px-4 py-3 small text-uppercase text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                            <td className="px-4 py-3 font-monospace fw-bold">{emp.empCode}</td>
                                            <td className="px-4 py-3">
                                                <div className="fw-bold" style={{ color: "var(--text-main)" }}>{emp.name}</div>
                                                <span className="small" style={{ color: "var(--text-muted)" }}>{emp.designation || "-"}</span>
                                            </td>
                                            <td className="px-4 py-3 small">
                                                <div>{emp.email}</div>
                                                <div style={{ color: "var(--text-muted)" }}>{emp.phone || "-"}</div>
                                            </td>
                                            <td className="px-4 py-3 small">
                                                <div>{emp.department || "-"}</div>
                                            </td>
                                            <td className="px-4 py-3 small">
                                                {emp.shiftId ? (
                                                    <span className="badge bg-light text-dark border">{emp.shiftId.name}</span>
                                                ) : (
                                                    <span className="text-muted small">No shift assigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="badge"
                                                    style={
                                                        emp.status === "ACTIVE"
                                                            ? { backgroundColor: "#e2fbe8", color: "#16a34a" }
                                                            : { backgroundColor: "#fee2e2", color: "#dc2626" }
                                                    }
                                                >
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary p-2 d-inline-flex"
                                                        onClick={() => {
                                                            setEditEmployee(emp);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger p-2 d-inline-flex"
                                                        onClick={() => handleDeleteEmployee(emp._id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* CRUD Modal */}
            {showModal && editEmployee && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <form className="modal-content" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }} onSubmit={handleSaveEmployee}>
                            <div className="modal-header border-bottom border-light">
                                <h5 className="modal-title fw-bold" style={{ color: "var(--text-main)" }}>
                                    {editEmployee._id ? "Edit Employee Profile" : "Register Employee"}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={editEmployee.name || ""}
                                            onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Employee Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            disabled={!!editEmployee._id}
                                            value={editEmployee.empCode || ""}
                                            onChange={(e) => setEditEmployee({ ...editEmployee, empCode: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            required
                                            value={editEmployee.email || ""}
                                            onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editEmployee.phone || ""}
                                            onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Department</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editEmployee.department || ""}
                                            onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Designation</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editEmployee.designation || ""}
                                            onChange={(e) => setEditEmployee({ ...editEmployee, designation: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Assign Shift</label>
                                        <select
                                            className="form-select"
                                            value={editEmployee.shiftId?._id || editEmployee.shiftId || ""}
                                            onChange={(e) => setEditEmployee({ ...editEmployee, shiftId: e.target.value || undefined })}
                                        >
                                            <option value="">-- No Shift assigned --</option>
                                            {shifts.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.startTime} - {s.endTime})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Assign Policy</label>
                                        <select
                                            className="form-select"
                                            value={editEmployee.policyId?._id || editEmployee.policyId || ""}
                                            onChange={(e) => setEditEmployee({ ...editEmployee, policyId: e.target.value || undefined })}
                                        >
                                            <option value="">-- No Policy assigned --</option>
                                            {policies.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Gender</label>
                                        <select
                                            className="form-select"
                                            value={editEmployee.gender || "Male"}
                                            onChange={(e) => setEditEmployee({ ...editEmployee, gender: e.target.value })}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer Not to Say">Prefer Not to Say</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold">Roster Status</label>
                                        <select
                                            className="form-select"
                                            value={editEmployee.status || "ACTIVE"}
                                            onChange={(e: any) => setEditEmployee({ ...editEmployee, status: e.target.value })}
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="TERMINATED">Terminated</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn" style={{ backgroundColor: "var(--dark-section)", color: "#fff", border: "none" }}>
                                    {editEmployee._id ? "Update Employee" : "Register Employee"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
