"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import UnitModal from "@/components/dashboard/UnitModal";
import UnitFilterDrawer from "./UnitFilterDrawer";

const ITEMS_PER_PAGE = 10;

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "Occupied":
      return { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" };
    case "Reserved":
      return { backgroundColor: "var(--brand-orange-bg)", color: "var(--brand-orange)", border: "1px solid var(--brand-orange-border)" };
    case "Available":
      return { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe" };
    default:
      return { backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2" };
  }
};

export default function UnitsPageClient() {
  const router = useRouter();
  const [units, setUnits] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Top Metrics
  const [metrics, setMetrics] = useState({
    totalUnits: 0,
    occupiedUnits: 0,
    availableUnits: 0,
    totalSft: 0,
    occupiedSft: 0,
    availableSft: 0,
    totalRevenue: 0,
    totalSeats: 0,
    occupiedSeats: 0,
  });

  // Search & Filter state
  const [selectedPropertyId, setSelectedPropertyId] = useState("all");
  const [selectedFloorId, setSelectedFloorId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<any>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TENANT_ROLES = [
    "COWORKING_TENANT",
    "Tenant",
    "Co-Working Member",
    "Coworking Tenant",
    "COWORKING TENANT",
    "COWORKING_MEMBER"
  ];

  const rawRole = currentUser?.role || "";
  const isTenantRole = TENANT_ROLES.includes(rawRole) || rawRole.toUpperCase().includes("TENANT");

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 400);
  };

  // Auto-redirect tenants to their first assigned unit
  useEffect(() => {
    if (!currentUser) return;
    const role = currentUser.role || "";
    const isTenant = TENANT_ROLES.includes(role) || role.toUpperCase().includes("TENANT");
    if (isTenant) {
      const assignedUnits: any[] = currentUser.assignedUnits || [];
      if (assignedUnits.length > 0) {
        const firstUnitId = assignedUnits[0]?._id || assignedUnits[0];
        if (firstUnitId) {
          setRedirecting(true);
          router.replace(`/admin/units/${firstUnitId}`);
          return;
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchProperties();
    fetchFloors();
    api.get("/auth/me").then((res: any) => {
      if (res?.success && res?.data) {
        setCurrentUser(res.data);
      }
    }).catch(() => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (stored) {
        try { setCurrentUser(JSON.parse(stored)); } catch (e) { }
      }
    });
  }, []);

  const buildParams = useCallback(() => {
    const p: Record<string, string> = {
      page: String(currentPage),
      limit: String(ITEMS_PER_PAGE),
    };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (selectedPropertyId !== "all") p.property = selectedPropertyId;
    if (selectedFloorId !== "all") p.floor = selectedFloorId;
    if (selectedStatus !== "all") p.unitStatus = selectedStatus;
    return new URLSearchParams(p).toString();
  }, [currentPage, debouncedSearch, selectedPropertyId, selectedFloorId, selectedStatus]);

  const fetchUnits = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await api.get(`/units?${buildParams()}`);
      if (r.success) {
        setUnits(r.data);
        setTotalPages(r.totalPages || r.pagination?.pages || 1);
        setTotalItems(r.total || r.pagination?.total || r.data.length);
        if (r.metrics) {
          setMetrics({
            totalUnits: r.metrics.totalUnits || 0,
            occupiedUnits: r.metrics.occupiedUnits || 0,
            availableUnits: r.metrics.availableUnits || 0,
            totalSft: r.metrics.totalSft || 0,
            occupiedSft: r.metrics.occupiedSft || 0,
            availableSft: r.metrics.availableSft || 0,
            totalRevenue: r.metrics.totalRevenue || 0,
            totalSeats: r.metrics.totalSeats || 0,
            occupiedSeats: r.metrics.occupiedSeats || 0,
          });
        }
      }
    } catch { } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const fetchProperties = async () => {
    try {
      const r = await api.get("/properties");
      if (r.success) setProperties(r.data);
    } catch { }
  };

  const fetchFloors = async () => {
    try {
      const r = await api.get("/floors?limit=100");
      if (r.success) setFloors(r.data);
    } catch { }
  };

  const handleSaveUnit = async (data: any) => {
    try {
      if (editUnit) await api.put(`/units/${editUnit._id}`, data);
      else await api.post("/units", data);
      fetchUnits();
    } catch { }
    setIsModalOpen(false);
    setEditUnit(null);
  };

  const handleReset = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedPropertyId("all");
    setSelectedFloorId("all");
    setSelectedStatus("all");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const activeFilters = [
    debouncedSearch.trim() !== "",
    selectedPropertyId !== "all",
    selectedFloorId !== "all",
    selectedStatus !== "all",
  ].filter(Boolean).length;

  const occupantDisplay = (unit: any) => {
    if (unit.lease) return { name: unit.lease.companyName || unit.lease.tenantName || "—", badge: "Lease Holder", color: "info", phone: unit.lease.tenantContact };
    if (unit.tenant) return { name: unit.tenant.tenantName || "—", badge: "Tenant", color: "primary", phone: unit.tenant.contactNumber };
    if (unit.owner) return { name: unit.owner.ownerName || "—", badge: "Office Owner", color: "success", phone: unit.owner.contactNumber };
    if (unit.ownerName) return { name: unit.ownerName, badge: "Office Owner", color: "success", phone: "" };
    return null;
  };

  // Filtered floor options based on selected Property
  const filteredFloorOptions = selectedPropertyId !== "all"
    ? floors.filter(f => {
      const pId = typeof f.property === 'object' ? f.property._id : f.property;
      return String(pId) === String(selectedPropertyId);
    })
    : floors;

  // Selected floor object for summary banner
  const activeSelectedFloorObj = selectedFloorId !== "all"
    ? floors.find(f => String(f._id) === String(selectedFloorId))
    : null;

  const columns: TableColumn<any>[] = [
    {
      header: "Unit Details",
      render: (u) => (
        <div>
          <Link
            href={`/admin/units/${u._id}`}
            className="text-decoration-none fw-bold text-dark hover-primary d-inline-flex align-items-center gap-1.5"
            style={{ fontSize: "0.88rem" }}
          >
            Unit {u.unitNumber}
          </Link>
          {u.unitName && (
            <div className="text-muted small fw-medium mt-0.5" style={{ fontSize: "0.78rem" }}>
              {u.unitName}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Floor",
      render: (u) => (
        <div>
          <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>
            {u.floor?.floorNumber || u.floorNumber ? `Floor ${u.floor?.floorNumber || u.floorNumber}` : "Floor —"}
          </span>
          <div className="text-muted extra-small" style={{ fontSize: "0.75rem" }}>
            {u.floor?.floorName || "Office Workspace"}
          </div>
        </div>
      ),
    },
    {
      header: "Occupant / Tenant",
      render: (u) => {
        const occupantsList = u.occupants || [];
        if (occupantsList.length > 0) {
          const first = occupantsList[0];
          const hasMultiple = occupantsList.length > 1;
          return (
            <div>
              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                <span className="fw-bold text-dark" style={{ fontSize: "0.86rem" }}>
                  {first.name}
                </span>
                {u.unitStatus === "Occupied" && (
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "0.82rem" }} />
                )}
                {hasMultiple && (
                  <span className="badge rounded-pill bg-light text-primary border px-2 py-0.5 fw-semibold" style={{ fontSize: "0.7rem" }}>
                    +{occupantsList.length - 1} More
                  </span>
                )}
              </div>
              {first.phone && (
                <div className="text-muted extra-small mt-0.5" style={{ fontSize: "0.74rem" }}>
                  <i className="bi bi-telephone me-1"></i>{first.phone}
                </div>
              )}
            </div>
          );
        }

        const occ = occupantDisplay(u);
        if (!occ) return <span className="text-muted small">—</span>;
        return (
          <div>
            <div className="d-flex align-items-center gap-1.5">
              <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{occ.name}</span>
              {u.unitStatus === "Occupied" && (
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "0.82rem" }} />
              )}
            </div>
            {occ.phone && (
              <div className="text-muted extra-small" style={{ fontSize: "0.74rem" }}>
                <i className="bi bi-telephone me-1"></i>{occ.phone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Area (SFT)",
      render: (u) => (
        <span className="text-dark fw-semibold" style={{ fontSize: "0.85rem" }}>
          {u.sqft ? `${u.sqft.toLocaleString("en-IN")} SFT` : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (u) => {
        const isMeeting = u.isMeetingRoom || false;
        const statusVal = isMeeting ? "Reserved" : (u.unitStatus || "Available");
        const style = getStatusBadgeStyle(statusVal);
        return (
          <span
            className="badge px-2.5 py-1.5 fw-bold"
            style={{
              fontSize: "0.75rem",
              borderRadius: "10px",
              ...style
            }}
          >
            {statusVal}
          </span>
        );
      },
    },
    {
      header: "Actions",
      style: { textAlign: "right" as const },
      render: (u) => (
        <div className="d-flex gap-2 align-items-center justify-content-end" onClick={(e) => e.stopPropagation()}>
          {/* <Link
            href={`/admin/units/${u._id}`}
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center border"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              borderColor: "var(--border-light)",
              color: "var(--dark-heading)"
            }}
            title="View Details"
          >
            <i className="bi bi-eye" style={{ fontSize: "0.85rem", color: "var(--brand-orange)" }} />
          </Link> */}
          {!isTenantRole && (
            <button
              onClick={() => {
                setEditUnit(u);
                setIsModalOpen(true);
              }}
              className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center border"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                borderColor: "var(--border-light)",
                color: "var(--dark-heading)"
              }}
              title="Edit Unit"
            >
              <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // For tenants: show a loading screen while router.replace is in progress
  if (redirecting) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "60vh", fontFamily: "var(--font-geist-sans), Inter, sans-serif" }}
      >
        <div
          className="d-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{ width: "64px", height: "64px", backgroundColor: "#eff6ff" }}
        >
          <i className="bi bi-person-workspace" style={{ fontSize: "1.75rem", color: "#3b82f6" }}></i>
        </div>
        <h6 className="fw-bold mb-1" style={{ color: "var(--dark-heading)", fontSize: "1rem" }}>
          Loading Your Workspace...
        </h6>
        <p className="small mb-3" style={{ color: "var(--text-body)" }}>
          Opening your assigned unit details
        </p>
        <div className="spinner-border spinner-border-sm" style={{ color: "#3b82f6" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "var(--font-geist-sans), Inter, sans-serif",
        color: "var(--text-primary)",
        padding: "0px 10px"
      }}
    >
      <UnitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditUnit(null);
        }}
        onSave={handleSaveUnit}
        editData={editUnit}
      />

      <UnitFilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        properties={properties}
        floors={floors}
        selectedPropertyId={selectedPropertyId}
        setSelectedPropertyId={setSelectedPropertyId}
        selectedFloorId={selectedFloorId}
        setSelectedFloorId={setSelectedFloorId}
        statusFilter={selectedStatus}
        setStatusFilter={setSelectedStatus}
        onApply={() => {
          setCurrentPage(1);
          setShowFilters(false);
        }}
        onReset={handleReset}
      />

      {/* ── METRIC STAT CARDS ── */}
      <div className="mb-4">
        {/* Single row of 5 clean metric cards */}
        <div className="row g-3">
          {[
            { label: "Total Units",       value: metrics.totalUnits,                          icon: "bi-building",        bg: "#eff6ff", color: "#2563eb" },
            { label: "Occupied Units",    value: metrics.occupiedUnits,                       icon: "bi-person-check",    bg: "#f0fdf4", color: "#16a34a" },
            { label: "Available Units",   value: metrics.availableUnits,                      icon: "bi-door-open",       bg: "#fff7ed", color: "#f97316" },
            { label: "Total Area (SFT)",  value: metrics.totalSft.toLocaleString("en-IN"),    icon: "bi-aspect-ratio",    bg: "#f5f3ff", color: "#7c3aed" },
          ].map((card, i) => (
            <div key={i} className="col">
              <div
                className="card border-0 d-flex flex-row align-items-center gap-3 h-100"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "14px 16px" }}
              >
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: card.bg, color: card.color }}
                >
                  <i className={`bi ${card.icon}`} style={{ fontSize: "1.1rem" }}></i>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--text-body)", lineHeight: 1.2 }}>{card.label}</div>
                  <div className="fw-bold" style={{ fontSize: "1.2rem", lineHeight: 1.1, color: "var(--dark-heading)", marginTop: "3px" }}>{card.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CARD CONTAINER ── */}
      <div
        className="card border-0 p-4"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px"
        }}
      >
        {/* TOOLBAR */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <h5 className="fw-bold m-0" style={{ color: "var(--dark-heading)", fontSize: "1rem" }}>
            {isTenantRole ? "My Assigned Units" : "SFT Directory"}
          </h5>

          <div className="d-flex gap-2 align-items-center flex-wrap">
            {/* Search */}
            <div className="position-relative">
              <i className="bi bi-search text-muted position-absolute" style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.82rem" }}></i>
              <input
                type="text"
                placeholder="Search units..."
                className="form-control form-control-sm shadow-none"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ width: "200px", paddingLeft: "30px", borderColor: "var(--border-color)", borderRadius: "10px", height: "36px", fontSize: "0.85rem" }}
              />
            </div>

            {/* Admin Only Controls */}
            {!isTenantRole && (
              <>
                <select
                  className="form-select form-select-sm shadow-none"
                  value={selectedPropertyId}
                  onChange={(e) => { setSelectedPropertyId(e.target.value); setSelectedFloorId("all"); setCurrentPage(1); }}
                  style={{ width: "170px", borderColor: "var(--border-color)", borderRadius: "10px", height: "36px", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  <option value="all">All Properties</option>
                  {properties.map((p) => (<option key={p._id} value={p._id}>{p.propertyName}</option>))}
                </select>

                <select
                  className="form-select form-select-sm shadow-none"
                  value={selectedFloorId}
                  onChange={(e) => { setSelectedFloorId(e.target.value); setCurrentPage(1); }}
                  style={{ width: "160px", borderColor: "var(--border-color)", borderRadius: "10px", height: "36px", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  <option value="all">All Floors</option>
                  {filteredFloorOptions.map((f) => (
                    <option key={f._id} value={f._id}>{f.floorName || `Floor ${f.floorNumber}`}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowFilters(true)}
                  className="btn btn-sm btn-light border fw-semibold d-flex align-items-center gap-1"
                  style={{ height: "36px", borderRadius: "10px", borderColor: "var(--border-color)", fontSize: "0.85rem", padding: "0 14px" }}
                >
                  <i className="bi bi-funnel"></i> Filters
                  {activeFilters > 0 && <span className="badge bg-dark rounded-pill ms-1">{activeFilters}</span>}
                </button>

                <button
                  onClick={() => { setEditUnit(null); setIsModalOpen(true); }}
                  className="btn btn-dark btn-sm fw-bold px-3 d-flex align-items-center gap-2"
                  style={{ backgroundColor: "var(--dark-section)", borderRadius: "10px", height: "36px", fontSize: "0.85rem" }}
                >
                  <i className="bi bi-plus-lg"></i> Add SFT
                </button>
              </>
            )}
          </div>
        </div>

        {/* ACTIVE SELECTED FLOOR SUMMARY BANNER */}
        {activeSelectedFloorObj && (
          <div className="p-3 mb-3 border rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ backgroundColor: "var(--brand-orange-bg)", borderColor: "var(--brand-orange-border)" }}>
            <div className="d-flex align-items-center gap-2.5">
              <i className="bi bi-layers fs-5" style={{ color: "var(--brand-orange)" }}></i>
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                  {activeSelectedFloorObj.floorName || `Floor ${activeSelectedFloorObj.floorNumber}`}
                </div>
                <div className="text-muted extra-small">
                  Property: {activeSelectedFloorObj.property?.propertyName || "Selected Property"}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="badge bg-white text-dark border px-3 py-1.5 rounded-pill fw-semibold" style={{ fontSize: "0.8rem" }}>
                {activeSelectedFloorObj.totalSft ? `${activeSelectedFloorObj.totalSft.toLocaleString("en-IN")} SFT Capacity` : "7,100 SFT"}
              </span>
              <span className="badge px-3 py-1.5 rounded-pill fw-bold" style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", fontSize: "0.8rem" }}>
                <i className="bi bi-person-workspace me-1.5"></i>
                {metrics.occupiedSeats} / {metrics.totalSeats > 0 ? metrics.totalSeats : 10} Seats Occupied
              </span>
            </div>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          data={units}
          isLoading={isLoading}
          loadingMessage="Loading units & seat data..."
          emptyMessage="No commercial spaces found matching your search or floor filters."
          containerClassName="table-responsive-container table-responsive mt-0"
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
