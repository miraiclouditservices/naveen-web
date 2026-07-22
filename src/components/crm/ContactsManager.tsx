import React, { useState } from "react";
import Table, { TableColumn } from "@/components/common/Table";
import ContactDetailView from "./ContactDetailView";
import { api } from "@/utils/api";

interface ContactsManagerProps {
  contacts: any[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  contactTypeFilter: string;
  setContactTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onEdit: (item: any) => void;
  openNewContactForm: () => void;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  stats?: any;
}

export default function ContactsManager({
  contacts = [],
  isLoading,
  searchTerm,
  setSearchTerm,
  contactTypeFilter,
  setContactTypeFilter,
  statusFilter,
  setStatusFilter,
  onEdit,
  openNewContactForm,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  stats
}: ContactsManagerProps) {
  const [viewingContact, setViewingContact] = useState<any | null>(null);

  // Compute metric counts from database stats or local page list (for display)
  const totalContactsCount = stats?.total ?? totalRecords;
  const employeesCount = stats?.employees ?? (contacts ? contacts.filter(c => c.contact_type === "Employee").length : 0);
  const tenantsCount = stats?.tenants ?? (contacts ? contacts.filter(c => c.contact_type === "Tenant").length : 0);
  const ownersCount = stats?.owners ?? (contacts ? contacts.filter(c => c.contact_type === "Owner").length : 0);
  const inactiveCount = stats?.inactive ?? (contacts ? contacts.filter(c => c.status === "Inactive").length : 0);

  const contactColumns: TableColumn<any>[] = [
    {
      header: "Full Name",
      style: {
        position: "sticky",
        left: 0,
        zIndex: 6,
        minWidth: "160px",
        width: "160px"
      },
      render: (item) => (
        <div className="d-flex align-items-center gap-2">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold" 
            style={{ 
              width: "28px", 
              height: "28px", 
              fontSize: "0.75rem", 
              backgroundColor: "rgba(0, 0, 0, 0.05)", 
              color: "var(--text-main)",
              border: "1px solid var(--border-color)"
            }}
          >
            {item.name ? item.name.charAt(0).toUpperCase() : "?"}
          </div>
          <span className="fw-bold text-dark" style={{ fontSize: "0.825rem" }}>{item.name}</span>
        </div>
      )
    },
    {
      header: "Account / Company",
      render: (item) => <span className="fw-medium text-dark" style={{ fontSize: "0.825rem" }}>{item.account_id?.company_name || "—"}</span>
    },
    {
      header: "Contact Type",
      render: (item) => (
        <span 
          className="badge px-2.5 py-1 fw-semibold"
          style={{
            fontSize: "0.725rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: item.contact_type === "Employee" ? "#eff6ff" : item.contact_type === "Customer" ? "#f0fdf4" : "#f5f3ff",
            color: item.contact_type === "Employee" ? "#2563eb" : item.contact_type === "Customer" ? "#16a34a" : "#7c3aed",
            border: `1px solid ${item.contact_type === "Employee" ? "#dbeafe" : item.contact_type === "Customer" ? "#dcfce7" : "#ede9fe"}`
          }}
        >
          {item.contact_type || "Tenant"}
        </span>
      )
    },
    {
      header: "Phone & Email",
      render: (item) => (
        <div className="d-flex flex-column" style={{ fontSize: "0.8rem" }}>
          <span className="text-secondary fw-semibold">{item.phone || "—"}</span>
          <span className="text-muted" style={{ fontSize: "0.75rem", marginTop: "1px" }}>{item.email || "—"}</span>
        </div>
      )
    },
    {
      header: "Designation",
      render: (item) => <span style={{ fontSize: "0.825rem" }}>{item.designation || "—"}</span>
    },
    {
      header: "Department",
      render: (item) => <span style={{ fontSize: "0.825rem" }}>{item.department || "—"}</span>
    },
    {
      header: "Property",
      render: (item) => <span className="fw-semibold text-secondary" style={{ fontSize: "0.825rem" }}>{item.propertyId?.propertyName || "—"}</span>
    },
    {
      header: "Floor",
      render: (item) => <span style={{ fontSize: "0.825rem" }}>{item.floorId?.floorName || (item.floorId?.floorNumber ? `Floor ${item.floorId.floorNumber}` : "") || "—"}</span>
    },
    {
      header: "Created By",
      render: (item) => {
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
      render: (item) => {
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
        width: "125px"
      },
      render: (item) => {
        const isActive = (item.status || "Active") === "Active";
        return (
          <span 
            className="badge px-2 py-1 fw-bold"
            style={{
              fontSize: "0.725rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: isActive ? "#f0fdf4" : "#fef2f2",
              color: isActive ? "#16a34a" : "#dc2626",
              border: `1px solid ${isActive ? "#dcfce7" : "#fee2e2"}`
            }}
          >
            {item.status || "Active"}
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
      render: (item) => (
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
            title="View Contact Details"
            onClick={async () => {
              try {
                const res = await api.get(`/crm/contacts/${item._id}`);
                if (res.success && res.data) {
                  setViewingContact(res.data);
                } else {
                  setViewingContact(item);
                }
              } catch (err) {
                console.error("Error fetching contact detail:", err);
                setViewingContact(item);
              }
            }}
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
            title="Edit Contact"
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
      <div className="d-flex flex-wrap gap-3 mb-4">
        {/* Card 1: Total Contacts */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "185px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                color: "#2563eb"
              }}
            >
              <i className="bi bi-people" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Total Contacts</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{totalContactsCount}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Employees */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "185px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                color: "#2563eb"
              }}
            >
              <i className="bi bi-person-badge" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Employees</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{employeesCount}</div>
            </div>
          </div>
        </div>

        {/* Card 3: Tenants */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "185px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#f5f3ff",
                color: "#7c3aed"
              }}
            >
              <i className="bi bi-house" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Tenants</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{tenantsCount}</div>
            </div>
          </div>
        </div>

        {/* Card 4: Owners */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "185px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#f0fdf4",
                color: "#16a34a"
              }}
            >
              <i className="bi bi-shield-check" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Owners</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{ownersCount}</div>
            </div>
          </div>
        </div>

        {/* Card 5: Inactive */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "185px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#fef2f2",
                color: "#dc2626"
              }}
            >
              <i className="bi bi-person-x" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Inactive</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{inactiveCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTACTS DIRECTORY CARD ── */}
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
            <h5 className="fw-bold m-0" style={{ color: "var(--text-main)", fontSize: "1.1rem" }}>Contacts Directory</h5>
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <div className="position-relative">
              <i className="bi bi-search text-muted position-absolute" style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem" }}></i>
              <input
                type="text"
                placeholder="Search contacts..."
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
              value={contactTypeFilter}
              onChange={e => setContactTypeFilter(e.target.value)}
            >
              <option value="All">All Contact Types</option>
              <option value="Employee">Employee</option>
              <option value="Tenant">Tenant</option>
              <option value="Owner">Owner</option>
              <option value="Partner">Partner</option>
            </select>

            <select
              className="form-select form-select-sm"
              style={{
                width: "140px",
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
              onClick={openNewContactForm}
            >
              <i className="bi bi-plus-lg"></i> Add Contact
            </button>
          </div>
        </div>

        <Table
          columns={contactColumns}
          data={contacts}
          isLoading={isLoading}
          emptyMessage="No contacts match your search criteria."
          containerClassName="table-responsive-container table-responsive mt-0"
        />

        {/* ── PAGINATION CONTROLS ── */}
        {!isLoading && totalRecords > 0 && (
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 pt-3 border-top" style={{ fontSize: "0.825rem" }}>
            <div className="text-muted">
              Showing <span className="fw-semibold">{Math.min((currentPage - 1) * 20 + 1, totalRecords)}</span> to{" "}
              <span className="fw-semibold">{Math.min(currentPage * 20, totalRecords)}</span> of{" "}
              <span className="fw-semibold">{totalRecords}</span> contacts
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

      {viewingContact && (
        <ContactDetailView 
          viewItem={viewingContact}
          onClose={() => setViewingContact(null)}
          onEdit={(item) => {
            setViewingContact(null);
            onEdit(item);
          }}
        />
      )}
    </>
  );
}
