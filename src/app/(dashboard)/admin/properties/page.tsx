"use client";

import Link from "next/link";
import { useState, useEffect, Suspense, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
  status?: string;
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

// ── 1. KPI Stat Card Component (Design System Variable Alignment) ───────────
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subText: string;
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
}

function StatCard({ label, value, unit, subText, icon, iconBgClass, iconTextClass }: StatCardProps) {
  return (
    <div
      className="card border-0 h-100 p-3"
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--bg-card)",
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
      }}
    >
      <div className="d-flex align-items-center gap-3">


        {/* Value and Label */}
        <div className="overflow-hidden">
          <span
            className="fw-semibold d-block text-truncate mb-0"
            style={{ fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "-0.01em" }}
          >
            {label}
          </span>
          <div className="d-flex align-items-baseline gap-1 mt-0.5">
            <span
              className="fw-bold lh-1"
              style={{ fontSize: "1rem", color: "var(--text-main)", letterSpacing: "-0.02em" }}
            >
              {value}
            </span>

          </div>
        </div>
      </div>

    </div>
  );
}

// ── 2. Filter Drawer ────────────────────────────────────────────────────────────
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
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 1040,
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />
      {/* Drawer Container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 320,
          backgroundColor: "var(--bg-card)",
          zIndex: 1050,
          borderLeft: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom" style={{ borderColor: "var(--border-color)" }}>
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: "var(--text-main)" }}>
            <i className="bi bi-funnel-fill" style={{ color: "var(--dark-section)" }}></i>
            Filter Properties
          </h6>
          <button className="btn-close shadow-none" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-4">
          {/* Status Filter */}
          <div>
            <label
              className="form-label fw-bold mb-2"
              style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}
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
                    borderRadius: "var(--radius-md)",
                    height: 36,
                    fontSize: "0.82rem",
                    backgroundColor: statusFilter === s ? "var(--dark-section)" : "var(--bg-card)",
                    color: statusFilter === s ? "var(--bg-card)" : "var(--text-main)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label
              className="form-label fw-bold mb-2"
              style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}
            >
              Property Type
            </label>
            <div className="d-grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {["All", "Office", "Commercial", "Residential", "IT Park", "Mixed Use", "Industrial"].map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`btn btn-sm fw-semibold ${typeFilter === t ? "text-white" : "btn-light border"}`}
                    style={{
                      borderRadius: "var(--radius-md)",
                      height: 36,
                      fontSize: "0.82rem",
                      backgroundColor: typeFilter === t ? "var(--dark-section)" : "var(--bg-card)",
                      color: typeFilter === t ? "var(--bg-card)" : "var(--text-main)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-top d-flex gap-2" style={{ borderColor: "var(--border-color)" }}>
          <button
            className="btn btn-light border flex-grow-1 fw-semibold"
            style={{ borderRadius: "var(--radius-md)", fontSize: "0.85rem", borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-main)" }}
            onClick={onReset}
          >
            Reset All
          </button>
          <button
            className="btn fw-semibold text-white flex-grow-1"
            style={{ borderRadius: "var(--radius-md)", fontSize: "0.85rem", backgroundColor: "var(--dark-section)", color: "var(--bg-card)", border: "none" }}
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
  const searchParams = useSearchParams();

  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<PropertyItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      // Fetch paginated server-side filtered result
      const r = await api.get(`/properties?${buildParams()}`);
      if (r.success) {
        setProperties(r.data);
        setTotalPages(r.pagination?.pages || 1);
        setTotalItems(r.pagination?.total || r.data.length);
      }

      // Fetch complete summary set for overall KPI stats calculations
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property asset?")) return;
    setDeletingId(id);
    try {
      const r = await api.delete(`/properties/${id}`);
      if (r.success) {
        fetchProperties();
      }
    } catch {
    } finally {
      setDeletingId(null);
    }
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

  // ── Calculate Summary Metrics ────────────────────────────────────────────────
  const metrics: SummaryMetrics = useMemo(() => {
    const list = allProperties.length > 0 ? allProperties : properties;
    const totalProperties = totalItems > 0 ? totalItems : list.length;
    const activeProperties = list.filter((p) => p.status === "Active").length;
    const activePercent =
      totalProperties > 0 ? Math.round((activeProperties / totalProperties) * 100) : 0;
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

  // ── Table Columns Configuration (Design System Variable Alignment) ─────────
  const columns: TableColumn<PropertyItem>[] = [
    {
      header: "Building / Property Name",
      style: {
        position: "sticky",
        left: 0,
        zIndex: 6,
        minWidth: "220px",
      },
      render: (p) => (
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 bg-success bg-opacity-10 text-success"
            style={{
              width: 36,
              height: 36,
              fontSize: "1.05rem",
            }}
          >
            <i className="bi bi-building"></i>
          </div>
          <div>
            <Link
              href={`/admin/properties/${p._id}`}
              className="fw-bold text-decoration-none"
              style={{ fontSize: "0.88rem", color: "var(--text-main)" }}
            >
              {p.propertyName}
            </Link>
            <div className="text-truncate" style={{ fontSize: "0.74rem", maxWidth: "260px", color: "var(--text-muted)" }}>
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
          className="badge bg-light border px-2.5 py-1.5 fw-semibold"
          style={{ fontSize: "0.75rem", borderRadius: "var(--radius-md)", color: "var(--text-main)", borderColor: "var(--border-color)" }}
        >
          {p.propertyType || "Office"}
        </span>
      ),
    },
    {
      header: "Structure",
      render: (p) => (
        <div>
          <div className="fw-semibold" style={{ fontSize: "0.84rem", color: "var(--text-main)" }}>
            {p.totalFloors || 1} Floors
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {p.towers || 1} Tower(s)
          </div>
        </div>
      ),
    },
    {
      header: "Total SFT",
      render: (p) => (
        <span className="fw-bold" style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
          {p.totalSft ? p.totalSft.toLocaleString() : "0"}{" "}
          <span className="small fw-semibold" style={{ color: "var(--text-muted)" }}>SFT</span>
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
              <span className="fw-bold" style={{ fontSize: "0.84rem", color: "var(--text-main)" }}>
                {p.occupiedSft ? p.occupiedSft.toLocaleString() : "0"} <span className="small" style={{ color: "var(--text-muted)" }}>SFT</span>
              </span>
              <span className="fw-bold" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {occPercent}%
              </span>
            </div>
            {/* Occupancy Progress Bar */}
            <div className="progress" style={{ height: "5px", backgroundColor: "var(--border-color)", borderRadius: "4px" }}>
              <div
                className="progress-bar rounded-pill bg-success"
                role="progressbar"
                style={{
                  width: `${Math.min(occPercent, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Added By",
      render: (p) => (
        <div className="d-flex align-items-center gap-1.5" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <i className="bi bi-person-circle opacity-75"></i>
          <span>{p.createdBy?.name || "Admin"}</span>
        </div>
      ),
    },
    {
      header: "Status",
      style: {
        position: "sticky",
        right: "90px",
        zIndex: 5,
        minWidth: "110px",
      },
      render: (p) => (
        <span
          className={`badge rounded-pill px-2.5 py-1.5 fw-bold border ${p.status === "Active"
            ? "bg-success bg-opacity-10 text-success border-success"
            : "bg-warning bg-opacity-10 text-warning border-warning"
            }`}
          style={{ fontSize: "0.73rem" }}
        >
          {p.status || "Active"}
        </span>
      ),
    },
    {
      header: "Actions",
      style: {
        position: "sticky",
        right: 0,
        zIndex: 5,
        minWidth: "90px",
        width: "90px",
        textAlign: "center" as const,
      },
      render: (p) => (
        <div className="d-flex gap-2 align-items-center justify-content-center" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/admin/properties/${p._id}`}
            title="View Details"
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--bg-app)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
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
              className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
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
      <div className="p-4" style={{ backgroundColor: "var(--bg-app)" }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1" style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>
            My Office Details
          </h2>
          <p className="small mb-0" style={{ color: "var(--text-muted)" }}>View your assigned office details and active units.</p>
        </div>
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="border p-4 h-100" style={{ backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", borderColor: "var(--border-color)" }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success"
                  style={{ width: 48, height: 48 }}
                >
                  <i className="bi bi-briefcase-fill" style={{ fontSize: "1.4rem" }}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0" style={{ color: "var(--text-main)" }}>{ownerProfile?.ownerName || "Office Profile"}</h5>
                  <span className="badge fw-semibold bg-success bg-opacity-10 text-success" style={{ fontSize: "0.72rem" }}>
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
                  style={{ borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}
                >
                  <span className="fw-semibold" style={{ color: "var(--text-muted)" }}>{l}</span>
                  <span className="fw-bold" style={{ color: "var(--text-main)" }}>{v || "—"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="border p-4 h-100" style={{ backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", borderColor: "var(--border-color)" }}>
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--text-main)" }}>
                <i className="bi bi-building text-success"></i> Assigned Units
              </h6>
              <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: 340 }}>
                {ownerProfile?.unitsAssigned?.length > 0 ? (
                  ownerProfile.unitsAssigned.map((u: any) => (
                    <div
                      key={u._id}
                      className="p-3 border rounded-3 d-flex align-items-center justify-content-between"
                      style={{ backgroundColor: "var(--bg-app)", borderColor: "var(--border-color)" }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
                          style={{ width: 38, height: 38 }}
                        >
                          <i className="bi bi-door-open-fill"></i>
                        </div>
                        <div>
                          <div className="fw-bold small" style={{ color: "var(--text-main)" }}>Unit {u.unitNumber}</div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                            {u.property?.propertyName || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <span
                          className="badge d-block mb-1 small fw-bold bg-primary bg-opacity-10 text-primary"
                        >
                          Floor {u.floorNumber}
                        </span>
                        <span className="small fw-bold" style={{ color: "var(--text-muted)" }}>
                          {u.sqft ? Math.round(u.sqft).toLocaleString() : "N/A"} SFT
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5" style={{ color: "var(--text-muted)" }}>
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

  // ── Admin Master Directory View ──────────────────────────────────────────────
  return (
    <div className="p-3 pt-2 d-flex flex-column gap-3 min-vh-100" style={{ backgroundColor: "var(--bg-app)" }}>
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditProperty(null);
        }}
        onSave={handleSave}
        editData={editProperty}
      />

      {/* ── 5 KPI Stat Cards Row (Enterprise CSS Variables) ────────────────────── */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-2.5">
        {/* Card 1: Total Properties */}
        <div className="col">
          <StatCard
            label="Total Properties"
            value={metrics.totalProperties}
            subText="All properties"
            icon="bi-building"
            iconBgClass="bg-success bg-opacity-10"
            iconTextClass="text-success"
          />
        </div>

        {/* Card 2: Active Properties */}
        <div className="col">
          <StatCard
            label="Active Properties"
            value={metrics.activeProperties}
            subText={`${metrics.activePercent}% active`}
            icon="bi-houses"
            iconBgClass="bg-primary bg-opacity-10"
            iconTextClass="text-primary"
          />
        </div>

        {/* Card 3: Total SFT */}
        <div className="col">
          <StatCard
            label="Total SFT"
            value={metrics.totalSft.toLocaleString()}
            unit="SFT"
            subText="Total area"
            icon="bi-aspect-ratio"
            iconBgClass="bg-warning bg-opacity-10"
            iconTextClass="text-warning"
          />
        </div>

        {/* Card 4: Occupied SFT */}
        <div className="col">
          <StatCard
            label="Occupied SFT"
            value={metrics.occupiedSft.toLocaleString()}
            unit="SFT"
            subText={`${metrics.occupancyRate}% occupied`}
            icon="bi-building-up"
            iconBgClass="bg-purple-light"
            iconTextClass="text-purple"
          />
        </div>

        {/* Card 5: Occupancy Rate */}
        <div className="col">
          <StatCard
            label="Occupancy Rate"
            value={`${metrics.occupancyRate}%`}
            subText="Average rate"
            icon="bi-bullseye"
            iconBgClass="bg-danger bg-opacity-10"
            iconTextClass="text-danger"
          />
        </div>
      </div>

      {/* ── Table Card Container (Brand Palette Alignment) ──────────────────── */}
      <div
        className="card border-0 p-3 flex-grow-1 d-flex flex-column"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
        }}
      >
        {/* Controls Bar */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-2">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold m-0" style={{ color: "var(--text-main)", fontSize: "1.1rem" }}>
              Property Directory
            </h5>
            <span className="small" style={{ color: "var(--text-muted)" }}>({totalItems} records)</span>
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            {/* Search Input */}
            <div className="position-relative">
              <i
                className="bi bi-search position-absolute"
                style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", color: "var(--text-muted)" }}
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
                  borderColor: "var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  height: "36px",
                  fontSize: "0.85rem",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-main)",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="btn btn-link p-0 position-absolute text-decoration-none"
                  style={{ right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem", color: "var(--text-muted)" }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Quick Filter Select */}
            <select
              className="form-select form-select-sm"
              style={{
                width: "140px",
                borderColor: "var(--border-color)",
                borderRadius: "var(--radius-md)",
                height: "36px",
                fontSize: "0.85rem",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Filter Drawer Trigger Button */}
            <button
              className="btn btn-sm border d-flex align-items-center gap-1.5 px-3"
              onClick={() => setShowFilters(true)}
              style={{
                borderRadius: "var(--radius-md)",
                height: "36px",
                fontSize: "0.85rem",
                borderColor: "var(--border-color)",
                backgroundColor: showFilters ? "var(--dark-section)" : "var(--bg-card)",
                color: showFilters ? "var(--bg-card)" : "var(--text-main)",
              }}
            >
              <i className="bi bi-funnel"></i>
              <span className="fw-semibold">Filter</span>
              {activeFilters > 0 && (
                <span className="badge rounded-pill bg-primary ms-0.5" style={{ fontSize: "0.65rem" }}>
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Add Property Button (On Right Side of Filter Button) */}
            {isAdmin && (
              <button
                onClick={() => {
                  setEditProperty(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-sm fw-bold d-flex align-items-center gap-2 px-3"
                style={{
                  borderRadius: "var(--radius-md)",
                  height: "36px",
                  fontSize: "0.85rem",
                  backgroundColor: "var(--dark-section)",
                  color: "var(--bg-card)",
                  border: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <i className="bi bi-plus-lg"></i>
                <span>Add Property</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters > 0 && (
          <div className="d-flex align-items-center gap-2 py-2 mb-2 border rounded-3 px-3 flex-wrap" style={{ backgroundColor: "var(--bg-app)", borderColor: "var(--border-color)" }}>
            <span className="fw-bold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              ACTIVE FILTERS:
            </span>
            {debouncedSearch && (
              <span className="badge border px-2.5 py-1 rounded-2" style={{ fontSize: "0.75rem", backgroundColor: "var(--bg-card)", color: "var(--text-main)", borderColor: "var(--border-color)" }}>
                Search: <strong>{debouncedSearch}</strong>
                <button
                  onClick={() => handleSearchChange("")}
                  className="btn btn-link p-0 ms-1 text-decoration-none"
                  style={{ fontSize: "0.85rem", lineHeight: 1, color: "var(--text-muted)" }}
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== "All" && (
              <span className="badge border px-2.5 py-1 rounded-2" style={{ fontSize: "0.75rem", backgroundColor: "var(--bg-card)", color: "var(--text-main)", borderColor: "var(--border-color)" }}>
                Status: <strong>{statusFilter}</strong>
                <button
                  onClick={() => setStatusFilter("All")}
                  className="btn btn-link p-0 ms-1 text-decoration-none"
                  style={{ fontSize: "0.85rem", lineHeight: 1, color: "var(--text-muted)" }}
                >
                  ×
                </button>
              </span>
            )}
            {typeFilter !== "All" && (
              <span className="badge border px-2.5 py-1 rounded-2" style={{ fontSize: "0.75rem", backgroundColor: "var(--bg-card)", color: "var(--text-main)", borderColor: "var(--border-color)" }}>
                Type: <strong>{typeFilter}</strong>
                <button
                  onClick={() => setTypeFilter("All")}
                  className="btn btn-link p-0 ms-1 text-decoration-none"
                  style={{ fontSize: "0.85rem", lineHeight: 1, color: "var(--text-muted)" }}
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

        {/* Directory Table */}
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
        <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "var(--bg-app)" }}>
          <div className="spinner-border" role="status" style={{ color: "var(--dark-section)" }} />
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
