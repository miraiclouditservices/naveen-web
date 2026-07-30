"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import AssetFormModal from "@/components/assets/AssetFormModal";
import AssetDetailView from "@/components/assets/AssetDetailView";
import { exportAssetsToExcel } from "@/utils/exportAssetsExcel";
import { exportAssetsToPdf } from "@/utils/exportAssetsPdf";

const ITEMS_PER_PAGE = 20;

export default function AssetsPage() {

  // ── Server Data ───────────────────────────────────────────────────────────
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [allFloors, setAllFloors] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    amcActive: 0,
    amcExpired: 0,
    amcExpiringSoon: 0,
    totalAmcValue: 0,
    annualAmcCost: 0,
    noAmc: 0,
  });

  // ── Categories State (for filters) ─────────────────────────────────────────
  const [categories, setCategories] = useState<any[]>([]);

  // ── Query Parameters (Assets - High Density Filters) ──────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [amcStatusFilter, setAmcStatusFilter] = useState("All");

  // ── Split View Telemetry Drawer State ─────────────────────────────────────
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [detailAsset, setDetailAsset] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "vendor" | "amc" | "logs">("overview");

  // ── Form Modal State ──────────────────────────────────────────────────────
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Export Modal State ────────────────────────────────────────────────────
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState("excel");
  const [exportPreviewData, setExportPreviewData] = useState<any[] | null>(null);

  // ── Debounce Search Input ─────────────────────────────────────────────────
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 400);
  };

  // ── Reset page when filter changes ────────────────────────────────────────
  useEffect(() => { setCurrentPage(1); }, [statusFilter, categoryFilter, propertyFilter, vendorFilter, amcStatusFilter]);

  // ── Fetch Side Dropdown Options ───────────────────────────────────────────
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [propRes, vendorRes] = await Promise.all([
          api.get("/properties?limit=1000"),
          api.get("/vendors?limit=1000")
        ]);
        if (propRes.success) setProperties(propRes.data);
        if (vendorRes.success) setVendors(vendorRes.data);
      } catch (err) {
        console.error("Failed to load toolbar dropdown options:", err);
      }
    };
    fetchDropdownOptions();
  }, []);

  // ── Build API Query Params ────────────────────────────────────────────────
  const buildParams = useCallback(() => {
    const params: Record<string, string> = {
      page: String(currentPage),
      limit: String(ITEMS_PER_PAGE),
    };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (statusFilter !== "All") params.assetStatus = statusFilter;
    if (categoryFilter !== "All") params.category = categoryFilter;
    if (propertyFilter !== "All") params.property = propertyFilter;
    if (vendorFilter !== "All") params.vendor = vendorFilter;
    if (amcStatusFilter !== "All") params.amcStatus = amcStatusFilter;
    return new URLSearchParams(params).toString();
  }, [currentPage, debouncedSearch, statusFilter, categoryFilter, propertyFilter, vendorFilter, amcStatusFilter]);

  // ── Fetch Assets ──────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/assets?${buildParams()}`);
      if (res.success) {
        setAssets(res.data);
        setTotalItems(res.total ?? res.data.length);
        setTotalPages(res.pages ?? 1);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  // ── Fetch Live Telemetry Stats ────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/assets?limit=5000");
      if (res.success) {
        const all = res.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const amcActive = all.filter((a: any) => a.amcEndDate && new Date(a.amcEndDate) >= today).length;
        const amcExpired = all.filter((a: any) => a.amcEndDate && new Date(a.amcEndDate) < today).length;
        const amcExpiringSoon = all.filter((a: any) => {
          if (!a.amcEndDate) return false;
          const diff = Math.ceil((new Date(a.amcEndDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diff >= 0 && diff <= 45; // 45 days matching leaseAutomation
        }).length;

        const totalAmcValue = all.reduce((sum: number, a: any) => sum + (Number(a.contractValue) || 0), 0);
        const annualAmcCost = all.reduce((sum: number, a: any) => sum + (Number(a.contractValue) || 0), 0);

        setStats({
          total: all.length,
          amcActive,
          amcExpired,
          amcExpiringSoon,
          totalAmcValue,
          annualAmcCost,
          noAmc: all.filter((a: any) => !a.amcEndDate).length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch asset stats:", err);
    }
  }, []);

  // ── Fetch Categories ──────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/assets/categories");
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  const fetchAllFloors = useCallback(async () => {
    try {
      const res = await api.get("/floors?limit=5000");
      if (res.success) setAllFloors(res.data);
    } catch (err) {
      console.error("Failed to fetch floors:", err);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
    fetchStats();
    fetchCategories();
    fetchAllFloors();
  }, [fetchAssets, fetchStats, fetchCategories, fetchAllFloors]);

  // ── Fetch Detail Asset whenever Selected ID changes ──────────────────────
  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedAssetId) {
        setDetailAsset(null);
        return;
      }
      setIsLoadingDetail(true);
      try {
        const res = await api.get(`/assets/${selectedAssetId}`);
        if (res.success) {
          setDetailAsset(res.data);
        }
      } catch (err) {
        console.error("Failed to load asset detail:", err);
      } finally {
        setIsLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedAssetId]);

  // ── Save Asset ────────────────────────────────────────────────────────────
  const handleSave = async (data: any) => {
    try {
      setIsSubmitting(true);
      const res = modalMode === "edit"
        ? await api.put(`/assets/${data._id}`, data)
        : await api.post("/assets", data);
      if (res.success) {
        fetchAssets();
        fetchStats();
        fetchCategories();
        if (selectedAssetId === data._id) {
          // Refresh details pane
          const detailRes = await api.get(`/assets/${data._id}`);
          if (detailRes.success) setDetailAsset(detailRes.data);
        }
      }
    } catch (err) {
      console.error("Failed to save asset:", err);
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  // ── Toggle Status ─────────────────────────────────────────────────────────
  const handleToggleStatus = async (asset: any) => {
    const nextStatusMap: Record<string, string> = {
      "Active": "Under Maintenance",
      "Under Maintenance": "Disposed",
      "Disposed": "Active",
    };
    const nextStatus = nextStatusMap[asset.assetStatus] || "Active";
    try {
      setAssets(prev =>
          prev.map(a => (a._id === asset._id ? { ...a, assetStatus: nextStatus } : a))
      );
      const res = await api.put(`/assets/${asset._id}`, { assetStatus: nextStatus });
      if (!res.success) {
        fetchAssets();
      } else {
        if (selectedAssetId === asset._id) {
          setDetailAsset((prev: any) => ({ ...prev, assetStatus: nextStatus }));
        }
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      fetchAssets();
    }
  };

  // ── Reset Filters ─────────────────────────────────────────────────────────
  const handleReset = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setPropertyFilter("All");
    setVendorFilter("All");
    setAmcStatusFilter("All");
    setCurrentPage(1);
  };



  // ── Date Range Helper for Export ──────────────────────────────────────────
  const getFilteredExportData = async () => {
    try {
      const res = await api.get("/assets?limit=5000");
      if (!res.success) return [];
      const all = res.data;
      if (!exportStartDate || !exportEndDate) return all;
      return all.filter((a: any) => {
        const pd = new Date(a.purchaseDate);
        return pd >= new Date(exportStartDate) && pd <= new Date(exportEndDate);
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const handleDownloadExport = async () => {
    const dataToExport = await getFilteredExportData();
    if (dataToExport.length === 0) {
      alert("No assets found in range!");
      return;
    }
    const totalValue = dataToExport.reduce((sum: number, a: any) => sum + (a.purchaseValue || a.purchaseAmount || 0), 0);
    if (exportFormat === "pdf") {
      exportAssetsToPdf(dataToExport, totalValue);
    } else {
      exportAssetsToExcel(dataToExport);
    }
    setIsExportModalOpen(false);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
    setExportPreviewData(null);
  };

  // ── AMC & Warranty Indicators ────────────────────────────────────────────
  const getAmcInfo = (a: any) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (!a.amcEndDate) return { status: "No AMC", badge: "secondary" };
    const aDate = new Date(a.amcEndDate); aDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((aDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { status: "Expired", badge: "danger" };
    if (diffDays <= 45) return { status: `Expiring (${diffDays}d)`, badge: "warning" };
    return { status: "Active", badge: "success" };
  };

  // ── Dynamically Adaptive Columns for Table (Prevents Squishing) ──────────
  const columns: TableColumn<any>[] = [
    {
      header: "Asset",
      render: (v: any) => {
        const getIcon = (cat: string) => {
          const c = (cat || "").toLowerCase();
          if (c.includes("lift") || c.includes("elevator")) return "bi-arrow-up-down text-indigo";
          if (c.includes("hvac") || c.includes("cooling") || c.includes("air")) return "bi-wind text-info";
          if (c.includes("electric") || c.includes("power") || c.includes("generator") || c.includes("ups")) return "bi-lightning-charge-fill text-warning";
          if (c.includes("fire") || c.includes("safety") || c.includes("alarm")) return "bi-shield-fire text-danger";
          if (c.includes("security") || c.includes("cctv") || c.includes("access")) return "bi-camera-video-fill text-dark";
          return "bi-box-seam text-secondary";
        };
        return (
          <div className="d-flex align-items-center gap-2.5">
            <div className="d-flex align-items-center justify-content-center bg-light border rounded-3" style={{ width: 36, height: 36 }}>
              <i className={`bi ${getIcon(v.category)}`} style={{ fontSize: "1.1rem" }} />
            </div>
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: "0.85rem", lineHeight: 1.2 }}>{v.assetName || v.assetDescription}</div>
              <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                {v.assetCode || "AST-NEW"} {v.brandName ? `· ${v.brandName}` : ""}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Category",
      render: (v: any) => (
        <span className="badge bg-light text-dark border px-2.5 py-1" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
          {v.category || "General"}
        </span>
      ),
    },
    {
      header: "Location",
      render: (v: any) => {
        const floorObj = allFloors.find(f => String(f.floorNumber) === String(v.floorNumber));
        const floorLabel = floorObj ? floorObj.floorName : (v.floorNumber !== undefined && v.floorNumber !== null ? `Floor ${v.floorNumber}` : "Ground Floor");
        return (
          <div>
            <div className="fw-semibold text-dark" style={{ fontSize: "0.82rem" }}>
              {v.property?.propertyName || "Main Complex"}
            </div>
            <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
              {floorLabel} {v.unit ? `· Unit ${v.unit.unitNumber}` : ""}
            </div>
          </div>
        );
      },
    },
    {
      header: "Vendor Partner",
      render: (v: any) => (
        <div>
          <div className="fw-bold text-dark" style={{ fontSize: "0.82rem" }}>{v.vendor?.vendorName || v.vendorName || "—"}</div>
          <div className="text-muted small" style={{ fontSize: "0.72rem" }}>{v.contactNumber || v.vendor?.mobileNumber || "No contact"}</div>
        </div>
      ),
    },
    {
      header: "AMC Status",
      render: (v: any) => {
        const amc = getAmcInfo(v);
        const expiryDateStr = v.amcEndDate ? new Date(v.amcEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
        return (
          <div>
            <span
              className={`badge bg-${amc.badge} bg-opacity-10 text-${amc.badge} border border-${amc.badge} border-opacity-25 rounded-pill px-2.5 py-0.5`}
              style={{ fontSize: "0.7rem", fontWeight: 700 }}
            >
              {amc.status}
            </span>
            {expiryDateStr && (
              <div className="text-muted mt-0.5" style={{ fontSize: "0.68rem" }}>
                Ends: {expiryDateStr}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "AMC Value",
      render: (v: any) => (
        <div className="fw-bold text-dark" style={{ fontSize: "0.82rem" }}>
          ₹ {(v.contractValue || v.purchaseValue || 0).toLocaleString()}
        </div>
      ),
    },
    {
      header: "Status",
      render: (v: any) => (
        <span
          onClick={() => handleToggleStatus(v)}
          className={`badge rounded-pill px-2.5 py-1 ${
            v.assetStatus === "Active"
              ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25"
              : v.assetStatus === "Under Maintenance"
              ? "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
              : "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
          }`}
          style={{ fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", userSelect: "none" }}
          title="Click to toggle status"
        >
          {v.assetStatus || "Active"}
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
            onClick={(e) => { e.stopPropagation(); setSelectedAssetId(v._id); }}
            className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center"
            style={{ width: 26, height: 26 }}
          >
            <i className="bi bi-eye" style={{ fontSize: "0.75rem" }} />
          </button>
          <button
            title="Edit Asset"
            onClick={(e) => { e.stopPropagation(); setSelectedAsset(v); setModalMode("edit"); setShowModal(true); }}
            className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center"
            style={{ width: 26, height: 26 }}
          >
            <i className="bi bi-pencil" style={{ fontSize: "0.75rem" }} />
          </button>
        </div>
      ),
    },
  ];

  const activeFiltersCount = [
    debouncedSearch.trim() !== "",
    statusFilter !== "All",
    categoryFilter !== "All",
    propertyFilter !== "All",
    vendorFilter !== "All",
    amcStatusFilter !== "All",
  ].filter(Boolean).length;

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
            Assets & AMC Management
          </h2>
          <p className="text-muted m-0 mt-1" style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
            Comprehensive asset lifecycle tracking, AMC contracts, maintenance schedules, and financial ledger
          </p>
        </div>
        
        <div className="d-flex gap-2 align-items-center">
          <button
            onClick={() => {
              setSelectedAsset(null);
              setModalMode("create");
              setShowModal(true);
            }}
            className="btn btn-dark btn-sm fw-bold px-3 py-2 d-flex align-items-center gap-2"
            style={{ backgroundColor: "#040404", borderRadius: "8px", fontSize: "0.8rem", height: "38px" }}
          >
            <i className="bi bi-plus-lg"></i> Add Asset
          </button>
          <button
            className="btn btn-sm btn-white border fw-bold px-3 py-2"
            style={{ borderRadius: "8px", fontSize: "0.8rem", backgroundColor: "#ffffff", height: "38px" }}
            onClick={() => setIsExportModalOpen(true)}
          >
            Export
          </button>
        </div>
      </div>

      {/* ── 2. STATS CARDS GRID ───────────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {/* KPI 1: Total Assets */}
        <div className="col-md-2">
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-box-seam text-muted" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Total Assets
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              {stats.total}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              Active Inventory
            </div>
          </div>
        </div>

        {/* KPI 2: Under AMC */}
        <div className="col-md-2">
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-shield-check text-success" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Under AMC
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              {stats.amcActive}
            </h5>
            <div className="text-success" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
              {stats.total > 0 ? `${((stats.amcActive / stats.total) * 100).toFixed(1)}%` : "0%"} Covered
            </div>
          </div>
        </div>

        {/* KPI 3: Expiring Soon */}
        <div className="col-md-2">
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-hourglass-split text-warning" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Expiring Soon
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              {stats.amcExpiringSoon}
            </h5>
            <div className="text-warning" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
              Next 45 Days
            </div>
          </div>
        </div>

        {/* KPI 4: AMC Expired */}
        <div className="col-md-2">
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                AMC Expired
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              {stats.amcExpired}
            </h5>
            <div className="text-danger" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
              Immediate Action
            </div>
          </div>
        </div>

        {/* KPI 5: Total AMC Value */}
        <div className="col-md-2">
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-currency-rupee text-primary" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Total AMC Value
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "0.95rem" }}>
              ₹ {stats.totalAmcValue.toLocaleString("en-IN")}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              Contract Volume
            </div>
          </div>
        </div>

        {/* KPI 6: Annual Cost */}
        <div className="col-md-2">
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "16px", height: "100%" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-wallet2 text-info" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Annual AMC Cost
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "0.95rem" }}>
              ₹ {stats.annualAmcCost.toLocaleString("en-IN")}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              Planned Per Year
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. FILTER TABS & SELECTORS ────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        {/* Left tabs */}
        <div className="d-flex gap-1 bg-white p-1 rounded-3" style={{ border: "1px solid var(--border-color)" }}>
          {["All Assets", "Active", "Inactive", "Under Maintenance", "Disposed"].map((tab) => {
            const targetStatus = tab === "All Assets" ? "All" : tab;
            const isAct = statusFilter === targetStatus;
            return (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(targetStatus);
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
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right selectors */}
        <div className="d-flex gap-2 flex-wrap">
          <select
            className="form-select bg-white py-1 rounded-3"
            style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "150px", outline: "none", boxShadow: "none" }}
            value={propertyFilter}
            onChange={(e) => {
              setPropertyFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Properties</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>{p.propertyName}</option>
            ))}
          </select>

          <select
            className="form-select bg-white py-1 rounded-3"
            style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "150px", outline: "none", boxShadow: "none" }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Categories</option>
            {categories.filter(c => !c.parentCategory).map(c => (
              <option key={c._id} value={c.categoryName}>{c.categoryName}</option>
            ))}
          </select>

          <select
            className="form-select bg-white py-1 rounded-3"
            style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "140px", outline: "none", boxShadow: "none" }}
            value={vendorFilter}
            onChange={(e) => {
              setVendorFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Vendors</option>
            {vendors.map(v => (
              <option key={v._id} value={v._id}>{v.vendorName}</option>
            ))}
          </select>

          <select
            className="form-select bg-white py-1 rounded-3"
            style={{ border: "1px solid var(--border-color)", fontSize: "0.78rem", width: "140px", outline: "none", boxShadow: "none" }}
            value={amcStatusFilter}
            onChange={(e) => {
              setAmcStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All AMC Status</option>
            <option value="Active">Active AMC</option>
            <option value="Expired">Expired AMC</option>
            <option value="No AMC">No AMC</option>
          </select>
        </div>
      </div>

      {/* ── 4. BOTTOM DIRECTORY: Assets Table ─────────────────────────────── */}
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
                Asset Inventory Directory
              </h6>
              <div className="d-flex gap-2 align-items-center">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search name, code, serial..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: "260px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.8rem" }}
                  />
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    style={{ borderRadius: "6px", fontSize: "0.78rem" }}
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                )}
                <button
                  className="btn btn-sm btn-white border"
                  style={{ borderRadius: "6px", backgroundColor: "#ffffff" }}
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <i className="bi bi-download" style={{ fontSize: "0.85rem" }} />
                </button>
              </div>
            </div>

            {/* Table Component */}
            <Table
              columns={columns}
              data={assets}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              emptyMessage="No asset records match the current filters."
            />
          </div>
        </div>
      </div>

      {/* ── 5. ASSET DETAIL MODAL ────────────────────────────────────────── */}
      {selectedAssetId && (
        <AssetDetailView
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onEdit={() => {
            const a = assets.find(x => x._id === selectedAssetId);
            setSelectedAsset(a || null);
            setModalMode("edit");
            setShowModal(true);
            setSelectedAssetId(null);
          }}
        />
      )}

      {/* ── 6. ASSET FORM MODAL (CREATE / EDIT) ──────────────────────────── */}
      {showModal && (
        <AssetFormModal
          mode={modalMode}
          editData={selectedAsset}
          onSubmit={handleSave}
          onClose={() => setShowModal(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ── 7. EXPORT MODAL ──────────────────────────────────────────────── */}
      {isExportModalOpen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 9999,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg overflow-hidden"
            style={{ width: "100%", maxWidth: exportPreviewData ? "800px" : "450px", transition: "max-width 0.3s ease" }}
          >
            <div className="border-bottom p-3 d-flex justify-content-between align-items-center bg-light">
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-file-earmark-spreadsheet text-success" /> Export Assets Data
              </h6>
              <button className="btn-close shadow-none" onClick={closeExportModal} />
            </div>

            <div className="p-4 d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Date Range (Purchase Date)</label>
                  <div className="d-flex gap-2">
                    <input type="date" className="form-control form-control-sm" value={exportStartDate}
                      onChange={e => { setExportStartDate(e.target.value); setExportPreviewData(null); }} />
                    <span className="align-self-center text-muted">to</span>
                    <input type="date" className="form-control form-control-sm" value={exportEndDate}
                      onChange={e => { setExportEndDate(e.target.value); setExportPreviewData(null); }} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Export Format</label>
                  <select className="form-select form-select-sm" value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
                    <option value="excel">Excel (.csv)</option>
                    <option value="pdf">PDF Document</option>
                  </select>
                </div>
              </div>

              {exportPreviewData && (
                <div className="border rounded-3 overflow-hidden bg-light">
                  <div className="p-2 border-bottom bg-white d-flex justify-content-between align-items-center">
                    <span className="small fw-bold text-primary">Previewing {exportPreviewData.length} Records</span>
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">
                      Total Value: ₹ {exportPreviewData.reduce((s, a) => s + (a.purchaseValue || a.purchaseAmount || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                    <table className="table table-sm mb-0 align-middle text-nowrap" style={{ fontSize: "0.75rem" }}>
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Asset Code</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Value &amp; Date</th>
                          <th>Created By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exportPreviewData.slice(0, 10).map((a, i) => (
                          <tr key={i}>
                            <td className="fw-medium">{a.assetCode}</td>
                            <td>{a.assetName || a.assetDescription}</td>
                            <td>{a.category}</td>
                            <td>
                              <div className="fw-bold text-dark">₹ {(a.purchaseValue || a.purchaseAmount || 0).toLocaleString()}</div>
                              <div className="text-muted" style={{ fontSize: "0.65rem" }}>
                                {a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : "N/A"}
                              </div>
                            </td>
                            <td>
                              <div className="fw-bold">
                                {a.createdBy ? (typeof a.createdBy === "object" ? a.createdBy.name : "System") : "System"}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {exportPreviewData.length > 10 && (
                          <tr><td colSpan={5} className="text-center text-muted">...and {exportPreviewData.length - 10} more rows</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="d-flex gap-2 justify-content-end mt-2">
                <button className="btn btn-light btn-sm fw-bold px-3 border" onClick={async () => {
                  const dataToExport = await getFilteredExportData();
                  if (dataToExport.length === 0) {
                    alert("No assets match this criteria.");
                    setExportPreviewData(null);
                  } else {
                    setExportPreviewData(dataToExport);
                  }
                }}>
                  <i className="bi bi-eye" /> Preview Data
                </button>
                <button
                  className={`btn btn-${exportFormat === "pdf" ? "danger" : "success"} btn-sm fw-bold px-3 shadow-sm`}
                  onClick={handleDownloadExport}
                >
                  <i className={`bi bi-${exportFormat === "pdf" ? "file-earmark-pdf" : "download"}`} />{" "}
                  Download {exportFormat.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple export helper close helper
const closeExportModalHelper = (setOpen: any, setPreview: any) => {
  setOpen(false);
  setPreview(null);
};
