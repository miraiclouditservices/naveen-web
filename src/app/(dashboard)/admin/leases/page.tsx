"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import RecordPaymentModal from "./RecordPaymentModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ITEMS_PER_PAGE = 10;

// ── Lease Filter Drawer Component ────────────────────────────────────────────
interface LeaseFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (status: string) => void;
  onApply: () => void;
  onReset: () => void;
}

function LeaseFilterDrawer({
  isOpen,
  onClose,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  onApply,
  onReset,
}: LeaseFilterDrawerProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.3)",
            zIndex: 1000,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : -340,
          width: 340,
          height: "100vh",
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-color)",
          zIndex: 1001,
          transition: "right 0.3s ease-in-out",
          padding: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
            Filter Agreements
          </span>
          <button onClick={onClose} className="btn-close shadow-none" style={{ fontSize: "0.8rem" }} />
        </div>

        <div className="flex-grow-1">
          {/* Role Filter */}
          <div className="mb-4">
            <label className="form-label fw-bold text-muted" style={{ fontSize: "0.76rem", textTransform: "uppercase" }}>
              Assigned User Role
            </label>
            <select
              className="form-select shadow-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ fontSize: "0.85rem", borderRadius: "6px" }}
            >
              <option value="FLOOR_ADMIN,OFFICE_OWNER">All Roles</option>
              <option value="FLOOR_ADMIN">Floor Admin</option>
              <option value="OFFICE_OWNER">Office Owner</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="mb-4">
            <label className="form-label fw-bold text-muted" style={{ fontSize: "0.76rem", textTransform: "uppercase" }}>
              Agreement Status
            </label>
            <select
              className="form-select shadow-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: "0.85rem", borderRadius: "6px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="mb-4">
            <label className="form-label fw-bold text-muted" style={{ fontSize: "0.76rem", textTransform: "uppercase" }}>
              Payment Status
            </label>
            <select
              className="form-select shadow-none"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              style={{ fontSize: "0.85rem", borderRadius: "6px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Drawer Actions */}
        <div className="d-flex gap-2 pt-3 border-top">
          <button
            onClick={onReset}
            className="btn btn-sm btn-light border flex-grow-1 py-2"
            style={{ fontSize: "0.82rem", fontWeight: 600, borderRadius: "6px" }}
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="btn btn-sm text-white flex-grow-1 py-2"
            style={{ backgroundColor: "var(--dark-section)", fontSize: "0.82rem", fontWeight: 600, borderRadius: "6px" }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

function DonutChart({ active, expiringSoon, expired, terminated }: any) {
  const total = active + expiringSoon + expired + terminated || 1;
  const activePct = (active / total) * 100;
  const expiringPct = (expiringSoon / total) * 100;
  const expiredPct = (expired / total) * 100;
  const terminatedPct = (terminated / total) * 100;

  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const createSlice = (percent: number, color: string) => {
    if (percent === 0) return null;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`
    ].join(' ');

    return <path d={pathData} fill="none" stroke={color} strokeWidth="0.4" key={color} />;
  };

  return (
    <div className="d-flex align-items-center gap-4">
      <div style={{ position: "relative", width: "120px", height: "120px" }}>
        <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
          {createSlice(activePct / 100, "#22c55e")}
          {createSlice(expiringPct / 100, "#f59e0b")}
          {createSlice(expiredPct / 100, "#ef4444")}
          {createSlice(terminatedPct / 100, "var(--text-muted)")}
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
          <div className="fw-bold text-dark fs-5">{active + expiringSoon + expired + terminated}</div>
          <div className="text-muted" style={{ fontSize: "0.65rem" }}>Total</div>
        </div>
      </div>
      <div className="d-flex flex-column gap-2" style={{ fontSize: "0.8rem" }}>
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2"><div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e" }}></div><span className="text-dark">Active</span></div>
          <span className="fw-bold">{active} <span className="text-muted fw-normal">({Math.round(activePct)}%)</span></span>
        </div>
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2"><div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f59e0b" }}></div><span className="text-dark">Expiring Soon</span></div>
          <span className="fw-bold">{expiringSoon} <span className="text-muted fw-normal">({Math.round(expiringPct)}%)</span></span>
        </div>
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2"><div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#ef4444" }}></div><span className="text-dark">Expired</span></div>
          <span className="fw-bold">{expired} <span className="text-muted fw-normal">({Math.round(expiredPct)}%)</span></span>
        </div>
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2"><div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--text-muted)" }}></div><span className="text-dark">Terminated</span></div>
          <span className="fw-bold">{terminated} <span className="text-muted fw-normal">({Math.round(terminatedPct)}%)</span></span>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; val: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 text-muted" style={{ minHeight: "120px", fontSize: "0.8rem" }}>
        No upcoming lease expirations
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.val), 5);

  return (
    <div className="d-flex align-items-end justify-content-between h-100 pb-2" style={{ minHeight: "120px" }}>
      {data.map((d, i) => (
        <div key={i} className="d-flex flex-column align-items-center gap-2" style={{ width: `${Math.floor(80 / data.length)}%` }}>
          <div className="fw-bold text-dark" style={{ fontSize: "0.7rem" }}>{d.val}</div>
          <div 
            style={{ 
              width: "100%", 
              height: `${(d.val / maxVal) * 80}px`, 
              backgroundColor: "#60a5fa", 
              borderRadius: "4px 4px 0 0", 
              opacity: 0.9,
              transition: "height 0.3s ease"
            }}
          ></div>
          <div className="text-muted text-center" style={{ fontSize: "0.65rem", whiteSpace: "nowrap" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── LeasesContent Component ──────────────────────────────────────────────────
function LeasesContent() {
  const [leases, setLeases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [leaseStats, setLeaseStats] = useState({
    totalLeases: 0,
    activeLeases: 0,
    expiringSoon: 0,
    expiredLeases: 0,
    terminated: 0,
    trends: {
      totalLeases: 0,
      activeLeases: 0,
      expiringSoon: 0,
      expiredLeases: 0
    },
    timeline: [] as any[]
  });

  // Search, Filters and Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("FLOOR_ADMIN,OFFICE_OWNER");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [timelineRange, setTimelineRange] = useState<number>(6);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [paymentUpdateUser, setPaymentUpdateUser] = useState<any | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 400);
  };

  const buildQuery = useCallback(() => {
    const q: Record<string, string> = {
      page: String(currentPage),
      limit: String(ITEMS_PER_PAGE),
    };
    if (debouncedSearch.trim()) q.search = debouncedSearch.trim();
    if (statusFilter !== "All") q.status = statusFilter;
    return new URLSearchParams(q).toString();
  }, [currentPage, debouncedSearch, statusFilter]);

  const fetchLeasesList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/leases?${buildQuery()}`);
      if (res.success) {
        setLeases(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalItems(res.total || res.data?.length || 0);

        if (res.summary) {
          setLeaseStats({
            totalLeases: res.summary.totalLeases || 0,
            activeLeases: res.summary.activeLeases || 0,
            expiringSoon: res.summary.expiringSoon || 0,
            expiredLeases: res.summary.expiredLeases || 0,
            terminated: res.summary.terminated || 0,
            trends: { totalLeases: 0, activeLeases: 0, expiringSoon: 0, expiredLeases: 0 },
            timeline: []
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetchLeasesList();
  }, [fetchLeasesList]);

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const handleReset = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setRoleFilter("FLOOR_ADMIN,OFFICE_OWNER");
    setStatusFilter("All");
    setPaymentStatusFilter("All");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const activeFilters = [
    debouncedSearch.trim() !== "",
    roleFilter !== "FLOOR_ADMIN,OFFICE_OWNER",
    statusFilter !== "All",
    paymentStatusFilter !== "All",
  ].filter(Boolean).length;

  const getDurationInMonths = (start: any, end: any) => {
    if (!start || !end) return "0 Months";
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "0 Months";
    
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    
    if (e.getDate() < s.getDate() - 1) {
      months--;
    }
    
    if (months <= 0) {
      return `${totalDays} Day${totalDays > 1 ? 's' : ''}`;
    }
    return `${months} Month${months > 1 ? 's' : ''}`;
  };

  const getTotalDays = (start: any, end: any) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diffTime = e.getTime() - s.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getDaysRemainingText = (endDateStr: any) => {
    if (!endDateStr) return null;
    const endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return { text: `Expired ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`, color: "#ef4444" };
    } else if (diffDays === 0) {
      return { text: "Expires today", color: "#f59e0b" };
    } else {
      return { text: `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`, color: diffDays <= 60 ? "#ef6c00" : "#71717a" };
    }
  };

  const getAgreementStatusBadge = (u: any) => {
    const status = u.agreementStatus || "Active";
    const endDateStr = u.floorAssignmentEndDate;

    let displayStatus = status;
    let bg = "#e8f5e9";
    let color = "#2e7d32";

    if (status === "Active" && endDateStr) {
      const endDate = new Date(endDateStr);
      if (!isNaN(endDate.getTime())) {
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          displayStatus = "Expired";
        } else if (diffDays <= 60) {
          displayStatus = "Expiring Soon";
        }
      }
    }

    if (displayStatus === "Active") {
      bg = "#e8f5e9";
      color = "#2e7d32";
    } else if (displayStatus === "Expiring Soon") {
      bg = "#fff3e0";
      color = "#ef6c00";
    } else if (displayStatus === "Expired" || displayStatus === "Suspended") {
      bg = "#ffebee";
      color = "#c62828";
    } else {
      bg = "#f3e8fd";
      color = "#a142f4";
    }

    return (
      <span
        className="badge rounded-pill px-2.5 py-1.5 fw-semibold"
        style={{ backgroundColor: bg, color: color, fontSize: "0.72rem" }}
      >
        {displayStatus}
      </span>
    );
  };

  const getNextDueDate = (u: any) => {
    if (u.paymentStatus === "Paid") {
      return <span className="text-success fw-bold">Paid</span>;
    }
    if (u.nextDueDate) return formatDate(u.nextDueDate);
    if (u.floorAssignmentStartDate) {
      const d = new Date(u.floorAssignmentStartDate);
      d.setMonth(d.getMonth() + 1);
      return formatDate(d);
    }
    return "—";
  };

  const columns: TableColumn<any>[] = [
    {
      header: "Tenant / Company",
      render: (item) => (
        <div>
          <Link href={`/admin/leases/${item._id}`} className="fw-bold text-dark text-decoration-none small d-block mb-0.5">
            {item.tenantName || item.name || item.companyName || "N/A"}
          </Link>
          <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
            {item.tenantEmail || item.email || item.tenantContact || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Property / Unit",
      render: (item) => {
        let propName = item.property?.propertyName || item.property?.building || "N/A";
        let floorName = item.floor?.floorName || (item.floor?.floorNumber ? `Floor ${item.floor.floorNumber}` : "N/A");
        let unitName = Array.isArray(item.units) && item.units.length > 0
          ? item.units.map((u: any) => typeof u === "object" ? `Office ${u.unitNumber}` : `Office ${u}`).join(", ")
          : "N/A";

        return (
          <div>
            <div className="fw-bold text-dark small">
              {propName}, {unitName}
            </div>
            <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
              {floorName}
            </div>
          </div>
        );
      },
    },
    {
      header: "Lease Type",
      render: (item) => (
        <span
          className="badge rounded-pill"
          style={{
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            fontSize: "0.72rem",
            fontWeight: "600",
            padding: "6px 12px",
            border: "1px solid #dbeafe"
          }}
        >
          {item.leaseType || "Commercial"}
        </span>
      ),
    },
    {
      header: "Agreement Period",
      render: (item) => {
        const start = item.startDate || item.agreementStartDate || item.floorAssignmentStartDate;
        const end = item.endDate || item.agreementEndDate || item.floorAssignmentEndDate;
        const duration = item.durationMonths ? `${item.durationMonths} Month${item.durationMonths > 1 ? 's' : ''}` : getDurationInMonths(start, end);
        const totalDays = item.durationDays || getTotalDays(start, end);
        const daysInfo = getDaysRemainingText(end);
        return (
          <div>
            <div className="fw-bold text-dark small">
              {formatDate(start)} - {formatDate(end)}
            </div>
            <div className="text-muted small d-flex flex-column gap-0.5" style={{ fontSize: "0.75rem" }}>
              <span>({duration} / {totalDays} Days)</span>
              {daysInfo && (
                <span className="fw-semibold" style={{ color: daysInfo.color }}>
                  {daysInfo.text}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Monthly Rent",
      render: (item) => (
        <span className="fw-bold text-dark small">
          ₹{Number(item.monthlyRent || item.monthlyManagementAmount || item.totalMonthlyAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Due/Expire Count",
      render: (item) => {
        const count = item.dueExpireCount || (item.status === 'Expiring Soon' || item.status === 'Expired' ? 1 : 0);
        return (
          <span
            className="badge rounded-pill fw-bold"
            style={{
              backgroundColor: count > 0 ? "#fef2f2" : "#f4f4f5",
              color: count > 0 ? "#ef4444" : "#71717a",
              fontSize: "0.72rem",
              padding: "6px 12px",
              border: `1px solid ${count > 0 ? "#fca5a5" : "#e4e4e7"}`
            }}
          >
            {count} Alerts
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (item) => getAgreementStatusBadge(item),
    },
    {
      header: "Action",
      style: { textAlign: "right" as const },
      render: (item) => (
        <div className="d-flex align-items-center justify-content-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/admin/leases/${item._id}`}
            title="View Details"
            className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm border border-light-subtle bg-white"
            style={{ width: "32px", height: "32px" }}
          >
            <i className="bi bi-eye text-secondary" style={{ fontSize: "0.95rem" }}></i>
          </Link>
        </div>
      ),
    },
  ];
  const renderTrend = (val: number) => {
    if (val === 0) return (
      <div className="text-muted mt-2" style={{ fontSize: "0.7rem" }}>
        <span className="text-secondary fw-bold">—</span> from last month
      </div>
    );
    const isPos = val > 0;
    const color = isPos ? "text-success" : "text-danger";
    const arrow = isPos ? "↑" : "↓";
    return (
      <div className="text-muted mt-2" style={{ fontSize: "0.7rem" }}>
        <span className={`${color} fw-bold`}>{arrow} {Math.abs(val)}%</span> from last month
      </div>
    );
  };

  return (
    <div className="container-fluid p-2" style={{ backgroundColor: "", minHeight: "100vh", fontFamily: "var(--font-geist-sans)" }}>

      {/* Top Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div 
            className="card border p-3 h-100 bg-white" 
            onClick={() => { setStatusFilter("All"); setCurrentPage(1); }}
            style={{ 
              borderRadius: "10px", 
              borderColor: statusFilter === "All" ? "#3b82f6" : "var(--border-color)", 
              borderWidth: statusFilter === "All" ? "2px" : "1px",
              boxShadow: statusFilter === "All" ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="rounded p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#eff6ff" }}>
                <i className="bi bi-file-earmark-text text-primary" style={{ fontSize: "1.1rem" }}></i>
              </div>
              <div>
                <span className="text-muted fw-semibold d-block" style={{ fontSize: "0.75rem" }}>Total Leases</span>
                <h4 className="fw-bold text-dark mb-0">{leaseStats.totalLeases}</h4>
              </div>
            </div>
            {renderTrend(leaseStats.trends.totalLeases)}
          </div>
        </div>

        <div className="col-md-3">
          <div 
            className="card border p-3 h-100 bg-white" 
            onClick={() => { setStatusFilter("Active"); setCurrentPage(1); }}
            style={{ 
              borderRadius: "10px", 
              borderColor: statusFilter === "Active" ? "#22c55e" : "var(--border-color)", 
              borderWidth: statusFilter === "Active" ? "2px" : "1px",
              boxShadow: statusFilter === "Active" ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="rounded p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f0fdf4" }}>
                <i className="bi bi-check-circle text-success" style={{ fontSize: "1.1rem" }}></i>
              </div>
              <div>
                <span className="text-muted fw-semibold d-block" style={{ fontSize: "0.75rem" }}>Active Leases</span>
                <h4 className="fw-bold text-dark mb-0">{leaseStats.activeLeases}</h4>
              </div>
            </div>
            {renderTrend(leaseStats.trends.activeLeases)}
          </div>
        </div>

        <div className="col-md-3">
          <div 
            className="card border p-3 h-100 bg-white" 
            onClick={() => { setStatusFilter("Expiring Soon"); setCurrentPage(1); }}
            style={{ 
              borderRadius: "10px", 
              borderColor: statusFilter === "Expiring Soon" ? "#f59e0b" : "var(--border-color)", 
              borderWidth: statusFilter === "Expiring Soon" ? "2px" : "1px",
              boxShadow: statusFilter === "Expiring Soon" ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="rounded p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fffbeb" }}>
                <i className="bi bi-clock text-warning" style={{ fontSize: "1.1rem" }}></i>
              </div>
              <div>
                <span className="text-muted fw-semibold d-block" style={{ fontSize: "0.75rem" }}>Expiring Soon</span>
                <h4 className="fw-bold text-dark mb-0">{leaseStats.expiringSoon}</h4>
              </div>
            </div>
            {renderTrend(leaseStats.trends.expiringSoon)}
          </div>
        </div>

        <div className="col-md-3">
          <div 
            className="card border p-3 h-100 bg-white" 
            onClick={() => { setStatusFilter("Expired"); setCurrentPage(1); }}
            style={{ 
              borderRadius: "10px", 
              borderColor: statusFilter === "Expired" ? "#ef4444" : "var(--border-color)", 
              borderWidth: statusFilter === "Expired" ? "2px" : "1px",
              boxShadow: statusFilter === "Expired" ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="rounded p-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fef2f2" }}>
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: "1.1rem" }}></i>
              </div>
              <div>
                <span className="text-muted fw-semibold d-block" style={{ fontSize: "0.75rem" }}>Expired Leases</span>
                <h4 className="fw-bold text-dark mb-0">{leaseStats.expiredLeases}</h4>
              </div>
            </div>
            {renderTrend(leaseStats.trends.expiredLeases)}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border p-3 h-100 bg-white" style={{ borderRadius: "10px" }}>
            <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "0.85rem" }}>Lease Status Overview</h6>
            <DonutChart 
              active={leaseStats.activeLeases} 
              expiringSoon={leaseStats.expiringSoon} 
              expired={leaseStats.expiredLeases} 
              terminated={leaseStats.terminated} 
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border p-3 h-100 bg-white" style={{ borderRadius: "10px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.85rem" }}>Lease Expiry Timeline</h6>
              <select 
                className="form-select form-select-sm border-0 bg-light fw-semibold" 
                style={{ width: "auto", fontSize: "0.75rem" }}
                value={timelineRange}
                onChange={(e) => setTimelineRange(Number(e.target.value))}
              >
                <option value={3}>Next 3 Months</option>
                <option value={6}>Next 6 Months</option>
                <option value={12}>Next 12 Months</option>
              </select>
            </div>
            <BarChart data={leaseStats.timeline.slice(0, timelineRange)} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div
        className="p-0 d-flex flex-column bg-white border rounded-4"
        style={{ height: "calc(100vh - 200px)", minHeight: "550px", overflow: "hidden", borderColor: "var(--border-color)", boxShadow: "none" }}
      >
        <LeaseFilterDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          paymentStatusFilter={paymentStatusFilter}
          setPaymentStatusFilter={setPaymentStatusFilter}
          onApply={() => {
            setCurrentPage(1);
            setShowFilters(false);
          }}
          onReset={handleReset}
        />

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2 flex-shrink-0" style={{ backgroundColor: "var(--bg-card)" }}>
          <div>
            <span className="fw-bold text-dark" style={{ fontSize: "1rem" }}>
              Tenant Lease Agreements
            </span>
            <div className="text-muted mt-1" style={{ fontSize: "0.72rem" }}>
              Review occupant assignments, contract terms, billing schedules, and ledger entries
            </div>
          </div>

          {/* Controls */}
          <div className="d-flex gap-2 align-items-center">
            {/* Search bar */}
            <div className="position-relative">
              <input
                type="text"
                className="form-control shadow-none"
                placeholder="Search agreements..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  width: 210,
                  height: 40,
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.82rem",
                  paddingRight: 32,
                }}
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: "1.1rem",
                  }}
                >
                  &times;
                </button>
              ) : (
                <i className="bi bi-search position-absolute text-muted" style={{ right: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem" }} />
              )}
            </div>

            {/* Filters Toggle Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 position-relative"
              style={{
                height: 40,
                fontSize: "0.82rem",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                fontWeight: 500,
                backgroundColor: activeFilters > 0 ? "var(--bg-app)" : "var(--bg-card)",
              }}
            >
              <i className="bi bi-funnel" /> Filters
              {activeFilters > 0 && (
                <span
                  className="position-absolute bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    top: -6,
                    right: -6,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    fontSize: "0.68rem",
                    backgroundColor: "var(--dark-section)",
                  }}
                >
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-grow-1 overflow-hidden d-flex flex-column">
          <Table
            columns={columns}
            data={leases}
            isLoading={isLoading}
            loadingMessage="Loading lease agreements..."
            emptyMessage="No active agreements matching the filters."
            containerClassName="table-responsive-container table-responsive"
            containerStyle={{ flexGrow: 1, overflowY: "auto" }}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* RECORD PAYMENT MODAL */}
        {paymentUpdateUser && (
          <RecordPaymentModal
            user={paymentUpdateUser}
            onClose={() => setPaymentUpdateUser(null)}
            onSuccess={() => {
              setPaymentUpdateUser(null);
              fetchLeasesList();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function LeasesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeasesContent />
    </Suspense>
  );
}
