"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useRef, useCallback, useMemo } from "react";
import { api, getStoredUser } from "@/utils/api";

// ── Types ───────────────────────────────────────────────────────────────────
interface PropertyItem {
  _id: string;
  propertyName: string;
  propertyCode?: string;
  propertyType?: string;
  propertyAddress?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  totalFloors?: number;
  towers?: number;
  totalUnits?: number;
  occupiedUnits?: number;
  availableUnits?: number;
  totalSft?: number;
  occupiedSft?: number;
  availableSft?: number;
  monthlyRevenue?: number;
  maintenanceCost?: number;
  status?: "Active" | "Inactive" | "Draft" | "Archived" | "Maintenance" | "Construction" | "Sold" | "Leased" | string;
  managerName?: string;
  managerAvatar?: string;
  imageUrl?: string;
  images?: Array<{ imageType?: string; imageUrl?: string; url?: string; isPrimary?: boolean }>;
  createdBy?: { _id?: string; name?: string };
  createdAt?: string;
  updatedAt?: string;
}

export const getPropertyImage = (p: any): string => {
  if (!p) return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";
  if (typeof p.imageUrl === "string" && p.imageUrl.trim() !== "") {
    return p.imageUrl;
  }
  if (Array.isArray(p.images) && p.images.length > 0) {
    const primary = p.images.find((img: any) => img?.isPrimary || img?.imageType === "FRONT_VIEW") || p.images[0];
    const url = primary?.imageUrl || primary?.url;
    if (typeof url === "string" && url.trim() !== "") {
      return url;
    }
  }
  if (typeof p.image === "string" && p.image.trim() !== "") {
    return p.image;
  }
  return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";
};

// ── Status Badge Pills Component ───────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
  const s = status || "Active";

  const config: Record<string, { bg: string; text: string; dot: string; border: string; glow: string }> = {
    Active: { bg: "rgba(236, 253, 245, 0.95)", text: "#047857", dot: "#10b981", border: "#a7f3d0", glow: "rgba(16, 185, 129, 0.6)" },
    Leased: { bg: "rgba(240, 253, 244, 0.95)", text: "#15803d", dot: "#22c55e", border: "#bbf7d0", glow: "rgba(34, 197, 94, 0.6)" },
    Maintenance: { bg: "rgba(255, 247, 237, 0.95)", text: "#c2410c", dot: "#f97316", border: "#fed7aa", glow: "rgba(249, 115, 22, 0.6)" },
    Draft: { bg: "rgba(255, 251, 235, 0.95)", text: "#b45309", dot: "#f59e0b", border: "#fde68a", glow: "rgba(245, 158, 11, 0.6)" },
    Inactive: { bg: "rgba(248, 250, 252, 0.95)", text: "#475569", dot: "#94a3b8", border: "#e2e8f0", glow: "rgba(148, 163, 184, 0.6)" },
    Archived: { bg: "rgba(241, 245, 249, 0.95)", text: "#334155", dot: "#64748b", border: "#cbd5e1", glow: "rgba(100, 116, 139, 0.6)" },
    Construction: { bg: "rgba(245, 243, 255, 0.95)", text: "#6d28d9", dot: "#8b5cf6", border: "#ddd6fe", glow: "rgba(139, 92, 246, 0.6)" },
    Sold: { bg: "rgba(239, 246, 255, 0.95)", text: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe", glow: "rgba(59, 130, 246, 0.6)" },
  };

  const style = config[s] || config.Active;

  return (
    <span
      className="badge rounded-pill px-2.5 py-1 fw-extrabold border d-inline-flex align-items-center gap-1.5 shadow-sm"
      style={{
        fontSize: "0.72rem",
        letterSpacing: "0.02em",
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
        backdropFilter: "blur(4px)",
      }}
    >
      <span
        className="rounded-circle d-inline-block"
        style={{
          width: 7,
          height: 7,
          backgroundColor: style.dot,
          boxShadow: `0 0 6px ${style.glow}`,
        }}
      />
      {s}
    </span>
  );
}

