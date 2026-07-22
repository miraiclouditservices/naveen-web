"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import FloorModal from "@/components/dashboard/FloorModal";
import FloorFilterDrawer from "./FloorFilterDrawer";
import FloorDetailsDrawer from "./FloorDetailsDrawer";

const ITEMS_PER_PAGE = 10;

export default function FloorsPageClient() {
  const [floors, setFloors] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  // Top Metrics state
  const [metrics, setMetrics] = useState({
    totalFloors: 0,
    totalSft: 0,
    occupiedSft: 0,
    availableSft: 0,
    activeAssignments: 0,
  });

  // Filter state
  const [selectedPropertyId, setSelectedPropertyId] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [floorTypeFilter, setFloorTypeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Selected Floor Details Sidebar
  const [selectedFloor, setSelectedFloor] = useState<any>(null);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFloor, setEditFloor] = useState<any>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 400);
  };

  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetchProperties();
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse local user context", e);
        }
      }
    }
  }, []);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const buildParams = useCallback(() => {
    const p: Record<string, string> = {
      page: String(currentPage),
      limit: String(ITEMS_PER_PAGE),
    };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (selectedPropertyId !== "All") p.property = selectedPropertyId;
    if (statusFilter !== "All") p.status = statusFilter;
    return new URLSearchParams(p).toString();
  }, [currentPage, debouncedSearch, selectedPropertyId, statusFilter]);

  const fetchFloors = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await api.get(`/floors?${buildParams()}`);
      if (r.success) {
        const data = r.data || [];
        setFloors(data);
        setTotalPages(r.totalPages || r.pagination?.pages || 1);
        setTotalItems(r.total || r.pagination?.total || data.length);
      }
    } catch { } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  const fetchMetrics = useCallback(async () => {
    try {
      let queryParts = [];
      if (selectedPropertyId !== "All") queryParts.push(`propertyId=${selectedPropertyId}`);
      const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      const res = await api.get(`/dashboard/metrics${queryString}`);
      if (res.success && res.data?.metrics) {
        const m = res.data.metrics;
        setMetrics({
          totalFloors: m.totalFloors || 0,
          totalSft: m.totalSft || 0,
          occupiedSft: m.occupiedSft || 0,
          availableSft: (m.totalSft || 0) - (m.occupiedSft || 0),
          activeAssignments: 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    fetchFloors();
    fetchMetrics();
  }, [fetchFloors, fetchMetrics]);

  useEffect(() => {
    if (floors.length > 0) {
      const count = floors.filter(f => f.assignedAdmin || f.assignedOwner).length;
      setMetrics(prev => ({ ...prev, activeAssignments: count }));
    }
  }, [floors]);

  const fetchProperties = async () => {
    try {
      const r = await api.get("/properties");
      if (r.success && r.data) {
        setProperties(r.data);
      }
    } catch { }
  };

  const handleSaveFloor = async (data: any) => {
    try {
      if (editFloor) await api.put(`/floors/${editFloor._id}`, data);
      else await api.post("/floors", data);
      fetchFloors();
      fetchMetrics();
    } catch { }
    setIsModalOpen(false);
    setEditFloor(null);
  };

  const handleReset = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedPropertyId("All");
    setStatusFilter("All");
    setFloorTypeFilter("All");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const activeFilters = [
    debouncedSearch.trim() !== "",
    selectedPropertyId !== "All",
    statusFilter !== "All",
    floorTypeFilter !== "All",
  ].filter(Boolean).length;

  const columns: TableColumn<any>[] = [
    {
      header: "Floor & Property",
      render: (f) => (
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "#eff6ff",
              color: "#2563eb"
            }}
          >
            <i className="bi bi-layers" style={{ fontSize: "0.95rem" }} />
          </div>
          <div>
            <button
              onClick={() => setSelectedFloor(f)}
              className="btn btn-link p-0 text-decoration-none fw-bold text-dark text-start border-0"
              style={{ fontSize: "0.85rem", lineHeight: 1.2 }}
            >
              {f.floorName || `Floor ${f.floorNumber}`}
            </button>
            <div className="text-muted small mt-0.5" style={{ fontSize: "0.75rem" }}>
              {f.property?.propertyName || "Commercial Property"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Assigned Admin",
      render: (f) => {
        const adminName = f.assignedAdmin?.name || f.assignedOwner?.ownerName;
        const adminPhone = f.assignedAdmin?.phoneNumber || f.assignedOwner?.contactNumber;

        return adminName ? (
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
                border: "1px solid var(--border-color)"
              }}
            >
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="d-flex flex-column">
              <span className="fw-medium text-dark" style={{ fontSize: "0.85rem" }}>
                {adminName}
              </span>
              {adminPhone && (
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {adminPhone}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span
            className="badge px-2 py-1 fw-semibold"
            style={{
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fee2e2",
              fontSize: "0.75rem",
              borderRadius: "var(--radius-full)"
            }}
          >
            Unassigned
          </span>
        );
      },
    },
    {
      header: "Monthly Fee",
      render: (f) => f.floorRevenue > 0 ? (
        <div style={{ fontSize: "0.85rem" }}>
          <span className="fw-bold text-dark">₹ {Number(f.floorRevenue).toLocaleString("en-IN")}</span>
          <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>Monthly</span>
        </div>
      ) : (
        <span className="text-muted">—</span>
      ),
    },
    {
      header: "Next Payment",
      render: (f) => {
        const activeLease = f.occupants?.find((o: any) => o.nextDueDate);
        if (!activeLease || !activeLease.nextDueDate) return <span className="text-muted">—</span>;

        const nextDate = new Date(activeLease.nextDueDate);
        const formattedDate = nextDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        const diffTime = nextDate.getTime() - Date.now();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return (
          <div style={{ fontSize: "0.85rem" }}>
            <span className="fw-semibold text-dark">{formattedDate}</span>
            <span className={diffDays < 0 ? "text-danger d-block fw-semibold" : "text-success d-block fw-semibold"} style={{ fontSize: "0.72rem" }}>
              {diffDays < 0 ? `Overdue by ${Math.abs(diffDays)} Days` : `In ${diffDays} Days`}
            </span>
          </div>
        );
      },
    },
    {
      header: "Occupancy",
      render: (f) => {
        const cap = f.totalSft || 0;
        const occ = f.occupiedSft || 0;
        const pct = cap > 0 ? Math.round((occ / cap) * 100) : 0;
        return (
          <div style={{ minWidth: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: "0.78rem" }}>
              <span className="fw-semibold text-dark">{occ.toLocaleString("en-IN")} / {cap.toLocaleString("en-IN")} SFT</span>
              <span className="text-secondary fw-bold ms-2">{pct}%</span>
            </div>
            <div className="progress" style={{ height: "5px", backgroundColor: "#f1f5f9", borderRadius: "10px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct >= 90 ? "#2563eb" : pct >= 50 ? "#3b82f6" : "#60a5fa",
                  borderRadius: "10px"
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: "Status",
      render: (f) => {
        const isAct = f.status === "Active";
        return (
          <span
            className="badge px-2.5 py-1.5 fw-bold"
            style={{
              fontSize: "0.75rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: isAct ? "#f0fdf4" : "#fef2f2",
              color: isAct ? "#16a34a" : "#dc2626",
              border: `1px solid ${isAct ? "#dcfce7" : "#fee2e2"}`
            }}
          >
            {f.status || "Active"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      style: { textAlign: "right" as const },
      render: (f) => (
        <div className="d-flex gap-2 align-items-center justify-content-end" onClick={(e) => e.stopPropagation()}>
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
            title="View Details"
            onClick={() => setSelectedFloor(f)}
          >
            <i className="bi bi-eye" style={{ fontSize: "0.85rem" }} />
          </button>
          {isSuperAdmin && (
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
              title="Edit Floor"
              onClick={() => {
                setEditFloor(f);
                setIsModalOpen(true);
              }}
            >
              <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        fontFamily: "var(--font-geist-sans), Inter, sans-serif",
        color: "var(--text-primary)",
        padding: "0px 10px"
      }}
    >
      <FloorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditFloor(null);
        }}
        onSave={handleSaveFloor}
        editData={editFloor}
      />

      <FloorFilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        setSelectedPropertyId={setSelectedPropertyId}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        floorTypeFilter={floorTypeFilter}
        setFloorTypeFilter={setFloorTypeFilter}
        onApply={() => {
          setCurrentPage(1);
          setShowFilters(false);
        }}
        onReset={handleReset}
      />

      {/* ── METRIC STAT CARDS ── */}
      <div className="row g-2 mb-3 justify-content-start" style={{ marginTop: "-12px" }}>
        {/* Card 1: Total Floors */}
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
              <i className="bi bi-layers" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Total Floors</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.totalFloors}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Capacity */}
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
              <i className="bi bi-pie-chart" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Total Capacity</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.totalSft.toLocaleString("en-IN")} SFT</div>
            </div>
          </div>
        </div>

        {/* Card 3: Occupied Area */}
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
              <i className="bi bi-building-check" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Occupied Area</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.occupiedSft.toLocaleString("en-IN")} SFT</div>
            </div>
          </div>
        </div>

        {/* Card 4: Available Area */}
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
                color: "#ea580c"
              }}
            >
              <i className="bi bi-building-dash" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Available Area</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.availableSft.toLocaleString("en-IN")} SFT</div>
            </div>
          </div>
        </div>

        {/* Card 5: Active Assignments */}
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
                color: "#0f766e"
              }}
            >
              <i className="bi bi-person-badge" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Active Admins</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.activeAssignments}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CARD CONTAINER ── */}
      <div
        className="card border-0 p-4"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px"
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <div>
            <h5 className="fw-bold m-0" style={{ color: "var(--text-main)", fontSize: "1.1rem" }}>Floors Directory</h5>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            {/* Search Input */}
            <div className="position-relative">
              <i className="bi bi-search text-muted position-absolute" style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem" }}></i>
              <input
                type="text"
                placeholder="Search floors, property..."
                className="form-control form-control-sm shadow-none"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
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

            {/* Filter Drawer Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="btn btn-sm btn-light border fw-semibold d-flex align-items-center gap-1.5"
              style={{
                height: "36px",
                borderRadius: "10px",
                borderColor: "var(--border-color)",
                backgroundColor: "var(--bg-card)",
                fontSize: "0.85rem",
                padding: "0 14px"
              }}
            >
              <i className="bi bi-funnel"></i> Filters {activeFilters > 0 && <span className="badge bg-dark rounded-pill ms-1">{activeFilters}</span>}
            </button>

            {/* Add Floor Button */}
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setEditFloor(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-dark btn-sm fw-bold px-3 d-flex align-items-center gap-2"
                style={{
                  backgroundColor: "var(--dark-section)",
                  borderRadius: "10px",
                  height: "36px",
                  fontSize: "0.85rem"
                }}
              >
                <i className="bi bi-plus-lg"></i> Add Floor
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={floors}
          isLoading={isLoading}
          loadingMessage="Loading floors & spaces..."
          emptyMessage="No floors configured matching the selected filters."
          containerClassName="table-responsive-container table-responsive mt-0"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* RIGHT SIDEBAR DETAILS PANEL */}
      {selectedFloor && (
        <FloorDetailsDrawer
          selectedFloor={selectedFloor}
          onClose={() => setSelectedFloor(null)}
          onEdit={(floor) => {
            setEditFloor(floor);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
