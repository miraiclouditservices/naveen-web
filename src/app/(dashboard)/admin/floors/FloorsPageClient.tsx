"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import FloorModal from "@/components/dashboard/FloorModal";
import FloorBulkUploadModal from "@/components/dashboard/FloorBulkUploadModal";
import FloorFilterDrawer from "./FloorFilterDrawer";

const ITEMS_PER_PAGE = 10;

function StatusBadgeDropdown({
  floorId,
  currentStatus,
  onStatusChange,
  disabled
}: {
  floorId: string;
  currentStatus: string;
  onStatusChange: (floorId: string, newStatus: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const s = currentStatus || "Active";
  const config: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    Active: { bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e", border: "#dcfce7" },
    Maintenance: { bg: "#fffbe6", text: "#d97706", dot: "#f59e0b", border: "#fef3c7" },
    Inactive: { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444", border: "#fee2e2" },
  };
  const style = config[s] || config.Active;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="position-relative d-inline-block" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <span
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="badge rounded-pill px-2.5 py-1.5 fw-bold border d-inline-flex align-items-center gap-1.5 shadow-sm"
        style={{
          fontSize: "0.74rem",
          backgroundColor: style.bg,
          color: style.text,
          borderColor: style.border,
          userSelect: "none",
          transition: "all 0.15s ease",
          cursor: disabled ? "default" : "pointer"
        }}
      >
        <span
          className="rounded-circle d-inline-block"
          style={{
            width: 6,
            height: 6,
            backgroundColor: style.dot,
            boxShadow: `0 0 5px ${style.dot}`
          }}
        />
        {s}
        {!disabled && <i className="bi bi-chevron-down ms-0.5" style={{ fontSize: "0.65rem" }} />}
      </span>

      {isOpen && !disabled && (
        <div
          className="position-absolute bg-white rounded-3 shadow-lg border p-1"
          style={{
            top: "100%",
            left: 0,
            marginTop: "4px",
            zIndex: 1050,
            minWidth: "135px",
            fontSize: "0.8rem"
          }}
        >
          {[
            { label: "Active", dot: "#22c55e", text: "#16a34a" },
            { label: "Maintenance", dot: "#f59e0b", text: "#d97706" },
            { label: "Inactive", dot: "#ef4444", text: "#dc2626" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className={`btn btn-sm w-100 text-start d-flex align-items-center gap-2 px-2 py-1.5 rounded border-0 ${s === item.label ? 'fw-bold bg-light' : ''}`}
              style={{ color: item.text, fontSize: "0.78rem" }}
              onClick={() => {
                setIsOpen(false);
                if (s !== item.label) {
                  onStatusChange(floorId, item.label);
                }
              }}
            >
              <span
                className="rounded-circle d-inline-block"
                style={{ width: 6, height: 6, backgroundColor: item.dot }}
              />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FloorsPageClient() {
  const [floors, setFloors] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

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
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const handleStatusChange = async (floorId: string, newStatus: string) => {
    setUpdatingStatusId(floorId);
    try {
      const res = await api.patch(`/floors/${floorId}/status`, { status: newStatus });
      if (res.success) {
        setFloors((prev) =>
          prev.map((f) => (f._id === floorId ? { ...f, status: newStatus } : f))
        );
      }
    } catch (err: any) {
      console.error("Failed to update floor status:", err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
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
    if (floorTypeFilter !== "All") p.floorType = floorTypeFilter;
    return new URLSearchParams(p).toString();
  }, [currentPage, debouncedSearch, selectedPropertyId, statusFilter, floorTypeFilter]);

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

  useEffect(() => {
    fetchFloors();
  }, [fetchFloors]);

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
        <div>
          <Link
            href={`/admin/floors/${f._id}`}
            className="text-decoration-none fw-bold text-dark text-start d-block"
            style={{ fontSize: "0.85rem", lineHeight: 1.2 }}
          >
            {f.floorName || `Floor ${f.floorNumber}`}
          </Link>
          <div className="text-muted small mt-0.5" style={{ fontSize: "0.75rem" }}>
            {f.property?.propertyName || "Commercial Property"}
          </div>
        </div>
      ),
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
      render: (f) => (
        <StatusBadgeDropdown
          floorId={f._id}
          currentStatus={f.status || "Active"}
          onStatusChange={handleStatusChange}
          disabled={updatingStatusId === f._id || !isSuperAdmin}
        />
      ),
    },
    {
      header: "Actions",
      style: { textAlign: "right" as const },
      render: (f) => (
        <div className="d-flex gap-2 align-items-center justify-content-end" onClick={(e) => e.stopPropagation()}>
          {/* <Link
            href={`/admin/floors/${f._id}`}
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-app)",
              border: "none",
              color: "var(--text-main)"
            }}
            title="View Full Floor Page"
          >
            <i className="bi bi-eye" style={{ fontSize: "0.85rem" }} />
          </Link> */}
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

      <FloorBulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={() => {
          fetchFloors();
        }}
        properties={properties}
        defaultPropertyId={selectedPropertyId !== "All" ? selectedPropertyId : ""}
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

            {/* Action Buttons */}
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setIsBulkUploadOpen(true)}
                  className="btn btn-sm btn-outline-dark fw-bold px-3 d-flex align-items-center gap-2"
                  style={{
                    borderRadius: "10px",
                    height: "36px",
                    fontSize: "0.85rem"
                  }}
                >
                  <i className="bi bi-file-earmark-arrow-up"></i> Bulk Upload
                </button>
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
              </>
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
    </div>
  );
}
