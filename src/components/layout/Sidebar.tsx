"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/modules/Sidebar.module.css";
import { api, getStoredUser, setStoredUser } from "@/utils/api";

export default function Sidebar() {
  const pathname = usePathname();

  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isCRMOpen, setIsCRMOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(true);
  const [activeCRMTab, setActiveCRMTab] = useState("dashboard");

  useEffect(() => {
    const initialUser = getStoredUser();
    setUser(initialUser);

    const fetchFreshProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res && res.success && res.user) {
          const stored = getStoredUser() || {};
          const mergedUser = {
            ...stored,
            ...res.user,
            orgName: res.user.orgName || res.user.organizationName || res.user.organization?.name || stored.orgName || stored.organizationName || stored.organization?.name,
            organizationName: res.user.organizationName || res.user.orgName || res.user.organization?.name || stored.organizationName || stored.orgName || stored.organization?.name,
            organization: res.user.organization || stored.organization
          };
          setStoredUser(mergedUser);
          setUser(mergedUser);
        }
      } catch {
        // Quietly handle network or profile sync errors
      }
    };
    fetchFreshProfile();
  }, []);

  // Sync active CRM tab from URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && tab !== activeCRMTab) {
        setActiveCRMTab(tab);
      }
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
  const isStaffAdmin = normalizedRole === "STAFF_ADMIN" || normalizedRole === "STAFF";

  const permissions: string[] = (user as { permissions?: string[] })?.permissions || [];
  const hasAccess = (permission: string) => isSuperAdmin || isCoworkingAdmin || permissions.includes(permission);

  const showCRM = isSuperAdmin || isCoworkingAdmin || hasAccess('manage_crm');

  // Role 1: SUPER_ADMIN Menu
  const superAdminGroups = [
    {
      label: "PROPERTY MANAGEMENT",
      items: [
        { name: "Properties", path: "/admin/properties", icon: "hgi-building-01" },
        { name: "Floor Management", path: "/admin/floors", icon: "hgi-layers-01" },
        { name: "SFT", path: "/admin/units", icon: "hgi-door-01" },
        { name: "Lease Management", path: "/admin/leases", icon: "hgi-agreement-01" },
        { name: "Booking Management", path: "/admin/bookings", icon: "hgi-calendar-03" }
      ]
    },
    {
      label: "FINANCE MANAGEMENT",
      items: [
        { name: "Payment Management", path: "/admin/payments", icon: "hgi-credit-card" }
      ]
    },
    {
      label: "SUPPORT MANAGEMENT",
      items: [
        { name: "Helpdesk & Complaints", path: "/admin/helpdesk", icon: "hgi-headset" }
      ]
    },
    {
      label: "VISITOR & SECURITY",
      items: [
        { name: "Visitor Management", path: "/admin/visitors", icon: "hgi-identity-card" }
      ]
    },
    {
      label: "ASSET & MAINTENANCE",
      items: [
        { name: "Asset & AMC Management", path: "/admin/assets", icon: "hgi-tools" },
        { name: "Material Management", path: "/admin/materials", icon: "hgi-package" }
      ]
    },
    {
      label: "VENDOR MANAGEMENT",
      items: [
        { name: "Vendor Management", path: "/admin/vendors", icon: "hgi-truck" }
      ]
    },
    {
      label: "USER MANAGEMENT",
      items: [
        { name: "Access Control Management", path: "/admin/users", icon: "hgi-user-shield-01" }
      ]
    }
  ];

  // Role 2: FLOOR_ADMIN Menu
  const floorAdminGroups = [
    {
      label: "PROPERTY MANAGEMENT",
      items: [
        { name: "SFT and Seats", path: "/admin/units", icon: "hgi-door-01" },
        { name: "Lease Details", path: "/admin/leases", icon: "hgi-agreement-01" },
        { name: "Booking Management", path: "/admin/bookings", icon: "hgi-calendar-03" }
      ]
    },
    {
      label: "VISITOR & SECURITY",
      items: [
        { name: "Visitor Management", path: "/admin/visitors", icon: "hgi-identity-card" },
        { name: "Gate Pass & Materials", path: "/admin/materials", icon: "hgi-package" }
      ]
    },
    {
      label: "ACCOUNT MANAGEMENT",
      items: [
        { name: "Profile & Settings", path: "/admin/settings", icon: "hgi-settings-01" }
      ]
    }
  ];

  // Role 3: COWORKING_ADMIN Menu
  const coworkingAdminGroups = [
    {
      label: "PROPERTY MANAGEMENT",
      items: [
        { name: "Properties", path: "/admin/properties", icon: "hgi-building-01" },
        { name: "SFT and Seats", path: "/admin/units", icon: "hgi-door-01" },
        { name: "Lease Management", path: "/admin/leases", icon: "hgi-agreement-01" },
        { name: "Booking Management", path: "/admin/bookings", icon: "hgi-calendar-03" }
      ]
    },
    {
      label: "FINANCE MANAGEMENT",
      items: [
        { name: "Payment Management", path: "/admin/payments", icon: "hgi-credit-card" }
      ]
    },
    {
      label: "VISITOR & SECURITY",
      items: [
        { name: "Visitor Management", path: "/admin/visitors", icon: "hgi-identity-card" }
      ]
    },
    {
      label: "ASSET & MAINTENANCE",
      items: [
        { name: "Asset & AMC Management", path: "/admin/assets", icon: "hgi-tools" },
        { name: "Material / Gate Pass", path: "/admin/materials", icon: "hgi-package" }
      ]
    },
    {
      label: "VENDOR MANAGEMENT",
      items: [
        { name: "Vendor Management", path: "/admin/vendors", icon: "hgi-truck" }
      ]
    },
    {
      label: "USER MANAGEMENT",
      items: [
        { name: "Access Control Management", path: "/admin/users", icon: "hgi-user-shield-01" }
      ]
    }
  ];

  // Role 4: COWORKING_TENANT Menu
  const coworkingTenantGroups = [
    {
      label: "PROPERTY MANAGEMENT",
      items: [
        { name: "Lease Details", path: "/admin/leases", icon: "hgi-agreement-01" },
        { name: "Booking Management", path: "/admin/bookings", icon: "hgi-calendar-03" }
      ]
    },
    {
      label: "SUPPORT MANAGEMENT",
      items: [
        { name: "Helpdesk & Complaints", path: "/admin/helpdesk", icon: "hgi-headset" }
      ]
    },
    {
      label: "VISITOR & SECURITY",
      items: [
        { name: "Visitor Management", path: "/admin/visitors", icon: "hgi-identity-card" },
        { name: "Gate Pass & Material Requests", path: "/admin/materials", icon: "hgi-package" }
      ]
    },
    {
      label: "ACCOUNT MANAGEMENT",
      items: [
        { name: "Profile & Settings", path: "/admin/settings", icon: "hgi-settings-01" }
      ]
    }
  ];

  // Role 5: STAFF_ADMIN Menu (Dynamically Filtered by Permissions)
  const staffOperationsItems = [
    ...(permissions.length === 0 || permissions.includes('manage_helpdesk') ? [{ name: "Helpdesk & Complaints", path: "/admin/helpdesk", icon: "hgi-headset" }] : []),
    ...(permissions.length === 0 || permissions.includes('manage_visitors') ? [{ name: "Visitor Management", path: "/admin/visitors", icon: "hgi-identity-card" }] : []),
    ...(permissions.length === 0 || permissions.includes('manage_materials') ? [{ name: "Gate Pass & Material Requests", path: "/admin/materials", icon: "hgi-package" }] : []),
    ...(permissions.includes('manage_assets') ? [{ name: "Asset & AMC Management", path: "/admin/assets", icon: "hgi-tools" }] : []),
    ...(permissions.includes('manage_vendors') ? [{ name: "Vendor Management", path: "/admin/vendors", icon: "hgi-truck" }] : []),
    ...(permissions.includes('manage_leases') ? [{ name: "Lease Details", path: "/admin/leases", icon: "hgi-agreement-01" }] : []),
    ...(permissions.includes('manage_floors') ? [{ name: "Floor Management", path: "/admin/floors", icon: "hgi-layers-01" }] : []),
    ...(permissions.includes('manage_bookings') ? [{ name: "Booking Management", path: "/admin/bookings", icon: "hgi-calendar-03" }] : []),
    ...(permissions.includes('manage_payments') ? [{ name: "Payment Management", path: "/admin/payments", icon: "hgi-credit-card" }] : []),
  ];

  const staffAdminGroups = [
    ...(staffOperationsItems.length > 0 ? [{
      label: "OPERATIONS",
      items: staffOperationsItems
    }] : []),
    {
      label: "ACCOUNT MANAGEMENT",
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
            : isStaffAdmin
              ? staffAdminGroups
              : superAdminGroups;

  const isCRMPath = pathname.startsWith("/admin/crm");
  const isAttendancePath = pathname.startsWith("/admin/attendance");

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

    return (
      <div className="w-100 mb-3">
        <div className={styles.navGroupHeader}>CRM MANAGEMENT</div>
        <div
          onClick={() => setIsCRMOpen(!isCRMOpen)}
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{
            backgroundColor: isCRMPath ? "#1e293b" : "rgba(255, 255, 255, 0.04)",
            border: isCRMPath ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.06)",
            color: "#ffffff",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.84rem",
            userSelect: "none",
            transition: "all 0.18s ease"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="hgi-stroke hgi-user-add" style={{ fontSize: "1.15rem", color: isCRMPath ? "#ffffff" : "#94a3b8" }}></i>
            <span>CRM Portal</span>
          </div>
          <i className={`bi bi-chevron-${isCRMOpen ? 'up' : 'down'}`} style={{ fontSize: "0.75rem", color: "#94a3b8" }}></i>
        </div>

        {isCRMOpen && (
          <div
            className="d-flex flex-column gap-1 mt-2 ps-2"
            style={{
              borderLeft: "1.5px solid rgba(255, 255, 255, 0.1)",
              marginLeft: "12px"
            }}
          >
            {crmItems.map((item) => {
              const isActive = isCRMPath && activeCRMTab === item.tab;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setActiveCRMTab(item.tab)}
                  className="d-flex align-items-center gap-2 px-3 py-1.5 text-decoration-none"
                  style={{
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: "500",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    backgroundColor: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                    transition: "all 0.18s ease"
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      backgroundColor: isActive ? "#ffffff" : "#64748b",
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
        { name: "Leaves", path: "/admin/attendance/leaves" }
      ] : [])
    ];

    if (attendanceItems.length === 0) return null;

    return (
      <div className="w-100 mb-3">
        <div className={styles.navGroupHeader}>HR & ATTENDANCE</div>
        <div
          onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
          className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{
            backgroundColor: isAttendancePath ? "#1e293b" : "rgba(255, 255, 255, 0.04)",
            border: isAttendancePath ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.06)",
            color: "#ffffff",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.84rem",
            userSelect: "none",
            transition: "all 0.18s ease"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className="hgi-stroke hgi-clipboard-check" style={{ fontSize: "1.15rem", color: isAttendancePath ? "#ffffff" : "#94a3b8" }}></i>
            <span>Attendance Portal</span>
          </div>
          <i className={`bi bi-chevron-${isAttendanceOpen ? 'up' : 'down'}`} style={{ fontSize: "0.75rem", color: "#94a3b8" }}></i>
        </div>

        {isAttendanceOpen && (
          <div
            className="d-flex flex-column gap-1 mt-2 ps-2"
            style={{
              borderLeft: "1.5px solid rgba(255, 255, 255, 0.1)",
              marginLeft: "12px"
            }}
          >
            {attendanceItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className="d-flex align-items-center gap-2 px-3 py-1.5 text-decoration-none"
                  style={{
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: "500",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    backgroundColor: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                    transition: "all 0.18s ease"
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      backgroundColor: isActive ? "#ffffff" : "#64748b",
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

  const isDashboardActive = pathname === "/admin/dashboard" || pathname === "/admin";

  const orgDisplay =
    (user as any)?.orgName ||
    (user as any)?.organizationName ||
    (user as any)?.organization?.name ||
    (user as any)?.assignedProperties?.[0]?.propertyName ||
    "Mirai Cloud IT Services";

  return (
    <aside className={styles.sidebar}>
      {/* Brand Header & Organization Display */}
      <div className="px-3 py-3 d-flex align-items-center gap-2.5 border-bottom border-secondary border-opacity-10" style={{ backgroundColor: "#0b0f19" }}>
        {/* <img
          src="/mirai_logo.png"
          alt="MIRAI CLOUD IT SERVICES"
          style={{ height: 34 }}
          className="w-auto object-fit-contain flex-shrink-0"
        /> */}
        <div className="d-flex flex-column justify-content-center" style={{ minWidth: 0, lineHeight: 1.25 }}>
          <span className="fw-bold text-white text-truncate" style={{ fontSize: "0.85rem", letterSpacing: "-0.01em" }} title={orgDisplay}>
            {orgDisplay}
          </span>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>
            ORGANIZATION
          </span>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className={styles.navSection}>
        {/* Top Featured Dashboard Card Button */}
        <Link
          href="/admin/dashboard"
          className={`${styles.dashboardCard} ${isDashboardActive ? styles.dashboardCardActive : styles.dashboardCardInactive}`}
        >
          <i className="hgi-stroke hgi-dashboard-square-01" style={{ fontSize: "1.2rem", color: isDashboardActive ? "#ffffff" : "#94a3b8" }}></i>
          <span>Dashboard</span>
        </Link>

        {/* Grouped Navigation Links */}
        {menuGroups.map((group) => (
          <div key={group.label} className={styles.navGroup}>
            {group.label && (
              <div className={styles.navGroupHeader}>
                {group.label}
              </div>
            )}
            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
              {group.items.map((item) => {
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
        ))}

        {/* CRM Dropdown (Hidden per user request) */}
        {/* {showCRM && renderCRMDropdown()} */}

        {/* HR & Attendance Dropdown (Hidden per user request) */}
        {/* {(isSuperAdmin || isHrAdmin || normalizedRole === 'MANAGER' || normalizedRole === 'EMPLOYEE') && renderAttendanceDropdown()} */}
      </nav>

      {/* Bottom User Card */}
      {user && (
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.07)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#070a10"
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)"
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#ffffff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {user.name || "Admin User"}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", textTransform: "capitalize" }}>
              {user.role ? user.role.replace(/_/g, " ").toLowerCase() : "Administrator"}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
