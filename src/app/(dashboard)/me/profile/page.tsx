"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { User, Mail, Phone, Calendar, MapPin, Building, FileText, Lock, ShieldCheck, Download, Edit } from "lucide-react";

export default function EmployeeProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [employeeDetails, setEmployeeDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    // Mock 2FA state
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/auth/profile");
            if (res.success && res.user) {
                setProfile(res.user);

                if (res.user.employeeId) {
                    // Fetch employee details from attendance controller
                    const empRes = await api.get(`/attendance/employees`);
                    if (empRes.success && empRes.data) {
                        const matchedEmp = empRes.data.find((e: any) => e._id === res.user.employeeId);
                        if (matchedEmp) {
                            setEmployeeDetails(matchedEmp);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Error loading profile data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("All password fields are required");
            return;
        }

        if (newPassword.length !== 6 || !/^\d+$/.test(newPassword)) {
            setPasswordError("New password must be exactly 6 digits (numbers only)");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        setPasswordSubmitting(true);
        try {
            // Put to /users/change-password or /auth/change-password endpoint
            const res = await api.post("/users/change-password", {
                currentPassword,
                newPassword
            });

            if (res.success) {
                setPasswordSuccess("Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPasswordError(res.error || "Failed to change password.");
            }
        } catch (err: any) {
            setPasswordError(err.message || "Failed to update password.");
        } finally {
            setPasswordSubmitting(false);
        }
    };

    const handleToggle2FA = () => {
        setIs2FAEnabled(!is2FAEnabled);
        alert(`Two-Factor Authentication has been ${!is2FAEnabled ? "enabled" : "disabled"}.`);
    };

    if (loading && !profile) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Manrope', sans-serif" }}>
            {/* Header */}
            <div className="mb-4">
                <h3 className="fw-bold text-dark mb-1">My Profile</h3>
                <p className="text-muted small mb-0">View personal information, assignments, and adjust settings.</p>
            </div>

            <div className="row g-4">
                {/* Left Side: General Profile Card */}
                <div className="col-12 col-lg-8">
                    {/* General Info Card */}
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-4 mb-4">
                        <div className="d-flex align-items-center gap-3.5 mb-4">
                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: "64px", height: "64px", backgroundColor: "#1E2A78", fontSize: "1.4rem" }}>
                                {profile?.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="fw-bold text-dark mb-0.5">{profile?.name}</h4>
                                <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1 small fw-semibold uppercase">{profile?.role}</span>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-6 col-md-4">
                                <span className="text-muted small fw-bold d-block uppercase mb-1">Employee Code</span>
                                <span className="text-dark fw-bold">{employeeDetails?.empCode || "N/A"}</span>
                            </div>
                            <div className="col-6 col-md-4">
                                <span className="text-muted small fw-bold d-block uppercase mb-1">Department</span>
                                <span className="text-dark fw-bold">{employeeDetails?.department || "General"}</span>
                            </div>
                            <div className="col-6 col-md-4">
                                <span className="text-muted small fw-bold d-block uppercase mb-1">Designation</span>
                                <span className="text-dark fw-bold">{employeeDetails?.designation || "N/A"}</span>
                            </div>
                            <div className="col-12 col-md-4">
                                <span className="text-muted small fw-bold d-block uppercase mb-1">Email Address</span>
                                <span className="text-dark fw-bold d-flex align-items-center gap-1.5"><Mail size={14} className="text-muted" /> {profile?.email}</span>
                            </div>
                            <div className="col-6 col-md-4">
                                <span className="text-muted small fw-bold d-block uppercase mb-1">Phone Number</span>
                                <span className="text-dark fw-bold d-flex align-items-center gap-1.5"><Phone size={14} className="text-muted" /> {employeeDetails?.phone || "N/A"}</span>
                            </div>
                            <div className="col-6 col-md-4">
                                <span className="text-muted small fw-bold d-block uppercase mb-1">Joining Date</span>
                                <span className="text-dark fw-bold d-flex align-items-center gap-1.5"><Calendar size={14} className="text-muted" /> {employeeDetails?.doj ? new Date(employeeDetails.doj).toLocaleDateString() : "N/A"}</span>
                            </div>
                            <div className="col-12 col-md-4">
                                <span className="text-muted small fw-bold d-block uppercase mb-1">Manager</span>
                                <span className="text-dark fw-bold">{employeeDetails?.managerId?.name || "None"}</span>
                            </div>
                            <div className="col-12 col-md-4">
                                <span className="text-muted small fw-bold d-block uppercase mb-1">Location / Office</span>
                                <span className="text-dark fw-bold d-flex align-items-center gap-1.5"><MapPin size={14} className="text-muted" /> {employeeDetails?.location || "Delhi HQ"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Properties, Floors & Units (Read-only Assignments) */}
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-4 mb-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <Building size={20} style={{ color: "#1E2A78" }} />
                            <h5 className="fw-bold text-dark mb-0">Role Assignments</h5>
                        </div>
                        <p className="text-muted small">Properties, floors, and rental units currently assigned to you.</p>

                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <div className="p-3 bg-light rounded-3 border border-light">
                                    <span className="text-muted small fw-bold d-block uppercase mb-1.5">Properties</span>
                                    <ul className="list-unstyled mb-0 small text-dark fw-semibold">
                                        {profile?.assignedProperties?.length === 0 ? <li>None</li> : profile?.assignedProperties?.map((p: any) => (
                                            <li key={p._id} className="mb-1">• {p.propertyName}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="p-3 bg-light rounded-3 border border-light">
                                    <span className="text-muted small fw-bold d-block uppercase mb-1.5">Floors</span>
                                    <ul className="list-unstyled mb-0 small text-dark fw-semibold">
                                        {profile?.assignedFloors?.length === 0 ? <li>None</li> : profile?.assignedFloors?.map((f: any) => (
                                            <li key={f._id} className="mb-1">• Floor {f.floorNumber}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="p-3 bg-light rounded-3 border border-light">
                                    <span className="text-muted small fw-bold d-block uppercase mb-1.5">Units</span>
                                    <ul className="list-unstyled mb-0 small text-dark fw-semibold">
                                        {profile?.assignedUnits?.length === 0 ? <li>None</li> : profile?.assignedUnits?.map((u: any) => (
                                            <li key={u._id} className="mb-1">• Unit {u.unitNumber} ({u.unitType})</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Documents */}
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <FileText size={20} style={{ color: "#1E2A78" }} />
                            <h5 className="fw-bold text-dark mb-0">Documents & ID Proofs</h5>
                        </div>
                        <p className="text-muted small">Employee agreements, compliance records, and proof credentials.</p>
                        
                        <div className="d-flex flex-column gap-2">
                            {employeeDetails?.documents?.length === 0 ? (
                                <p className="text-muted small mb-0">No documents uploaded.</p>
                            ) : (
                                employeeDetails?.documents?.map((doc: any, index: number) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center p-3 rounded-3 border border-light bg-light">
                                        <div className="d-flex align-items-center gap-2.5">
                                            <FileText size={18} className="text-muted" />
                                            <span className="small text-dark fw-bold">{doc.name}</span>
                                        </div>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light border d-flex align-items-center gap-1.5 px-2.5">
                                            <Download size={14} />
                                            <span className="small">Download</span>
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Security, Password & 2FA */}
                <div className="col-12 col-lg-4">
                    {/* Change Password Form */}
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-4 mb-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <Lock size={20} style={{ color: "#1E2A78" }} />
                            <h5 className="fw-bold text-dark mb-0">Change Password</h5>
                        </div>
                        
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold uppercase">Current Password</label>
                                <input
                                    type="password"
                                    className="form-control rounded-3 border-light"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold uppercase">New Password</label>
                                <input
                                    type="password"
                                    className="form-control rounded-3 border-light"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold uppercase">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-control rounded-3 border-light"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                />
                            </div>

                            {passwordError && <div className="alert alert-danger p-2 small border-0 bg-danger bg-opacity-10 text-danger mb-3">{passwordError}</div>}
                            {passwordSuccess && <div className="alert alert-success p-2 small border-0 bg-success bg-opacity-10 text-success mb-3">{passwordSuccess}</div>}

                            <button
                                type="submit"
                                className="btn text-white rounded-3 w-100 py-2"
                                style={{ backgroundColor: "#1E2A78" }}
                                disabled={passwordSubmitting}
                            >
                                {passwordSubmitting ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>

                    {/* Two-Factor Authentication (2FA) */}
                    <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <ShieldCheck size={20} style={{ color: "#1E2A78" }} />
                            <h5 className="fw-bold text-dark mb-0">Two-Factor Auth</h5>
                        </div>
                        <p className="text-muted small">Add an extra layer of security by requiring a verification code sent to your registered email when logging in.</p>

                        <div className="form-check form-switch mt-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="flexSwitchCheck2FA"
                                checked={is2FAEnabled}
                                onChange={handleToggle2FA}
                                style={{ cursor: "pointer" }}
                            />
                            <label className="form-check-label fw-bold text-dark small cursor-pointer" htmlFor="flexSwitchCheck2FA">
                                {is2FAEnabled ? "2FA Protection Enabled" : "Enable 2FA Protection"}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
