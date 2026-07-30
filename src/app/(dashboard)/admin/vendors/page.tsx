"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import VendorFormModal from "@/components/vendors/VendorFormModal";
import VendorDetailView from "@/components/vendors/VendorDetailView";

const ITEMS_PER_PAGE = 10;

// Reusable Donut Chart Component (styled exactly like Payments page)
const DonutChart = ({ data, totalText }: { data: { label: string; value: number; color: string }[]; totalText: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  if (total === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: "150px" }}>
        <span className="text-muted small">No data</span>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center gap-4 flex-wrap justify-content-center">
      <div className="position-relative" style={{ width: "130px", height: "130px" }}>
        <svg viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
          {data.map((slice, i) => {
            if (slice.value === 0) return null;
            const startPercent = cumulativePercent;
            const slicePercent = slice.value / total;
            cumulativePercent += slicePercent;

            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

            if (slicePercent === 1) {
              return (
                <circle key={i} cx="0" cy="0" r="0.75" fill="none" stroke={slice.color} strokeWidth="0.3" />
              );
            }

            const pathData = [
              `M ${startX * 0.75} ${startY * 0.75}`,
              `A 0.75 0.75 0 ${largeArcFlag} 1 ${endX * 0.75} ${endY * 0.75}`,
            ].join(" ");

            return (
              <path
                key={i}
                d={pathData}
                fill="none"
                stroke={slice.color}
                strokeWidth="0.25"
              />
            );
          })}
        </svg>
        <div className="position-absolute start-50 top-50 translate-middle text-center" style={{ width: "70%" }}>
          <div className="fw-bold" style={{ fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: "1.1" }}>{totalText}</div>
          <div className="text-muted" style={{ fontSize: "0.6rem" }}>Vendors</div>
        </div>
      </div>
      <div className="flex-grow-1" style={{ minWidth: "120px" }}>
        {data.map((item, i) => {
          const percent = Math.round((item.value / total) * 100) || 0;
          return (
            <div key={i} className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: "0.75rem" }}>
              <div className="d-flex align-items-center gap-2" style={{ color: "var(--text-muted)", fontWeight: "500" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color, display: "inline-block" }}></span>
                {item.label}
              </div>
              <span className="fw-bold" style={{ color: "var(--text-primary)" }}>{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Rating Distribution Chart Component (styled exactly like Payments CashFlowTrendChart)
const RatingDistributionChart = ({ ratings }: { ratings: { name: string; count: number; color: string }[] }) => {
  const maxVal = Math.max(...ratings.map((r) => r.count), 0);

  return (
    <div className="position-relative" style={{ height: "180px" }}>
      <div className="d-flex justify-content-between align-items-end h-100 pb-3" style={{ borderBottom: "1px solid var(--border-color)" }}>
        {ratings.map((r) => {
          const heightPercent = maxVal > 0 ? (r.count / maxVal) * 100 : 0;
          return (
            <div
              key={r.name}
              className="d-flex flex-column align-items-center position-relative"
              style={{ width: `${100 / ratings.length}%`, height: "130px" }}
            >
              {/* Stacked Bar container */}
              <div className="d-flex flex-column justify-content-end w-50 h-100 rounded-1 overflow-hidden" style={{ backgroundColor: "#F9F7F3" }}>
                <div style={{ height: `${heightPercent}%`, backgroundColor: r.color }}></div>
              </div>
              <span className="text-muted mt-2 text-center" style={{ fontSize: "0.68rem", whiteSpace: "nowrap" }}>{r.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function VendorsPage() {
  // ── Server Data ───────────────────────────────────────────────────────────
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [properties, setProperties] = useState<any[]>([]);

  // Bento Stats State
  const [stats, setStats] = useState<any>({
    totalVendors: 0,
    activeVendors: 0,
    contractExpiring: 0,
    pendingPayments: 0,
    monthlyExpense: 0,
    openComplaints: 0
  });

  // ── Filter States ──────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Sub-Filters (Category, Property, Status, Payment Status)
  const [serviceTypeFilter, setServiceTypeFilter] = useState("All");
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");

  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // ── Debounce search input (300ms) ─────────────────────────────────────────
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 300);
  };

  // ── Fetch Properties for Filter ───────────────────────────────────────────
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await api.get("/properties");
        if (res.success) setProperties(res.data);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      }
    };
    loadProperties();
  }, []);

  // ── Build API query params ────────────────────────────────────────────────
  const buildParams = useCallback(() => {
    const params: Record<string, string> = {
      page: String(currentPage),
      limit: String(ITEMS_PER_PAGE),
    };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (statusFilter !== "All") params.status = statusFilter;
    if (serviceTypeFilter !== "All") params.vendorCategory = serviceTypeFilter;
    return new URLSearchParams(params).toString();
  }, [currentPage, debouncedSearch, statusFilter, serviceTypeFilter]);

  // ── Fetch vendors from backend ────────────────────────────────────────────
  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/vendors?${buildParams()}`);
      if (res.success) {
        setVendors(res.data);
        setTotalItems(res.total ?? res.data.length);
        setTotalPages(res.pages ?? 1);
      }
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // ── Fetch Stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/vendors/stats");
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [vendors, fetchStats]);

  // ── Save (create / edit) ──────────────────────────────────────────────────
  const handleSave = async (data: any) => {
    try {
      setIsSubmitting(true);
      const res = modalMode === "edit"
        ? await api.put(`/vendors/${data._id}`, data)
        : await api.post("/vendors", data);
      
      if (res.success) {
        fetchVendors();
        fetchStats();
        if (selectedVendorId === data._id) {
          setSelectedVendorId(null);
          setTimeout(() => setSelectedVendorId(data._id), 50);
        }
      }
    } catch (err) {
      console.error("Failed to save vendor:", err);
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  // ── Toggle Status ─────────────────────────────────────────────────────────
  const handleToggleStatus = async (vendor: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = vendor.status === "Active" ? "Inactive" : "Active";
    try {
      setVendors(prev =>
        prev.map(v => (v._id === vendor._id ? { ...v, status: newStatus } : v))
      );
      const res = await api.put(`/vendors/${vendor._id}`, { status: newStatus });
      if (res.success) {
        fetchStats();
      } else {
        fetchVendors();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      fetchVendors();
    }
  };

  // ── Reset all filters ─────────────────────────────────────────────────────
  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setServiceTypeFilter("All");
    setPropertyFilter("All");
    setStatusFilter("All");
    setPaymentStatusFilter("All");
    setCurrentPage(1);
  };

  // ── Dynamic Payment Status Calculation ───────────────────────────────────
  const getPaymentStatus = (v: any) => {
    if (!v.invoices || v.invoices.length === 0) return "Paid";
    const total = v.invoices.reduce((acc: number, inv: any) => acc + (inv.totalAmount || inv.invoiceAmount || 0), 0);
    const paid = v.payments ? v.payments.reduce((acc: number, p: any) => acc + (p.paidAmount || 0), 0) : 0;
    if (paid >= total) return "Paid";
    
    const today = new Date();
    const hasOverdue = v.invoices.some((inv: any) => {
      const due = inv.dueDate ? new Date(inv.dueDate) : null;
      const invPaid = v.payments ? v.payments.filter((p: any) => p.invoiceReference === inv.invoiceNumber).reduce((a: number, b: any) => a + (b.paidAmount || 0), 0) : 0;
      const invTotal = inv.totalAmount || inv.invoiceAmount || 0;
      return due && due < today && invPaid < invTotal;
    });
    
    return hasOverdue ? "Overdue" : "Pending";
  };

  // ── Property Assigned synthesis ──────────────────────────────────────────
  const getPropertyAssigned = (v: any) => {
    if (v.services && v.services.length > 0) {
      const prop = v.services[0].assignedProperty;
      if (prop) return prop.propertyName || "Assigned Property";
    }
    if (v.addressLine1 || v.city) {
      return v.city || "Local";
    }
    return "Skyline Towers";
  };

  // ── Client-side filters for Property & Payment Status ─────────────────────
  const filteredVendors = vendors.filter(v => {
    if (propertyFilter !== "All") {
      const hasProp = v.services?.some((s: any) => s.assignedProperty === propertyFilter || s.assignedProperty?._id === propertyFilter);
      const matchesName = v.services?.some((s: any) => s.assignedProperty?.propertyName === propertyFilter);
      const matchesCity = v.city === propertyFilter;
      if (!hasProp && !matchesName && !matchesCity && getPropertyAssigned(v) !== propertyFilter) return false;
    }

    if (paymentStatusFilter !== "All") {
      const status = getPaymentStatus(v);
      if (status !== paymentStatusFilter) return false;
    }

    return true;
  });

  // ── Row Selection ─────────────────────────────────────────────────────────
  const handleSelectRow = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(x => x !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredVendors.map(v => v._id));
    } else {
      setSelectedRows([]);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns: TableColumn<any>[] = [
    {
      header: (
        <input
          type="checkbox"
          className="form-check-input"
          checked={filteredVendors.length > 0 && selectedRows.length === filteredVendors.length}
          onChange={handleSelectAll}
          onClick={e => e.stopPropagation()}
        />
      ),
      style: { width: 40 },
      render: (v: any) => (
        <input
          type="checkbox"
          className="form-check-input"
          checked={selectedRows.includes(v._id)}
          onChange={e => handleSelectRow(v._id, e)}
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    {
      header: "Vendor Profile",
      render: (v: any) => {
        const initials = v.vendorName ? v.vendorName.split(" ").map((n: string) => n[0]).join("").substring(0, 3).toUpperCase() : "VEN";
        const colors: Record<string, string> = {
          Security: "#1e3a8a",
          Housekeeping: "#047857",
          Maintenance: "#b45309",
          AMC: "#6d28d9",
          "IT Support": "#0369a1",
          Transport: "#4f46e5",
          Supplier: "#be123c"
        };
        const bgColor = colors[v.vendorCategory] || "#334155";
        return (
          <div className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
               style={{ width: 34, height: 34, backgroundColor: bgColor, fontSize: "0.75rem", letterSpacing: "0.02em" }}>
            {initials}
          </div>
        );
      }
    },
    {
      header: "Vendor ID",
      render: (v: any) => <span className="fw-semibold text-secondary" style={{ fontSize: "0.8rem" }}>{v.vendorCode}</span>
    },
    {
      header: "Company Name",
      render: (v: any) => (
        <div className="fw-bold text-dark" style={{ fontSize: "0.85rem", cursor: "pointer" }} onClick={() => setSelectedVendorId(v._id)}>
          {v.companyName || v.vendorName}
        </div>
      )
    },
    {
      header: "Service Type",
      render: (v: any) => (
        <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: "0.74rem", fontWeight: 600 }}>
          {v.vendorCategory || "Other"}
        </span>
      )
    },
    {
      header: "Contact Person",
      render: (v: any) => <span className="text-dark fw-semibold" style={{ fontSize: "0.82rem" }}>{v.contactName || "—"}</span>
    },
    {
      header: "Phone",
      render: (v: any) => <span className="text-muted" style={{ fontSize: "0.8rem" }}>{v.contactNumber || v.mobileNumber || "—"}</span>
    },
    {
      header: "Property Assigned",
      render: (v: any) => <span className="text-secondary fw-medium" style={{ fontSize: "0.82rem" }}>{getPropertyAssigned(v)}</span>
    },
    {
      header: "Payment Status",
      render: (v: any) => {
        const payStatus = getPaymentStatus(v);
        let pillClass = "bg-success bg-opacity-10 text-success border-success";
        if (payStatus === "Pending") pillClass = "bg-warning bg-opacity-10 text-warning border-warning";
        if (payStatus === "Overdue") pillClass = "bg-danger bg-opacity-10 text-danger border-danger";
        return (
          <span className={`badge border rounded-pill px-3 py-1 ${pillClass}`} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
            {payStatus}
          </span>
        );
      }
    },
    {
      header: "Status",
      render: (v: any) => (
        <span
          onClick={(e) => handleToggleStatus(v, e)}
          className={`badge rounded-pill px-3 py-1 ${
            v.status === "Active"
              ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25"
              : "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
          }`}
          style={{ fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", userSelect: "none" }}
          title="Click to toggle status"
        >
          {v.status || "Active"}
        </span>
      ),
    },
    {
      header: "Actions",
      style: { textAlign: "center" as const },
      render: (v: any) => (
        <div className="d-flex justify-content-center gap-1">
          <button
            title="View Details"
            onClick={(e) => { e.stopPropagation(); setSelectedVendorId(v._id); }}
            className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center"
            style={{ width: 26, height: 26 }}
          >
            <i className="bi bi-eye" style={{ fontSize: "0.75rem" }} />
          </button>
          <button
            title="Edit"
            onClick={(e) => { e.stopPropagation(); setSelectedVendorForEdit(v); setModalMode("edit"); setShowModal(true); }}
            className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center"
            style={{ width: 26, height: 26 }}
          >
            <i className="bi bi-pencil" style={{ fontSize: "0.75rem" }} />
          </button>
        </div>
      ),
    },
  ];

  // ── Gather Donut Data dynamically ─────────────────────────────────────────
  const categoryCounts: Record<string, number> = {};
  vendors.forEach(v => {
    const cat = v.vendorCategory || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const donutData = Object.entries(categoryCounts).map(([label, val]) => {
    const colors: Record<string, string> = {
      Security: "#1e3a8a",
      Housekeeping: "#047857",
      Maintenance: "#b45309",
      AMC: "#6d28d9",
      "IT Support": "#0369a1",
      Transport: "#4f46e5",
      Supplier: "#be123c"
    };
    return {
      label,
      value: val,
      color: colors[label] || "#4b5563"
    };
  });

  // ── Gather Rating Distribution dynamically ───────────────────────────────
  const ratingDistribution = [
    { name: "Excellent (4.5+)", count: vendors.filter(v => (v.performance?.rating ?? 5.0) >= 4.5).length, color: "#10b981" },
    { name: "Good (4.0-4.5)", count: vendors.filter(v => (v.performance?.rating ?? 5.0) >= 4.0 && (v.performance?.rating ?? 5.0) < 4.5).length, color: "#f59e0b" },
    { name: "Average (3.5-4.0)", count: vendors.filter(v => (v.performance?.rating ?? 5.0) >= 3.5 && (v.performance?.rating ?? 5.0) < 4.0).length, color: "#4f46e5" },
    { name: "Poor (<3.5)", count: vendors.filter(v => (v.performance?.rating ?? 5.0) < 3.5).length, color: "#ef4444" }
  ];

  // ── Gather Top Performing Vendors ─────────────────────────────────────────
  const topPerformingVendors = [...vendors]
    .sort((a, b) => (b.performance?.rating ?? 5.0) - (a.performance?.rating ?? 5.0))
    .slice(0, 4);

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
            Vendor Management
          </h2>
          <p className="text-muted m-0 mt-1" style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Manage service providers, contracts, payments and vendor performance
          </p>
        </div>
        
        <div className="d-flex gap-2 align-items-center">
          <button
            onClick={() => {
              setSelectedVendorForEdit(null);
              setModalMode("create");
              setShowModal(true);
            }}
            className="btn btn-dark btn-sm fw-bold px-3 py-2 d-flex align-items-center gap-2"
            style={{ backgroundColor: "#040404", borderRadius: "8px", fontSize: "0.8rem", height: "38px" }}
          >
            <i className="bi bi-plus-lg"></i> Add Vendor
          </button>
          <button
            className="btn btn-sm btn-white border fw-bold px-3 py-2"
            style={{ borderRadius: "8px", fontSize: "0.8rem", backgroundColor: "#ffffff", height: "38px" }}
            onClick={() => alert("Import functionality coming soon!")}
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

      {/* ── 2. STATS CARDS GRID ───────────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {/* Card 1 */}
        <div className="col-md-3">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-people text-muted" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Total Vendors
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              {stats.totalVendors || vendors.length}
            </h5>
            <div className="text-muted cursor-pointer" style={{ fontSize: "0.68rem" }} onClick={handleReset}>
              View all vendors →
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col-md-3">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-person-check text-success" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Active Vendors
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              {stats.activeVendors || vendors.filter(v => v.status === "Active").length}
            </h5>
            <div className="text-success" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
              Currently working
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="col-md-3">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-credit-card text-warning" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Pending Payments
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              ₹ {(stats.pendingPayments || 0).toLocaleString("en-IN")}
            </h5>
            <div className="text-warning" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
              Total outstanding
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="col-md-3">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-shield-check text-info" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                AMC Vendors
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              {vendors.filter(v => v.vendorCategory === "AMC").length}
            </h5>
            <div className="text-info" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
              Under active AMC
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. FILTER TABS & SELECTORS ────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        {/* Left tabs */}
        <div className="d-flex gap-1 bg-white p-1 rounded-3" style={{ border: "1px solid var(--border-color)" }}>
          {["All Vendors", "Active", "Inactive"].map((tab) => {
            const isAct = (tab === "All Vendors" && statusFilter === "All") ||
                          (tab === "Active" && statusFilter === "Active") ||
                          (tab === "Inactive" && statusFilter === "Inactive");
            return (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab === "All Vendors" ? "All" : tab);
                  setCurrentPage(1);
                }}
                className="btn btn-sm animate-fade-in"
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
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right selectors */}
        <div className="d-flex gap-2 flex-wrap">
          <select
            className="form-select bg-white py-1 rounded-3"
            style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "160px", outline: "none", boxShadow: "none" }}
            value={propertyFilter}
            onChange={(e) => {
              setPropertyFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Properties</option>
            {properties.map((p, idx) => (
              <option key={idx} value={p.propertyName}>{p.propertyName}</option>
            ))}
            <option value="Green Valley Hub">Green Valley Hub</option>
            <option value="Skyline Towers">Skyline Towers</option>
            <option value="Orchid Business Park">Orchid Business Park</option>
          </select>

          <select
            className="form-select bg-white py-1 rounded-3"
            style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "150px", outline: "none", boxShadow: "none" }}
            value={serviceTypeFilter}
            onChange={(e) => {
              setServiceTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Service Types</option>
            <option value="Security">Security</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Maintenance">Maintenance</option>
            <option value="AMC">AMC</option>
            <option value="IT Support">IT Support</option>
            <option value="Transport">Transport</option>
            <option value="Supplier">Supplier</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* ── 4. MIDDLE ANALYTICS SECTION ───────────────────────────────────── */}
      <div className="row g-4 mb-4">
        {/* 1. Category Overview */}
        <div className="col-lg-4">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              padding: "24px",
              height: "100%",
            }}
          >
            <h6 className="fw-bold mb-4" style={{ color: "#000000", fontSize: "0.9rem" }}>
              Category Breakdown
            </h6>
            <DonutChart
              totalText={String(vendors.length)}
              data={donutData}
            />
          </div>
        </div>

        {/* 2. Performance Rating Distribution */}
        <div className="col-lg-4">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              padding: "24px",
              height: "100%",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold m-0" style={{ color: "#000000", fontSize: "0.9rem" }}>
                Rating Distribution
              </h6>
              <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                Performance ▾
              </span>
            </div>
            <RatingDistributionChart ratings={ratingDistribution} />
          </div>
        </div>

        {/* 3. Top Performing Vendors */}
        <div className="col-lg-4">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              padding: "24px",
              height: "100%",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold m-0" style={{ color: "#000000", fontSize: "0.9rem" }}>
                Top Rated Vendors
              </h6>
            </div>
            <div className="d-flex flex-column gap-3">
              {topPerformingVendors.length === 0 ? (
                <div className="text-center py-5 text-muted small">No vendor performance records.</div>
              ) : (
                topPerformingVendors.map((topv, idx) => {
                  const initials = topv.vendorName ? topv.vendorName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "V";
                  return (
                    <div key={idx} className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: "#f9f7f3",
                            color: "var(--text-primary)",
                            fontSize: "0.8rem",
                            border: "1px solid var(--border-color)",
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                            {topv.companyName || topv.vendorName}
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                            {topv.vendorCategory || "Service Provider"}
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold d-flex align-items-center gap-1" style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                          <i className="bi bi-star-fill text-warning" style={{ fontSize: "0.75rem" }} />
                          {Number(topv.performance?.rating ?? 5.0).toFixed(1)}
                        </div>
                        <div className="text-success fw-semibold" style={{ fontSize: "0.68rem" }}>
                          {topv.status}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. BOTTOM DIRECTORY: Vendors Table ─────────────────────────────── */}
      <div className="row g-4">
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
                Vendor Directory
              </h6>
              <div className="d-flex gap-2 align-items-center">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search vendor name, service, phone..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: "260px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.8rem" }}
                  />
                </div>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "120px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.8rem" }}
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button
                  className="btn btn-sm btn-white"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "6px", backgroundColor: "#ffffff" }}
                  onClick={() => alert("Exporting data as CSV...")}
                >
                  <i className="bi bi-download" style={{ fontSize: "0.85rem" }} />
                </button>
              </div>
            </div>

            {/* Table Component */}
            <Table
              columns={columns}
              data={filteredVendors}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              emptyMessage="No vendor records match the current filters."
            />
          </div>
        </div>
      </div>

      {/* ── 6. VENDOR DETAIL MODAL ────────────────────────────────────────── */}
      {selectedVendorId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1050,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 position-relative"
            style={{
              width: "92%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid var(--border-color)",
            }}
          >
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold m-0 text-dark">Vendor Details</h5>
              <button
                className="btn-close shadow-none"
                onClick={() => setSelectedVendorId(null)}
              />
            </div>
            {/* Modal Content */}
            <VendorDetailView
              vendorId={selectedVendorId}
              onClose={() => setSelectedVendorId(null)}
              onEdit={() => {
                const v = vendors.find(x => x._id === selectedVendorId);
                setSelectedVendorForEdit(v || null);
                setModalMode("edit");
                setShowModal(true);
                setSelectedVendorId(null); // Close details modal when opening edit
              }}
              onRefreshList={() => {
                fetchVendors();
                fetchStats();
              }}
            />
          </div>
        </div>
      )}

      {/* ── 7. FORM MODAL (CREATE / EDIT) ─────────────────────────────────── */}
      {showModal && (
        <VendorFormModal
          mode={modalMode}
          editData={selectedVendorForEdit}
          onSubmit={handleSave}
          onClose={() => setShowModal(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
