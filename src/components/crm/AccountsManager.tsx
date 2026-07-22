"use client";

import React, { useState, useEffect } from "react";
import Table, { TableColumn } from "@/components/common/Table";
import { api } from "@/utils/api";
import AccountDetailView from "./AccountDetailView";

interface AccountsManagerProps {
  accounts: any[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  accountTypeFilter: string;
  setAccountTypeFilter: (val: string) => void;
  industryFilter: string;
  setIndustryFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  openNewAccountForm: () => void;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

export default function AccountsManager({
  accounts = [],
  isLoading,
  searchTerm,
  setSearchTerm,
  accountTypeFilter,
  setAccountTypeFilter,
  industryFilter,
  setIndustryFilter,
  statusFilter,
  setStatusFilter,
  onEdit,
  onDelete,
  openNewAccountForm,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
}: AccountsManagerProps) {
  // Drawer details state (if user clicks company name)
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<string>("overview");

  // Pop-up modal details state (when clicking the eye button)
  const [viewingAccount, setViewingAccount] = useState<any | null>(null);

  // Dynamic drawer tab collections
  const [drawerContacts, setDrawerContacts] = useState<any[]>([]);
  const [drawerDeals, setDrawerDeals] = useState<any[]>([]);
  const [drawerActivities, setDrawerActivities] = useState<any[]>([]);
  const [drawerPayments, setDrawerPayments] = useState<any[]>([]);
  const [drawerLeases, setDrawerLeases] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedAccount) {
      setDrawerContacts([]);
      setDrawerDeals([]);
      setDrawerActivities([]);
      setDrawerPayments([]);
      setDrawerLeases([]);
      return;
    }

    const fetchDrawerData = async () => {
      setDrawerLoading(true);
      try {
        // Associated contacts
        const contactsRes = await api.get(`/crm/contacts?company_id=${selectedAccount._id}&limit=100`);
        const contactsList = contactsRes.success ? (contactsRes.data || []) : [];
        setDrawerContacts(contactsList);

        // Associated deals
        const dealsRes = await api.get(`/crm/deals?company_id=${selectedAccount._id}&limit=100`);
        const dealsList = dealsRes.success ? (dealsRes.data || []) : [];
        setDrawerDeals(dealsList);

        // Leases
        const leasesRes = await api.get(`/leases?limit=200`);
        const leasesList = leasesRes.success ? (leasesRes.data || []) : [];
        const companyLeases = leasesList.filter((l: any) => {
          return l.companyName?.toLowerCase() === selectedAccount.company_name?.toLowerCase() ||
                 l.tenantName?.toLowerCase() === selectedAccount.company_name?.toLowerCase();
        });
        setDrawerLeases(companyLeases);

        const leaseIds = new Set(companyLeases.map((l: any) => l._id));

        // Payments
        const paymentsRes = await api.get(`/payments?limit=300`);
        const paymentsList = paymentsRes.success ? (paymentsRes.data || []) : [];
        const filteredPayments = paymentsList.filter((p: any) => {
          return p.lead && leaseIds.has(p.lead?._id || p.lead);
        });
        setDrawerPayments(filteredPayments);

        // Activities
        const activitiesRes = await api.get(`/crm/activities?limit=300`);
        const activitiesList = activitiesRes.success ? (activitiesRes.data || []) : [];
        const dealIds = new Set(dealsList.map((d: any) => d._id));
        const filteredActivities = activitiesList.filter((act: any) => {
          return act.deal_id && dealIds.has(act.deal_id?._id || act.deal_id);
        });
        setDrawerActivities(filteredActivities);

      } catch (err) {
        console.error("Error loading drawer data:", err);
      } finally {
        setDrawerLoading(false);
      }
    };

    fetchDrawerData();
  }, [selectedAccount]);

  // Compute metrics from current page/total
  const totalAccountsCount = totalRecords;
  const enterpriseCount = accounts ? accounts.filter(a => a.account_type === "Enterprise" || a.account_type === "Corporate").length : 0;
  const partnersCount = accounts ? accounts.filter(a => a.account_type === "Partner").length : 0;
  const customersCount = accounts ? accounts.filter(a => a.account_type === "Customer" || !a.account_type).length : 0;
  const inactiveCount = accounts ? accounts.filter(a => a.status === "Inactive" || a.status === "Blocked").length : 0;

  const columns: TableColumn<any>[] = [
    {
      header: "Company Name",
      style: {
        position: "sticky",
        left: 0,
        zIndex: 5,
        minWidth: "220px",
        width: "220px",
        boxShadow: "2px 0 5px rgba(0,0,0,0.05)"
      },
      render: (item: any) => (
        <span 
          className="fw-bold text-dark hover-underline" 
          style={{ cursor: "pointer", fontSize: "0.825rem" }} 
          onClick={() => { setSelectedAccount(item); setActiveDrawerTab("overview"); }}
        >
          {item.company_name ? (item.company_name.charAt(0).toUpperCase() + item.company_name.slice(1)) : "—"}
        </span>
      )
    },
    {
      header: "Industry",
      render: (item: any) => <span style={{ fontSize: "0.825rem" }}>{item.industry || "—"}</span>
    },
    {
      header: "Account Type",
      render: (item: any) => (
        <span 
          className="badge px-2 py-1 fw-semibold"
          style={{
            fontSize: "0.725rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            border: "1px solid #dbeafe"
          }}
        >
          {item.account_type || "Customer"}
        </span>
      )
    },
    {
      header: "Primary Contact",
      render: (item: any) => (
        <div className="d-flex flex-column">
          <span className="fw-semibold text-dark" style={{ fontSize: "0.825rem" }}>{item.contact_name || "—"}</span>
          {item.designation && <span className="text-muted" style={{ fontSize: "0.725rem" }}>{item.designation}</span>}
        </div>
      )
    },
    {
      header: "Phone & Email",
      render: (item: any) => (
        <div className="d-flex flex-column" style={{ fontSize: "0.8rem" }}>
          <span className="text-secondary fw-semibold">{item.phone || "—"}</span>
          <span className="text-muted" style={{ fontSize: "0.75rem", marginTop: "1px" }}>{item.email || "—"}</span>
        </div>
      )
    },
    {
      header: "Location",
      render: (item: any) => <span style={{ fontSize: "0.825rem" }}>{item.city ? `${item.city}, ${item.country || "India"}` : "—"}</span>
    },
    {
      header: "Created By",
      render: (item: any) => {
        const createdDate = item.createdAt 
          ? new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })
          : "—";
        const creatorName = item.created_by?.name || item.createdBy?.name || "System";
        return (
          <div className="d-flex flex-column" style={{ fontSize: "0.78rem" }}>
            <span className="fw-semibold text-dark">{creatorName}</span>
            <span className="text-muted" style={{ fontSize: "0.725rem", marginTop: "1px" }}>{createdDate}</span>
          </div>
        );
      }
    },
    {
      header: "Last Updated By",
      render: (item: any) => {
        const updatedDate = item.updatedAt 
          ? new Date(item.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })
          : "—";
        const updaterName = item.updated_by?.name || item.updatedBy?.name || "System";
        return (
          <div className="d-flex flex-column" style={{ fontSize: "0.78rem" }}>
            <span className="fw-semibold text-dark">{updaterName}</span>
            <span className="text-muted" style={{ fontSize: "0.725rem", marginTop: "1px" }}>{updatedDate}</span>
          </div>
        );
      }
    },
    {
      header: "Status",
      style: {
        position: "sticky",
        right: "90px",
        zIndex: 5,
        minWidth: "125px",
        width: "125px",
        boxShadow: "-2px 0 5px rgba(0,0,0,0.05)"
      },
      render: (item: any) => {
        const status = item.status || "Active";
        let badgeStyle = { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" };
        if (status === "Inactive") {
          badgeStyle = { backgroundColor: "#fff7ed", color: "#ea580c", border: "1px solid #ffedd5" };
        } else if (status === "Blocked") {
          badgeStyle = { backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2" };
        }
        return (
          <span 
            className="badge px-2 py-1 fw-bold" 
            style={{ fontSize: "0.725rem", borderRadius: "var(--radius-full)", ...badgeStyle }}
          >
            {status}
          </span>
        );
      }
    },
    {
      header: "Actions",
      style: {
        position: "sticky",
        right: 0,
        zIndex: 5,
        minWidth: "90px",
        width: "90px"
      },
      render: (item: any) => (
        <div className="d-flex gap-2 align-items-center">
          {/* View Button */}
          <button
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-app)",
              border: "none",
              color: "var(--text-main)"
            }}
            title="View Account Details"
            onClick={() => setViewingAccount(item)}
          >
            <i className="bi bi-eye" style={{ fontSize: "0.85rem" }} />
          </button>
          
          {/* Edit Button */}
          <button
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-app)",
              border: "none",
              color: "var(--text-main)"
            }}
            title="Edit Account"
            onClick={() => onEdit(item)}
          >
            <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      {/* ── METRIC CARDS ── */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Accounts */}
        <div className="col">
          <div
            className="card border-0 p-3 d-flex flex-row align-items-center gap-3"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                color: "#2563eb"
              }}
            >
              <i className="bi bi-building" style={{ fontSize: "1.2rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.75rem", fontWeight: "500" }}>Total Accounts</div>
              <div className="fw-bold fs-5 text-dark mt-0.5">{totalAccountsCount}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Enterprise */}
        <div className="col">
          <div
            className="card border-0 p-3 d-flex flex-row align-items-center gap-3"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                color: "#2563eb"
              }}
            >
              <i className="bi bi-award" style={{ fontSize: "1.2rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.75rem", fontWeight: "500" }}>Enterprise / Corp</div>
              <div className="fw-bold fs-5 text-dark mt-0.5">{enterpriseCount}</div>
            </div>
          </div>
        </div>

        {/* Card 3: Partners */}
        <div className="col">
          <div
            className="card border-0 p-3 d-flex flex-row align-items-center gap-3"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#f5f3ff",
                color: "#7c3aed"
              }}
            >
              <i className="bi bi-briefcase" style={{ fontSize: "1.2rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.75rem", fontWeight: "500" }}>Partners</div>
              <div className="fw-bold fs-5 text-dark mt-0.5">{partnersCount}</div>
            </div>
          </div>
        </div>

        {/* Card 4: Customers */}
        <div className="col">
          <div
            className="card border-0 p-3 d-flex flex-row align-items-center gap-3"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#f0fdf4",
                color: "#16a34a"
              }}
            >
              <i className="bi bi-person-check" style={{ fontSize: "1.1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.75rem", fontWeight: "500" }}>Customers</div>
              <div className="fw-bold fs-5 text-dark mt-0.5">{customersCount}</div>
            </div>
          </div>
        </div>

        {/* Card 5: Inactive / Blocked */}
        <div className="col">
          <div
            className="card border-0 p-3 d-flex flex-row align-items-center gap-3"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#fef2f2",
                color: "#dc2626"
              }}
            >
              <i className="bi bi-slash-circle" style={{ fontSize: "1.1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.75rem", fontWeight: "500" }}>Inactive / Blocked</div>
              <div className="fw-bold fs-5 text-dark mt-0.5">{inactiveCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACCOUNTS DIRECTORY CARD ── */}
      <div
        className="card border-0 p-4"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px"
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h5 className="fw-bold m-0" style={{ color: "var(--text-main)", fontSize: "1.1rem" }}>Accounts Directory</h5>
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <div className="position-relative">
              <i className="bi bi-search text-muted position-absolute" style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem" }}></i>
              <input
                type="text"
                placeholder="Search accounts..."
                className="form-control form-control-sm"
                value={searchTerm || ""}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "220px",
                  paddingLeft: "30px",
                  borderColor: "var(--border-color)",
                  borderRadius: "10px",
                  height: "36px",
                  fontSize: "0.85rem"
                }}
              />
            </div>

            <select
              className="form-select form-select-sm"
              style={{
                width: "160px",
                borderColor: "var(--border-color)",
                borderRadius: "10px",
                height: "36px",
                fontSize: "0.85rem"
              }}
              value={accountTypeFilter}
              onChange={e => setAccountTypeFilter(e.target.value)}
            >
              <option value="All">All Account Types</option>
              <option value="Customer">Customer</option>
              <option value="Partner">Partner</option>
              <option value="Vendor">Vendor</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Corporate">Corporate</option>
            </select>

            <select
              className="form-select form-select-sm"
              style={{
                width: "150px",
                borderColor: "var(--border-color)",
                borderRadius: "10px",
                height: "36px",
                fontSize: "0.85rem"
              }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>

            <button
              className="btn btn-dark btn-sm fw-bold px-3 d-flex align-items-center gap-2"
              style={{
                backgroundColor: "var(--dark-section)",
                borderRadius: "10px",
                height: "36px",
                fontSize: "0.85rem",
                paddingTop: "0px",
                paddingBottom: "0px"
              }}
              onClick={openNewAccountForm}
            >
              <i className="bi bi-plus-lg"></i> Add Account
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={accounts}
          isLoading={isLoading}
          emptyMessage="No accounts match your search criteria."
          containerClassName="table-responsive-container table-responsive mt-0"
        />

        {/* ── PAGINATION CONTROLS ── */}
        {!isLoading && totalRecords > 0 && (
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 pt-3 border-top" style={{ fontSize: "0.825rem" }}>
            <div className="text-muted">
              Showing <span className="fw-semibold">{Math.min((currentPage - 1) * 20 + 1, totalRecords)}</span> to{" "}
              <span className="fw-semibold">{Math.min(currentPage * 20, totalRecords)}</span> of{" "}
              <span className="fw-semibold">{totalRecords}</span> accounts
            </div>
            
            <div className="d-flex gap-1 align-items-center">
              <button
                className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-main)"
                }}
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                title="Previous Page"
              >
                <i className="bi bi-chevron-left" />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => {
                if (pg === 1 || pg === totalPages || Math.abs(pg - currentPage) <= 1) {
                  const isActive = pg === currentPage;
                  return (
                    <button
                      key={pg}
                      className="btn btn-sm d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "10px",
                        border: isActive ? "none" : "1px solid var(--border-color)",
                        backgroundColor: isActive ? "var(--dark-section)" : "var(--bg-card)",
                        color: isActive ? "#ffffff" : "var(--text-main)"
                      }}
                      onClick={() => onPageChange(pg)}
                    >
                      {pg}
                    </button>
                  );
                } else if (pg === 2 || pg === totalPages - 1) {
                  return (
                    <span key={pg} className="px-1 text-muted" style={{ userSelect: "none" }}>
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-main)"
                }}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                title="Next Page"
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {viewingAccount && (
        <AccountDetailView 
          viewItem={viewingAccount}
          onClose={() => setViewingAccount(null)}
          onEdit={(item) => {
            setViewingAccount(null);
            onEdit(item);
          }}
        />
      )}

      {/* ── DETAILS DRAWER ── */}
      {selectedAccount && (
        <div 
          className="position-fixed top-0 end-0 h-100 bg-white border-start" 
          style={{ 
            width: "500px", 
            zIndex: 1050, 
            boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease-out"
          }}
        >
          <div className="d-flex flex-column h-100">
            {/* Drawer Header */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
              <div>
                <h6 className="fw-bold mb-0 text-dark">
                  {selectedAccount.company_name ? (selectedAccount.company_name.charAt(0).toUpperCase() + selectedAccount.company_name.slice(1)) : "—"}
                </h6>
                <small className="text-muted">{selectedAccount.account_code || "Corporate Account"}</small>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                style={{ fontSize: "0.8rem" }}
                onClick={() => setSelectedAccount(null)}
              />
            </div>

            {/* Tabs Selector */}
            <div className="bg-light px-2 border-bottom">
              <nav className="nav nav-tabs border-0" style={{ fontSize: "0.75rem" }}>
                {[
                  { id: "overview", label: "Overview" },
                  { id: "contacts", label: "Contacts" },
                  { id: "deals", label: "Deals" },
                  { id: "leases", label: "Leases" },
                  { id: "payments", label: "Payments" },
                  { id: "documents", label: "Documents" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`nav-link border-0 fw-bold px-3.5 py-2.5 ${activeDrawerTab === tab.id ? "active bg-white text-dark" : "text-muted bg-transparent"}`}
                    onClick={() => setActiveDrawerTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Contents */}
            <div className="flex-grow-1 overflow-auto p-3" style={{ fontSize: "0.8rem", backgroundColor: "var(--bg-app)" }}>
              {drawerLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.75rem" }}>Retrieving associated CRM records...</p>
                </div>
              ) : (
                <>
                  {activeDrawerTab === "overview" && (
                    <div className="d-flex flex-column gap-3">
                      <div className="bg-white p-3 rounded border">
                        <span className="fw-semibold text-muted mb-2 d-block">Company Info</span>
                        <div className="row g-2">
                          <div className="col-5 text-muted">Industry:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.industry || "—"}</div>
                          <div className="col-5 text-muted">Account Type:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.account_type || "Customer"}</div>
                          <div className="col-5 text-muted">Company Size:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.company_size || "—"}</div>
                          <div className="col-5 text-muted">Employee Count:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.employee_count || "—"}</div>
                          <div className="col-5 text-muted">Annual Revenue:</div>
                          <div className="col-7 fw-bold text-dark">₹{selectedAccount.annual_revenue?.toLocaleString("en-IN") || "—"}</div>
                          <div className="col-5 text-muted">Business Category:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.business_category || "—"}</div>
                          <div className="col-5 text-muted">Website URL:</div>
                          <div className="col-7">
                            {selectedAccount.website ? (
                              <a href={selectedAccount.website.startsWith("http") ? selectedAccount.website : `https://${selectedAccount.website}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-semibold">
                                {selectedAccount.website} <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: "0.65rem" }} />
                              </a>
                            ) : "—"}
                          </div>
                          <div className="col-5 text-muted">Status:</div>
                          <div className="col-7"><span className="badge bg-success-subtle text-success border border-success-subtle">{selectedAccount.status || "Active"}</span></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <span className="fw-semibold text-muted mb-2 d-block">Legal & Tax Credentials</span>
                        <div className="row g-2">
                          <div className="col-5 text-muted">GST Number:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.gst_number || "—"}</div>
                          <div className="col-5 text-muted">Registration No:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.registration_number || "—"}</div>
                          <div className="col-5 text-muted">PAN Number:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.pan_number || "—"}</div>
                          <div className="col-5 text-muted">Tax ID:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.tax_id || "—"}</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <span className="fw-semibold text-muted mb-2 d-block">Primary Contact Details</span>
                        <div className="row g-2">
                          <div className="col-5 text-muted">Contact Name:</div>
                          <div className="col-7 fw-bold text-dark">{selectedAccount.contact_name || "—"}</div>
                          <div className="col-5 text-muted">Designation:</div>
                          <div className="col-7 text-dark">{selectedAccount.designation || "—"}</div>
                          <div className="col-5 text-muted">Phone Number:</div>
                          <div className="col-7"><a href={`tel:${selectedAccount.phone}`} className="text-decoration-none fw-semibold">{selectedAccount.phone || "—"}</a></div>
                          <div className="col-5 text-muted">Email Address:</div>
                          <div className="col-7"><a href={`mailto:${selectedAccount.email}`} className="text-decoration-none fw-semibold">{selectedAccount.email || "—"}</a></div>
                          <div className="col-5 text-muted">WhatsApp No:</div>
                          <div className="col-7">
                            {selectedAccount.whatsapp ? (
                              <a href={`https://wa.me/${selectedAccount.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-semibold" style={{ color: "#16a34a" }}>
                                <i className="bi bi-whatsapp me-1" />{selectedAccount.whatsapp}
                              </a>
                            ) : "—"}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <span className="fw-semibold text-muted mb-2 d-block">Address Location</span>
                        <div className="row g-2">
                          <div className="col-5 text-muted">Address Line 1:</div>
                          <div className="col-7 text-dark">{selectedAccount.address || "—"}</div>
                          <div className="col-5 text-muted">Address Line 2:</div>
                          <div className="col-7 text-dark">{selectedAccount.address2 || "—"}</div>
                          <div className="col-5 text-muted">City/State:</div>
                          <div className="col-7 text-dark">{selectedAccount.city || "—"}{selectedAccount.state ? `, ${selectedAccount.state}` : ""}</div>
                          <div className="col-5 text-muted">Country:</div>
                          <div className="col-7 text-dark">{selectedAccount.country || "India"}</div>
                          <div className="col-5 text-muted">Pincode:</div>
                          <div className="col-7 text-dark">{selectedAccount.pincode || "—"}</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <span className="fw-semibold text-muted mb-2 d-block">System Audit Details</span>
                        <div className="row g-2">
                          <div className="col-5 text-muted">Account Owner:</div>
                          <div className="col-7 text-dark">{selectedAccount.owner_id?.name || selectedAccount.ownerName || "—"}</div>
                          <div className="col-5 text-muted">Created By:</div>
                          <div className="col-7 text-dark">{selectedAccount.created_by?.name || selectedAccount.createdBy?.name || "System"}</div>
                          <div className="col-5 text-muted">Created Date:</div>
                          <div className="col-7 text-dark">
                            {selectedAccount.createdAt 
                              ? new Date(selectedAccount.createdAt).toLocaleDateString("en-US", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "—"}
                          </div>
                          <div className="col-5 text-muted">Last Updated By:</div>
                          <div className="col-7 text-dark">{selectedAccount.updated_by?.name || selectedAccount.updatedBy?.name || "System"}</div>
                          <div className="col-5 text-muted">Last Updated Date:</div>
                          <div className="col-7 text-dark">
                            {selectedAccount.updatedAt 
                              ? new Date(selectedAccount.updatedAt).toLocaleDateString("en-US", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "—"}
                          </div>
                        </div>
                      </div>

                      {selectedAccount.notes && (
                        <div className="bg-white p-3 rounded border">
                          <span className="fw-semibold text-muted mb-2 d-block">Description & Notes</span>
                          <div className="text-secondary" style={{ fontSize: "0.75rem", lineHeight: "1.4", whiteSpace: "pre-line" }}>
                            {selectedAccount.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeDrawerTab === "contacts" && (
                    <div className="d-flex flex-column gap-2">
                      <span className="fw-semibold text-muted mb-1">Company Contacts</span>
                      {drawerContacts.length === 0 ? (
                        <div className="text-center py-4 text-muted bg-light rounded border border-dashed" style={{ fontSize: "0.75rem" }}>
                          <i className="bi bi-people mb-1 d-block text-secondary" style={{ fontSize: "1.2rem" }}></i>
                          No associated contact individuals found.
                        </div>
                      ) : (
                        <div className="list-group">
                          {drawerContacts.map((c: any) => (
                            <div key={c._id} className="list-group-item d-flex justify-content-between align-items-center p-2 bg-light border-0 mb-1 rounded">
                              <div>
                                <strong className="text-dark">{c.name}</strong>
                                <div className="text-muted" style={{ fontSize: "0.68rem" }}>{c.designation || "Contact"} • {c.email}</div>
                              </div>
                              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle" style={{ fontSize: "0.68rem" }}>{c.contact_type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDrawerTab === "deals" && (
                    <div className="d-flex flex-column gap-2">
                      <span className="fw-semibold text-muted mb-1">Associated Deals Ledger</span>
                      {drawerDeals.length === 0 ? (
                        <div className="text-center py-4 text-muted bg-light rounded border border-dashed" style={{ fontSize: "0.75rem" }}>
                          <i className="bi bi-piggy-bank mb-1 d-block text-secondary" style={{ fontSize: "1.2rem" }}></i>
                          No associated deals or pipelines.
                        </div>
                      ) : (
                        <div className="list-group">
                          {drawerDeals.map((d: any) => (
                            <div key={d._id} className="list-group-item d-flex justify-content-between align-items-center p-2 bg-light border-0 mb-1 rounded">
                              <div>
                                <strong className="text-dark">{d.name}</strong>
                                <div className="text-muted" style={{ fontSize: "0.68rem" }}>Stage: {d.stage} • Prob: {d.probability}%</div>
                              </div>
                              <span className="fw-bold text-success">₹{d.amount?.toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDrawerTab === "leases" && (
                    <div className="d-flex flex-column gap-2">
                      <span className="fw-semibold text-muted mb-1">Lease Agreements</span>
                      {drawerLeases.length === 0 ? (
                        <div className="text-center py-4 text-muted bg-light rounded border border-dashed" style={{ fontSize: "0.75rem" }}>
                          <i className="bi bi-file-text mb-1 d-block text-secondary" style={{ fontSize: "1.2rem" }}></i>
                          No active or past leases associated.
                        </div>
                      ) : (
                        <div className="list-group">
                          {drawerLeases.map((l: any) => (
                            <div key={l._id} className="list-group-item d-flex justify-content-between align-items-center p-2 bg-light border-0 mb-1 rounded">
                              <div>
                                <strong className="text-dark">{l.propertyName || "Lease Record"}</strong>
                                <div className="text-muted" style={{ fontSize: "0.68rem" }}>Term: {l.startDate ? new Date(l.startDate).toLocaleDateString() : ""} to {l.endDate ? new Date(l.endDate).toLocaleDateString() : ""}</div>
                              </div>
                              <span className={`badge ${l.status === "Active" ? "bg-success text-white" : "bg-warning text-dark"}`} style={{ fontSize: "0.68rem" }}>{l.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}



                  {activeDrawerTab === "payments" && (
                    <div className="d-flex flex-column gap-2">
                      <span className="fw-semibold text-muted mb-1">Invoice Payments</span>
                      {drawerPayments.length === 0 ? (
                        <div className="text-center py-4 text-muted bg-light rounded border border-dashed" style={{ fontSize: "0.75rem" }}>
                          <i className="bi bi-credit-card mb-1 d-block text-secondary" style={{ fontSize: "1.2rem" }}></i>
                          No invoice payments recorded for this account.
                        </div>
                      ) : (
                        <div className="list-group">
                          {drawerPayments.map((pay: any) => (
                            <div key={pay._id} className="list-group-item d-flex justify-content-between align-items-center p-2 bg-light border-0 mb-1 rounded">
                              <div>
                                <strong className="text-dark">{pay.remarks || `Lease Payment - ${pay.month} ${pay.year}`}</strong>
                                <div className="text-muted" style={{ fontSize: "0.68rem" }}>Date: {pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : "—"} • {pay.paymentMethod}</div>
                              </div>
                              <div className="text-end">
                                <span className="fw-bold text-dark d-block">₹{pay.amount?.toLocaleString("en-IN")}</span>
                                <span className={`badge ${pay.status === "Paid" ? "bg-success text-white" : "bg-warning text-dark"} px-2 py-0`} style={{ fontSize: "0.6rem" }}>{pay.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDrawerTab === "documents" && (
                    <div className="d-flex flex-column gap-2">
                      <span className="fw-semibold text-muted mb-1">Agreement Documents</span>
                      {drawerLeases.filter((l: any) => l.agreementUrl).length === 0 ? (
                        <div className="text-center py-4 text-muted bg-light rounded border border-dashed" style={{ fontSize: "0.75rem" }}>
                          <i className="bi bi-file-earmark mb-1 d-block text-secondary" style={{ fontSize: "1.2rem" }}></i>
                          No lease agreement documents uploaded.
                        </div>
                      ) : (
                        <div className="list-group">
                          {drawerLeases.filter((l: any) => l.agreementUrl).map((lease: any) => (
                            <div key={lease._id} className="list-group-item d-flex justify-content-between align-items-center p-2 bg-light border-0 mb-1 rounded">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-file-earmark-pdf-fill text-danger" style={{ fontSize: "1.4rem" }}></i>
                                <div>
                                  <strong className="text-dark">Lease Agreement - {lease.companyName || lease.tenantName}</strong>
                                  <div className="text-muted" style={{ fontSize: "0.68rem" }}>Term: {lease.startDate ? new Date(lease.startDate).toLocaleDateString() : ""} to {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : ""}</div>
                                </div>
                              </div>
                              <a href={lease.agreementUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border p-1" title="Open Agreement Document">
                                <i className="bi bi-box-arrow-up-right" style={{ fontSize: "0.8rem" }}></i>
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
