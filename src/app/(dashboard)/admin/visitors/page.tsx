"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/utils/api";
import VisitorFormModal from "@/components/visitors/VisitorFormModal";
import VisitorDetailView from "@/components/visitors/VisitorDetailView";
import VisitorFilterDrawer from "@/components/visitors/VisitorFilterDrawer";
import Table, { TableColumn } from "@/components/common/Table";
import { ModalMode } from "@/components/dashboard/AssetModal";


const formatDateTime = (dateStr?: string, timeStr?: string) => {
  if (!timeStr || timeStr === "-" || timeStr === "") {
    return <span className="text-muted" style={{ fontSize: "0.8rem" }}>—</span>;
  }
  let datePart = "";
  try {
    const dateObj = new Date(dateStr || "");
    if (!isNaN(dateObj.getTime())) {
      datePart = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } else {
      datePart = dateStr || "";
    }
  } catch {
    datePart = dateStr || "";
  }

  let timePart = "";
  try {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      timePart = `${displayHours}:${displayMinutes} ${ampm}`;
    } else {
      timePart = timeStr;
    }
  } catch {
    timePart = timeStr;
  }

  return (
    <div>
      <div className="fw-semibold text-dark" style={{ fontSize: "0.82rem" }}>
        {datePart}
      </div>
      <div className="text-muted" style={{ fontSize: "0.72rem", marginTop: "1px" }}>
        {timePart}
      </div>
    </div>
  );
};