// ── Shimmer Skeleton Loading State ───────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="w-100 py-3">
      <div className="row g-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="col-12 col-md-6 col-lg-4">
            <div className="card border p-3 rounded-3 shadow-none bg-white">
              <div className="shimmer-wrapper rounded-3 mb-3" style={{ height: 160, width: "100%" }} />
              <div className="shimmer-wrapper rounded-2 mb-2" style={{ height: 20, width: "70%" }} />
              <div className="shimmer-wrapper rounded-2 mb-3" style={{ height: 14, width: "40%" }} />
              <div className="d-flex justify-content-between">
                <div className="shimmer-wrapper rounded-2" style={{ height: 30, width: "45%" }} />
                <div className="shimmer-wrapper rounded-2" style={{ height: 30, width: "45%" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN PROPERTIES COMPONENT ────────────────────────────────────────────────
function PropertiesContent() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(() => getStoredUser());
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedPropertyForDrawer, setSelectedPropertyForDrawer] = useState<PropertyItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<string>("Overview");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);

  // Search & Filter Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 350);
  };

  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load properties with infinite scrolling support
  const loadProperties = useCallback(async (pageNum: number, isAppending: boolean = false) => {
    if (isAppending) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      let queryUrl = `/properties?page=${pageNum}&limit=${itemsPerPage}`;
      if (debouncedSearch.trim()) {
        queryUrl += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      }
      if (sortOption) {
        queryUrl += `&sort=${encodeURIComponent(sortOption)}`;
      }

      const r = await api.get(queryUrl);
      if (r && r.success && Array.isArray(r.data)) {
        const fetchedItems: PropertyItem[] = r.data;
        const totalP = r.pagination?.pages || 1;
        const totalCount = r.pagination?.total || fetchedItems.length;

        setTotalPages(totalP);
        setTotalItems(totalCount);
        setHasMore(pageNum < totalP);

        if (isAppending) {
          setAllProperties((prev) => {
            const existingIds = new Set(prev.map((item) => item._id));
            const newItems = fetchedItems.filter((item) => !existingIds.has(item._id));
            return [...prev, ...newItems];
          });
          setProperties((prev) => {
            const existingIds = new Set(prev.map((item) => item._id));
            const newItems = fetchedItems.filter((item) => !existingIds.has(item._id));
            return [...prev, ...newItems];
          });
        } else {
          setAllProperties(fetchedItems);
          setProperties(fetchedItems);
          if (fetchedItems.length === 0) setHasMore(false);
        }
      } else {
        if (!isAppending) {
          setAllProperties([]);
          setProperties([]);
        }
        setHasMore(false);
      }
    } catch {
      if (!isAppending) {
        setAllProperties([]);
        setProperties([]);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [itemsPerPage, debouncedSearch, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOption]);

  useEffect(() => {
    if (currentPage === 1) {
      loadProperties(1, false);
    } else {
      loadProperties(currentPage, true);
    }
  }, [currentPage, loadProperties]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { rootMargin: "120px", threshold: 0.01 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore]);

  // Filter & Search Logic
  const filteredProperties = useMemo(() => {
    return allProperties;
  }, [allProperties]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSortOption("newest");
    setCurrentPage(1);
  };

  const isAdmin = !user || ["Admin", "SUPER_ADMIN", "Super Admin"].includes(user.role || "");

  return (
    <div className="p-0 d-flex flex-column gap-3 min-vh-100" style={{ backgroundColor: "var(--page-bg, #f8fafc)" }}>
      {/* ── 1. Sticky Search & Filter Toolbar ────────────────────────────────────── */}
      <div
        className="card border p-3 rounded-3 mb-1 sticky-top"
        style={{
          top: 0,
          zIndex: 100,
          backgroundColor: "#ffffff",
          borderColor: "var(--border, #e2e8f0)",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)"
        }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Left: Search Bar */}
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "600px" }}>
            <div className="position-relative flex-grow-1">
              <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ fontSize: "0.85rem" }}></i>
              <input
                type="text"
                placeholder="Search by property name, code, city, type..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="form-control form-control-sm ps-5 border"
                style={{ height: 38, borderRadius: "var(--radius, 10px)", fontSize: "0.85rem" }}
              />
              {searchQuery && (
                <button className="btn btn-link p-0 position-absolute end-0 top-50 translate-middle-y me-3 text-muted text-decoration-none" onClick={() => handleSearchChange("")}>×</button>
              )}
            </div>
          </div>

          {/* Right: Sort & Add Property Button */}
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm border fw-semibold text-dark shadow-xs"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{ width: "175px", height: 38, borderRadius: "10px", fontSize: "0.83rem", borderColor: "#e2e8f0" }}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="revenue-desc">Sort: Revenue (High-Low)</option>
              <option value="occupancy-desc">Sort: Occupancy (High-Low)</option>
            </select>

            {isAdmin && (
              <Link
                href="/admin/properties/add"
                className="btn btn-orange-primary shadow-sm fw-bold px-3 d-flex align-items-center gap-1.5 text-decoration-none"
                style={{ height: 38, borderRadius: "var(--radius, 10px)" }}
              >
                <i className="bi bi-plus-lg me-1"></i>
                <span>Add Property</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedPropertyIds.length > 0 && (
        <div className="p-3 bg-dark text-white rounded-3 d-flex align-items-center justify-content-between animate-fade-up shadow-lg">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-orange text-white fw-bold px-2 py-1">{selectedPropertyIds.length} Selected</span>
            <span className="small text-light">Properties selected for bulk action</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-light" onClick={() => alert(`Exporting ${selectedPropertyIds.length} properties...`)}>
              <i className="bi bi-download me-1"></i> Export Selected
            </button>
            <button className="btn btn-sm btn-link text-white-50 text-decoration-none ms-2" onClick={() => setSelectedPropertyIds([])}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── 2. PROPERTY GRID ──────────────────────────────────────────────── */}
      {isLoading ? (
        <SkeletonLoader />
      ) : filteredProperties.length === 0 ? (
        /* ── Empty State ── */
        <div className="card border bg-white p-5 text-center rounded-3 my-4">
          <div
            className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
            style={{ width: 80, height: 80, backgroundColor: "var(--brand-bg, #fff7ed)", color: "var(--brand-orange, #ea580c)" }}
          >
            <i className="bi bi-building-dash fs-1"></i>
          </div>
          <h5 className="fw-bold text-dark mb-1">No Properties Found</h5>
          <p className="text-muted small mx-auto mb-4" style={{ maxWidth: 420 }}>
            We couldn't find any property records matching your search query.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-light border fw-bold text-dark px-4" onClick={handleResetFilters}>
              Reset Search
            </button>
            {isAdmin && (
              <Link href="/admin/properties/add" className="btn btn-orange-primary text-decoration-none">
                + Add Property
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* ── GRID VIEW ── */
        <div className="row g-4">
          {filteredProperties.map((p) => {
            const occPercent = p.totalSft ? Math.round(((p.occupiedSft || 0) / p.totalSft) * 100) : 0;

            return (
              <div key={p._id} className="col-12 col-md-6 col-lg-4">
                <div
                  className="card border bg-white rounded-3 h-100 mkt-card-clean overflow-hidden d-flex flex-column transition-all cursor-pointer"
                  style={{ borderColor: "var(--border, #e2e8f0)", borderRadius: "var(--radius, 10px)" }}
                  onClick={() => router.push(`/admin/properties/${p._id}`)}
                >
                  {/* Property Image & Badges Overlay */}
                  <div
                    className="position-relative overflow-hidden"
                    style={{ height: 180, backgroundColor: "#f1f5f9" }}
                  >
                    <img
                      src={getPropertyImage(p)}
                      alt={p.propertyName}
                      className="w-100 h-100 object-fit-cover transition-all"
                      style={{ transition: "transform 0.5s ease" }}
                    />

                    {/* Top Badges */}
                    <div className="position-absolute top-0 start-0 p-3 d-flex gap-2 align-items-center">
                      <StatusBadge status={p.status} />
                      <span className="badge bg-dark bg-opacity-75 text-white extra-small fw-semibold">
                        {p.propertyType || "Commercial"}
                      </span>
                    </div>

                    {/* Bottom Image Overlay Info */}
                    <div
                      className="position-absolute bottom-0 start-0 end-0 p-2 px-3 d-flex justify-content-between align-items-center text-white"
                      style={{ background: "linear-gradient(to top, rgba(15,23,42,0.85), transparent)" }}
                    >
                      <span className="extra-small fw-bold">
                        <i className="bi bi-geo-alt me-1 text-warning"></i>{p.city || "Location"}, {p.country || "USA"}
                      </span>
                      <span className="extra-small fw-bold opacity-75">{p.propertyCode || "PROP-001"}</span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <h6
                      className="fw-extrabold text-dark mb-1 text-truncate hover-orange"
                      style={{ fontSize: "1rem" }}
                    >
                      {p.propertyName}
                    </h6>
                    <p className="text-muted extra-small text-truncate mb-3">
                      {p.propertyAddress || "Financial District, Main Avenue"}
                    </p>

                    {/* Quick Specs Grid */}
                    <div className="p-2 bg-light rounded-2 mb-3 extra-small">
                      <span className="text-muted d-block">Total Area</span>
                      <strong className="text-dark">{p.totalSft ? (p.totalSft / 1000).toFixed(0) + "K" : "0"} SFT</strong>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1 extra-small">
                        <span className="fw-semibold text-muted">Occupancy</span>
                        <span className="fw-bold text-dark">{occPercent}%</span>
                      </div>
                      <div className="progress" style={{ height: 6, borderRadius: 4, backgroundColor: "#e2e8f0" }}>
                        <div
                          className="progress-bar rounded-pill"
                          role="progressbar"
                          style={{ width: `${occPercent}%`, backgroundColor: "var(--brand-orange, #ea580c)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="py-3 text-center" style={{ minHeight: 50 }}>
        {isLoadingMore && (
          <div className="d-flex align-items-center justify-content-center gap-2 text-muted py-2">
            <div className="spinner-border spinner-border-sm text-orange" role="status" style={{ color: "var(--brand-orange, #ea580c)" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="fw-semibold extra-small text-dark">Loading more properties...</span>
          </div>
        )}
      </div>

      {/* ── 4. PROPERTY DETAILS SLIDE-OVER DRAWER (Right) ───────────────────── */}
      {selectedPropertyForDrawer && (
        <>
          <div
            className="position-fixed inset-0 bg-dark bg-opacity-50"
            style={{ zIndex: 1045, backdropFilter: "blur(2px)" }}
            onClick={() => setSelectedPropertyForDrawer(null)}
          />
          <div
            className="position-fixed top-0 end-0 bottom-0 bg-white shadow-lg d-flex flex-column animate-fade-up"
            style={{ width: "min(650px, 100vw)", zIndex: 1050, borderLeft: "1px solid var(--border, #e2e8f0)" }}
          >
            {/* Drawer Header */}
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-orange fw-bold"
                  style={{ width: 44, height: 44, backgroundColor: "var(--brand-bg, #fff7ed)", color: "var(--brand-orange, #ea580c)" }}
                >
                  <i className="bi bi-building fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">{selectedPropertyForDrawer.propertyName}</h5>
                  <span className="text-muted extra-small">{selectedPropertyForDrawer.propertyAddress || selectedPropertyForDrawer.city}</span>
                </div>
              </div>
              <button className="btn-close shadow-none" onClick={() => setSelectedPropertyForDrawer(null)} />
            </div>

            {/* Drawer Tabs Navigation */}
            <div className="border-bottom bg-white px-3 overflow-auto no-scrollbar d-flex gap-1">
              {[
                "Overview", "Buildings", "Floors", "Units", "Owners",
                "Documents", "Tenants", "Leases", "Maintenance",
                "Invoices", "Gallery", "History"
              ].map((tab) => (
                <button
                  key={tab}
                  className={`tab-item extra-small ${drawerTab === tab ? "active fw-bold text-dark" : "text-muted"}`}
                  onClick={() => setDrawerTab(tab)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Drawer Body Content */}
            <div className="flex-grow-1 overflow-auto p-4">
              {drawerTab === "Overview" && (
                <div className="d-flex flex-column gap-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block">Property Code</span>
                        <strong className="text-dark small">{selectedPropertyForDrawer.propertyCode || "PROP-001"}</strong>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block">Property Type</span>
                        <strong className="text-dark small">{selectedPropertyForDrawer.propertyType || "Commercial"}</strong>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block">Total SFT</span>
                        <strong className="text-dark small">{selectedPropertyForDrawer.totalSft?.toLocaleString() || "0"} SQFT</strong>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded-3 bg-light">
                        <span className="text-muted extra-small d-block">Occupied SFT</span>
                        <strong className="text-dark small">{selectedPropertyForDrawer.occupiedSft?.toLocaleString() || "0"} SQFT</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className="fw-bold text-dark mb-2">Structure & Capacity</h6>
                    <div className="border rounded-3 p-3 bg-white">
                      {[
                        ["Floors Count", `${selectedPropertyForDrawer.totalFloors || 1} Floors`],
                        ["Towers / Blocks", `${selectedPropertyForDrawer.towers || 1} Towers`],
                        ["Total Units", `${selectedPropertyForDrawer.totalUnits || 10} Units`],
                        ["Occupied Units", `${selectedPropertyForDrawer.occupiedUnits || 8} Units`],
                        ["Available Units", `${selectedPropertyForDrawer.availableUnits || 2} Units`],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="d-flex justify-content-between py-2 border-bottom extra-small">
                          <span className="text-muted">{lbl}</span>
                          <strong className="text-dark">{val}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h6 className="fw-bold text-dark mb-2">Assigned Manager</h6>
                    <div className="border rounded-3 p-3 bg-white d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-dark text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                        {selectedPropertyForDrawer.managerAvatar || "M"}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0 text-dark small">{selectedPropertyForDrawer.managerName || "Property Manager"}</h6>
                        <span className="text-muted extra-small">Senior Assets Manager</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab !== "Overview" && (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-folder2-open fs-1 d-block mb-2 text-warning"></i>
                  <h6 className="fw-bold text-dark">{drawerTab} Details</h6>
                  <p className="extra-small max-w-sm mx-auto">
                    Live records loaded for {drawerTab.toLowerCase()} in {selectedPropertyForDrawer.propertyName}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}


    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
          <div className="spinner-border text-orange" role="status" style={{ color: "var(--brand-orange, #ea580c)" }} />
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
