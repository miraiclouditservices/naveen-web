"use client";
import { useState, useEffect, Suspense, lazy } from "react";
import Link from "next/link";
import { api, getStoredUser } from "@/utils/api";

// ── Lazy-loaded role dashboards ───────────────────────────────────────────────
const UltraSuperAdminDash = lazy(() => import("@/components/dashboard/UltraSuperAdminDashboard"));
const FloorAdminDash = lazy(() => import("@/components/dashboard/FloorAdminDashboard"));
const OfficeOwnerDash = lazy(() => import("@/components/dashboard/OfficeOwnerDashboard"));
const StaffAdminDash = lazy(() => import("@/components/dashboard/StaffAdminDashboard"));
const WatchmanDash = lazy(() => import("@/components/dashboard/WatchmanDashboard"));

const COLOR = { blue: "var(--dark-section)", green: "#16a34a", yellow: "#d97706", red: "#dc2626", purple: "#7c3aed", slate: "var(--text-primary)", teal: "#0891b2", orange: "var(--brand-orange)" };

const SPINNER = (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", flexDirection: "column", gap: 16 }}>
    <div className="spinner-border" style={{ color: "var(--dark-section)", width: 36, height: 36 }} role="status" />
    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600 }}>Loading dashboard...</span>
  </div>
);

