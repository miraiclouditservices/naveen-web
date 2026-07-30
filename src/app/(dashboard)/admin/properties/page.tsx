"use client";

import Link from "next/link";
import { useState, useEffect, Suspense, useRef, useCallback, useMemo } from "react";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import PropertyModal from "@/components/dashboard/PropertyModal";

const ITEMS_PER_PAGE = 10;

interface PropertyItem {
  _id: string;
  propertyName: string;
  propertyCode?: string;
  propertyType?: string;
  propertyAddress?: string;
  location?: string;
  totalFloors?: number;
  towers?: number;
  totalSft?: number;
  occupiedSft?: number;
  availableSft?: number;
  status?: "Active" | "Inactive" | string;
  createdBy?: {
    _id?: string;
    name?: string;
  };
  createdAt?: string;
}

interface SummaryMetrics {
  totalProperties: number;
  activeProperties: number;
  activePercent: number;
  totalSft: number;
  occupiedSft: number;
  occupancyRate: number;
}

// ── Separate Status API Handler ──────────────────────────────────────────────
export const updatePropertyStatusApi = async (id: string, newStatus: string) => {
  try {
    const res = await api.patch(`/properties/${id}/status`, { status: newStatus });
    return res;
  } catch (err: any) {
    // Fallback to update property endpoint if dedicated status patch isn't defined
    return await api.put(`/properties/${id}`, { status: newStatus });
  }
};

// ── Circular Gauge Component for Occupancy (Marketing Orange Accent) ───────────
function CircularGauge({ percentage }: { percentage: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
      <svg width="54" height="54" viewBox="0 0 54 54" style={{ transform: "rotate(-90deg)" }}>
        {/* Background track */}
        <circle
          cx="27"
          cy="27"
          r={radius}
          stroke="var(--border-light, #e2e8f0)"
          strokeWidth="5"
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx="27"
          cy="27"
          r={radius}
          stroke="var(--brand-orange, #ea580c)"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease-in-out" }}
        />
      </svg>
    </div>
  );
}

// ── Format Large SFT Numbers (e.g., 12.4M, 545K, or exact formatted) ──────────
function formatSftDisplay(sft: number): { value: string; unit: string } {
  if (sft >= 1_000_000) {
    return { value: (sft / 1_000_000).toFixed(1).replace(/\.0$/, ""), unit: "M SQFT" };
  }
  if (sft >= 100_000) {
    return { value: (sft / 1_000).toFixed(0), unit: "K SQFT" };
  }
  return { value: sft.toLocaleString(), unit: "SQFT" };
}

