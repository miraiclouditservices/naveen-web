"use client";
import { useState, useEffect } from "react";
import { api } from "@/utils/api";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [activeLeases, setActiveLeases] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'spaces' | 'billing' | 'ownerProfile' | 'leases' | 'security'>('overview');
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [address, setAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstPan, setGstPan] = useState("");

  // Password change states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "overview" || tab === "profile" || tab === "spaces" || tab === "billing" || tab === "ownerProfile" || tab === "leases" || tab === "security") {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/me");
      if (response.success && (response.data || response.user)) {
        const u = response.data || response.user;
        setCurrentUser(u);
        setOwnerProfile(response.ownerProfile || null);
        setActiveLeases(response.activeLeases || []);
        setAgreements(response.agreements || []);
        setPayments(response.payments || []);
        setName(u.name || "");
        setPhoneNumber(u.phoneNumber || "");
        setEmergencyNumber(u.emergencyNumber || "");
        setAddress(u.address || "");
        setCompanyName(u.companyName || "");
        setGstPan(u.gstPan || "");
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg(null);
    try {
      const response = await api.put(`/users/${currentUser._id}`, {
        name,
        phoneNumber,
        emergencyNumber,
        address,
        companyName,
        gstPan
      });
      if (response.success) {
        setUpdateMsg({ type: 'success', text: "Profile details updated successfully!" });
        setIsEditingProfile(false);
        fetchProfile();
      } else {
        setUpdateMsg({ type: 'danger', text: response.error || "Failed to update profile." });
      }
    } catch (err: any) {
      setUpdateMsg({ type: 'danger', text: err.message || "An error occurred." });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg(null);
    if (newPassword !== confirmPassword) {
      setUpdateMsg({ type: 'danger', text: "New passwords do not match." });
      return;
    }
    try {
      const response = await api.put(`/users/${currentUser._id}`, {
        password: newPassword
      });
      if (response.success) {
        setUpdateMsg({ type: 'success', text: "Password updated successfully!" });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setUpdateMsg({ type: 'danger', text: response.error || "Failed to change password." });
      }
    } catch (err: any) {
      setUpdateMsg({ type: 'danger', text: err.message || "An error occurred." });
    }
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return String(dateStr);
    }
  };

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " at " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return String(dateStr);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: "70vh" }}>
        <div className="spinner-border" style={{ color: "var(--brand-orange)" }} role="status" />
      </div>
    );
  }

  const displayRole = currentUser?.role === "Owner" ? "OFFICE_OWNER" : currentUser?.role === "Admin" ? "SUPER_ADMIN" : currentUser?.role || "User";

  // Summary Metrics
  const totalAssignedSft = currentUser?.assignedUnits?.reduce((sum: number, u: any) => sum + (u.sqft || 0), 0) ||
    currentUser?.assignedFloors?.reduce((sum: number, f: any) => sum + (f.totalSft || 0), 0) || 0;

  const totalAssignedSeats = currentUser?.assignedSeatCount || currentUser?.assignedUnits?.reduce((sum: number, u: any) => sum + (u.seatCount || 0), 0) || 0;

  const paidPaymentsList = payments.filter((p: any) => p.status === 'Paid');
  const totalPaidAmount = paidPaymentsList.reduce((sum: number, p: any) => sum + (p.paidAmount || p.amount || 0), 0);

  const primaryAgreement = agreements.length > 0 ? agreements[0] : null;
  const monthlyAmount = currentUser?.monthlyManagementAmount || primaryAgreement?.monthlyAmount || 0;
  const totalAgreementAmt = currentUser?.totalAgreementAmount || primaryAgreement?.totalAmount || 0;
  const pendingAmount = Math.max(totalAgreementAmt - totalPaidAmount, 0);

  return (
    <div className="container-fluid p-0 pb-5" style={{ backgroundColor: '#ffffff', fontFamily: "var(--font-geist-sans), Inter, sans-serif" }}>
      
      {/* ── TOP HORIZONTAL TAB NAVIGATION BAR (IMAGE 1 SPEC) ── */}
      <div className="bg-white border-bottom px-4 pt-3 pb-0 sticky-top" style={{ zIndex: 100, borderColor: '#e2e8f0' }}>
        <div className="d-flex align-items-center gap-4 overflow-auto scrollbar-none" style={{ borderBottom: '1px solid transparent' }}>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn border-0 rounded-0 pb-3 px-1 fw-semibold position-relative text-nowrap ${activeTab === 'overview' ? 'text-primary' : 'text-secondary'}`}
            style={{ fontSize: '0.92rem', color: activeTab === 'overview' ? '#2563eb' : '#64748b' }}
          >
            Overview
            {activeTab === 'overview' && (
              <span className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0', backgroundColor: '#2563eb' }}></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`btn border-0 rounded-0 pb-3 px-1 fw-semibold position-relative text-nowrap ${activeTab === 'profile' ? 'text-primary' : 'text-secondary'}`}
            style={{ fontSize: '0.92rem', color: activeTab === 'profile' ? '#2563eb' : '#64748b' }}
          >
            Profile
            {activeTab === 'profile' && (
              <span className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0', backgroundColor: '#2563eb' }}></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('spaces')}
            className={`btn border-0 rounded-0 pb-3 px-1 fw-semibold position-relative text-nowrap ${activeTab === 'spaces' ? 'text-primary' : 'text-secondary'}`}
            style={{ fontSize: '0.92rem', color: activeTab === 'spaces' ? '#2563eb' : '#64748b' }}
          >
            Spatial Assignments
            {activeTab === 'spaces' && (
              <span className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0', backgroundColor: '#2563eb' }}></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`btn border-0 rounded-0 pb-3 px-1 fw-semibold position-relative text-nowrap ${activeTab === 'billing' ? 'text-primary' : 'text-secondary'}`}
            style={{ fontSize: '0.92rem', color: activeTab === 'billing' ? '#2563eb' : '#64748b' }}
          >
            Billing & Payments
            {activeTab === 'billing' && (
              <span className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0', backgroundColor: '#2563eb' }}></span>
            )}
          </button>

          {ownerProfile && (
            <button
              onClick={() => setActiveTab('ownerProfile')}
              className={`btn border-0 rounded-0 pb-3 px-1 fw-semibold position-relative text-nowrap ${activeTab === 'ownerProfile' ? 'text-primary' : 'text-secondary'}`}
              style={{ fontSize: '0.92rem', color: activeTab === 'ownerProfile' ? '#2563eb' : '#64748b' }}
            >
              Owner Profile
              {activeTab === 'ownerProfile' && (
                <span className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0', backgroundColor: '#2563eb' }}></span>
              )}
            </button>
          )}

          {activeLeases.length > 0 && (
            <button
              onClick={() => setActiveTab('leases')}
              className={`btn border-0 rounded-0 pb-3 px-1 fw-semibold position-relative text-nowrap ${activeTab === 'leases' ? 'text-primary' : 'text-secondary'}`}
              style={{ fontSize: '0.92rem', color: activeTab === 'leases' ? '#2563eb' : '#64748b' }}
            >
              Leases
              {activeTab === 'leases' && (
                <span className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0', backgroundColor: '#2563eb' }}></span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('security')}
            className={`btn border-0 rounded-0 pb-3 px-1 fw-semibold position-relative text-nowrap ${activeTab === 'security' ? 'text-primary' : 'text-secondary'}`}
            style={{ fontSize: '0.92rem', color: activeTab === 'security' ? '#2563eb' : '#64748b' }}
          >
            Security & Credentials
            {activeTab === 'security' && (
              <span className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0', backgroundColor: '#2563eb' }}></span>
            )}
          </button>

        </div>
      </div>

      <div className="p-4 mx-auto" style={{ maxWidth: '1440px' }}>

        {updateMsg && (
          <div className={`alert alert-${updateMsg.type} rounded-3 shadow-sm d-flex align-items-center gap-2 mb-4`} role="alert">
            <i className={`bi ${updateMsg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span className="small fw-semibold">{updateMsg.text}</span>
          </div>
        )}

        {/* ── TWO COLUMN MAIN LAYOUT (IMAGE 1 SPEC) ── */}
        <div className="row g-4 align-items-start">
          
          {/* ── LEFT SIDEBAR PROFILE CARD (IMAGE 1 SPEC) ── */}
          <div className="col-lg-3.5 col-md-4">
            <div className="card border rounded-4 overflow-hidden bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
              
              {/* Cover Banner Photo Header */}
              <div style={{
                height: '110px',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e3a8a 100%)',
                backgroundSize: 'cover'
              }}></div>

              <div className="card-body p-4 pt-0 position-relative text-center">
                
                {/* Avatar Overlapping Banner */}
                <div className="d-inline-block position-relative" style={{ marginTop: '-48px' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-dark bg-white shadow" style={{ width: '84px', height: '84px', fontSize: '2.2rem', border: '4px solid #ffffff' }}>
                    {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="position-absolute bottom-0 end-0 p-1.5 bg-success border border-white rounded-circle" style={{ width: '14px', height: '14px' }} title="Online"></span>
                </div>

                {/* User Name & Bio / Subtitle */}
                <h5 className="fw-bold text-dark mt-2 mb-1" style={{ fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
                  {currentUser?.name || "User Name"}
                </h5>
                <div className="mb-3">
                  <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ backgroundColor: 'var(--brand-orange-bg)', color: 'var(--brand-orange)', border: '1px solid var(--brand-orange-border)', fontSize: '0.74rem' }}>
                    {displayRole}
                  </span>
                </div>

                {/* 3 Quick Metrics Bar (IMAGE 1 SPEC) */}
                <div className="d-flex align-items-center justify-content-center gap-3 py-3 border-top border-bottom my-3">
                  <div className="text-center px-2">
                    <div className="fw-bold text-dark fs-6">{totalAssignedSeats}</div>
                    <div className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>Seats</div>
                  </div>
                  <div className="border-end" style={{ height: '24px' }}></div>
                  <div className="text-center px-2">
                    <div className="fw-bold text-dark fs-6">{totalAssignedSft ? `${(totalAssignedSft / 1000).toFixed(1)}k` : '0'}</div>
                    <div className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>SFT</div>
                  </div>
                  <div className="border-end" style={{ height: '24px' }}></div>
                  <div className="text-center px-2">
                    <div className="fw-bold text-success fs-6">₹{totalPaidAmount ? `${(totalPaidAmount / 1000).toFixed(0)}k` : '0'}</div>
                    <div className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>Paid</div>
                  </div>
                </div>

                {/* Quick Info Items */}
                <div className="text-start d-flex flex-column gap-2.5 pt-1" style={{ fontSize: '0.84rem' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-muted">Email:</span>
                    <span className="fw-semibold text-dark text-truncate ms-2" style={{ maxWidth: '170px' }}>{currentUser?.email}</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-muted">Phone:</span>
                    <span className="fw-semibold text-dark">{currentUser?.phoneNumber || "—"}</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-muted">Member Since:</span>
                    <span className="fw-semibold text-dark">{formatDate(currentUser?.createdAt)}</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-muted">Status:</span>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-2.5 py-0.5 fw-bold" style={{ fontSize: '0.7rem' }}>
                      Active
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── RIGHT MAIN CONTENT PANE (IMAGE 1 SPEC) ── */}
          <div className="col-lg-8.5 col-md-8">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="d-flex flex-column gap-4">
                
                {/* Profile Summary Header */}
                <div className="card border rounded-4 p-4 bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <h5 className="fw-bold text-dark m-0">Admin Profile & Summary</h5>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('profile'); setIsEditingProfile(true); }}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
                    >
                      <i className="bi bi-pencil me-1"></i> Edit Profile
                    </button>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem' }}>FULL NAME</span>
                      <span className="fw-bold text-dark">{currentUser?.name}</span>
                    </div>

                    <div className="col-md-4">
                      <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem' }}>EMAIL ADDRESS</span>
                      <span className="fw-bold text-dark">{currentUser?.email}</span>
                    </div>

                    <div className="col-md-4">
                      <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem' }}>PRIMARY PHONE</span>
                      <span className="fw-bold text-dark">{currentUser?.phoneNumber || '—'}</span>
                    </div>

                    <div className="col-md-4">
                      <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem' }}>COMPANY / ENTITY</span>
                      <span className="fw-bold text-dark">{currentUser?.companyName || '—'}</span>
                    </div>

                    <div className="col-md-4">
                      <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem' }}>GST / PAN DETAILS</span>
                      <span className="fw-bold text-dark">{currentUser?.gstPan || '—'}</span>
                    </div>

                    <div className="col-md-4">
                      <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem' }}>REGISTRATION TIME</span>
                      <span className="fw-bold text-dark">{formatDateTime(currentUser?.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Spatial Summary Cards */}
                <div className="card border rounded-4 p-4 bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <h5 className="fw-bold text-dark m-0">Spatial Allocations</h5>
                    <button
                      type="button"
                      onClick={() => setActiveTab('spaces')}
                      className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold text-dark"
                    >
                      View All Spaces
                    </button>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.65rem' }}>PROPERTIES</span>
                        <span className="fw-bold text-dark fs-5">{currentUser?.assignedProperties?.length || 0} Assigned</span>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.65rem' }}>FLOORS</span>
                        <span className="fw-bold text-dark fs-5">{currentUser?.assignedFloors?.length || 0} Assigned</span>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.65rem' }}>OFFICE UNITS</span>
                        <span className="fw-bold text-dark fs-5">{currentUser?.assignedUnits?.length || 0} Units ({totalAssignedSeats} Seats)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Summary Card */}
                <div className="card border rounded-4 p-4 bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <h5 className="fw-bold text-dark m-0">Financial & Payment Ledger</h5>
                    <button
                      type="button"
                      onClick={() => setActiveTab('billing')}
                      className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold text-dark"
                    >
                      View Full Ledger
                    </button>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.65rem' }}>MONTHLY RATE</span>
                        <span className="fw-bold text-primary fs-5" style={{ color: 'var(--brand-orange)' }}>₹{monthlyAmount.toLocaleString('en-IN')}/mo</span>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.65rem' }}>TOTAL PAID</span>
                        <span className="fw-bold text-success fs-5">₹{totalPaidAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.65rem' }}>OUTSTANDING DUE</span>
                        <span className="fw-bold text-danger fs-5">₹{pendingAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* PROFILE TAB (VIEW MODE + EDIT MODE TRIGGER) */}
            {activeTab === 'profile' && (
              <div className="card border rounded-4 p-4 bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
                  <div>
                    <h5 className="fw-bold text-dark m-0">Personal Information</h5>
                    <span className="text-muted small">View & update account details</span>
                  </div>

                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                      style={{ backgroundColor: 'var(--brand-orange)', borderColor: 'var(--brand-orange)' }}
                    >
                      <i className="bi bi-pencil me-1.5"></i> Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="btn btn-light border rounded-pill px-4 fw-semibold text-muted"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  /* VIEW MODE DISPLAY (IMAGE 1 SPEC) */
                  <div className="d-flex flex-column gap-4">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>FULL NAME</span>
                        <span className="fw-bold text-dark fs-6">{currentUser?.name}</span>
                      </div>

                      <div className="col-md-6">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>EMAIL ADDRESS</span>
                        <span className="fw-bold text-dark fs-6">{currentUser?.email}</span>
                      </div>

                      <div className="col-md-6">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>PRIMARY PHONE NUMBER</span>
                        <span className="fw-semibold text-dark">{currentUser?.phoneNumber || '—'}</span>
                      </div>

                      <div className="col-md-6">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>EMERGENCY CONTACT</span>
                        <span className="fw-semibold text-dark">{currentUser?.emergencyNumber || '—'}</span>
                      </div>

                      <div className="col-md-6">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>COMPANY / ENTITY NAME</span>
                        <span className="fw-semibold text-dark">{currentUser?.companyName || '—'}</span>
                      </div>

                      <div className="col-md-6">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>GST / PAN NUMBER</span>
                        <span className="fw-semibold text-dark">{currentUser?.gstPan || '—'}</span>
                      </div>

                      <div className="col-12">
                        <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>REGISTERED ADDRESS</span>
                        <span className="fw-semibold text-dark">{currentUser?.address || '—'}</span>
                      </div>
                    </div>

                    {/* Account Metadata */}
                    <div className="p-4 border rounded-3 bg-light mt-2" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <h6 className="fw-bold text-dark mb-3"><i className="bi bi-info-circle me-1 text-primary"></i> Account Registration & Creation Details</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.62rem' }}>ROLE</span>
                          <span className="fw-bold text-dark small">{displayRole}</span>
                        </div>
                        <div className="col-md-4">
                          <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.62rem' }}>STAFF CATEGORY</span>
                          <span className="fw-semibold text-dark small">{currentUser?.staffCategory || 'None'}</span>
                        </div>
                        <div className="col-md-4">
                          <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.62rem' }}>PROVISIONED AT</span>
                          <span className="fw-bold text-dark small">{formatDateTime(currentUser?.createdAt)}</span>
                        </div>
                        <div className="col-md-4">
                          <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.62rem' }}>PROVISIONED BY</span>
                          <span className="fw-semibold text-dark small">{currentUser?.createdBy?.name || 'System Admin'}</span>
                        </div>
                        <div className="col-md-4">
                          <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.62rem' }}>KYC ATTACHMENT</span>
                          {currentUser?.idProofUrl ? (
                            <a href={currentUser.idProofUrl} target="_blank" rel="noopener noreferrer" className="fw-bold text-primary small text-decoration-underline">
                              View Attachment ({currentUser.idProofUrl})
                            </a>
                          ) : (
                            <span className="text-muted small">No document attached</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* EDIT FORM MODE */
                  <form onSubmit={handleUpdateProfile}>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>Full Name</label>
                        <input type="text" className="form-control shadow-none" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>Email Address (Disabled)</label>
                        <input type="email" className="form-control bg-light shadow-none" value={currentUser?.email || ""} disabled />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>Phone Number</label>
                        <input type="text" className="form-control shadow-none" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>Emergency Contact Number</label>
                        <input type="text" className="form-control shadow-none" value={emergencyNumber} onChange={(e) => setEmergencyNumber(e.target.value)} />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>Company / Entity Name</label>
                        <input type="text" className="form-control shadow-none" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>GST / PAN Number</label>
                        <input type="text" className="form-control shadow-none" value={gstPan} onChange={(e) => setGstPan(e.target.value)} />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>Registered Address</label>
                        <textarea className="form-control shadow-none" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="btn btn-light border rounded-pill px-4 fw-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary rounded-pill px-4 shadow-sm text-white border-0 fw-bold"
                        style={{ backgroundColor: 'var(--brand-orange)' }}
                      >
                        Save Profile Updates
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

            {/* SPATIAL ASSIGNMENTS TAB */}
            {activeTab === 'spaces' && (
              <div className="card border rounded-4 p-4 bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">Assigned Spatial Details</h5>

                {/* 1. Property Details */}
                <div className="mb-5">
                  <h6 className="fw-bold text-dark mb-3"><i className="bi bi-building me-2 text-primary"></i>Assigned Properties</h6>
                  {currentUser?.assignedProperties && currentUser.assignedProperties.length > 0 ? (
                    <div className="row g-3">
                      {currentUser.assignedProperties.map((prop: any) => (
                        <div key={prop._id} className="col-md-6">
                          <div className="p-3 border rounded-3 bg-light">
                            <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Property Name</span>
                            <span className="fw-bold text-dark fs-6 d-block mb-1">{prop.propertyName}</span>
                            <span className="small text-muted d-block">{prop.address || prop.propertyAddress || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small p-3 bg-light rounded-3 border">No properties assigned.</div>
                  )}
                </div>

                {/* 2. Floor Details */}
                <div className="mb-5">
                  <h6 className="fw-bold text-dark mb-3"><i className="bi bi-layers me-2 text-primary"></i>Assigned Floors</h6>
                  {currentUser?.assignedFloors && currentUser.assignedFloors.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {currentUser.assignedFloors.map((floor: any) => (
                        <span key={floor._id} className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-bold small">
                          {floor.floorName || `Floor ${floor.floorNumber}`} {floor.totalSft ? `(${floor.totalSft} SFT)` : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small p-3 bg-light rounded-3 border">No floors assigned.</div>
                  )}
                </div>

                {/* 3. Office Units */}
                <div>
                  <h6 className="fw-bold text-dark mb-3"><i className="bi bi-door-open me-2 text-primary"></i>Assigned Office Units & Seats</h6>
                  {currentUser?.assignedUnits && currentUser.assignedUnits.length > 0 ? (
                    <div className="row g-3">
                      {currentUser.assignedUnits.map((unit: any) => (
                        <div key={unit._id} className="col-md-6">
                          <div className="p-3.5 border rounded-3 bg-white shadow-2xs border-start border-4" style={{ borderLeftColor: 'var(--brand-orange)', borderColor: '#e2e8f0' }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="badge rounded-pill bg-light text-dark border px-3 py-1 fw-bold">{unit.unitType || "Office"}</span>
                              <span className={`badge rounded-pill px-3 py-1 fw-bold ${unit.unitStatus === "Occupied" ? "bg-success bg-opacity-10 text-success border border-success" : "bg-warning bg-opacity-10 text-warning border border-warning"}`}>
                                {unit.unitStatus || "Available"}
                              </span>
                            </div>

                            <div className="mb-2">
                              <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Property / Office Name</span>
                              <span className="fw-bold text-dark small d-block mb-1">{unit.property?.propertyName || "—"}</span>
                            </div>

                            <div className="row g-2 mb-2">
                              <div className="col-6">
                                <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Floor</span>
                                <span className="small text-dark fw-semibold" style={{ fontSize: '0.8rem' }}>{unit.floor?.floorName || `Floor ${unit.floorNumber || "—"}`}</span>
                              </div>
                              <div className="col-6">
                                <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Unit / Flat Number</span>
                                <span className="small text-dark fw-bold" style={{ fontSize: '0.8rem' }}>{unit.unitNumber || "—"}</span>
                              </div>
                            </div>

                            <div className="row g-2 pt-2 border-top">
                              <div className="col-6">
                                <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Area (SFT)</span>
                                <span className="small text-dark fw-bold">{unit.sqft ? `${unit.sqft.toLocaleString()} SFT` : "—"}</span>
                              </div>
                              <div className="col-6">
                                <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Seats Allocated</span>
                                <span className="small text-success fw-bold">💺 {unit.occupiedSeatCount || unit.seatCount || 0} Seats</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small p-3 bg-light rounded-3 border">No office units assigned.</div>
                  )}
                </div>

              </div>
            )}

            {/* BILLING & PAYMENTS TAB */}
            {activeTab === 'billing' && (
              <div className="card border rounded-4 p-4 bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                <h5 className="fw-bold mb-4 text-dark border-bottom pb-3 d-flex align-items-center justify-content-between">
                  <span>Billing, Agreement Terms & Payment Ledger</span>
                  <span className={`badge rounded-pill px-3 py-1.5 fw-bold ${currentUser?.agreementStatus === 'Active' ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-warning bg-opacity-10 text-warning border border-warning'}`}>
                    Agreement: {currentUser?.agreementStatus || 'Active'}
                  </span>
                </h5>

                {/* Agreement Terms Summary */}
                <div className="p-4 border rounded-3 mb-4 bg-light shadow-2xs" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                  <h6 className="fw-bold text-dark mb-3"><i className="bi bi-file-earmark-spreadsheet text-primary me-2"></i>Agreement Financial Terms</h6>
                  <div className="row g-3">
                    <div className="col-md-3 col-6">
                      <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Start Date</span>
                      <span className="fw-bold text-dark">{formatDate(currentUser?.floorAssignmentStartDate || primaryAgreement?.startDate)}</span>
                    </div>

                    <div className="col-md-3 col-6">
                      <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>End Date</span>
                      <span className="fw-bold text-dark">{formatDate(currentUser?.floorAssignmentEndDate || primaryAgreement?.endDate)}</span>
                    </div>

                    <div className="col-md-3 col-6">
                      <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Monthly Rate</span>
                      <span className="fw-bold text-primary fs-6" style={{ color: 'var(--brand-orange)' }}>₹{monthlyAmount.toLocaleString('en-IN')}/mo</span>
                    </div>

                    <div className="col-md-3 col-6">
                      <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Total Agreement Value</span>
                      <span className="fw-bold text-dark fs-6">₹{totalAgreementAmt.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="col-md-3 col-6">
                      <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Payment Cycle</span>
                      <span className="badge bg-white text-dark border px-3 py-1 fw-bold rounded-pill" style={{ fontSize: '0.78rem' }}>
                        {currentUser?.paymentType || primaryAgreement?.paymentType || 'Monthly Installment'}
                      </span>
                    </div>

                    <div className="col-md-3 col-6">
                      <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Due Day</span>
                      <span className="fw-bold text-dark">Day {currentUser?.paymentDueDay || 5} of Month</span>
                    </div>

                    <div className="col-md-3 col-6">
                      <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Total Paid</span>
                      <span className="fw-bold text-success fs-6">₹{totalPaidAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="col-md-3 col-6">
                      <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.62rem' }}>Outstanding Due</span>
                      <span className="fw-bold text-danger fs-6">₹{pendingAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Payments Table (IMAGE 1 SPEC) */}
                <div>
                  <h6 className="fw-bold text-dark mb-3"><i className="bi bi-journal-check me-2 text-primary"></i>Payment History & Receipts Ledger</h6>
                  {payments.length > 0 ? (
                    <div className="table-responsive border rounded-3 overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-light text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                          <tr>
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-3">Cycle / Month</th>
                            <th className="py-3 px-3">Transaction ID</th>
                            <th className="py-3 px-3">Method</th>
                            <th className="py-3 px-3 text-end">Amount Due</th>
                            <th className="py-3 px-3 text-end">Paid Amount</th>
                            <th className="py-3 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p: any, idx: number) => (
                            <tr key={p._id || idx}>
                              <td className="py-3 px-3 fw-medium text-dark">{formatDate(p.paymentDate || p.createdAt)}</td>
                              <td className="py-3 px-3 fw-semibold text-dark">{p.month ? `${p.month} ${p.year || ''}` : 'Monthly Installment'}</td>
                              <td className="py-3 px-3 text-muted font-monospace small">{p.transactionId || `TXN-${(p._id || '').substring(0, 8).toUpperCase()}`}</td>
                              <td className="py-3 px-3">
                                <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-medium" style={{ fontSize: '0.72rem' }}>
                                  {p.paymentMethod || 'Online'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-end fw-semibold text-dark">₹{(p.amount || 0).toLocaleString('en-IN')}</td>
                              <td className="py-3 px-3 text-end fw-bold text-success">₹{(p.paidAmount || p.amount || 0).toLocaleString('en-IN')}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`badge rounded-pill px-3 py-1 fw-bold ${p.status === 'Paid' ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-warning bg-opacity-10 text-warning border border-warning'}`} style={{ fontSize: '0.72rem' }}>
                                  {p.status || 'Paid'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-3 text-center text-muted bg-light">
                      <i className="bi bi-receipt fs-3 d-block mb-2 text-secondary"></i>
                      <div className="fw-semibold text-dark">No Payment Records Found</div>
                      <div className="small text-muted mt-1">Payment transactions will appear here when recorded by administration.</div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* OWNER PROFILE TAB */}
            {activeTab === 'ownerProfile' && ownerProfile && (
              <div className="card border rounded-4 p-4 bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">Owner Business Profile</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.62rem' }}>OWNER LEGAL NAME</span>
                    <span className="fw-bold text-dark fs-6">{ownerProfile.ownerName}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.62rem' }}>CORPORATE EMAIL</span>
                    <span className="fw-bold text-dark fs-6">{ownerProfile.emailId || '—'}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.62rem' }}>CONTACT PHONE</span>
                    <span className="fw-bold text-dark fs-6">{ownerProfile.contactNumber || '—'}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted extra-small d-block fw-bold" style={{ fontSize: '0.62rem' }}>GST TAX REGISTRATION</span>
                    <span className="fw-bold text-dark fs-6">{ownerProfile.gstNumber || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="card border rounded-4 p-4 bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                <form onSubmit={handlePasswordChange}>
                  <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">Change Security Password</h5>
                  <div className="row g-3" style={{ maxWidth: '500px' }}>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>New Password</label>
                      <input 
                        type="password" 
                        className="form-control shadow-none" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                        minLength={6}
                        placeholder="Enter new 6-digit or secure password"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-control shadow-none" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        minLength={6}
                        placeholder="Re-enter password to confirm"
                      />
                    </div>
                  </div>
                  <hr className="my-4 opacity-10" />
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm text-white border-0 fw-bold" style={{ backgroundColor: 'var(--brand-orange)' }}>
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
