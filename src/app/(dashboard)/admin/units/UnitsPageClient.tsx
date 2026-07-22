"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import UnitModal from "@/components/dashboard/UnitModal";
import UnitFilterDrawer from "./UnitFilterDrawer";
import UnitDetailsDrawer from "./UnitDetailsDrawer";

const ITEMS_PER_PAGE = 10;

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "Occupied":
      return { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" };
    case "Reserved":
      return { backgroundColor: "#fff7ed", color: "#ea580c", border: "1px solid #ffedd5" };
    case "Available":
      return { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe" };
    default:
      return { backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2" };
  }
};

export default function UnitsPageClient() {
  const [units, setUnits] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);

  // Top Metrics
  const [metrics, setMetrics] = useState({
    totalUnits: 0,
    occupiedUnits: 0,
    availableUnits: 0,
    totalSft: 0,
    occupiedSft: 0,
    availableSft: 0,
    totalRevenue: 0,
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

  // Selected Unit Details Sidebar
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [activeDetailTab, setActiveDetailTab] = useState("Overview");

  // Invoices data for details tab
  const [unitInvoices, setUnitInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<any>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 400);
  };

  useEffect(() => {
    fetchProperties();
    fetchFloors();
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
      }
    } catch {} finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  const fetchMetrics = useCallback(async () => {
    try {
      let queryParts = [];
      if (selectedPropertyId !== "all") queryParts.push(`propertyId=${selectedPropertyId}`);
      if (selectedStatus !== "all") {
        let statusVal = selectedStatus;
        if (selectedStatus === "Available") statusVal = "Vacant";
        queryParts.push(`status=${statusVal}`);
      }
      const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      const res = await api.get(`/dashboard/metrics${queryString}`);
      if (res.success && res.data?.metrics) {
        const m = res.data.metrics;
        setMetrics({
          totalUnits: m.totalUnits || 0,
          occupiedUnits: m.occupiedUnits || 0,
          availableUnits: (m.totalUnits || 0) - (m.occupiedUnits || 0),
          totalSft: m.totalSft || 0,
          occupiedSft: m.occupiedSft || 0,
          availableSft: m.availableSft || 0,
          totalRevenue: m.totalRevenue || 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedPropertyId, selectedStatus]);

  const fetchUnitInvoices = useCallback(async () => {
    if (!selectedUnit?.lease?._id) {
      setUnitInvoices([]);
      return;
    }
    setInvoicesLoading(true);
    try {
      const res = await api.get(`/invoices?leaseId=${selectedUnit.lease._id}&limit=10`);
      if (res.success) {
        setUnitInvoices(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInvoicesLoading(false);
    }
  }, [selectedUnit]);

  useEffect(() => {
    fetchUnits();
    fetchMetrics();
  }, [fetchUnits, fetchMetrics]);

  useEffect(() => {
    if (selectedUnit && activeDetailTab === "Financials") {
      fetchUnitInvoices();
    }
  }, [selectedUnit, activeDetailTab, fetchUnitInvoices]);

  const fetchProperties = async () => {
    try {
      const r = await api.get("/properties");
      if (r.success) setProperties(r.data);
    } catch {}
  };

  const fetchFloors = async () => {
    try {
      const r = await api.get("/floors?limit=100");
      if (r.success) setFloors(r.data);
    } catch {}
  };

  const handleSaveUnit = async (data: any) => {
    try {
      if (editUnit) await api.put(`/units/${editUnit._id}`, data);
      else await api.post("/units", data);
      fetchUnits();
      fetchMetrics();
    } catch {}
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

  const columns: TableColumn<any>[] = [
    {
      header: "Unit Number",
      render: (u) => (
        <button
          onClick={() => {
            setSelectedUnit(u);
            setActiveDetailTab("Overview");
          }}
          className="btn btn-link text-decoration-none fw-bold text-dark p-0 align-baseline text-start border-0"
          style={{ fontSize: "0.85rem" }}
        >
          {u.unitNumber}
        </button>
      ),
    },
    {
      header: "Property",
      render: (u) => (
        <span className="text-dark fw-medium" style={{ fontSize: "0.85rem" }}>
          {u.property?.propertyName || "—"}
        </span>
      ),
    },
    {
      header: "Floor",
      render: (u) => (
        <span className="text-muted" style={{ fontSize: "0.85rem" }}>
          {u.floor?.floorName || `Floor ${u.floor?.floorNumber || u.floorNumber || "—"}`}
        </span>
      ),
    },
    {
      header: "Tenant",
      render: (u) => {
        const occ = occupantDisplay(u);
        if (!occ) return <span className="text-muted">—</span>;
        return (
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{occ.name}</span>
            {u.unitStatus === "Occupied" && (
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "0.85rem" }} />
            )}
          </div>
        );
      },
    },
    {
      header: "Area (SFT)",
      render: (u) => (
        <span className="text-dark fw-medium" style={{ fontSize: "0.85rem" }}>
          {u.sqft ? u.sqft.toLocaleString("en-IN") : "—"}
        </span>
      ),
    },
    {
      header: "Monthly Rent",
      render: (u) => {
        const rent = u.lease?.monthlyRent || u.monthlyRent || (u.sqft * 50);
        return (
          <span className="text-dark fw-bold" style={{ fontSize: "0.85rem" }}>
            ₹ {rent ? Number(rent).toLocaleString("en-IN") : "—"}
          </span>
        );
      },
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
              borderRadius: "var(--radius-full)",
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
            onClick={() => {
              setSelectedUnit(u);
              setActiveDetailTab("Overview");
            }}
          >
            <i className="bi bi-eye" style={{ fontSize: "0.85rem" }} />
          </button>
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
            title="Edit Unit"
            onClick={() => {
              setEditUnit(u);
              setIsModalOpen(true);
            }}
          >
            <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }} />
          </button>
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
      <div className="row g-2 mb-3 justify-content-start" style={{ marginTop: "-12px" }}>
        {/* Card 1: Total Units */}
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
              <i className="bi bi-building" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Total Units</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.totalUnits}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Occupied Units */}
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
              <i className="bi bi-person-check" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Occupied Units</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.occupiedUnits}</div>
            </div>
          </div>
        </div>

        {/* Card 3: Available Units */}
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
              <i className="bi bi-door-open" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Available Units</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.availableUnits}</div>
            </div>
          </div>
        </div>

        {/* Card 4: Total Area */}
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
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Total Area</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.totalSft.toLocaleString("en-IN")} SFT</div>
            </div>
          </div>
        </div>

        {/* Card 5: Occupied SFT */}
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
              <i className="bi bi-building-check" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Occupied SFT</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{metrics.occupiedSft.toLocaleString("en-IN")} SFT</div>
            </div>
          </div>
        </div>

        {/* Card 6: Revenue Generated */}
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
                backgroundColor: "#fdf2f8",
                color: "#be185d"
              }}
            >
              <i className="bi bi-currency-rupee" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Revenue</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>₹{metrics.totalRevenue.toLocaleString("en-IN")}</div>
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
            <h5 className="fw-bold m-0" style={{ color: "var(--text-main)", fontSize: "1.1rem" }}>Units Directory</h5>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            {/* Search Input */}
            <div className="position-relative">
              <i className="bi bi-search text-muted position-absolute" style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem" }}></i>
              <input
                type="text"
                placeholder="Search units, property..."
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

            {/* Add Unit Button */}
            <button
              onClick={() => {
                setEditUnit(null);
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
              <i className="bi bi-plus-lg"></i> Add Unit
            </button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={units}
          isLoading={isLoading}
          loadingMessage="Loading units & space data..."
          emptyMessage="No commercial spaces found matching your search or filters."
          containerClassName="table-responsive-container table-responsive mt-0"
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* RIGHT DETAILS DRAWER / SLIDE-OVER */}
      {selectedUnit && (
        <UnitDetailsDrawer
          selectedUnit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
          activeDetailTab={activeDetailTab}
          setActiveDetailTab={setActiveDetailTab}
          unitInvoices={unitInvoices}
          invoicesLoading={invoicesLoading}
          onEdit={(unit) => {
            setEditUnit(unit);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