function StatCard({ label, value, icon, color, sub }: any) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease-in-out",
        cursor: "default"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--dark-section)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(1, 74, 173, 0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: "10px", background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <i className={`bi ${icon}`} style={{ color, fontSize: "1.2rem" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}



const STATUS_PILL: Record<string, { bg: string; cl: string }> = {
  Pending: { bg: "#fef9c3", cl: "#854d0e" }, Approved: { bg: "#dcfce7", cl: "#166534" },
  Rejected: { bg: "#fee2e2", cl: "#991b1b" }, "Checked-In": { bg: "#dbeafe", cl: "#1e40af" },
  "Checked-Out": { bg: "var(--border-color)", cl: "var(--text-primary)" }, Cleared: { bg: "#dbeafe", cl: "#1e40af" },
};

export default function DashboardPage() {
  const [m, setM] = useState<any>({});
  const [rev, setRev] = useState<any[]>([]);
  const [vis, setVis] = useState<any[]>([]);
  const [props, setProps] = useState<any[]>([]);
  const [recentV, setRecentV] = useState<any[]>([]);
  const [recentG, setRecentG] = useState<any[]>([]);
  const [expLeases, setExpLeases] = useState<any[]>([]);
  const [agreementM, setAgreementM] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    const u = getStoredUser();
    if (u) setUser(u);

    // Fetch properties
    api.get("/properties").then(res => {
      if (res.success) {
        setPropertiesList(res.data || []);
      }
    }).catch(() => { });
  }, []);

  useEffect(() => {
    let queryParts = [];
    if (selectedProperty) queryParts.push(`propertyId=${selectedProperty}`);
    if (selectedMonth) queryParts.push(`month=${selectedMonth}`);
    if (selectedYear) queryParts.push(`year=${selectedYear}`);
    if (selectedStatus && selectedStatus !== 'All') queryParts.push(`status=${selectedStatus}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    setLoading(true);

    api.get(`/dashboard/metrics${queryString}`).then(r => {
      if (r.success) {
        setM(r.data.metrics || {});
        setRev(r.data.monthlyRevenue || []);
        setVis(r.data.visitorTrend || []);
        setProps(r.data.propertyBreakdown || []);
        setRecentV(r.data.recentVisitors || []);
        setRecentG(r.data.recentGatePasses || []);
        setExpLeases(r.data.expiringLeasesList || []);
        setAgreementM(r.data.agreementMetrics || {});
      }
    }).catch(() => { }).finally(() => setLoading(false));
  }, [selectedProperty, selectedMonth, selectedYear, selectedStatus]);

  // ── Role-based routing ──────────────────────────────────────────────────────
  if (!loading && user?.role) {
    if (user.role === "ULTRA_SUPER_ADMIN" || user.role === "Ultra Super Admin")
      return <Suspense fallback={SPINNER}><UltraSuperAdminDash user={user} /></Suspense>;
    if (user.role === "FLOOR_ADMIN")
      return <Suspense fallback={SPINNER}><FloorAdminDash user={user} /></Suspense>;
    if (user.role === "OFFICE_OWNER" || user.role === "Owner")
      return <Suspense fallback={SPINNER}><OfficeOwnerDash user={user} /></Suspense>;
    if (user.role === "STAFF_ADMIN")
      return <Suspense fallback={SPINNER}><StaffAdminDash user={user} /></Suspense>;
    if (user.role === "Watchman" || user.role === "Security")
      return <Suspense fallback={SPINNER}><WatchmanDash user={user} /></Suspense>;
  }

  const isSA = user?.role === "SUPER_ADMIN" || user?.role === "Admin" || user?.role === "STAFF_ADMIN";
  const th: React.CSSProperties = { background: "#1e293b", color: "var(--bg-card)", fontSize: "0.68rem", fontWeight: 700, padding: "10px 12px", textTransform: "uppercase", letterSpacing: "0.05em", border: "none", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 1 };
  const td: React.CSSProperties = { padding: "9px 12px", fontSize: "0.82rem", color: "#1e293b", borderBottom: "1px solid var(--border-color)" };

  const getHeaderSubtitle = () => {
    const propObj = propertiesList.find(p => p._id === selectedProperty);
    const propName = propObj ? propObj.propertyName : "All Properties";

    let monthName = "";
    if (selectedMonth) {
      monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][parseInt(selectedMonth, 10) - 1];
    } else {
      monthName = new Date().toLocaleString("default", { month: "long" });
    }

    const yearVal = selectedYear || new Date().getFullYear().toString();

    return `${propName} • ${monthName} ${yearVal}`;
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
      <div className="spinner-border" style={{ color: "var(--dark-section)", width: 36, height: 36 }} role="status" />
      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600 }}>Loading dashboard...</span>
    </div>
  );

  return (
    <div style={{ padding: "0 20px 40px", overflowX: "hidden" }}>
      <style>{`
        .dash-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .dash-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .dash-grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .panel { background:var(--bg-card); border-radius:12px; border:1px solid var(--border-color); overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
        .panel-head { background:#1e293b; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; }
        .panel-title { color:var(--bg-card); font-size:0.8rem; font-weight:700; margin:0; letter-spacing:0.02em; }
        .panel-body { padding:16px; }
        .qa-btn { display:flex; flex-direction:column; align-items:center; gap:6px; padding:14px 10px; border:1.5px solid var(--border-color); border-radius:10px; background:var(--bg-card); cursor:pointer; text-decoration:none; transition:all 0.15s; color:#1e293b; }
        .qa-btn:hover { background:var(--dark-section); border-color:var(--dark-section); color:var(--bg-card); transform:translateY(-2px); box-shadow:0 6px 16px var(--dark-section)30; }
        .qa-btn:hover .qa-icon { background:rgba(255,255,255,0.2); color:var(--bg-card); }
        .qa-icon { width:38px; height:38px; border-radius:9px; background:var(--border-color); display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
        @media(max-width:900px){.dash-grid-4{grid-template-columns:repeat(2,1fr)}.dash-grid-3{grid-template-columns:1fr}.dash-grid-2{grid-template-columns:1fr}}
      `}</style>



      {/* ── Filter Controls ── */}
      <div className="panel mb-4" style={{ backgroundColor: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
        <div className="panel-body" style={{ padding: "10px 14px" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--dark-section)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
            Property Analytics Dashboard
          </div>
          <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "8px" }}>
            Filter by Property, Month, Year, and Status
          </div>
          <div className="row g-2">
            {/* Property Filter */}
            <div className="col-md-3 col-sm-6 col-12">
              <select
                className="form-select form-select-sm bg-white border border-light-subtle shadow-none"
                style={{ borderRadius: "6px", fontSize: "0.75rem", padding: "4px 8px", height: "30px" }}
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <option value="">Select Property</option>
                {propertiesList.map(p => (
                  <option key={p._id} value={p._id}>{p.propertyName}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="col-md-3 col-sm-6 col-12">
              <select
                className="form-select form-select-sm bg-white border border-light-subtle shadow-none"
                style={{ borderRadius: "6px", fontSize: "0.75rem", padding: "4px 8px", height: "30px" }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="col-md-3 col-sm-6 col-12">
              <select
                className="form-select form-select-sm bg-white border border-light-subtle shadow-none"
                style={{ borderRadius: "6px", fontSize: "0.75rem", padding: "4px 8px", height: "30px" }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {["2024", "2025", "2026", "2027", "2028"].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-md-3 col-sm-6 col-12">
              <select
                className="form-select form-select-sm bg-white border border-light-subtle shadow-none"
                style={{ borderRadius: "6px", fontSize: "0.75rem", padding: "4px 8px", height: "30px" }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">Select Status</option>
                <option value="Active">Active</option>
                <option value="Occupied">Occupied</option>
                <option value="Vacant">Vacant</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Title ── */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Property Performance Overview
      </h3>

      {/* ── Stat Cards Row 1 ── */}
      <div className="dash-grid-4" style={{ marginBottom: 14 }}>
        {isSA && <StatCard label="Total Properties" value={m.totalProperties ?? 0} icon="bi-building" color={COLOR.blue} sub="All properties" />}
        <StatCard label="Total Floors" value={m.totalFloors ?? 0} icon="bi-layers" color={COLOR.purple} sub="Across all properties" />
        <StatCard label="Total Units" value={m.totalUnits ?? 0} icon="bi-grid-3x3-gap" color={COLOR.teal} sub={`${m.occupiedUnits ?? 0} occupied`} />
        <StatCard label="Occupancy" value={`${m.occupancyPct ?? 0}%`} icon="bi-pie-chart-fill" color={COLOR.green} sub={`${(m.occupiedSft || 0).toLocaleString()} sqft used`} />
      </div>

      {/* ── Stat Cards Row 2 ── */}
      <div className="dash-grid-4" style={{ marginBottom: 14 }}>
        <StatCard label="Monthly Revenue" value={`₹${((m.totalRevenue || 0) / 100000).toFixed(1)}L`} icon="bi-cash-stack" color={COLOR.green} sub="Rent + CAM" />
        <StatCard label="Active Tenants" value={m.activeTenantsCount ?? 0} icon="bi-people-fill" color={COLOR.blue} sub="Active leases" />
        <StatCard label="Pending Approvals" value={m.pendingApprovals ?? 0} icon="bi-hourglass-split" color={COLOR.yellow} sub="Visitors + Gate passes" />
        <StatCard label="Visitors Today" value={m.visitorsToday ?? 0} icon="bi-person-badge" color={COLOR.teal} sub={`${m.visitorsCheckedIn ?? 0} currently inside`} />
      </div>

      {/* ── Stat Cards Row 3 ── */}
      <div className="dash-grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Gate Passes" value={m.gatePassTotal ?? 0} icon="bi-card-checklist" color={COLOR.slate} sub={`${m.gatePassPending ?? 0} pending`} />
        <StatCard label="Expiring Leases" value={m.expiringLeasesCount ?? 0} icon="bi-exclamation-triangle" color={COLOR.red} sub="Within 60 days" />
        <StatCard label="Available SFT" value={(m.availableSft || 0).toLocaleString()} icon="bi-circle" color={COLOR.orange} sub="Vacant area" />
        <StatCard label="Total Staff" value={m.totalStaff ?? 0} icon="bi-person-workspace" color={COLOR.purple} sub="Floor & security staff" />
      </div>


      {/* ── Quick Actions ── */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-head">
          <h6 className="panel-title"><i className="bi bi-lightning-fill me-2" style={{ color: "#f59e0b" }} />Quick Actions</h6>
        </div>
        <div className="panel-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12 }}>
            {[
              { label: "Add Visitor", icon: "bi-person-plus-fill", href: "/admin/visitors", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
              { label: "Gate Pass", icon: "bi-card-checklist", href: "/admin/materials", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
              { label: "Add Asset", icon: "bi-tools", href: "/admin/assets", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
              { label: "Add Staff", icon: "bi-person-badge", href: "/admin/users", color: "#e11d48", bg: "#fff1f2", border: "#fecdd3" },
            ].map(a => (
              <Link key={a.label} href={a.href} className="qa-btn" style={{ borderColor: a.border }}>
                <div className="qa-icon" style={{ backgroundColor: a.bg }}>
                  <i className={`bi ${a.icon}`} style={{ fontSize: "1.15rem", color: a.color }} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1e293b", textAlign: "center", lineHeight: 1.3 }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>



      {/* ── Gate Pass & Lease Row ── */}
      <div className="dash-grid-2" style={{ marginBottom: 24 }}>

        {/* Gate Pass Stats */}
        <div className="panel">
          <div className="panel-head">
            <h6 className="panel-title"><i className="bi bi-card-checklist me-2" style={{ color: "#fb923c" }} />Gate Pass Summary</h6>
            <Link href="/admin/materials" style={{ fontSize: "0.7rem", color: "#60a5fa", textDecoration: "none", fontWeight: 700 }}>View All →</Link>
          </div>
          <div className="panel-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Total", value: m.gatePassTotal ?? 0, color: COLOR.slate },
                { label: "Pending", value: m.gatePassPending ?? 0, color: COLOR.yellow },
                { label: "Approved", value: m.gatePassApproved ?? 0, color: COLOR.green },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--bg-app)", borderRadius: 10, padding: "12px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {recentG.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Material</th><th style={th}>Type</th><th style={th}>Status</th>
                </tr></thead>
                <tbody>
                  {recentG.slice(0, 4).map((g: any, i: number) => {
                    const sp = STATUS_PILL[g.status] || STATUS_PILL.Pending;
                    return (
                      <tr key={i}>
                        <td style={td}>{g.material?.substring(0, 22) || "—"}{(g.material?.length > 22) ? "…" : ""}</td>
                        <td style={td}><span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: g.type === "Inward" ? "#dcfce7" : "#dbeafe", color: g.type === "Inward" ? "#166534" : "#1e40af", fontWeight: 700 }}>{g.type}</span></td>
                        <td style={td}><span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: sp.bg, color: sp.cl, fontWeight: 700 }}>{g.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", margin: "20px 0" }}>No gate passes yet</p>}
          </div>
        </div>

        {/* Expiring Leases */}
        <div className="panel">
          <div className="panel-head">
            <h6 className="panel-title"><i className="bi bi-exclamation-triangle-fill me-2" style={{ color: "#fbbf24" }} />Leases Expiring Soon</h6>
            <Link href="/admin/leases" style={{ fontSize: "0.7rem", color: "#60a5fa", textDecoration: "none", fontWeight: 700 }}>View All →</Link>
          </div>
          <div className="panel-body">
            {expLeases.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <th style={th}>Tenant</th><th style={th}>Property</th><th style={th}>Expires</th>
                </tr></thead>
                <tbody>
                  {expLeases.map((l: any, i: number) => {
                    const daysLeft = Math.ceil((new Date(l.endDate).getTime() - Date.now()) / (86400000));
                    return (
                      <tr key={i}>
                        <td style={td}><span style={{ fontWeight: 700 }}>{l.tenantName}</span></td>
                        <td style={td}>{l.property}</td>
                        <td style={td}>
                          <span style={{
                            fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                            background: daysLeft <= 10 ? "#fee2e2" : daysLeft <= 30 ? "#fef9c3" : "var(--border-color)",
                            color: daysLeft <= 10 ? "#991b1b" : daysLeft <= 30 ? "#854d0e" : "var(--text-primary)"
                          }}>
                            {daysLeft}d left
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
              <i className="bi bi-check2-circle" style={{ fontSize: "2rem", display: "block", marginBottom: 8, color: "#16a34a" }} />
              <span style={{ fontSize: "0.8rem" }}>No leases expiring within 60 days</span>
            </div>}
          </div>
        </div>
      </div>

      {/* ── Recent Visitors ── */}
      <div className="panel">
        <div className="panel-head">
          <h6 className="panel-title"><i className="bi bi-person-badge me-2" style={{ color: "#38bdf8" }} />Recent Visitors</h6>
          <Link href="/admin/visitors" style={{ fontSize: "0.7rem", color: "#60a5fa", textDecoration: "none", fontWeight: 700 }}>View All →</Link>
        </div>
        <div className="panel-body" style={{ padding: 0, maxHeight: "480px", overflowY: "auto", position: "relative" }}>
          {recentV.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={th}>Visitor</th><th style={th}>Contact</th><th style={th}>Property</th>
                <th style={th}>Date</th><th style={th}>Registered By</th><th style={th}>Status</th>
              </tr></thead>
              <tbody>
                {recentV.map((v: any, i: number) => {
                  const sp = STATUS_PILL[v.status] || STATUS_PILL.Pending;
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-app)" }}>
                      <td style={td}><span style={{ fontWeight: 700 }}>{v.name}</span></td>
                      <td style={{ ...td, fontFamily: "monospace", color: "var(--text-muted)" }}>{v.contact}</td>
                      <td style={td}>{v.property}</td>
                      <td style={td}>{v.date}</td>
                      <td style={td}><span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{v.createdBy}</span></td>
                      <td style={td}><span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, fontWeight: 700, background: sp.bg, color: sp.cl }}>{v.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", margin: "24px 0" }}>No visitors registered yet</p>}
        </div>
      </div>
    </div>
  );
}