// ── 1. KPI Summary Bar (Marketing Palette: Orange Accents, Dark Headings) ──────
function PropertySummaryBar({ metrics }: { metrics: SummaryMetrics }) {
  const formattedTotalSft = formatSftDisplay(metrics.totalSft);
  const formattedOccupiedSft = formatSftDisplay(metrics.occupiedSft);

  return (
    <div
      className="card border-0 p-3"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--border-light, #e2e8f0)",
        borderRadius: "var(--radius-custom, 10px)",
      }}
    >
      <div className="row g-3 align-items-center">
        {/* Metric 1: Total Properties */}
        <div className="col-12 col-sm-6 col-md">
          <div className="d-flex flex-column px-2">
            <div className="d-flex align-items-center gap-1.5 mb-1">
              <span className="rounded-circle" style={{ width: 7, height: 7, backgroundColor: "var(--brand-orange, #ea580c)" }} />
              <span className="fw-semibold" style={{ fontSize: "0.76rem", color: "var(--text-body, #475569)", letterSpacing: "-0.01em", marginLeft: "8px" }}>
                Total Properties
              </span>
            </div>
            <div className="d-flex align-items-baseline gap-1.5 ms-2.5">
              <span className="fw-bold lh-1" style={{ fontSize: "1.35rem", color: "var(--dark-heading, #0f172a)" }}>
                {metrics.totalProperties.toLocaleString()}
              </span>
              <span className="fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-body, #475569)" }}>
                units
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Properties */}
        <div className="col-12 col-sm-6 col-md">
          <div className="d-flex flex-column px-2" style={{ borderLeft: "1px solid var(--border-light, #e2e8f0)" }}>
            <div className="d-flex align-items-center gap-1.5 mb-1">
              <span className="rounded-circle" style={{ width: 7, height: 7, backgroundColor: "var(--brand-orange, #ea580c)" }} />
              <span className="fw-semibold" style={{ fontSize: "0.76rem", color: "var(--text-body, #475569)", letterSpacing: "-0.01em", marginLeft: "8px" }}>
                Active Properties
              </span>
            </div>
            <div className="d-flex align-items-baseline gap-1.5 ms-2.5">
              <span className="fw-bold lh-1" style={{ fontSize: "1.35rem", color: "var(--dark-heading, #0f172a)" }}>
                {metrics.activeProperties.toLocaleString()}
              </span>
              <span className="fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-body, #475569)" }}>
                units
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total SFT */}
        <div className="col-12 col-sm-6 col-md">
          <div className="d-flex flex-column px-2" style={{ borderLeft: "1px solid var(--border-light, #e2e8f0)" }}>
            <div className="d-flex align-items-center gap-1.5 mb-1">
              <span className="rounded-circle" style={{ width: 7, height: 7, backgroundColor: "var(--brand-orange, #ea580c)" }} />
              <span className="fw-semibold" style={{ fontSize: "0.76rem", color: "var(--text-body, #475569)", letterSpacing: "-0.01em", marginLeft: "8px" }}>
                Total SFT
              </span>
            </div>
            <div className="d-flex align-items-baseline gap-1.5 ms-2.5">
              <span className="fw-bold lh-1" style={{ fontSize: "1.35rem", color: "var(--dark-heading, #0f172a)" }}>
                {formattedTotalSft.value}
              </span>
              <span className="fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-body, #475569)" }}>
                {formattedTotalSft.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Occupied SFT */}
        <div className="col-12 col-sm-6 col-md">
          <div className="d-flex flex-column px-2" style={{ borderLeft: "1px solid var(--border-light, #e2e8f0)" }}>
            <div className="d-flex align-items-center gap-1.5 mb-1">
              <span className="rounded-circle" style={{ width: 7, height: 7, backgroundColor: "var(--brand-orange, #ea580c)" }} />
              <span className="fw-semibold" style={{ fontSize: "0.76rem", color: "var(--text-body, #475569)", letterSpacing: "-0.01em", marginLeft: "8px" }}>
                Occupied SFT
              </span>
            </div>
            <div className="d-flex align-items-baseline gap-1.5 ms-2.5">
              <span className="fw-bold lh-1" style={{ fontSize: "1.35rem", color: "var(--dark-heading, #0f172a)" }}>
                {formattedOccupiedSft.value}
              </span>
              <span className="fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-body, #475569)", marginLeft: "8px" }}>
                {formattedOccupiedSft.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 5: Occupancy Rate with Circular Progress */}
        <div className="col-12 col-sm-6 col-md">
          <div className="d-flex align-items-center justify-content-between px-2" style={{ borderLeft: "1px solid var(--border-light, #e2e8f0)" }}>
            <div>
              <div className="d-flex align-items-center gap-1.5 mb-1">
                <span className="rounded-circle" style={{ width: 7, height: 7, backgroundColor: "var(--brand-orange, #ea580c)" }} />
                <span className="fw-semibold" style={{ fontSize: "0.76rem", color: "var(--text-body, #475569)", letterSpacing: "-0.01em", marginLeft: "8px" }}>
                  Occupancy Rate
                </span>
              </div>
              <div className="ms-2.5">
                <span className="fw-bold lh-1" style={{ fontSize: "1.35rem", color: "var(--dark-heading, #0f172a)" }}>
                  {metrics.occupancyRate}%
                </span>
              </div>
            </div>
            <CircularGauge percentage={metrics.occupancyRate} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2. Filter Drawer (Marketing Orange Palette) ─────────────────────────────────
interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  onReset: () => void;
}

