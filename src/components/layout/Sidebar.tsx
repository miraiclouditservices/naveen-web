"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/modules/Sidebar.module.css";
import { api, getStoredUser, setStoredUser } from "@/utils/api";

export default function Sidebar() {
  const pathname = usePathname();

  // useState(null) keeps SSR and client initial renders identical → no hydration mismatch.
  // useLayoutEffect runs synchronously before the browser paints on the client,
  // so the menu items appear immediately without a visible flash.
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isCRMOpen, setIsCRMOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(true);
  const [activeCRMTab, setActiveCRMTab] = useState("dashboard");

  // Sync user from localStorage before first paint (client only)
  useLayoutEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
  }, []);

  useEffect(() => {
    // Fetch fresh profile from server and keep localStorage in sync
    const fetchFreshProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res && res.success && res.user) {
          setStoredUser(res.user);
          setUser(res.user);
        }
      } catch (err) {
        // Quietly handle network or profile sync errors
      }
    };
    fetchFreshProfile();
  }, []);

  // Sync active CRM tab from URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") || "dashboard";
      setActiveCRMTab(tab);
    }
    if (pathname.startsWith("/admin/crm")) {
      setIsCRMOpen(true);
    }
  }, [pathname]);

  // Normalize role string to uppercase standard constants
  const rawRole = user?.role || "";
  const normalizedRole =
    rawRole === "Super Admin" || rawRole === "SUPER_ADMIN" || rawRole === "Admin" ? "SUPER_ADMIN"
      : rawRole === "Floor Admin" || rawRole === "FLOOR_ADMIN" ? "FLOOR_ADMIN"
        : rawRole === "Co-Working Admin" || rawRole === "COWORKING_ADMIN" ? "COWORKING_ADMIN"
          : rawRole === "Co-Working Member" || rawRole === "COWORKING_TENANT" || rawRole === "COWORKING_TENENT" || rawRole === "Tenant" || rawRole === "TENANT" ? "COWORKING_TENANT"
            : rawRole === "Ultra Super Admin" || rawRole === "ULTRA_SUPER_ADMIN" ? "ULTRA_SUPER_ADMIN"
              : rawRole === "Owner" || rawRole === "Office Owner" || rawRole === "OFFICE_OWNER" ? "OFFICE_OWNER"
                : rawRole.toUpperCase().replace(/ /g, "_");

  const isUltraSuperAdmin = normalizedRole === "ULTRA_SUPER_ADMIN";
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN" || isUltraSuperAdmin;
  const isCoworkingAdmin = normalizedRole === "COWORKING_ADMIN";
  const isFloorAdmin = normalizedRole === "FLOOR_ADMIN";
  const isCoworkingTenant = normalizedRole === "COWORKING_TENANT";
  const isHrAdmin = normalizedRole === "HR_ADMIN";

  const permissions = (user as any)?.permissions || [];
  const hasAccess = (permission: string) => isSuperAdmin || isCoworkingAdmin || permissions.includes(permission);

  const showCRM = isSuperAdmin || isCoworkingAdmin || hasAccess('manage_crm');

  // Role 1: SUPER_ADMIN Menu
  const superAdminGroups = [
    {
      label: "Main",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: "hgi-dashboard-square-01" },
        { name: "Properties", path: "/admin/properties", icon: "hgi-building-01" },
        { name: "Floor Management", path: "/admin/floors", icon: "hgi-layers-01" },
        { name: "Lease Management", path: "/admin/leases", icon: "hgi-agreement-01" },
        { name: "Payment Management", path: "/admin/payments", icon: "hgi-credit-card" }
      ]
    },
    {
      label: "Operations",
      items: [
        { name: "Helpdesk & Complaints", path: "/admin/helpdesk", icon: "hgi-headset" },
        { name: "Visitor Management", path: "/admin/visitors", icon: "hgi-identity-card" },
        { name: "Asset & AMC Management", path: "/admin/assets", icon: "hgi-tools" },
        { name: "Material Management", path: "/admin/materials", icon: "hgi-package" },
        { name: "Vendor Management", path: "/admin/vendors", icon: "hgi-truck" }
      ]
    },
    {
      label: "Management",
      items: [
        { name: "Access Management", path: "/admin/users", icon: "hgi-user-shield-01" }
      ]
    }
  ];

  // Role 2: FLOOR_ADMIN Menu
  const floorAdminGroups = [
    {
      label: "Main",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: "hgi-dashboard-square-01" },
        { name: "Lease Details", path: "/admin/leases", icon: "hgi-agreement-01" }
      ]
    },
    {
      label: "Operations",
      items: [
        { name: "Visitor ", path: "/admin/visitors", icon: "hgi-identity-card" },
        { name: "Gate Pass & Material ", path: "/admin/materials", icon: "hgi-package" }
      ]
    },
    {
      label: "Account",
      items: [
        { name: "Profile & Settings", path: "/admin/settings", icon: "hgi-settings-01" }
      ]
    }
  ];

  // Role 3: COWORKING_ADMIN Menu
  const coworkingAdminGroups = [
    {
      label: "Main",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: "hgi-dashboard-square-01" },
        { name: "Properties", path: "/admin/properties", icon: "hgi-building-01" },
        { name: "SFT and Seats", path: "/admin/units", icon: "hgi-door-01" },
        { name: "Lease ", path: "/admin/leases", icon: "hgi-agreement-01" },
        { name: "Payment ", path: "/admin/payments", icon: "hgi-credit-card" }
      ]
    },
    {
      label: "Operations",
      items: [
        { name: "Visitor ", path: "/admin/visitors", icon: "hgi-identity-card" },
        { name: "Material / Gate Pass ", path: "/admin/materials", icon: "hgi-package" },
        { name: "Asset & AMC ", path: "/admin/assets", icon: "hgi-tools" },
        { name: "Vendor ", path: "/admin/vendors", icon: "hgi-truck" }
      ]
    },
    {
      label: "",
      items: [
        { name: "Access ", path: "/admin/users", icon: "hgi-user-shield-01" }
      ]
    }
  ];

  // Role 4: COWORKING_TENENT Menu
  const coworkingTenantGroups = [
    {
      label: "Main",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: "hgi-dashboard-square-01" },
        { name: "Lease Details", path: "/admin/leases", icon: "hgi-agreement-01" }
      ]
    },
    {
      label: "Operations",
      items: [
        { name: "Helpdesk & Complaints", path: "/admin/helpdesk", icon: "hgi-headset" },
        { name: "Visitor ", path: "/admin/visitors", icon: "hgi-identity-card" },
        { name: "Gate Pass & Material Requests", path: "/admin/materials", icon: "hgi-package" }
      ]
    },
    {
      label: "Account",
      items: [
        { name: "Profile & Settings", path: "/admin/settings", icon: "hgi-settings-01" }
      ]
    }
  ];

  const menuGroups = isUltraSuperAdmin
    ? superAdminGroups
    : isSuperAdmin
      ? superAdminGroups
      : isCoworkingAdmin
        ? coworkingAdminGroups
        : isFloorAdmin
          ? floorAdminGroups
          : isCoworkingTenant
            ? coworkingTenantGroups
            : superAdminGroups;

  const renderCRMDropdown = () => {
    const crmItems = [
      { name: "Overview", tab: "dashboard", path: "/admin/crm?tab=dashboard" },
      { name: "Leads", tab: "leads", path: "/admin/crm?tab=leads" },
      { name: "Contacts", tab: "contacts", path: "/admin/crm?tab=contacts" },
      { name: "Accounts", tab: "accounts", path: "/admin/crm?tab=accounts" },
      { name: "Deals", tab: "deals", path: "/admin/crm?tab=deals" },
      { name: "Activities", tab: "activities", path: "/admin/crm?tab=activities" },
      { name: "Pipeline", tab: "pipeline", path: "/admin/crm?tab=pipeline" },
      { name: "Reports", tab: "reports", path: "/admin/crm?tab=reports" },
      { name: "Settings", tab: "settings", path: "/admin/crm?tab=settings" }
    ];

    const isCRMPath = pathname.startsWith("/admin/crm");

    return (
      <div className="w-100 my-1">
        {/* Dropdown Header Trigger */}
        <div
          onClick={() => setIsCRMOpen(!isCRMOpen)}
          className="d-flex align-items-center justify-content-between"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
            userSelect: "none",
            transition: "all 0.2s"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="hgi-stroke hgi-user-add" style={{ fontSize: "1.1rem" }}></i>
            <span>CRM</span>
          </div>
          <i className={`bi bi-chevron-${isCRMOpen ? 'up' : 'down'}`} style={{ fontSize: "0.75rem" }}></i>
        </div>

        {/* Collapsible Submenu list */}
        {isCRMOpen && (
          <div
            className="d-flex flex-column gap-1 mt-2"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              borderRadius: "8px",
              padding: "6px"
            }}
          >
            {crmItems.map((item) => {
              const isActive = isCRMPath && activeCRMTab === item.tab;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setActiveCRMTab(item.tab)}
                  className="d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
                  style={{
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: "500",
                    color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                    backgroundColor: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Bullet Indicator Dot */}
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.35)",
                      display: "inline-block"
                    }}
                  ></span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderAttendanceDropdown = () => {
    const attendanceItems = [
      ...(isSuperAdmin || isHrAdmin || normalizedRole === 'MANAGER' || normalizedRole === 'EMPLOYEE' ? [
        { name: "Dashboard", path: "/admin/attendance/dashboard" }
      ] : []),
      ...(isSuperAdmin || isHrAdmin ? [
        { name: "Employee Directory", path: "/admin/attendance/employees" },
        { name: "Shifts & Policies", path: "/admin/attendance/shifts" },
        { name: "Holiday Calendar", path: "/admin/attendance/holidays" }
      ] : []),
      ...(isSuperAdmin || isHrAdmin || normalizedRole === 'MANAGER' ? [
        { name: "Shift Calendar", path: "/admin/attendance/calendar" }
      ] : []),
      ...(isSuperAdmin || isHrAdmin || normalizedRole === 'MANAGER' || normalizedRole === 'EMPLOYEE' ? [
        { name: "Attendance Logs", path: "/admin/attendance/logs" },
        { name: "Corrections", path: "/admin/attendance/corrections" },
        { name: "Leave ", path: "/admin/attendance/leaves" }
      ] : [])
    ];

    if (attendanceItems.length === 0) return null;

    return (
      <div className="w-100 my-1">
        {/* Dropdown Header Trigger */}
        <div
          onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
          className="d-flex align-items-center justify-content-between"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
            userSelect: "none",
            transition: "all 0.2s"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="hgi-stroke hgi-clipboard-check" style={{ fontSize: "1.1rem" }}></i>
            <span>Attendance</span>
          </div>
          <i className={`bi bi-chevron-${isAttendanceOpen ? 'up' : 'down'}`} style={{ fontSize: "0.75rem" }}></i>
        </div>

        {/* Collapsible Submenu list */}
        {isAttendanceOpen && (
          <div
            className="d-flex flex-column gap-1 mt-2"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              borderRadius: "8px",
              padding: "6px"
            }}
          >
            {attendanceItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className="d-flex align-items-center gap-3 px-3 py-2 text-decoration-none"
                  style={{
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: "500",
                    color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                    backgroundColor: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Bullet Indicator Dot */}
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.35)",
                      display: "inline-block"
                    }}
                  ></span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand} style={{ padding: '16px 12px', display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '12px' }}>
          <i className="hgi-stroke hgi-building-03" style={{ fontSize: '2rem', color: '#ffffff' }}></i>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontWeight: 700, fontSize: '1.1rem', color: '#ffffff', letterSpacing: '0.02em', fontFamily: "'Cinzel', 'Orbitron', serif",
          }}>
            {/* ANVAYA360 */} PMS
          </span>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
            All in one App
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.navSection}>
        {menuGroups.map((group) => {
          if (group.label === "CRM") {
            return showCRM ? <React.Fragment key="CRM">{renderCRMDropdown()}</React.Fragment> : null;
          }
          if (group.label === "Attendance") {
            const hasAttendanceAccess = isSuperAdmin || isHrAdmin || normalizedRole === 'MANAGER' || normalizedRole === 'EMPLOYEE';
            return hasAttendanceAccess ? <React.Fragment key="Attendance">{renderAttendanceDropdown()}</React.Fragment> : null;
          }

          return (
            <div key={group.label} className={styles.navGroup}>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                {group.items.map((item) => {
                  // Match /admin/units and all sub-paths like /admin/units/[id]
                  const isActive = item.path === "/admin/units"
                    ? pathname === "/admin/units" || pathname.startsWith("/admin/units/")
                    : pathname.startsWith(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                      >
                        <i className={`hgi-stroke ${item.icon} ${styles.navIcon}`}></i>
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
