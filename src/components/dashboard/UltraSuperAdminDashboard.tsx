"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import CreateAccountModal from "./CreateAccountModal";
import OrganizationDetailsModal from "./OrganizationDetailsModal";

export default function UltraSuperAdminDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    totalOrganizations: 1,
    propertyAccounts: 1,
    coworkingAccounts: 1,
    activeUsers: 1,
    subscriptions: 1,
    totalRevenue: 0,
    recentActivity: []
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PROPERTY" | "COWORKING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountContext, setSelectedAccountContext] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrgForView, setSelectedOrgForView] = useState<any | null>(null);

  const fetchSaaSData = async () => {
    setLoading(true);
    try {
      const [statsRes, accountsRes] = await Promise.all([
        api.get("/saas/stats").catch(() => null),
        api.get("/saas/accounts").catch(() => null)
      ]);

      if (statsRes && statsRes.success) {
        setStats(statsRes.data);
      }
      if (accountsRes && accountsRes.success) {
        setAccounts(accountsRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load SaaS Dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaaSData();
  }, []);

  const filteredAccounts = accounts.filter(acc => {
    const isCoworking = acc.account_type === "COWORKING" || acc.account_type === "Partner";
    if (activeTab === "PROPERTY" && isCoworking) return false;
    if (activeTab === "COWORKING" && !isCoworking) return false;
    
    if (selectedAccountContext !== "ALL" && acc._id !== selectedAccountContext) {
      return false;
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      acc.company_name?.toLowerCase().includes(q) ||
      acc.email?.toLowerCase().includes(q) ||
      acc.primary_contact?.toLowerCase().includes(q) ||
      acc.account_code?.toLowerCase().includes(q)
    );
  });

  const activeAccountObj = accounts.find(a => a._id === selectedAccountContext);

  return (
    <div style={{ padding: "0 20px 40px" }}>

      {/* Enterprise Breadcrumb & Organization Switcher Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
        
        {/* Breadcrumb Path */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0 extra-small fw-semibold">
            <li className="breadcrumb-item">
              <span className="text-secondary">SaaS Control Center</span>
            </li>
            <li className="breadcrumb-item">
              <span className="text-secondary">Organizations</span>
            </li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
              {selectedAccountContext === "ALL" ? "Global SaaS Accounts View" : (activeAccountObj?.company_name || "Account View")}
            </li>
          </ol>
        </nav>

        {/* Account Switcher Dropdown */}
        <div className="d-flex align-items-center gap-2">
          <span className="extra-small fw-bold text-muted text-uppercase" style={{ fontSize: "0.68rem" }}>
            <i className="bi bi-arrow-left-right me-1" /> Account Switcher:
          </span>
          <select
            className="form-select form-select-sm border-secondary border-opacity-25 bg-white shadow-none font-semibold"
            style={{ borderRadius: 999, fontSize: "0.82rem", minWidth: 240, paddingLeft: 14, paddingRight: 32 }}
            value={selectedAccountContext}
            onChange={(e) => setSelectedAccountContext(e.target.value)}
          >
            <option value="ALL">🏢 All Organizations (Global View)</option>
            {accounts.map(acc => (
              <option key={acc._id} value={acc._id}>
                {acc.account_type === "COWORKING" ? "🚪" : "🏙️"} {acc.company_name} ({acc.account_type})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* SaaS Admin Dark Header Banner */}
      <div className="bg-dark text-white rounded-4 p-4 mb-4 shadow-sm position-relative overflow-hidden">
        <div className="d-flex align-items-center justify-content-between position-relative z-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge rounded-pill bg-warning text-dark fw-bold px-3 py-1">
                <i className="bi bi-shield-check me-1" /> ULTRA_SUPER_ADMIN PORTAL
              </span>
              <span className="badge rounded-pill bg-secondary bg-opacity-50 text-white px-3 py-1 extra-small">
                Multi-Tenant Architecture
              </span>
            </div>
            <h2 className="fw-bold mb-1 text-white" style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
              SaaS System Control &amp; Global Accounts
            </h2>
            <p className="text-secondary mb-0 extra-small" style={{ color: "#cbd5e1", maxWidth: 650 }}>
              Centralized platform hub to create, manage, and provision Property Management Accounts and Co-working Space Accounts across multi-tenant organizations.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-warning btn-lg rounded-pill px-4 py-2 fw-bold text-dark d-inline-flex align-items-center gap-2 shadow-lg"
            style={{ fontSize: "0.95rem" }}
          >
            <i className="bi bi-plus-circle-fill" style={{ fontSize: "1.1rem" }} />
            Create Account
          </button>
        </div>
      </div>

      {/* Primary SaaS Metrics Row */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Organizations", val: stats.totalOrganizations || (accounts.length > 0 ? accounts.length : 1), icon: "bi-building-gear", color: "#16a34a", bg: "#f0fdf4" },
          { label: "Property Accounts", val: stats.propertyAccounts || accounts.filter(a => a.account_type !== "COWORKING" && a.account_type !== "Partner").length || 1, icon: "bi-building", color: "#ea580c", bg: "#fff7ed" },
          { label: "Co-working Accounts", val: stats.coworkingAccounts || accounts.filter(a => a.account_type === "COWORKING" || a.account_type === "Partner").length || 1, icon: "bi-grid-3x3-gap-fill", color: "#2563eb", bg: "#eff6ff" },
          { label: "Active Platform Users", val: stats.activeUsers || 6, icon: "bi-people-fill", color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Active Subscriptions", val: stats.subscriptions || 1, icon: "bi-award-fill", color: "#0891b2", bg: "#ecfeff" },
          { label: "Total Platform Revenue", val: `₹${((stats.totalRevenue || 0) / 100000).toFixed(1)}L`, icon: "bi-cash-coin", color: "#059669", bg: "#ecfdf5" },
        ].map((item, idx) => (
          <div key={idx} className="col-md-4 col-lg-2">
            <div className="card border-0 rounded-4 p-3 shadow-sm h-100 bg-white border border-light">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="extra-small fw-bold text-muted text-uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                  {item.label}
                </span>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 34, height: 34, backgroundColor: item.bg, color: item.color }}
                >
                  <i className={`bi ${item.icon}`} style={{ fontSize: "1.1rem" }} />
                </div>
              </div>
              <div className="h4 fw-bold text-dark mb-0" style={{ fontSize: "1.35rem" }}>
                {item.val}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Account Type Filters & Search Header */}
      <div className="card border-0 rounded-4 shadow-sm bg-white mb-4 overflow-hidden border border-light">
        <div className="card-header bg-white border-0 p-4 pb-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          
          <div className="d-flex align-items-center gap-2">
            {[
              { id: "ALL", label: "All Accounts" },
              { id: "PROPERTY", label: "Property Management" },
              { id: "COWORKING", label: "Co-working Spaces" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold transition-all ${
                  activeTab === tab.id ? "btn-dark shadow-sm" : "btn-light text-secondary border-0"
                }`}
                style={{ fontSize: "0.82rem" }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="d-flex align-items-center gap-3" style={{ minWidth: 280 }}>
            <div className="position-relative w-100">
              <input
                type="text"
                className="form-control form-control-sm ps-5 rounded-pill border-light bg-light"
                placeholder="Search organizations or admin email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: 38, fontSize: "0.85rem" }}
              />
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: "0.85rem" }} />
            </div>
          </div>

        </div>

        {/* Managed Accounts Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark extra-small text-uppercase">
              <tr>
                <th className="ps-4">Organization / Company</th>
                <th>Account Type</th>
                <th>Primary Admin</th>
                <th>Status</th>
                <th>Location / City</th>
                <th>Created</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-dark me-2" role="status" />
                    Loading SaaS Tenant Accounts...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="my-4">
                      <div className="mx-auto mb-3 rounded-circle bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: 64, height: 64 }}>
                        <i className="bi bi-building-x" style={{ fontSize: "2rem" }} />
                      </div>
                      <h6 className="fw-bold text-dark mb-1">No Accounts Found</h6>
                      <p className="extra-small text-muted mb-3">
                        {searchQuery ? `No organization matches "${searchQuery}".` : "No tenant accounts provisioned yet."}
                      </p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn btn-sm btn-warning rounded-pill px-4 fw-bold text-dark"
                      >
                        <i className="bi bi-plus-circle me-1" /> Create Account Now
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isCoworking = acc.account_type === "COWORKING" || acc.account_type === "Partner";
                  return (
                    <tr key={acc._id}>
                      <td className="ps-4" style={{ cursor: "pointer" }} onClick={() => setSelectedOrgForView(acc)}>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className={`rounded-3 d-flex align-items-center justify-content-center text-white fw-bold ${
                              isCoworking ? "bg-primary" : "bg-warning text-dark"
                            }`}
                            style={{ width: 38, height: 38, fontSize: "0.9rem" }}
                          >
                            {acc.company_name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark hover-underline" style={{ fontSize: "0.88rem" }}>
                              {acc.company_name}
                            </div>
                            <div className="extra-small text-muted font-monospace">
                              {acc.account_code || "ACC-2026-001"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge rounded-pill ${isCoworking ? "bg-primary bg-opacity-10 text-primary" : "bg-warning bg-opacity-10 text-dark"} px-3 py-1`}>
                          {isCoworking ? "Co-working Space" : "Property Management"}
                        </span>
                      </td>

                      <td>
                        <div className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>
                          {acc.primary_contact || acc.owner_id?.name || "Admin"}
                        </div>
                        <div className="extra-small text-muted">{acc.email || acc.owner_id?.email}</div>
                      </td>

                      <td>
                        <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-1">
                          <i className="bi bi-check-circle-fill me-1" /> Active
                        </span>
                      </td>

                      <td>
                        <div className="extra-small fw-semibold text-dark">
                          {acc.city || "Hyderabad"}
                        </div>
                        <div className="extra-small text-muted">{acc.state || "Telangana"}, {acc.country || "India"}</div>
                      </td>

                      <td className="extra-small text-muted">
                        {new Date(acc.createdAt).toLocaleDateString()}
                      </td>

                      <td className="text-end pe-4">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <button
                            onClick={() => setSelectedOrgForView(acc)}
                            className="btn btn-sm btn-dark rounded-pill px-3 fw-semibold extra-small"
                          >
                            <i className="bi bi-box-arrow-up-right me-1" /> Open Account
                          </button>

                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-light border-0 rounded-circle"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              <i className="bi bi-three-dots-vertical" />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                              <li>
                                <button
                                  className="dropdown-item extra-small"
                                  onClick={() => setSelectedOrgForView(acc)}
                                >
                                  <i className="bi bi-building me-2 text-warning" /> View Properties &amp; Add
                                </button>
                              </li>
                              <li>
                                <Link className="dropdown-item extra-small" href={`/admin/users`}>
                                  <i className="bi bi-people me-2" /> View Organization Users
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Creation Modal */}
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchSaaSData()}
      />

      {/* Organization View & Ultra Super Admin Property Creation Modal */}
      {selectedOrgForView && (
        <OrganizationDetailsModal
          isOpen={!!selectedOrgForView}
          onClose={() => setSelectedOrgForView(null)}
          account={selectedOrgForView}
          user={user}
          onUpdate={() => fetchSaaSData()}
        />
      )}
    </div>
  );
}
