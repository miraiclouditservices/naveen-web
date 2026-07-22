"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/modules/Sidebar.module.css";
import { api } from "@/utils/api";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isCRMOpen, setIsCRMOpen] = useState(true);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(true);
  const [activeCRMTab, setActiveCRMTab] = useState("dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }

      const fetchFreshProfile = async () => {
        try {
          const res = await api.get('/auth/profile');
          if (res.success && res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
            setUser(res.user);
          }
        } catch (err) {
          console.error("Failed to sync sidebar profile:", err);
        }
      };

      fetchFreshProfile();
    }
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

  const displayName = user ? user.name : "Admin User";
  const displayRole = user
    ? (user.role === "Admin" ? "SUPER_ADMIN" : user.role === "Owner" ? "OFFICE_OWNER" : user.role)
    : "SUPER_ADMIN";

  const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.role === "Admin" || user?.role === "Super Admin";
  const permissions = (user as any)?.permissions || [];
  const hasAccess = (permission: string) => isSuperAdmin || permissions.includes(permission);

  const showCRM = isSuperAdmin || hasAccess('manage_crm') || user?.role === 'STAFF_ADMIN' || user?.role === 'FLOOR_ADMIN';

  const menuGroups = [
    {
      label: "Main",
      items: [
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' || permissions.length > 0 ? [{ name: "Dashboard", path: "/admin/dashboard", icon: "hgi-dashboard-square-01" }] : []),
        ...(isSuperAdmin || hasAccess('view_floors') || user?.role === 'STAFF_ADMIN' ? [{ name: "Properties", path: "/admin/properties", icon: "hgi-building-01" }] : []),
        ...(isSuperAdmin || hasAccess('view_floors') || user?.role === 'STAFF_ADMIN' ? [{ name: "Floors", path: "/admin/floors", icon: "hgi-layers-01" }] : []),
        ...(isSuperAdmin || hasAccess('view_floors') || user?.role === 'STAFF_ADMIN' ? [{ name: "Units and sft", path: "/admin/units", icon: "hgi-door-01" }] : []),
        ...(isSuperAdmin || hasAccess('view_tenants') || user?.role === 'STAFF_ADMIN' ? [{ name: "Leases", path: "/admin/leases", icon: "hgi-agreement-01" }] : []),
        ...(user ? [{ name: "Payments", path: "/admin/payments", icon: "hgi-credit-card" }] : []),
      ]
    },
    {
      label: "Operations",
      items: [
        ...(isSuperAdmin || hasAccess('manage_helpdesk') || user?.role === 'STAFF_ADMIN' ? [{ name: "Helpdesk", path: "/admin/helpdesk", icon: "hgi-headset" }] : []),
        ...(isSuperAdmin || hasAccess('manage_visitors') || user?.role === 'STAFF_ADMIN' ? [
          { name: "Visitors", path: "/admin/visitors", icon: "hgi-identity-card" },
          { name: "Materials", path: "/admin/materials", icon: "hgi-package" },
          { name: "Bookings", path: "/admin/bookings", icon: "hgi-calendar-01" }
        ] : []),
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' || user?.role === 'FLOOR_ADMIN' ? [{ name: "Assets", path: "/admin/assets", icon: "hgi-tools" }] : []),
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' ? [{ name: "Vendors", path: "/admin/vendors", icon: "hgi-truck" }] : [])
      ]
    },
    {
      label: "Attendance",
      items: [] // handled via custom renderAttendanceDropdown
    },
    {
      label: "CRM",
      items: [] // handled via custom renderCRMDropdown
    },
    {
      label: "Management",
      items: [
        ...(isSuperAdmin || hasAccess('manage_staff') || user?.role === 'FLOOR_ADMIN' || user?.role === 'OFFICE_OWNER' || user?.role === 'Owner' ? [
          { name: "Access Management", path: "/admin/users", icon: "hgi-user-shield-01" },
        ] : []),
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' ? [{ name: "Roles & Permissions", path: "/admin/roles", icon: "hgi-user-key" }] : [])
      ]
    },
    {
      label: "Account",
      items: [
        { name: "Settings & Profile", path: "/admin/settings", icon: "hgi-settings-01" }
      ]
    }
  ].map(group => {
    if (user?.role === "Owner" || user?.role === "OFFICE_OWNER") {
      const itemsToRemove = ["Properties", "Floors", "Units and sft", "Leases", "Assets", "Vendors", "Reports"];
      return {
        ...group,
        items: group.items.filter(item => !itemsToRemove.includes(item.name))
      };
    }
    return group;
  }).filter(group => group.label === "CRM" || group.label === "Attendance" || group.items.length > 0);

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
      <div className="w-100 px-3 my-2">
        {/* Dropdown Header Trigger */}
        <div 
          onClick={() => setIsCRMOpen(!isCRMOpen)}
          className="d-flex align-items-center justify-content-between"
          style={{
            backgroundColor: "#5850ec",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
            userSelect: "none",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
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
                      backgroundColor: isActive ? "#5850ec" : "rgba(255, 255, 255, 0.35)",
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
      ...(isSuperAdmin || user?.role === 'HR_ADMIN' || user?.role === 'MANAGER' || user?.role === 'EMPLOYEE' ? [
        { name: "Dashboard", path: "/admin/attendance/dashboard" }
      ] : []),
      ...(isSuperAdmin || user?.role === 'HR_ADMIN' ? [
        { name: "Employee Directory", path: "/admin/attendance/employees" },
        { name: "Shifts & Policies", path: "/admin/attendance/shifts" },
        { name: "Holiday Calendar", path: "/admin/attendance/holidays" }
      ] : []),
      ...(isSuperAdmin || user?.role === 'HR_ADMIN' || user?.role === 'MANAGER' ? [
        { name: "Shift Calendar", path: "/admin/attendance/calendar" }
      ] : []),
      ...(isSuperAdmin || user?.role === 'HR_ADMIN' || user?.role === 'MANAGER' || user?.role === 'EMPLOYEE' ? [
        { name: "Attendance Logs", path: "/admin/attendance/logs" },
        { name: "Corrections", path: "/admin/attendance/corrections" },
        { name: "Leave Management", path: "/admin/attendance/leaves" }
      ] : [])
    ];

    if (attendanceItems.length === 0) return null;

    return (
      <div className="w-100 px-3 my-2">
        {/* Dropdown Header Trigger */}
        <div 
          onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
          className="d-flex align-items-center justify-content-between"
          style={{
            backgroundColor: "#1E2A78",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
            userSelect: "none",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
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
                      backgroundColor: isActive ? "#1E2A78" : "rgba(255, 255, 255, 0.35)",
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
      <div className={styles.brand} style={{ padding: '24px 20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '12px' }}>
          <i className="hgi-stroke hgi-building-03" style={{ fontSize: '2rem', color: '#c49a02' }}></i>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontWeight: 700, fontSize: '1.1rem', color: '#ffffff', letterSpacing: '0.02em', fontFamily: "'Cinzel', 'Orbitron', serif",
          }}>
            ANVAYA360
          </span>
          <span style={{ fontSize: '0.65rem', color: '#a0a0a0', fontWeight: 500 }}>
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
            const hasAttendanceAccess = isSuperAdmin || user?.role === 'HR_ADMIN' || user?.role === 'MANAGER' || user?.role === 'EMPLOYEE';
            return hasAttendanceAccess ? <React.Fragment key="Attendance">{renderAttendanceDropdown()}</React.Fragment> : null;
          }

          return (
            <div key={group.label} className={styles.navGroup}>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.path);
                  return (
                    <li key={item.name}>
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
