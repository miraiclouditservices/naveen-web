"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import HelpdeskFormModal from "@/components/helpdesk/HelpdeskFormModal";
import HelpdeskDetailView from "@/components/helpdesk/HelpdeskDetailView";
import HelpdeskFilterDrawer from "@/components/helpdesk/HelpdeskFilterDrawer";

export default function HelpdeskPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [propertyFilter, setPropertyFilter] = useState("All");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    inProgress: 0,
    waitingResponse: 0,
    resolved: 0,
    closed: 0
  });

  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Fetch properties list on mount
  useEffect(() => {
    api.get("/properties").then((res) => {
      if (res.success) {
        setProperties(res.data);
      }
    });
  }, []);

  // Fetch metrics and tickets whenever filters or page change
  useEffect(() => {
    fetchStats();
  }, [currentUser]);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, searchTerm, statusFilter, priorityFilter, categoryFilter, propertyFilter, currentUser]);

  const fetchStats = async () => {
    try {
      const response = await api.get("/helpdesk/stats");
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch helpdesk stats:", err);
    }
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "30",
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        property: propertyFilter
      });

      const response = await api.get(`/helpdesk?${queryParams.toString()}`);
      if (response.success) {
        setTickets(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
          setTotalItems(response.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (mode: "create" | "view", ticket: any = null) => {
    if (mode === "create") {
      setIsCreateOpen(true);
    } else {
      setSelectedTicket(ticket);
      setIsDetailOpen(true);
    }
  };

  const handleSaveTicket = async (savedData: any) => {
    try {
      const response = await api.post("/helpdesk", savedData);
      if (response.success) {
        await fetchTickets();
        await fetchStats();
        setIsCreateOpen(false);
      }
    } catch (err) {
      console.error("Failed to save ticket:", err);
      throw err;
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setPropertyFilter("All");
    setCurrentPage(1);
  };

  const activeFilters = [
    searchTerm.trim() !== "",
    statusFilter !== "All",
    priorityFilter !== "All",
    categoryFilter !== "All",
    propertyFilter !== "All"
  ].filter(Boolean).length;

  const columns: TableColumn<any>[] = [
    {
      header: "Ticket ID",
      render: (item) => (
        <span className="fw-bold cursor-pointer" onClick={() => handleOpenModal("view", item)} style={{ color: "#000000" }}>
          {item.ticketId}
        </span>
      )
    },
    {
      header: "Title",
      render: (item) => (
        <div style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis" }}>
          <span className="fw-bold text-dark d-block">{item.title}</span>
          <span className="text-muted extra-small">{item.category}</span>
        </div>
      )
    },
    {
      header: "Priority",
      render: (item) => (
        <span className={`badge rounded-pill px-2 py-1 border fw-bold ${item.priority === "Critical" ? "bg-danger text-white border-danger" :
          item.priority === "High" ? "bg-warning text-dark border-warning" :
            "bg-light text-dark border-secondary"
          }`}>
          {item.priority}
        </span>
      )
    },
    {
      header: "Property / Floor",
      render: (item) => (
        <div>
          <span className="fw-medium text-dark d-block">{item.property?.propertyName || "-"}</span>
          <span className="text-muted extra-small">
            {item.floor?.floorName || (item.floor?.floorNumber ? `Floor ${item.floor.floorNumber}` : "-")}
          </span>
        </div>
      )
    },
    {
      header: "Status",
      render: (item) => (
        <span className={`badge rounded-pill px-2 py-1 fw-bold border ${item.status === "OPEN" ? "bg-danger bg-opacity-10 text-danger border-danger" :
          item.status === "ASSIGNED" ? "bg-info bg-opacity-10 text-info border-info" :
            item.status === "IN_PROGRESS" ? "bg-warning bg-opacity-10 text-warning border-warning" :
              item.status === "RESOLVED" ? "bg-success bg-opacity-10 text-success border-success" :
                "bg-secondary bg-opacity-10 text-secondary border-secondary"
          }`}>
          {item.status}
        </span>
      )
    },
    {
      header: "Raised By",
      render: (item) => (
        <div>
          <span className="fw-bold text-dark d-block" style={{ fontSize: "0.78rem" }}>{item.raisedBy || "-"}</span>
          <span className="text-muted extra-small">{item.raisedRole || "-"}</span>
        </div>
      )
    },
    {
      header: "Actions",
      style: { textAlign: "right" as const },
      render: (item) => (
        <div className="d-flex justify-content-end align-items-center" onClick={(e) => e.stopPropagation()}>
          <button
            title="Open Workspace"
            onClick={() => handleOpenModal("view", item)}
            style={{
              width: 32, height: 32, borderRadius: "6px", border: "1px solid var(--border-color)",
              background: "#ffffff", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#1e293b",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f9f7f3")}
            onMouseLeave={e => (e.currentTarget.style.background = "#ffffff")}
          >
            <i className="bi bi-eye text-secondary" style={{ fontSize: "0.9rem" }}></i>
          </button>
        </div>
      )
    }
  ];

  const canCreateTicket = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "OFFICE_OWNER" || currentUser?.role === "Tenant";

  return (
    <div
      style={{
        backgroundColor: "#F9F7F3",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "var(--font-geist-sans), Inter, sans-serif",
        color: "var(--text-primary)",
      }}
    >
      {/* ── 1. HEADER SECTION ─────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold m-0" style={{ color: "#000000", fontSize: "1.5rem" }}>
            Helpdesk & Complaints
          </h2>
          <p className="text-muted m-0 mt-1" style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Manage occupant issues, maintenance requests & support tickets
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          {/* {canCreateTicket && ( */}
          <button
            onClick={() => handleOpenModal("create")}
            className="btn btn-dark btn-sm fw-bold px-3 py-2 d-flex align-items-center gap-2"
            style={{ backgroundColor: "#040404", borderColor: "#040404", borderRadius: "8px", fontSize: "0.8rem", height: "38px" }}
          >
            <i className="bi bi-plus-lg"></i> Raise Ticket
          </button>
          {/* // )} */}
          <button
            className="btn btn-sm btn-white border fw-bold px-3 py-2"
            style={{ borderRadius: "8px", fontSize: "0.8rem", backgroundColor: "#ffffff", height: "38px" }}
            onClick={() => alert("Exporting data as CSV...")}
          >
            Export
          </button>
        </div>
      </div>

      {/* ── 2. BENTO STATS ROW & FILTER TABS (Admin Only) ─────────────────── */}
      {!["COWORKING_TENANT", "COWORKING_MEMBER", "Tenant"].includes(currentUser?.role) && (
        <>
          <div className="row g-3 mb-4">
            {/* Card 1: Total Tickets */}
            <div className="col-md-2 col-sm-4 col-6">
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-ticket-perforated text-muted" style={{ fontSize: "1.1rem" }} />
                  <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Total Tickets
                  </span>
                </div>
                <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: "1.1rem" }}>
                  {(metrics.total || 0).toLocaleString("en-IN")}
                </h5>
                <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                  Support Ledger Total
                </div>
              </div>
            </div>

            {/* Card 2: Open Tickets */}
            <div className="col-md-2 col-sm-4 col-6">
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-folder-symlink text-danger" style={{ fontSize: "1.1rem" }} />
                  <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Open Tickets
                  </span>
                </div>
                <h5 className="fw-bold mb-1 text-danger" style={{ fontSize: "1.1rem" }}>
                  {(metrics.open || 0).toLocaleString("en-IN")}
                </h5>
                <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                  Immediate Attention
                </div>
              </div>
            </div>

            {/* Card 3: Assigned */}
            <div className="col-md-2 col-sm-4 col-6">
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-person-workspace text-info" style={{ fontSize: "1.1rem" }} />
                  <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Assigned
                  </span>
                </div>
                <h5 className="fw-bold mb-1 text-info" style={{ fontSize: "1.1rem" }}>
                  {(metrics.assigned || 0).toLocaleString("en-IN")}
                </h5>
                <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                  Awaiting Action
                </div>
              </div>
            </div>

            {/* Card 4: In Progress */}
            <div className="col-md-2 col-sm-4 col-6">
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-hourglass-split text-warning" style={{ fontSize: "1.1rem" }} />
                  <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    In Progress
                  </span>
                </div>
                <h5 className="fw-bold mb-1 text-warning" style={{ fontSize: "1.1rem" }}>
                  {(metrics.inProgress || 0).toLocaleString("en-IN")}
                </h5>
                <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                  Active Resolution
                </div>
              </div>
            </div>

            {/* Card 5: Resolved */}
            <div className="col-md-2 col-sm-4 col-6">
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-check2-circle text-success" style={{ fontSize: "1.1rem" }} />
                  <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Resolved
                  </span>
                </div>
                <h5 className="fw-bold mb-1 text-success" style={{ fontSize: "1.1rem" }}>
                  {(metrics.resolved || 0).toLocaleString("en-IN")}
                </h5>
                <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                  Ready for Close
                </div>
              </div>
            </div>

            {/* Card 6: Closed */}
            <div className="col-md-2 col-sm-4 col-6">
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-archive text-muted" style={{ fontSize: "1.1rem" }} />
                  <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Closed
                  </span>
                </div>
                <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: "1.1rem" }}>
                  {(metrics.closed || 0).toLocaleString("en-IN")}
                </h5>
                <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                  Completed & Archived
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. FILTER TABS & SELECTORS ────────────────────────────────────── */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            {/* Left tabs */}
            <div className="d-flex gap-1 bg-white p-1 rounded-3" style={{ border: "1px solid var(--border-color)" }}>
              {[
                { label: "All Tickets", value: "All" },
                { label: "Open", value: "OPEN" },
                { label: "Assigned", value: "ASSIGNED" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Resolved", value: "RESOLVED" },
                { label: "Closed", value: "CLOSED" }
              ].map((tab) => {
                const isAct = statusFilter === tab.value;
                return (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setStatusFilter(tab.value);
                      setCurrentPage(1);
                    }}
                    className="btn btn-sm"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      backgroundColor: isAct ? "#040404" : "transparent",
                      color: isAct ? "#FFFFFF" : "var(--text-muted)",
                      border: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Right selectors */}
            <div className="d-flex gap-2 flex-wrap">
              {/* Property Filter */}
              {(() => {
                const userAssignedPropIds = (currentUser?.assignedProperties || []).map((p: any) =>
                  typeof p === 'object' ? p._id || p.id : p
                ).filter(Boolean);
                const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ULTRA_SUPER_ADMIN';

                const selectableProperties = (isSuperAdmin || userAssignedPropIds.length === 0)
                  ? properties
                  : (currentUser?.assignedProperties && currentUser.assignedProperties.length > 0 && typeof currentUser.assignedProperties[0] === 'object')
                    ? currentUser.assignedProperties.map((p: any) => ({ _id: p._id || p.id, propertyName: p.propertyName || p.name || 'Assigned Property' }))
                    : properties.filter((p: any) => userAssignedPropIds.includes(p._id));

                return (
                  <select
                    className="form-select bg-white py-1 rounded-3"
                    style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "150px", outline: "none", boxShadow: "none" }}
                    value={propertyFilter}
                    onChange={(e) => {
                      setPropertyFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="All">All Properties</option>
                    {selectableProperties.map((p: any) => (
                      <option key={p._id} value={p._id}>{p.propertyName}</option>
                    ))}
                  </select>
                );
              })()}

              {/* Category Filter */}
              <select
                className="form-select bg-white py-1 rounded-3"
                style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "150px", outline: "none", boxShadow: "none" }}
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Categories</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
                <option value="Payment">Payment</option>
                <option value="Agreement">Agreement</option>
                <option value="Security">Security</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Complaint">Complaint</option>
                <option value="Other">Other</option>
              </select>

              {/* Priority Filter */}
              <select
                className="form-select bg-white py-1 rounded-3"
                style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "150px", outline: "none", boxShadow: "none" }}
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* ── 4. BOTTOM DIRECTORY: Helpdesk Table ───────────────────────────── */}
      <div className="row g-4 mb-4">
        <div className="col-lg-12">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              overflow: "hidden",
            }}
          >
            {/* Table Header controls */}
            <div className="p-3 bg-white d-flex justify-content-between align-items-center gap-3 flex-wrap border-bottom border-light">
              <h6 className="fw-bold m-0" style={{ fontSize: "0.95rem" }}>
                Helpdesk Directory Ledger
              </h6>
              <div className="d-flex gap-2 align-items-center">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search by title, ID, category..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="form-control form-control-sm"
                    style={{ width: "260px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.8rem" }}
                  />
                </div>
                {(searchTerm || statusFilter !== "All" || priorityFilter !== "All" || categoryFilter !== "All" || propertyFilter !== "All") && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    style={{ borderRadius: "6px", fontSize: "0.78rem" }}
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                )}
                {/* Advanced Filter Drawer toggle */}
                <button
                  className="btn btn-sm btn-white border"
                  style={{ borderRadius: "6px", backgroundColor: "#ffffff" }}
                  onClick={() => setShowFilters(true)}
                  title="Advanced Filters"
                >
                  <i className="bi bi-funnel" style={{ fontSize: "0.85rem" }} />
                </button>
              </div>
            </div>

            {/* Table Component */}
            <Table
              columns={columns}
              data={tickets}
              isLoading={isLoading}
              loadingMessage="Loading support tickets ledger..."
              emptyMessage="No tickets found matching your filter criteria."
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={10}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>

      {/* ── 5. HELPDESK FORM MODAL ────────────────────────────────────────── */}
      <HelpdeskFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveTicket}
      />

      {/* ── 6. HELPDESK DETAIL DRAWER / OVERLAY ───────────────────────────── */}
      {isDetailOpen && selectedTicket && (
        <HelpdeskDetailView
          viewItem={selectedTicket}
          onClose={() => { setIsDetailOpen(false); setSelectedTicket(null); }}
          currentUser={currentUser}
          onRefresh={() => { fetchTickets(); fetchStats(); }}
        />
      )}

      {/* ── 7. ADVANCED FILTERS DRAWER ────────────────────────────────────── */}
      <HelpdeskFilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        propertyFilter={propertyFilter}
        setPropertyFilter={setPropertyFilter}
        onReset={handleReset}
      />

      <style jsx global>{`
        .extra-small { font-size: 0.75rem !important; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}
