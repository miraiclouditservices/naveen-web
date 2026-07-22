"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";

const ITEMS_PER_PAGE = 10;

// Helper to format currency dynamically in short format (K, L, Cr)
const formatCurrencyShort = (val: number) => {
  if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹ ${(val / 1000).toFixed(2)} K`;
  return `₹ ${val.toLocaleString("en-IN")}`;
};

// Reusable Donut Chart Component
const DonutChart = ({ data, totalReceivedText }: { data: { label: string; value: number; color: string }[]; totalReceivedText: string }) => {
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
          <div className="fw-bold" style={{ fontSize: "0.85rem", color: "#202020", lineHeight: "1.1" }}>{totalReceivedText}</div>
          <div className="text-muted" style={{ fontSize: "0.6rem" }}>Received</div>
        </div>
      </div>
      <div className="flex-grow-1" style={{ minWidth: "120px" }}>
        {data.map((item, i) => {
          const percent = Math.round((item.value / total) * 100) || 0;
          return (
            <div key={i} className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: "0.75rem" }}>
              <div className="d-flex align-items-center gap-2" style={{ color: "#787878", fontWeight: "500" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color, display: "inline-block" }}></span>
                {item.label}
              </div>
              <span className="fw-bold" style={{ color: "#202020" }}>{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Cash Flow Trend Flexbar Chart
const CashFlowTrendChart = ({ months }: { months: { name: string; received: number; pending: number; overdue: number }[] }) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  if (!months || months.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center text-muted small" style={{ height: "180px" }}>
        No cash flow trend data available.
      </div>
    );
  }

  // Calculate the maximum total value across all months to scale the bars proportionally
  const maxVal = Math.max(...months.map((m) => m.received + m.pending + m.overdue), 0);

  return (
    <div className="position-relative" style={{ height: "180px" }}>
      <div className="d-flex justify-content-between align-items-end h-100 pb-3" style={{ borderBottom: "1px solid #E8E6E3" }}>
        {months.map((m) => {
          const totalVal = m.received + m.pending + m.overdue;
          // Scale heights relative to the maximum month's total value
          const divisor = maxVal > 0 ? maxVal : 1;
          const recHeight = (m.received / divisor) * 100;
          const penHeight = (m.pending / divisor) * 100;
          const ovHeight = (m.overdue / divisor) * 100;

          return (
            <div
              key={m.name}
              className="d-flex flex-column align-items-center position-relative"
              style={{ width: `${100 / months.length}%`, height: "130px", cursor: "pointer" }}
              onMouseEnter={() => setHoveredMonth(m.name)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {/* Stacked Bar container */}
              <div className="d-flex flex-column justify-content-end w-50 h-100 rounded-1 overflow-hidden" style={{ backgroundColor: "#F9F7F3" }}>
                <div style={{ height: `${ovHeight}%`, backgroundColor: "#ef4444" }}></div>
                <div style={{ height: `${penHeight}%`, backgroundColor: "#f59e0b" }}></div>
                <div style={{ height: `${recHeight}%`, backgroundColor: "#10b981" }}></div>
              </div>
              <span className="text-muted mt-2" style={{ fontSize: "0.68rem" }}>{m.name}</span>

              {/* Interactive Tooltip */}
              {hoveredMonth === m.name && (
                <div
                  className="position-absolute bg-dark text-white p-2 rounded shadow"
                  style={{
                    bottom: "110%",
                    zIndex: 10,
                    width: "140px",
                    fontSize: "0.7rem",
                    pointerEvents: "none",
                  }}
                >
                  <div className="fw-bold mb-1 border-bottom pb-1 border-secondary">{m.name}</div>
                  <div className="d-flex justify-content-between"><span>Received:</span> <span className="fw-bold text-success">{formatCurrencyShort(m.received)}</span></div>
                  <div className="d-flex justify-content-between"><span>Pending:</span> <span className="fw-bold text-warning">{formatCurrencyShort(m.pending)}</span></div>
                  <div className="d-flex justify-content-between"><span>Overdue:</span> <span className="fw-bold text-danger">{formatCurrencyShort(m.overdue)}</span></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function LedgerContent() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All Payments");
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);

  // Filters State
  const [selectedProperty, setSelectedProperty] = useState("All Properties");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const handlePrintPdf = (inv: any) => {
    if (!inv?._id) return;
    window.open(`/admin/payments/${inv._id}/print`, "_blank");
  };

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    collected: 0,
    pending: 0,
    overdue: 0,
    totalTransactions: 0,
    activeTenants: 0,
    cashFlowTrend: [] as any[],
    topOverdueTenants: [] as any[]
  });

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      if (res.success) {
        setProperties(res.data || []);
      }
    } catch (err) {
      console.error("Error loading properties:", err);
    }
  };

  const fetchFinanceReport = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedProperty && selectedProperty !== "All Properties") {
        params.append("propertyId", selectedProperty);
      }
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(`/reports/revenue?${params.toString()}`);
      if (res.success && res.data) {
        setMetrics({
          totalRevenue: res.data.totalRevenue || 0,
          collected: res.data.paidAmount || 0,
          pending: res.data.pendingAmount || 0,
          overdue: res.data.overdueAmount || 0,
          totalTransactions: res.data.totalTransactions || 0,
          activeTenants: res.data.activeTenants || 0,
          cashFlowTrend: res.data.cashFlowTrend || [],
          topOverdueTenants: res.data.topOverdueTenants || []
        });
      }
    } catch (err) {
      console.error("Error fetching revenue report:", err);
    }
  }, [selectedProperty, startDate, endDate]);

  const fetchFinanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(ITEMS_PER_PAGE));
      if (searchQuery) params.append("search", searchQuery);

      // Map tab status filter
      if (activeTab === "Received") params.append("status", "Paid");
      else if (activeTab === "Pending") params.append("status", "Pending");
      else if (activeTab === "Overdue") params.append("status", "Overdue");

      if (selectedProperty && selectedProperty !== "All Properties") {
        params.append("propertyId", selectedProperty);
      }
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(`/payments?${params.toString()}`);
      if (res.success) {
        setInvoices(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalItems(res.pagination?.totalPayments || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, activeTab, selectedProperty, startDate, endDate]);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchFinanceReport();
  }, [fetchFinanceReport]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchFinanceData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <span
            className="px-2 py-1 rounded-pill text-success"
            style={{ fontSize: "0.72rem", backgroundColor: "#e8f7f0", border: "1px solid #cceee0" }}
          >
            Paid
          </span>
        );
      case "Pending":
        return (
          <span
            className="px-2 py-1 rounded-pill text-warning"
            style={{ fontSize: "0.72rem", backgroundColor: "#fef8e7", border: "1px solid #fdf0cc" }}
          >
            Pending
          </span>
        );
      case "Partial":
      case "Partially Paid":
      case "Partial Paid":
        return (
          <span
            className="px-2 py-1 rounded-pill text-primary"
            style={{ fontSize: "0.72rem", backgroundColor: "#eef2ff", border: "1px solid #e0e7ff" }}
          >
            Partial
          </span>
        );
      case "Overdue":
        return (
          <span
            className="px-2 py-1 rounded-pill text-danger"
            style={{ fontSize: "0.72rem", backgroundColor: "#fdeeed", border: "1px solid #fcdbd9" }}
          >
            Overdue
          </span>
        );
      default:
        return (
          <span
            className="px-2 py-1 rounded-pill text-secondary"
            style={{ fontSize: "0.72rem", backgroundColor: "#f5f5f5", border: "1px solid #e8e6e3" }}
          >
            {status || "Draft"}
          </span>
        );
    }
  };

  const tabs = ["All Payments", "Received", "Pending", "Overdue"];

  const columns: TableColumn<any>[] = [
    {
      header: "Invoice No.",
      render: (inv) => (
        <span className="fw-semibold" style={{ color: "#202020" }}>
          {inv.invoiceNumber || `INV-${inv._id.toString().slice(-5).toUpperCase()}`}
        </span>
      )
    },
    {
      header: "Tenant Name",
      render: (inv) => {
        const leaseObj = inv.lease || inv.leaseId;
        const tenantName = inv.tenantName || leaseObj?.tenantName || inv.user?.name || inv.tenantId?.name || "—";
        return (
          <span className="fw-bold" style={{ color: "#202020" }}>
            {tenantName}
          </span>
        );
      }
    },
    {
      header: "Property / Unit",
      render: (inv) => {
        const leaseObj = inv.lease || inv.leaseId;
        const unitStr = leaseObj?.units?.[0]?.unitNumber || inv.user?.assignedFloors?.[0]?.floorName || inv.user?.assignedFloors?.[0]?.floorNumber || "—";
        const propStr = leaseObj?.property?.propertyName || inv.user?.assignedProperties?.[0]?.propertyName || "—";
        return <span style={{ color: "#787878" }}>{propStr}, {unitStr}</span>;
      }
    },
    {
      header: "Invoice Date",
      render: (inv) => {
        const dateVal = inv.invoiceDate || inv.paymentDate || inv.createdAt;
        return (
          <span style={{ color: "#787878" }}>
            {dateVal ? new Date(dateVal).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
          </span>
        );
      }
    },
    {
      header: "Due Date",
      render: (inv) => (
        <span style={{ color: "#787878" }}>
          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </span>
      )
    },
    {
      header: "Invoice Amount",
      style: { textAlign: "right" as const },
      render: (inv) => (
        <div className="fw-bold text-end">₹ {(inv.invoiceAmount || inv.amount || 0).toLocaleString("en-IN")}</div>
      )
    },
    {
      header: "Paid Amount",
      style: { textAlign: "right" as const },
      render: (inv) => (
        <div className="fw-semibold text-success text-end">₹ {(inv.paidAmount || 0).toLocaleString("en-IN")}</div>
      )
    },
    {
      header: "Pending Amount",
      style: { textAlign: "right" as const },
      render: (inv) => {
        const totalAmt = inv.invoiceAmount || inv.amount || 0;
        const paidAmt = inv.paidAmount || 0;
        const pendingAmt = inv.pendingAmount !== undefined ? inv.pendingAmount : Math.max(0, totalAmt - paidAmt);
        return <div className="fw-semibold text-danger text-end">₹ {pendingAmt.toLocaleString("en-IN")}</div>;
      }
    },
    {
      header: "Status",
      style: { textAlign: "center" as const },
      render: (inv) => <div className="text-center">{getStatusBadge(inv.status)}</div>
    },
    {
      header: "Payment Date",
      style: { textAlign: "center" as const },
      render: (inv) => (
        <div className="text-center text-muted">
          {inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </div>
      )
    },
    {
      header: "Action",
      style: { textAlign: "center" as const },
      render: (inv) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm btn-light border p-1 animate-fade-in"
            title="View"
            style={{ borderRadius: "6px" }}
            onClick={() => {
              setSelectedInvoice(inv);
              setShowInvoiceModal(true);
            }}
          >
            <i className="hgi-stroke hgi-eye" style={{ fontSize: "0.9rem" }} />
          </button>
          <button
            className="btn btn-sm btn-light border p-1 animate-fade-in"
            title="Download"
            style={{ borderRadius: "6px" }}
            onClick={() => handlePrintPdf(inv)}
          >
            <i className="hgi-stroke hgi-download-01" style={{ fontSize: "0.9rem" }} />
          </button>
          <button
            className="btn btn-sm btn-light border p-1 animate-fade-in"
            title="Print"
            style={{ borderRadius: "6px" }}
            onClick={() => handlePrintPdf(inv)}
          >
            <i className="hgi-stroke hgi-printer" style={{ fontSize: "0.9rem" }} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div
      style={{
        backgroundColor: "#F9F7F3",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "var(--font-geist-sans), Inter, sans-serif",
        color: "#202020",
      }}
    >
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold m-0" style={{ color: "#000000", fontSize: "1.5rem" }}>
            Payment Management
          </h2>
          <p className="text-muted m-0 mt-1" style={{ fontSize: "0.825rem", color: "#787878" }}>
            Track, manage and reconcile all lease payments in one place
          </p>
        </div>
      </div>

      {/* STAT CARDS GRID */}
      <div className="row g-3 mb-4">
        {/* Card 1 */}
        <div className="col-md-4 col-lg-2">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="hgi-stroke hgi-money-send-01 text-muted" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "#787878" }}>
                Total Receivable
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              ₹ {metrics.totalRevenue.toLocaleString("en-IN")}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              All Outstanding
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col-md-4 col-lg-2">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="hgi-stroke hgi-money-receive-01 text-success" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "#787878" }}>
                Total Received
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              ₹ {metrics.collected.toLocaleString("en-IN")}
            </h5>
            <div className="text-success" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
              {metrics.totalRevenue > 0 ? ((metrics.collected / metrics.totalRevenue) * 100).toFixed(2) : 0}% of Total
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="col-md-4 col-lg-2">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="hgi-stroke hgi-clock-01 text-warning" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "#787878" }}>
                Pending Amount
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              ₹ {metrics.pending.toLocaleString("en-IN")}
            </h5>
            <div className="text-warning" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
              {metrics.totalRevenue > 0 ? ((metrics.pending / metrics.totalRevenue) * 100).toFixed(2) : 0}% of Total
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="col-md-4 col-lg-2">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="hgi-stroke hgi-alert-circle text-danger" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "#787878" }}>
                Overdue Amount
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              ₹ {metrics.overdue.toLocaleString("en-IN")}
            </h5>
            <div className="text-danger" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
              {metrics.totalRevenue > 0 ? ((metrics.overdue / metrics.totalRevenue) * 100).toFixed(2) : 0}% of Total
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="col-md-4 col-lg-2">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="hgi-stroke hgi-transaction text-muted" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "#787878" }}>
                Total Transactions
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              {metrics.totalTransactions?.toLocaleString('en-IN') || 0}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              This Financial Year
            </div>
          </div>
        </div>

        {/* Card 6 */}
        <div className="col-md-4 col-lg-2">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              padding: "16px",
              height: "100%",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="hgi-stroke hgi-user-multiple-01 text-muted" style={{ fontSize: "1.1rem" }} />
              <span className="text-muted fw-semibold" style={{ fontSize: "0.72rem", color: "#787878" }}>
                Active Tenants
              </span>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: "#000000", fontSize: "1.1rem" }}>
              {metrics.activeTenants.toLocaleString("en-IN")}
            </h5>
            <div className="text-muted" style={{ fontSize: "0.68rem" }}>
              Across All Properties
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SELECTORS */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        {/* Left tabs */}
        <div className="d-flex gap-1 bg-white p-1 rounded-3" style={{ border: "1px solid #E8E6E3" }}>
          {tabs.map((tab) => {
            const isAct = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className="btn btn-sm animate-fade-in"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  backgroundColor: isAct ? "#040404" : "transparent",
                  color: isAct ? "#FFFFFF" : "#787878",
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
          {/* Date range filter */}
          <div
            className="bg-white px-3 py-1 rounded-3 d-flex align-items-center gap-2"
            style={{ border: "1px solid #E8E6E3", fontSize: "0.78rem" }}
          >
            <i className="hgi-stroke hgi-calendar-01 text-muted" />
            <span className="text-muted">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              style={{ border: "none", outline: "none", fontSize: "0.78rem", color: "#202020", backgroundColor: "transparent" }}
            />
            <span className="text-muted">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              style={{ border: "none", outline: "none", fontSize: "0.78rem", color: "#202020", backgroundColor: "transparent" }}
            />
          </div>

          <select
            className="form-select bg-white py-1 rounded-3"
            style={{ border: "1px solid #E8E6E3", fontSize: "0.78rem", width: "160px", outline: "none", boxShadow: "none" }}
            value={selectedProperty}
            onChange={(e) => {
              setSelectedProperty(e.target.value);
              setPage(1);
            }}
          >
            <option value="All Properties">All Properties</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.propertyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MIDDLE ANALYTICS SECTION */}
      <div className="row g-4 mb-4">
        {/* 1. Payment Overview */}
        <div className="col-lg-4">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              padding: "24px",
              height: "100%",
            }}
          >
            <h6 className="fw-bold mb-4" style={{ color: "#000000", fontSize: "0.9rem" }}>
              Payment Overview
            </h6>
            <DonutChart
              totalReceivedText={formatCurrencyShort(metrics.collected)}
              data={[
                { label: "Received", value: metrics.collected, color: "#10b981" },
                { label: "Pending", value: metrics.pending, color: "#f59e0b" },
                { label: "Overdue", value: metrics.overdue, color: "#ef4444" },
              ]}
            />
          </div>
        </div>

        {/* 2. Cash Flow Trend */}
        <div className="col-lg-4">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              padding: "24px",
              height: "100%",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold m-0" style={{ color: "#000000", fontSize: "0.9rem" }}>
                Cash Flow Trend
              </h6>
              <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                Monthly ▾
              </span>
            </div>
            <CashFlowTrendChart months={metrics.cashFlowTrend} />
          </div>
        </div>

        {/* 3. Top Overdue Tenants */}
        <div className="col-lg-4">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              padding: "24px",
              height: "100%",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold m-0" style={{ color: "#000000", fontSize: "0.9rem" }}>
                Top Overdue Tenants
              </h6>
            </div>
            <div className="d-flex flex-column gap-3">
              {metrics.topOverdueTenants.length === 0 ? (
                <div className="text-center py-5 text-muted small">No overdue tenants found.</div>
              ) : (
                metrics.topOverdueTenants.map((ot, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: "36px",
                          height: "36px",
                          backgroundColor: "#f9f7f3",
                          color: "#202020",
                          fontSize: "0.8rem",
                          border: "1px solid #E8E6E3",
                        }}
                      >
                        {ot.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: "0.8rem", color: "#202020" }}>
                          {ot.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                          {ot.property}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ fontSize: "0.8rem", color: "#202020" }}>
                        {ot.amount}
                      </div>
                      <div className="text-danger fw-semibold" style={{ fontSize: "0.68rem" }}>
                        {ot.days}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM LAYOUT GRID: Transactions Table */}
      <div className="row g-4">
        <div className="col-lg-12">
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E8E6E3",
              overflow: "hidden",
            }}
          >
            {/* Table Header controls */}
            <div className="p-3 bg-white d-flex justify-content-between align-items-center gap-3 flex-wrap border-bottom border-light">
              <h6 className="fw-bold m-0" style={{ fontSize: "0.95rem" }}>
                Payment Transactions
              </h6>
              <div className="d-flex gap-2 align-items-center">
                <div className="position-relative">
                  <input
                    type="text"
                    placeholder="Search by invoice, tenant, amount..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    className="form-control form-control-sm"
                    style={{ width: "260px", border: "1px solid #E8E6E3", borderRadius: "6px", fontSize: "0.8rem" }}
                  />
                </div>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "120px", border: "1px solid #E8E6E3", borderRadius: "6px", fontSize: "0.8rem" }}
                >
                  <option>100 per page</option>
                </select>
                <button
                  className="btn btn-sm btn-white"
                  style={{ border: "1px solid #E8E6E3", borderRadius: "6px" }}
                >
                  <i className="hgi-stroke hgi-download-01" style={{ fontSize: "0.85rem" }} />
                </button>
              </div>
            </div>

            {/* Table Component */}
            <Table
              columns={columns}
              data={invoices}
              isLoading={isLoading}
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(p) => setPage(p)}
              emptyMessage="No transaction records match this query."
            />
          </div>
        </div>
      </div>

      {/* INVOICE PREVIEW MODAL */}
      {showInvoiceModal && selectedInvoice && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1050,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 animate-fade-in position-relative"
            style={{
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid #E8E6E3",
            }}
          >
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0" style={{ fontSize: "1.1rem", color: "#000000" }}>Invoice Preview</h5>
              <div className="d-flex align-items-center gap-3">
                <button
                  onClick={() => handlePrintPdf(selectedInvoice)}
                  className="btn btn-link p-0 text-primary fw-semibold d-flex align-items-center gap-1 border-0 bg-transparent shadow-none"
                  style={{ fontSize: "0.8rem", textDecoration: "none" }}
                >
                  <i className="hgi-stroke hgi-download-01" /> Download PDF
                </button>
                <button
                  className="btn-close shadow-none"
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setSelectedInvoice(null);
                  }}
                />
              </div>
            </div>

            {/* Invoice Body Card */}
            <div
              className="border p-4 rounded-3 bg-white"
              style={{ borderColor: "#E8E6E3" }}
            >
              {/* Top Section */}
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded text-warning fw-bold"
                    style={{ width: "36px", height: "36px", fontSize: "1.2rem" }}
                  >
                    🏢
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "0.95rem", color: "#040404" }}>ANVAYA360</div>
                    <div className="text-muted" style={{ fontSize: "0.68rem" }}>All in one App</div>
                  </div>
                </div>
                <div className="text-end">
                  <h4 className="fw-extrabold m-0 text-dark" style={{ fontSize: "1.25rem", letterSpacing: "0.05em" }}>INVOICE</h4>
                  <div className="text-muted small">
                    # {selectedInvoice.invoiceNumber || `INV-${selectedInvoice._id.toString().slice(-6).toUpperCase()}`}
                  </div>
                </div>
              </div>

              {/* Billed To & Dates section */}
              {(() => {
                const leaseObj = selectedInvoice.lease || selectedInvoice.leaseId;
                const rentVal = Number(leaseObj?.rentAmount || 0);
                const maintVal = Number(leaseObj?.maintenanceCharges || 0);
                const subTotalVal = rentVal + maintVal > 0 ? (rentVal + maintVal) : Number(selectedInvoice.amount || 0);
                const paidVal = Number(selectedInvoice.paidAmount || 0);
                const dueVal = Math.max(0, subTotalVal - paidVal);

                return (
                  <>
                    <div className="row g-3 mb-4">
                      <div className="col-4">
                        <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                          Billed From
                        </div>
                        <div className="fw-bold text-dark small" style={{ fontSize: "0.85rem" }}>
                          Anvaya360 Services Pvt Ltd
                        </div>
                        <div className="text-muted mt-1 lh-base" style={{ fontSize: "0.74rem" }}>
                          Suite 501, 5th Floor, Valley Towers,<br />
                          Sector 62, Noida, UP - 201301<br />
                          GSTIN: 09AAHCA9081B1ZX<br />
                          Email: billing@anvaya360.com
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                          Billed To
                        </div>
                        <div className="fw-bold text-dark small" style={{ fontSize: "0.85rem" }}>
                          {selectedInvoice.tenantName || leaseObj?.tenantName || selectedInvoice.user?.name || selectedInvoice.tenantId?.name || "—"}
                        </div>
                        <div className="text-muted mt-1 lh-base" style={{ fontSize: "0.74rem" }}>
                          {leaseObj?.property?.propertyName || "—"}<br />
                          Unit {leaseObj?.units?.[0]?.unitNumber || "—"} ({leaseObj?.floor?.floorName || "—"})<br />
                          {leaseObj?.property?.address || "—"}<br />
                          Email: {selectedInvoice.tenantId?.email || selectedInvoice.user?.email || leaseObj?.tenantEmail || "—"}
                        </div>
                      </div>
                      <div className="col-4">
                        <table className="w-100 text-muted" style={{ fontSize: "0.74rem" }}>
                          <tbody>
                            <tr>
                              <td className="py-1">Invoice Date</td>
                              <td className="py-1 fw-bold text-dark text-end">
                                : {selectedInvoice.invoiceDate 
                                  ? new Date(selectedInvoice.invoiceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
                                  : (selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—")}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1">Due Date</td>
                              <td className="py-1 fw-bold text-dark text-end">
                                : {selectedInvoice.dueDate 
                                  ? new Date(selectedInvoice.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
                                  : "—"}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1">Billing Period</td>
                              <td className="py-1 fw-bold text-dark text-end">
                                : {selectedInvoice.month && selectedInvoice.year ? `${selectedInvoice.month} ${selectedInvoice.year}` : "—"}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1">Lease ID</td>
                              <td className="py-1 fw-bold text-dark text-end">
                                : {leaseObj?._id ? `LSE-${leaseObj._id.toString().slice(-6).toUpperCase()}` : "—"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Items Table */}
                    <table className="table table-sm table-borderless align-middle mb-4" style={{ fontSize: "0.8rem" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#F9F7F3" }}>
                          <th className="py-2 px-3 text-muted fw-bold text-uppercase" style={{ fontSize: "0.68rem" }}>Description</th>
                          <th className="py-2 px-3 text-muted fw-bold text-uppercase text-end" style={{ fontSize: "0.68rem" }}>Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-bottom" style={{ borderColor: "#E8E6E3" }}>
                          <td className="py-2 px-3 text-muted">Monthly Rent</td>
                          <td className="py-2 px-3 text-dark fw-bold text-end">
                            {rentVal.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-bottom" style={{ borderColor: "#E8E6E3" }}>
                          <td className="py-2 px-3 text-muted">Maintenance Charges</td>
                          <td className="py-2 px-3 text-dark fw-bold text-end">
                            {maintVal.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-bottom" style={{ borderColor: "#E8E6E3" }}>
                          <td className="py-2 px-3 text-muted">Other Charges</td>
                          <td className="py-2 px-3 text-dark fw-bold text-end">0.00</td>
                        </tr>
                        <tr className="border-bottom" style={{ borderColor: "#E8E6E3" }}>
                          <td className="py-2 px-3 fw-bold text-dark">Sub Total</td>
                          <td className="py-2 px-3 fw-bold text-dark text-end">
                            {subTotalVal.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-bottom" style={{ borderColor: "#E8E6E3" }}>
                          <td className="py-2 px-3 text-muted">Tax (0%)</td>
                          <td className="py-2 px-3 text-muted text-end">0.00</td>
                        </tr>
                        <tr style={{ backgroundColor: "#F9F7F3" }}>
                          <td className="py-2 px-3 fw-extrabold text-dark">Total Invoice Amount</td>
                          <td className="py-2 px-3 fw-extrabold text-success text-end" style={{ fontSize: "0.85rem" }}>
                            ₹ {subTotalVal.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Amount Paid / Amount Due Bar */}
                    <div className="d-flex justify-content-end mb-4">
                      <div style={{ width: "220px" }}>
                        <div className="d-flex justify-content-between align-items-center mb-1 text-muted" style={{ fontSize: "0.78rem" }}>
                          <span className="fw-semibold">Amount Paid</span>
                          <span className="fw-bold text-dark">₹ {paidVal.toFixed(2)}</span>
                        </div>
                        <div
                          className="d-flex justify-content-between align-items-center text-white px-3 py-2 rounded-2 fw-bold"
                          style={{ backgroundColor: "#10B981", fontSize: "0.8rem" }}
                        >
                          <span>Amount Due</span>
                          <span>
                            ₹ {dueVal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details Section */}
                    <div className="border-top pt-3">
                      <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: "0.68rem", letterSpacing: "0.05em" }}>
                        Payment Details
                      </div>
                      <table className="w-100 text-muted" style={{ fontSize: "0.78rem" }}>
                        <tbody>
                          <tr>
                            <td className="py-1" style={{ width: "140px" }}>Payment Date</td>
                            <td className="py-1 fw-bold text-dark">
                              : {selectedInvoice.paymentDate 
                                ? new Date(selectedInvoice.paymentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
                                : "—"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1">Payment Mode</td>
                            <td className="py-1 fw-bold text-dark">: {selectedInvoice.paymentMethod || "—"}</td>
                          </tr>
                          <tr>
                            <td className="py-1">Transaction ID</td>
                            <td className="py-1 fw-bold text-dark">: {selectedInvoice.transactionId || "—"}</td>
                          </tr>
                          <tr>
                            <td className="py-1">Payment Reference</td>
                            <td className="py-1 fw-bold text-dark">
                              : {selectedInvoice.paymentReference || (selectedInvoice._id ? `PAY-${selectedInvoice._id.toString().slice(-6).toUpperCase()}` : "—")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}

              {/* Centered Green Thank You message */}
              <div className="text-center text-success fw-bold mt-4" style={{ fontSize: "0.9rem" }}>
                Thank you for your payment!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="container p-5 text-center text-muted">Loading...</div>}>
      <LedgerContent />
    </Suspense>
  );
}