export default function VisitorsPage() {
  // ── States ────────────────────────────────────────────────────────────────
  const [visitors, setVisitors] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, todayCount: 0, checkedIn: 0, pending: 0, approved: 0, checkedOut: 0, rejected: 0 });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD format
  const [purposeFilter, setPurposeFilter] = useState("All");
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Modals & Details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [confirmCheckOutId, setConfirmCheckOutId] = useState<string | null>(null);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Debounce Search input (300ms)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 300);
  };
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch Auth / Profile ──────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    api.get("/auth/me").then(res => {
      if (res.success) setCurrentUser(res.data);
    }).catch(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          try { setCurrentUser(JSON.parse(stored)); } catch {}
        }
      }
    });
  }, []);

  // ── Fetch Properties ──────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/properties").then(res => {
      if (res.success) setProperties(res.data);
    }).catch(err => console.error("Error loading properties:", err));
  }, []);

  // ── Fetch Stats ───────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await api.get("/visitors/stats");
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch visitor stats:", err);
    }
  };

  // ── Fetch Visitors from Backend ───────────────────────────────────────────
  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = [];
      queryParams.push(`page=${currentPage}`);
      queryParams.push(`limit=${limit}`);
      
      if (debouncedSearch) {
        queryParams.push(`search=${encodeURIComponent(debouncedSearch)}`);
      }
      if (dateFilter) {
        queryParams.push(`dateFilter=${encodeURIComponent(dateFilter)}`);
      }
      if (purposeFilter !== "All") {
        queryParams.push(`purpose=${encodeURIComponent(purposeFilter)}`);
      }
      
      // Wire Status Filter to backend statuses
      if (statusFilter !== "All") {
        let apiStatus = statusFilter;
        if (statusFilter === "Inside") apiStatus = "Checked-In";
        if (statusFilter === "Checked Out") apiStatus = "Checked-Out";
        queryParams.push(`status=${encodeURIComponent(apiStatus)}`);
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      const res = await api.get(`/visitors${queryString}`);
      if (res.success) {
        setVisitors(res.data);
        setTotalItems(res.total || res.count || res.data.length);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, dateFilter, purposeFilter, statusFilter]);

  useEffect(() => {
    fetchVisitors();
    fetchStats();
  }, [fetchVisitors]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFilter, purposeFilter, statusFilter, locationFilter]);

  // ── Save Visitor ──────────────────────────────────────────────────────────
  const handleSaveVisitor = async (savedData: any) => {
    try {
      const response = modalMode === "edit"
        ? await api.put(`/visitors/${savedData._id}`, savedData)
        : await api.post("/visitors", savedData);
      if (response.success) {
        fetchVisitors();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to save visitor:", err);
    }
    setIsModalOpen(false);
  };

  // ── Checkout Visitor ──────────────────────────────────────────────────────
  const handleCheckOut = async (id: string) => {
    setCheckingOutId(id);
    try {
      const response = await api.patch(`/visitors/${id}/check-out`, {});
      if (response.success) {
        fetchVisitors();
        fetchStats();
        if (viewItem && viewItem._id === id) {
          setViewItem(response.data);
        }
        return true;
      }
    } catch (err) {
      console.error("Failed to check out visitor:", err);
    } finally {
      setCheckingOutId(null);
    }
    return false;
  };

  // ── Reset Filters ─────────────────────────────────────────────────────────
  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setLocationFilter("All");
    setStatusFilter("All");
    setDateFilter("");
    setPurposeFilter("All");
    setCurrentPage(1);
    setSelectedRows([]);
  };

  // ── Row selection helpers ─────────────────────────────────────────────────
  const handleSelectRow = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(x => x !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredVisitors.map(v => v._id));
    } else {
      setSelectedRows([]);
    }
  };

  // Client-side sub-filter for Location/Property
  const filteredVisitors = visitors.filter(v => {
    if (locationFilter !== "All") {
      const propName = v.property?.propertyName || v.placeOfVisit || "Head Office";
      if (propName !== locationFilter) return false;
    }
    return true;
  });

  const handleOpenModal = (mode: ModalMode, visitor: any = null) => {
    if (mode === "view") { setViewItem(visitor); return; }
    setModalMode(mode);
    setSelectedVisitor(visitor);
    setIsModalOpen(true);
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "Admin" || currentUser?.role === "Super Admin";
  const isStaffAdmin = currentUser?.role === "STAFF_ADMIN" || currentUser?.role === "Staff Admin" || currentUser?.role === "Staff";
  const isFloorAdmin = currentUser?.role === "FLOOR_ADMIN" || currentUser?.role === "Floor Admin";
  const isOfficeOwner = currentUser?.role === "OFFICE_OWNER" || currentUser?.role === "Office Owner" || currentUser?.role === "Owner";
  const isSecurity = currentUser?.role === "Watchman" || currentUser?.role === "Security" || currentUser?.role === "WATCHMAN";
  const isCoWorkingAdmin = currentUser?.role === "COWORKING_ADMIN" || currentUser?.role === "Co-Working Admin";
  const isCoWorkingTenant = currentUser?.role === "COWORKING_TENANT" || currentUser?.role === "Co-Working Member" || currentUser?.role === "Tenant";

  const permissions = currentUser?.permissions || [];
  const hasAccess = (permission: string) => isSuperAdmin || permissions.includes(permission);

  const showAddButton = !currentUser || isSuperAdmin || isCoWorkingAdmin || isCoWorkingTenant || isStaffAdmin || isFloorAdmin || isOfficeOwner || isSecurity || hasAccess("manage_visitors");

  // ── Table Columns (Matching high fidelity mockup) ────────────────────────
  const columns: TableColumn<any>[] = [
    {
      header: "Visitor Name",
      render: (v: any) => {
        const initials = v.visitorName ? v.visitorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "VI";
        const colors = ["#4f46e5", "#0ea5e9", "#06b6d4", "#10b981", "#8b5cf6", "#ec4899"];
        const charCodeSum = v.visitorName ? v.visitorName.split("").reduce((sum: number, c: string) => sum + c.charCodeAt(0), 0) : 0;
        const color = colors[charCodeSum % colors.length];

        return (
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
              style={{ width: "32px", height: "32px", backgroundColor: color, fontSize: "0.75rem", letterSpacing: "0.02em" }}
            >
              {initials}
            </div>
            <div className="fw-bold text-dark" style={{ fontSize: "0.82rem" }}>{v.visitorName}</div>
          </div>
        );
      }
    },
    {
      header: "Phone",
      render: (v: any) => <span className="text-muted" style={{ fontSize: "0.8rem" }}>{v.visitorContactNumber || "—"}</span>
    },
    {
      header: "Purpose",
      render: (v: any) => (
        <span className="badge bg-light text-dark border px-2 py-1 fw-semibold" style={{ fontSize: "0.72rem" }}>
          {v.purpose || v.visitPurpose || "Meeting"}
        </span>
      )
    },
    {
      header: "Host",
      render: (v: any) => <span className="text-dark fw-bold" style={{ fontSize: "0.82rem" }}>{v.personToMeet || "—"}</span>
    },
    {
      header: "Location",
      render: (v: any) => <span className="text-secondary fw-semibold" style={{ fontSize: "0.8rem" }}>{v.property?.propertyName || v.placeOfVisit || "Head Office"}</span>
    },
    {
      header: "Check In",
      render: (v: any) => formatDateTime(v.visitDate, v.inTime)
    },
    {
      header: "Check Out",
      render: (v: any) => formatDateTime(v.outDate || v.visitDate, v.outTime)
    },
    {
      header: "Status",
      render: (v: any) => {
        const isInside = v.status === "Checked-In" || v.status === "Inside" || !v.outTime;
        const bg = isInside ? "#e0f2fe" : "#e8f7f0";
        const color = isInside ? "#0284c7" : "#10b981";
        const label = isInside ? "Inside" : "Checked Out";
        return (
          <span
            className="badge rounded-pill fw-bold px-2.5 py-1"
            style={{ backgroundColor: bg, color, fontSize: "0.7rem", border: `1px solid ${isInside ? "#bae6fd" : "#a7f3d0"}` }}
          >
            {label}
          </span>
        );
      }
    },
    {
      header: "Actions",
      style: { textAlign: "center" as const },
      render: (v: any) => (
        <div className="d-flex justify-content-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            title="View Details"
            onClick={() => handleOpenModal("view", v)}
            className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center"
            style={{ width: 26, height: 26 }}
          >
            <i className="bi bi-eye" style={{ fontSize: "0.75rem" }} />
          </button>
          {!isCoWorkingTenant && v.status !== "Checked-Out" && v.status !== "Checked Out" && v.outTime !== "-" && (
            <button
              title="Check Out"
              disabled={checkingOutId === v._id}
              onClick={() => setConfirmCheckOutId(v._id)}
              className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center"
              style={{ width: 26, height: 26, color: "#dc2626", backgroundColor: "#fee2e2", borderColor: "#fecaca" }}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: "0.75rem" }} />
            </button>
          )}
        </div>
      ),
    }
  ];



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
            Visitor Management System
          </h2>
          <p className="text-muted m-0 mt-1" style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Monitor, Manage & Secure Your Visitors
          </p>
        </div>
        
        <div className="d-flex gap-2 align-items-center">
          {showAddButton && (
            <button
              onClick={() => handleOpenModal("create")}
              className="btn btn-dark btn-sm fw-bold px-3 py-2 d-flex align-items-center gap-2"
              style={{ backgroundColor: "#040404", borderColor: "#040404", borderRadius: "8px", fontSize: "0.8rem", height: "38px" }}
            >
              <i className="bi bi-plus-lg"></i> Register Visitor
            </button>
          )}
          <button
            className="btn btn-sm btn-white border fw-bold px-3 py-2"
            style={{ borderRadius: "8px", fontSize: "0.8rem", backgroundColor: "#ffffff", height: "38px" }}
            onClick={() => alert("Importing CSV...")}
          >
            Import
          </button>
          <button
            className="btn btn-sm btn-white border fw-bold px-3 py-2"
            style={{ borderRadius: "8px", fontSize: "0.8rem", backgroundColor: "#ffffff", height: "38px" }}
            onClick={() => alert("Exporting data as CSV...")}
          >
            Export
          </button>
        </div>
      </div>

      {/* ── 2. BENTO STATS ROW (5 cards) ──────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Visitors */}
        <div className="col" style={{ flex: "0 0 20%", maxInlineSize: "20%", minWidth: "180px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-people text-muted" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Total Visitors
              </span>
            </div>
            <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: "1.1rem" }}>
              {(stats.total || 0).toLocaleString("en-IN")}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              All-Time Registered
            </div>
          </div>
        </div>

        {/* Card 2: Today's Visitors */}
        <div className="col" style={{ flex: "0 0 20%", maxInlineSize: "20%", minWidth: "180px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-calendar2-check text-muted" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Today's Visitors
              </span>
            </div>
            <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: "1.1rem" }}>
              {(stats.todayCount || 0).toLocaleString("en-IN")}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              Check-ins Today
            </div>
          </div>
        </div>

        {/* Card 3: Currently Inside */}
        <div className="col" style={{ flex: "0 0 20%", maxInlineSize: "20%", minWidth: "180px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-door-open text-primary" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Currently Inside
              </span>
            </div>
            <h5 className="fw-bold mb-1 text-primary animate-pulse" style={{ fontSize: "1.1rem" }}>
              {stats.checkedIn || 0}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              🟢 Live inside properties
            </div>
          </div>
        </div>

        {/* Card 4: Pre-Registrations */}
        <div className="col" style={{ flex: "0 0 20%", maxInlineSize: "20%", minWidth: "180px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-journal-check text-muted" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Pre-Registrations
              </span>
            </div>
            <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: "1.1rem" }}>
              {(stats.approved + stats.pending || 0).toLocaleString("en-IN")}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              Upcoming expected
            </div>
          </div>
        </div>

        {/* Card 5: Blacklisted */}
        <div className="col" style={{ flex: "0 0 20%", maxInlineSize: "20%", minWidth: "180px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-shield-slash text-danger" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Blacklisted
              </span>
            </div>
            <h5 className="fw-bold mb-1 text-danger" style={{ fontSize: "1.1rem" }}>
              {stats.rejected || 0}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              Restricted access
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. FILTER TABS & SELECTORS ────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        {/* Left tabs */}
        <div className="d-flex gap-1 bg-white p-1 rounded-3" style={{ border: "1px solid var(--border-color)" }}>
          {[
            { label: "All Visitors", value: "All" },
            { label: "Inside", value: "Inside" },
            { label: "Checked Out", value: "Checked Out" }
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
          <select
            className="form-select bg-white py-1 rounded-3"
            style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "150px", outline: "none", boxShadow: "none" }}
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Locations</option>
            {properties.map((p, idx) => (
              <option key={idx} value={p.propertyName}>{p.propertyName}</option>
            ))}
            <option value="Head Office">Head Office</option>
            <option value="Building A">Building A</option>
            <option value="Building B">Building B</option>
            <option value="Building C">Building C</option>
          </select>

          {/* Purpose Filter */}
          <select
            className="form-select bg-white py-1 rounded-3"
            style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "150px", outline: "none", boxShadow: "none" }}
            value={purposeFilter}
            onChange={(e) => {
              setPurposeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Purposes</option>
            <option value="Business Meeting">Business Meeting</option>
            <option value="Client Visit">Client Visit</option>
            <option value="Interview">Interview</option>
            <option value="Service">Service</option>
            <option value="Training">Training</option>
            <option value="Delivery">Delivery</option>
          </select>

          {/* Date Input */}
          <input
            type="date"
            className="form-control bg-white py-1 rounded-3"
            style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "140px", outline: "none", boxShadow: "none", color: "var(--text-muted)" }}
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ── 4. BOTTOM DIRECTORY: Visitors Table ───────────────────────────── */}
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
                Visitor Directory
              </h6>
              <div className="d-flex gap-2 align-items-center">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search visitor, host, purpose..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: "260px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.8rem" }}
                  />
                </div>
                {(searchTerm || searchQuery || locationFilter !== "All" || statusFilter !== "All" || dateFilter || purposeFilter !== "All") && (
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
                  onClick={() => setShowAdvancedFilters(true)}
                  title="Advanced Filters"
                >
                  <i className="bi bi-funnel" style={{ fontSize: "0.85rem" }} />
                </button>
              </div>
            </div>

            {/* Table Component */}
            <Table
              columns={columns}
              data={filteredVisitors}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={setCurrentPage}
              emptyMessage="No visitors match the current filters."
            />
          </div>
        </div>
      </div>

      {/* ── 5. VISITOR REGISTRATION FORM MODAL ────────────────────────────── */}
      {isModalOpen && (
        <VisitorFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVisitor}
          editData={selectedVisitor}
          mode={modalMode}
        />
      )}

      {/* ── 6. VISITOR DETAIL DRAWER / OVERLAY ────────────────────────────── */}
      {viewItem && (
        <VisitorDetailView
          viewItem={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={(item) => {
            setViewItem(null);
            handleOpenModal("edit", item);
          }}
          onCheckOut={(id) => {
            setConfirmCheckOutId(id);
          }}
          isCheckingOut={checkingOutId === viewItem._id}
        />
      )}

      {/* ── 7. ADVANCED FILTERS DRAWER ────────────────────────────────────── */}
      <VisitorFilterDrawer
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        searchTerm={searchTerm}
        setSearchTerm={v => { setSearchTerm(v); setSearchQuery(v); setDebouncedSearch(v); setCurrentPage(1); }}
        dateFilter={dateFilter}
        setDateFilter={v => { setDateFilter(v); setCurrentPage(1); }}
        purposeFilter={purposeFilter}
        setPurposeFilter={v => { setPurposeFilter(v); setCurrentPage(1); }}
        statusFilter={statusFilter}
        setStatusFilter={v => { setStatusFilter(v); setCurrentPage(1); }}
        onReset={handleReset}
      />

      {/* ── 8. CONFIRM CHECK-OUT DIALOG MODAL ─────────────────────────────── */}
      {confirmCheckOutId && (
        <div
          className="modal show d-block animate-fade-in"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1200, backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
            <div className="modal-content border-0" style={{ borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
              <div className="modal-body text-center p-4">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
                  style={{ width: 56, height: 56, backgroundColor: "#fee2e2", color: "#dc2626" }}
                >
                  <i className="bi bi-exclamation-triangle" style={{ fontSize: "1.6rem" }}></i>
                </div>
                <h5 className="fw-bold mb-2" style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>Confirm Check-Out</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                  Are you sure you want to check out this visitor? This will update their status, out date, and out time.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn px-4 py-2 fw-semibold"
                    disabled={!!checkingOutId}
                    onClick={() => setConfirmCheckOutId(null)}
                    style={{ border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem", color: "#374151", backgroundColor: "#ffffff" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn px-4 py-2 fw-semibold text-white d-flex align-items-center justify-content-center"
                    disabled={!!checkingOutId}
                    onClick={async () => {
                      const id = confirmCheckOutId;
                      const success = await handleCheckOut(id);
                      if (success) {
                        setConfirmCheckOutId(null);
                      }
                    }}
                    style={{ backgroundColor: "#dc2626", border: "none", borderRadius: "6px", fontSize: "0.85rem", minWidth: "105px" }}
                  >
                    {checkingOutId ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" style={{ width: "0.85rem", height: "0.85rem" }} />
                        Saving...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