function PropertyFilterDrawer({
  isOpen,
  onClose,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  onReset,
}: FilterDrawerProps) {
  if (!isOpen) return null;
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          zIndex: 1040,
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 320,
          backgroundColor: "#ffffff",
          zIndex: 1050,
          borderLeft: "1px solid var(--border-light, #e2e8f0)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom" style={{ borderColor: "var(--border-light, #e2e8f0)" }}>
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: "var(--dark-heading, #0f172a)" }}>
            <i className="bi bi-funnel-fill" style={{ color: "var(--brand-orange, #ea580c)" }}></i>
            Filter Properties
          </h6>
          <button className="btn-close shadow-none" onClick={onClose} />
        </div>

        <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-4">
          <div>
            <label
              className="form-label fw-bold mb-2"
              style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-body, #475569)" }}
            >
              Status
            </label>
            <div className="d-grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {["All", "Active", "Inactive"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`btn btn-sm fw-semibold ${statusFilter === s ? "text-white" : "btn-light border"}`}
                  style={{
                    borderRadius: "var(--radius-custom, 10px)",
                    height: 36,
                    fontSize: "0.82rem",
                    backgroundColor: statusFilter === s ? "var(--brand-orange, #ea580c)" : "#ffffff",
                    color: statusFilter === s ? "#ffffff" : "var(--dark-heading, #0f172a)",
                    borderColor: statusFilter === s ? "var(--brand-orange, #ea580c)" : "var(--border-light, #e2e8f0)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="form-label fw-bold mb-2"
              style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-body, #475569)" }}
            >
              Property Type
            </label>
            <div className="d-grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {["All", "Office", "Commercial", "Residential", "IT Park", "Mixed Use", "Industrial"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`btn btn-sm fw-semibold ${typeFilter === t ? "text-white" : "btn-light border"}`}
                  style={{
                    borderRadius: "var(--radius-custom, 10px)",
                    height: 36,
                    fontSize: "0.82rem",
                    backgroundColor: typeFilter === t ? "var(--brand-orange, #ea580c)" : "#ffffff",
                    color: typeFilter === t ? "#ffffff" : "var(--dark-heading, #0f172a)",
                    borderColor: typeFilter === t ? "var(--brand-orange, #ea580c)" : "var(--border-light, #e2e8f0)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-top d-flex gap-2" style={{ borderColor: "var(--border-light, #e2e8f0)" }}>
          <button
            className="btn btn-light border flex-grow-1 fw-semibold"
            style={{ borderRadius: "var(--radius-custom, 10px)", fontSize: "0.85rem", borderColor: "var(--border-light, #e2e8f0)", backgroundColor: "#ffffff", color: "var(--dark-heading, #0f172a)" }}
            onClick={onReset}
          >
            Reset All
          </button>
          <button
            className="btn btn-orange-primary flex-grow-1 justify-content-center"
            onClick={onClose}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

// ── 3. Main Properties Content ──────────────────────────────────────────────
function PropertiesContent() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<PropertyItem | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 400);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("user");
      if (s) {
        try {
          setUser(JSON.parse(s));
        } catch { }
      }
    }
  }, []);

  const buildParams = useCallback(() => {
    const p: Record<string, string> = { page: String(currentPage), limit: String(ITEMS_PER_PAGE) };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (statusFilter !== "All") p.status = statusFilter;
    if (typeFilter !== "All") p.type = typeFilter;
    return new URLSearchParams(p).toString();
  }, [currentPage, debouncedSearch, statusFilter, typeFilter]);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await api.get(`/properties?${buildParams()}`);
      if (r.success) {
        setProperties(r.data);
        setTotalPages(r.pagination?.pages || 1);
        setTotalItems(r.pagination?.total || r.data.length);
      }

      const summaryRes = await api.get(`/properties?limit=1000`);
      if (summaryRes.success && Array.isArray(summaryRes.data)) {
        setAllProperties(summaryRes.data);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    if (user?.role === "Owner") {
      fetchOwnerProfile();
    }
  }, [user]);

  const fetchOwnerProfile = async () => {
    try {
      const r = await api.get("/owners/my-profile");
      if (r.success) setOwnerProfile(r.data);
    } catch { }
  };

  // ── Standalone Status Toggle Integration ────────────────────────────────────
  const handleToggleStatus = async (property: PropertyItem) => {
    const nextStatus = property.status === "Active" ? "Inactive" : "Active";
    setUpdatingStatusId(property._id);

    // Optimistic UI update
    setProperties((prev) =>
      prev.map((p) => (p._id === property._id ? { ...p, status: nextStatus } : p))
    );
    setAllProperties((prev) =>
      prev.map((p) => (p._id === property._id ? { ...p, status: nextStatus } : p))
    );

    try {
      const r = await updatePropertyStatusApi(property._id, nextStatus);
      if (!r.success) {
        fetchProperties();
      }
    } catch {
      fetchProperties();
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const r = editProperty
        ? await api.put(`/properties/${editProperty._id}`, data)
        : await api.post("/properties", data);
      if (r.success) fetchProperties();
    } catch { }
    setEditProperty(null);
    setIsModalOpen(false);
  };

  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setCurrentPage(1);
  };

  const activeFilters = [
    debouncedSearch.trim() !== "",
    statusFilter !== "All",
    typeFilter !== "All",
  ].filter(Boolean).length;

  const isAdmin = !user || ["Admin", "SUPER_ADMIN", "Super Admin"].includes(user.role || "");

  // ── Summary Metrics Calculation ──────────────────────────────────────────────
  const metrics: SummaryMetrics = useMemo(() => {
    const list = allProperties.length > 0 ? allProperties : properties;
    const totalProperties = totalItems > 0 ? totalItems : list.length;
    const activeProperties = list.filter((p) => p.status === "Active").length;
    const activePercent = totalProperties > 0 ? Math.round((activeProperties / totalProperties) * 100) : 0;
    const totalSft = list.reduce((acc, p) => acc + (p.totalSft || 0), 0);
    const occupiedSft = list.reduce((acc, p) => acc + (p.occupiedSft || 0), 0);
    const occupancyRate = totalSft > 0 ? Math.round((occupiedSft / totalSft) * 100) : 0;

    return {
      totalProperties,
      activeProperties,
      activePercent,
      totalSft,
      occupiedSft,
      occupancyRate,
    };
  }, [allProperties, properties, totalItems]);

  // ── Directory Table Columns ──────────────────────────────────────────────────
  const columns: TableColumn<PropertyItem>[] = [
    {
      header: "Building / Property Name",
      style: { position: "sticky", left: 0, zIndex: 6, minWidth: "220px" },
      render: (p) => (
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 36,
              height: 36,
              fontSize: "1.05rem",
              backgroundColor: "var(--brand-orange-bg, #fff7ed)",
              color: "var(--brand-orange, #ea580c)",
              border: "1px solid var(--brand-orange-border, #fed7aa)",
            }}
          >
            <i className="bi bi-building"></i>
          </div>
          <div>
            <Link
              href={`/admin/properties/${p._id}`}
              className="fw-bold text-decoration-none hover-orange"
              style={{ fontSize: "0.88rem", color: "var(--dark-heading, #0f172a)" }}
            >
              {p.propertyName}
            </Link>
            <div className="text-truncate" style={{ fontSize: "0.74rem", maxWidth: "260px", color: "var(--text-body, #475569)" }}>
              <i className="bi bi-geo-alt me-1 opacity-75"></i>
              {p.propertyAddress || p.location || "No address provided"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Property Type",
      render: (p) => (
        <span
          className="badge border px-2.5 py-1.5 fw-semibold"
          style={{
            fontSize: "0.75rem",
            borderRadius: "var(--radius-custom, 10px)",
            color: "var(--dark-heading, #0f172a)",
            backgroundColor: "#f8fafc",
            borderColor: "var(--border-light, #e2e8f0)",
          }}
        >
          {p.propertyType || "Office"}
        </span>
      ),
    },
    {
      header: "Structure",
      render: (p) => (
        <div>
          <div className="fw-semibold" style={{ fontSize: "0.84rem", color: "var(--dark-heading, #0f172a)" }}>
            {p.totalFloors || 1} Floors
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-body, #475569)" }}>
            {p.towers || 1} Tower(s)
          </div>
        </div>
      ),
    },
    {
      header: "Total SFT",
      render: (p) => (
        <span className="fw-bold" style={{ fontSize: "0.85rem", color: "var(--dark-heading, #0f172a)" }}>
          {p.totalSft ? p.totalSft.toLocaleString() : "0"}{" "}
          <span className="small fw-semibold" style={{ color: "var(--text-body, #475569)" }}>SFT</span>
        </span>
      ),
    },
    {
      header: "Occupied SFT",
      render: (p) => {
        const occPercent = p.totalSft && p.totalSft > 0 ? Math.round(((p.occupiedSft || 0) / p.totalSft) * 100) : 0;
        return (
          <div style={{ minWidth: "120px" }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-bold" style={{ fontSize: "0.84rem", color: "var(--dark-heading, #0f172a)" }}>
                {p.occupiedSft ? p.occupiedSft.toLocaleString() : "0"} <span className="small" style={{ color: "var(--text-body, #475569)" }}>SFT</span>
              </span>
              <span className="fw-bold" style={{ fontSize: "0.7rem", color: "var(--text-body, #475569)" }}>
                {occPercent}%
              </span>
            </div>
            <div className="progress" style={{ height: "5px", backgroundColor: "var(--border-light, #e2e8f0)", borderRadius: "4px" }}>
              <div
                className="progress-bar rounded-pill"
                role="progressbar"
                style={{ width: `${Math.min(occPercent, 100)}%`, backgroundColor: "var(--brand-orange, #ea580c)" }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: "Added By",
      render: (p) => (
        <div className="d-flex align-items-center gap-1.5" style={{ fontSize: "0.8rem", color: "var(--text-body, #475569)" }}>
          <i className="bi bi-person-circle opacity-75"></i>
          <span>{p.createdBy?.name || "Admin"}</span>
        </div>
      ),
    },
    {
      header: "Status",
      style: { position: "sticky", right: "90px", zIndex: 5, minWidth: "120px" },
      render: (p) => {
        const isActive = p.status === "Active";
        const isUpdating = updatingStatusId === p._id;

        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isUpdating && isAdmin) handleToggleStatus(p);
            }}
            disabled={isUpdating || !isAdmin}
            title={isAdmin ? `Click to switch to ${isActive ? "Inactive" : "Active"}` : undefined}
            className="btn btn-sm badge rounded-pill px-2.5 py-1.5 fw-bold border text-decoration-none d-inline-flex align-items-center gap-1"
            style={{
              fontSize: "0.73rem",
              cursor: isAdmin ? "pointer" : "default",
              backgroundColor: isActive ? "var(--brand-orange-bg, #fff7ed)" : "#f8fafc",
              color: isActive ? "var(--brand-orange, #ea580c)" : "var(--text-body, #475569)",
              borderColor: isActive ? "var(--brand-orange-border, #fed7aa)" : "var(--border-light, #e2e8f0)",
            }}
          >
            {isUpdating ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" style={{ width: 10, height: 10 }} />
            ) : (
              <span className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: isActive ? "var(--brand-orange, #ea580c)" : "#94a3b8" }} />
            )}
            {p.status || "Active"}
          </button>
        );
      },
    },
    {
      header: "Actions",
      style: { position: "sticky", right: 0, zIndex: 5, minWidth: "90px", width: "90px", textAlign: "center" as const },
      render: (p) => (
        <div className="d-flex gap-2 align-items-center justify-content-center" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/admin/properties/${p._id}`}
            title="View Details"
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center border"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "9999px",
              backgroundColor: "#ffffff",
              borderColor: "var(--border-light, #e2e8f0)",
              color: "var(--dark-heading, #0f172a)",
            }}
          >
            <i className="bi bi-eye" style={{ fontSize: "0.85rem" }}></i>
          </Link>
          {isAdmin && (
            <button
              title="Edit Property"
              onClick={() => {
                setEditProperty(p);
                setIsModalOpen(true);
              }}
              className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center border"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "9999px",
                backgroundColor: "#ffffff",
                borderColor: "var(--border-light, #e2e8f0)",
                color: "var(--dark-heading, #0f172a)",
              }}
            >
              <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }}></i>
            </button>
          )}
        </div>
      ),
    },
  ];

  // ── Owner View ───────────────────────────────────────────────────────────────
  if (user?.role === "Owner") {
    return (
      <div className="p-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1" style={{ fontSize: "1.1rem", color: "var(--dark-heading, #0f172a)" }}>
            My Office Details
          </h2>
          <p className="small mb-0" style={{ color: "var(--text-body, #475569)" }}>View your assigned office details and active units.</p>
        </div>
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="border p-4 h-100" style={{ backgroundColor: "#ffffff", borderRadius: "var(--radius-custom, 10px)", borderColor: "var(--border-light, #e2e8f0)" }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, backgroundColor: "var(--brand-orange-bg, #fff7ed)", color: "var(--brand-orange, #ea580c)" }}
                >
                  <i className="bi bi-briefcase-fill" style={{ fontSize: "1.4rem" }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0" style={{ color: "var(--dark-heading, #0f172a)" }}>{ownerProfile?.ownerName || "Office Profile"}</h5>
                  <span className="badge fw-semibold" style={{ fontSize: "0.72rem", backgroundColor: "var(--brand-orange-bg, #fff7ed)", color: "var(--brand-orange, #ea580c)" }}>
                    Active Profile
                  </span>
                </div>
              </div>
              <hr className="opacity-10" />
              {[
                ["Contact Person", ownerProfile?.contactPerson],
                ["Designation", ownerProfile?.designation],
                ["Email", ownerProfile?.emailId],
                ["Phone", ownerProfile?.contactNumber],
                ["GST", ownerProfile?.gstNumber],
                ["Type", ownerProfile?.ownerType],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="d-flex justify-content-between align-items-center py-2"
                  style={{ borderBottom: "1px solid var(--border-light, #e2e8f0)", fontSize: "0.85rem" }}
                >
                  <span className="fw-semibold" style={{ color: "var(--text-body, #475569)" }}>{l}</span>
                  <span className="fw-bold" style={{ color: "var(--dark-heading, #0f172a)" }}>{v || "—"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="border p-4 h-100" style={{ backgroundColor: "#ffffff", borderRadius: "var(--radius-custom, 10px)", borderColor: "var(--border-light, #e2e8f0)" }}>
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--dark-heading, #0f172a)" }}>
                <i className="bi bi-building" style={{ color: "var(--brand-orange, #ea580c)" }}></i> Assigned Units
              </h6>
              <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: 340 }}>
                {ownerProfile?.unitsAssigned?.length > 0 ? (
                  ownerProfile.unitsAssigned.map((u: any) => (
                    <div
                      key={u._id}
                      className="p-3 border rounded-3 d-flex align-items-center justify-content-between"
                      style={{ backgroundColor: "#ffffff", borderColor: "var(--border-light, #e2e8f0)" }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{ width: 38, height: 38, backgroundColor: "var(--brand-orange-bg, #fff7ed)", color: "var(--brand-orange, #ea580c)" }}
                        >
                          <i className="bi bi-door-open-fill"></i>
                        </div>
                        <div>
                          <div className="fw-bold small" style={{ color: "var(--dark-heading, #0f172a)" }}>Unit {u.unitNumber}</div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-body, #475569)" }}>
                            {u.property?.propertyName || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="badge d-block mb-1 small fw-bold" style={{ backgroundColor: "var(--brand-orange-bg, #fff7ed)", color: "var(--brand-orange, #ea580c)" }}>
                          Floor {u.floorNumber}
                        </span>
                        <span className="small fw-bold" style={{ color: "var(--text-body, #475569)" }}>
                          {u.sqft ? Math.round(u.sqft).toLocaleString() : "N/A"} SFT
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5" style={{ color: "var(--text-body, #475569)" }}>
                    <i className="bi bi-building-dash d-block mb-2" style={{ fontSize: "2rem" }}></i>
                    <span className="small">No units assigned.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin Directory View ────────────────────────────────────────────────────
  return (
    <div className="p-3 pt-2 d-flex flex-column gap-3 min-vh-100" style={{ backgroundColor: "#ffffff" }}>
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditProperty(null);
        }}
        onSave={handleSave}
        editData={editProperty}
      />

      {/* ── Top Clean KPI Summary Bar (Marketing Orange Theme) ───────────────── */}
      <PropertySummaryBar metrics={metrics} />

      {/* ── Table Card Container ───────────────────────────────────────────── */}
      <div
        className="card border-0 p-3 flex-grow-1 d-flex flex-column"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--border-light, #e2e8f0)",
          borderRadius: "var(--radius-custom, 10px)",
        }}
      >
        {/* Controls Bar */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-2">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold m-0" style={{ color: "var(--dark-heading, #0f172a)", fontSize: "1.05rem" }}>
              Property Directory
            </h5>
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            {/* Search Input */}
            <div className="position-relative">
              <i
                className="bi bi-search position-absolute"
                style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", color: "var(--text-body, #475569)" }}
              />
              <input
                type="text"
                placeholder="Search name, address, type..."
                className="form-control form-control-sm"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  width: "220px",
                  paddingLeft: "30px",
                  borderColor: "var(--border-light, #e2e8f0)",
                  borderRadius: "var(--radius-custom, 10px)",
                  height: "36px",
                  fontSize: "0.85rem",
                  backgroundColor: "#ffffff",
                  color: "var(--dark-heading, #0f172a)",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="btn btn-link p-0 position-absolute text-decoration-none"
                  style={{ right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem", color: "var(--text-body, #475569)" }}
                >
                  ×
                </button>
              )}
            </div>


            {/* Filter Drawer Trigger */}
            <button
              className="btn btn-sm border d-flex align-items-center gap-1.5 px-3"
              onClick={() => setShowFilters(true)}
              style={{
                borderRadius: "var(--radius-custom, 10px)",
                height: "36px",
                fontSize: "0.85rem",
                borderColor: "var(--border-light, #e2e8f0)",
                backgroundColor: showFilters ? "var(--brand-orange, #ea580c)" : "#ffffff",
                color: showFilters ? "#ffffff" : "var(--dark-heading, #0f172a)",
              }}
            >
              <i className="bi bi-funnel"></i>
              {/* <span className="fw-semibold">Filter</span> */}
              {activeFilters > 0 && (
                <span className="badge rounded-pill ms-0.5" style={{ fontSize: "0.65rem", backgroundColor: "var(--brand-orange, #ea580c)" }}>
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Add Property Button */}
            {isAdmin && (
              <button
                onClick={() => {
                  setEditProperty(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-orange-primary"
                style={{ height: "36px" }}
              >
                <i className="bi bi-plus-lg"></i>
                <span>Add Property</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        {activeFilters > 0 && (
          <div className="d-flex align-items-center gap-2 py-2 mb-2 border rounded-3 px-3 flex-wrap" style={{ backgroundColor: "#f8fafc", borderColor: "var(--border-light, #e2e8f0)" }}>
            <span className="fw-bold" style={{ fontSize: "0.72rem", color: "var(--text-body, #475569)" }}>
              ACTIVE FILTERS:
            </span>
            {debouncedSearch && (
              <span className="badge border px-2.5 py-1 rounded-2" style={{ fontSize: "0.75rem", backgroundColor: "#ffffff", color: "var(--dark-heading, #0f172a)", borderColor: "var(--border-light, #e2e8f0)" }}>
                Search: <strong>{debouncedSearch}</strong>
                <button
                  onClick={() => handleSearchChange("")}
                  className="btn btn-link p-0 ms-1 text-decoration-none"
                  style={{ fontSize: "0.85rem", lineHeight: 1, color: "var(--text-body, #475569)" }}
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== "All" && (
              <span className="badge border px-2.5 py-1 rounded-2" style={{ fontSize: "0.75rem", backgroundColor: "#ffffff", color: "var(--dark-heading, #0f172a)", borderColor: "var(--border-light, #e2e8f0)" }}>
                Status: <strong>{statusFilter}</strong>
                <button
                  onClick={() => setStatusFilter("All")}
                  className="btn btn-link p-0 ms-1 text-decoration-none"
                  style={{ fontSize: "0.85rem", lineHeight: 1, color: "var(--text-body, #475569)" }}
                >
                  ×
                </button>
              </span>
            )}
            {typeFilter !== "All" && (
              <span className="badge border px-2.5 py-1 rounded-2" style={{ fontSize: "0.75rem", backgroundColor: "#ffffff", color: "var(--dark-heading, #0f172a)", borderColor: "var(--border-light, #e2e8f0)" }}>
                Type: <strong>{typeFilter}</strong>
                <button
                  onClick={() => setTypeFilter("All")}
                  className="btn btn-link p-0 ms-1 text-decoration-none"
                  style={{ fontSize: "0.85rem", lineHeight: 1, color: "var(--text-body, #475569)" }}
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={handleReset}
              className="btn btn-link p-0 fw-semibold ms-auto text-decoration-none text-danger"
              style={{ fontSize: "0.75rem" }}
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Filter Drawer */}
        <PropertyFilterDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          statusFilter={statusFilter}
          setStatusFilter={(v) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
          typeFilter={typeFilter}
          setTypeFilter={(v) => {
            setTypeFilter(v);
            setCurrentPage(1);
          }}
          onReset={handleReset}
        />

        {/* Table */}
        <Table
          columns={columns}
          data={properties}
          isLoading={isLoading}
          loadingMessage="Loading property directory..."
          emptyMessage={
            activeFilters > 0
              ? "No property records match the active filter criteria."
              : "No property records found. Click 'Add Property' to create your first asset."
          }
          containerClassName="table-responsive-container table-responsive mt-0 flex-grow-1"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#ffffff" }}>
          <div className="spinner-border" role="status" style={{ color: "var(--brand-orange, #ea580c)" }} />
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
