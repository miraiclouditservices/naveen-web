import React, { useState } from "react";
import Table, { TableColumn } from "@/components/common/Table";
import LeadDetailView from "./LeadDetailView";
import { api } from "@/utils/api";

interface LeadsManagerProps {
  leads: any[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  openNewLeadForm: () => void;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

export default function LeadsManager({
  leads,
  isLoading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onEdit,
  onDelete,
  openNewLeadForm,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
}: LeadsManagerProps) {

  const totalLeadsCount = totalRecords;
  const newLeadsCount = leads ? leads.filter(l => (l.status || "New") === "New").length : 0;
  const inProgressCount = leads ? leads.filter(l => ["Contacted", "Site Visit", "Proposal", "Negotiation"].includes(l.status)).length : 0;
  const wonCount = leads ? leads.filter(l => l.status === "Won").length : 0;
  const lostCount = leads ? leads.filter(l => l.status === "Lost").length : 0;

  const [viewingLead, setViewingLead] = useState<any | null>(null);

  const leadColumns: TableColumn<any>[] = [
    {
      header: "Lead Name",
      style: {
        position: "sticky",
        left: 0,
        zIndex: 6,
        minWidth: "150px",
        width: "150px"
      },
      render: (item) => <span className="fw-bold text-dark">{item.lead_name || "—"}</span>
    },
    {
      header: "Company Name",
      render: (item) => <span className="text-secondary">{item.companyName || "—"}</span>
    },
    {
      header: "Contact Info",
      render: (item) => (
        <div className="d-flex flex-column" style={{ fontSize: "0.8rem" }}>
          <span className="text-secondary fw-semibold">{item.phone || "—"}</span>
          <span className="text-muted" style={{ fontSize: "0.75rem", marginTop: "1px" }}>{item.email || "—"}</span>
        </div>
      )
    },
    {
      header: "Assigned To",
      render: (item) => (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: "600",
              color: "#475569",
              border: "1px solid var(--border-color)",
              backgroundImage: item.owner_id?.profileImage ? `url(${item.owner_id.profileImage})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {!item.owner_id?.profileImage && (item.owner_id?.name ? item.owner_id.name.charAt(0).toUpperCase() : "U")}
          </div>
          <span className="fw-medium text-dark">{item.owner_id?.name || "Unassigned"}</span>
        </div>
      )
    },
    {
      header: "Next Follow-up",
      render: (item) => {
        if (!item.nextFollowUp) return <span className="text-muted">—</span>;
        const dateObj = new Date(item.nextFollowUp);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const followUpDate = new Date(dateObj);
        followUpDate.setHours(0, 0, 0, 0);

        let badgeBg = "rgba(120, 120, 120, 0.08)";
        let badgeColor = "var(--text-muted)";
        if (followUpDate < today) {
          // Overdue
          badgeBg = "rgba(220, 53, 69, 0.09)";
          badgeColor = "#dc3545";
        } else if (followUpDate.getTime() === today.getTime()) {
          // Today
          badgeBg = "rgba(249, 115, 22, 0.09)";
          badgeColor = "#f97316";
        } else {
          // Future
          badgeBg = "rgba(22, 163, 74, 0.09)";
          badgeColor = "#16a34a";
        }

        return (
          <span
            className="d-inline-flex align-items-center"
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              borderRadius: "4px",
              padding: "3px 8px",
              gap: "6px",
              backgroundColor: badgeBg,
              color: badgeColor,
              border: `1px solid ${badgeColor}22`
            }}
          >
            <i className="bi bi-calendar-event" style={{ fontSize: "0.78rem" }}></i>
            <span>{formattedDate}</span>
          </span>
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
        const getStatusStyles = (status: string) => {
          switch (status) {
            case "New":
              return { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe" };
            case "Contacted":
              return { backgroundColor: "#f0f9ff", color: "#0284c7", border: "1px solid #e0f2fe" };
            case "Site Visit":
              return { backgroundColor: "#f5f3ff", color: "#7c3aed", border: "1px solid #ede9fe" };
            case "Proposal":
              return { backgroundColor: "#fff7ed", color: "#ea580c", border: "1px solid #ffedd5" };
            case "Negotiation":
              return { backgroundColor: "#fefce8", color: "#ca8a04", border: "1px solid #fef9c3" };
            case "Won":
              return { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" };
            case "Lost":
              return { backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2" };
            default:
              return { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe" };
          }
        };
        const styles = getStatusStyles(item.status || "New");
        return (
          <span
            className="badge px-2.5 py-1.5 fw-bold"
            style={{
              fontSize: "0.75rem",
              borderRadius: "var(--radius-full)",
              ...styles
            }}
          >
            {item.status || "New"}
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
            title="View Lead Details"
            onClick={async () => {
              try {
                const res = await api.get(`/crm/leads/${item._id}`);
                if (res.success && res.data) {
                  setViewingLead(res.data);
                } else {
                  setViewingLead(item);
                }
              } catch (err) {
                console.error("Error fetching lead detail:", err);
                setViewingLead(item);
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
            title="Edit Lead"
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
      <div className="row g-2 mb-4 justify-content-start">
        {/* Card 1: Total Leads */}
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
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Total Leads</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{totalLeadsCount}</div>
            </div>
          </div>
        </div>

        {/* Card 2: New Leads */}
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
              <i className="bi bi-person-plus" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>New Leads</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{newLeadsCount}</div>
            </div>
          </div>
        </div>

        {/* Card 3: In Progress */}
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
                backgroundColor: "#fff7ed",
                color: "#f97316"
              }}
            >
              <i className="bi bi-clock-history" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>In Progress</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{inProgressCount}</div>
            </div>
          </div>
        </div>

        {/* Card 4: Won */}
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
              <i className="bi bi-check-circle" style={{ fontSize: "0.95rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Won</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{wonCount}</div>
            </div>
          </div>
        </div>

        {/* Card 5: Lost */}
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
              <i className="bi bi-file-earmark-x" style={{ fontSize: "0.95rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Lost</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{lostCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LEADS DIRECTORY CARD ── */}
      <div
        className="card border-0 p-4"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px"
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-2">
          <div>
            <h5 className="fw-bold m-0" style={{ color: "var(--text-main)", fontSize: "1.1rem" }}>CRM Leads Directory</h5>
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <div className="position-relative">
              <i className="bi bi-search text-muted position-absolute" style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem" }}></i>
              <input
                type="text"
                placeholder="Search leads, phone..."
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
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
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
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
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
              onClick={openNewLeadForm}
            >
              <i className="bi bi-plus-lg"></i> Add Lead
            </button>
          </div>
        </div>

        <Table
          columns={leadColumns}
          data={leads}
          isLoading={isLoading}
          emptyMessage="No leads match your search criteria."
          containerClassName="table-responsive-container table-responsive mt-0"
        />

        {/* ── PAGINATION CONTROLS ── */}
        {!isLoading && totalRecords > 0 && (
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 pt-3 border-top" style={{ fontSize: "0.825rem" }}>
            <div className="text-muted">
              Showing <span className="fw-semibold">{Math.min((currentPage - 1) * 20 + 1, totalRecords)}</span> to{" "}
              <span className="fw-semibold">{Math.min(currentPage * 20, totalRecords)}</span> of{" "}
              <span className="fw-semibold">{totalRecords}</span> leads
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

      {viewingLead && (
        <LeadDetailView
          viewItem={viewingLead}
          onClose={() => setViewingLead(null)}
          onEdit={(item) => {
            setViewingLead(null);
            onEdit(item);
          }}
        />
      )}
    </>
  );
}
