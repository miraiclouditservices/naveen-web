"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/modules/Sidebar.module.css";
import { api } from "@/utils/api";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

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


  const displayName = user ? user.name : "Admin User";
  const displayRole = user
    ? (user.role === "Admin" ? "SUPER_ADMIN" : user.role === "Owner" ? "OFFICE_OWNER" : user.role)
    : "SUPER_ADMIN";
  const avatarChar = displayName ? displayName.charAt(0).toUpperCase() : "A";

  const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.role === "Admin" || user?.role === "Super Admin";
  const permissions = (user as any)?.permissions || [];

  const hasAccess = (permission: string) => isSuperAdmin || permissions.includes(permission);

  const menuGroups = [
    {
      label: "Main",
      items: [
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' || permissions.length > 0 ? [{ name: "Dashboard", path: "/admin/dashboard", icon: "hgi-dashboard-square-01" }] : []),
        ...(isSuperAdmin || hasAccess('view_floors') || user?.role === 'STAFF_ADMIN' ? [{ name: "Properties", path: "/admin/properties", icon: "hgi-building-01" }] : []),
        ...(isSuperAdmin || hasAccess('view_floors') || user?.role === 'STAFF_ADMIN' ? [{ name: "Floors", path: "/admin/floors", icon: "hgi-layers-01" }] : []),
        ...(isSuperAdmin || hasAccess('view_floors') || user?.role === 'STAFF_ADMIN' ? [{ name: "Units and sft", path: "/admin/units", icon: "hgi-door-01" }] : []),
        ...(isSuperAdmin || hasAccess('view_tenants') || user?.role === 'STAFF_ADMIN' ? [{ name: "Leases", path: "/admin/leases", icon: "hgi-agreement-01" }] : []),
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' ? [{ name: "Floor Assignments", path: "/admin/floor-assignments", icon: "hgi-clipboard" }] : []),
        ...(user ? [
          { name: "Payments", path: "/admin/payments", icon: "hgi-credit-card" }
        ] : []),
      ]
    },
    {
      label: "Operations",
      items: [
        ...(isSuperAdmin || hasAccess('manage_helpdesk') || user?.role === 'STAFF_ADMIN' ? [
          { name: "Helpdesk", path: "/admin/helpdesk", icon: "hgi-headset" }
        ] : []),
        ...(isSuperAdmin || hasAccess('manage_visitors') || user?.role === 'STAFF_ADMIN' ? [
          { name: "Visitors", path: "/admin/visitors", icon: "hgi-identity-card" },
          { name: "Materials", path: "/admin/materials", icon: "hgi-package" },
          { name: "Bookings", path: "/admin/bookings", icon: "hgi-calendar-01" }
        ] : []),
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' || user?.role === 'FLOOR_ADMIN' ? [
          { name: "Assets", path: "/admin/assets", icon: "hgi-tools" }
        ] : []),
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' ? [
          { name: "Vendors", path: "/admin/vendors", icon: "hgi-truck" },
          { name: "AMC Contracts", path: "/admin/amc", icon: "hgi-document-text" },
          { name: "Spaces", path: "/admin/space", icon: "hgi-structure-01" }
        ] : [])
      ]
    },
    {
      label: "Management",
      items: [
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' ? [
          { name: "Owners", path: "/admin/owners", icon: "hgi-user" },
          { name: "Tenants", path: "/admin/tenants", icon: "hgi-user-group" },
          { name: "People", path: "/admin/people", icon: "hgi-user-id" },
          { name: "Watchmen", path: "/admin/watchmen", icon: "hgi-security-guard" },
          { name: "Offices", path: "/admin/offices", icon: "hgi-office" },
          { name: "Finance", path: "/admin/finance", icon: "hgi-money-bag" }
        ] : []),
        ...(isSuperAdmin || hasAccess('manage_staff') || user?.role === 'FLOOR_ADMIN' || user?.role === 'OFFICE_OWNER' || user?.role === 'Owner' ? [
          { name: "Access Management", path: "/admin/users", icon: "hgi-user-shield-01" },
        ] : []),
        ...(isSuperAdmin || user?.role === 'STAFF_ADMIN' ? [
          { name: "Security", path: "/admin/security", icon: "hgi-shield-keyhole" },
          { name: "Roles & Permissions", path: "/admin/roles", icon: "hgi-user-key" }
        ] : [])
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
      const itemsToRemove = ["Properties", "Floors", "Units and sft", "Tenants", "Leases", "Owners", "Assets", "Vendors", "Reports"];
      return {
        ...group,
        items: group.items.filter(item => !itemsToRemove.includes(item.name))
      };
    }
    return group;
  }).filter(group => group.items.length > 0);

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <i className="hgi-stroke hgi-shield-01"></i>
        </div>
        <span className={styles.brandName}>PMS Global</span>
      </div>

      {/* Navigation */}
      <nav className={styles.navSection}>
        {menuGroups.map((group) => (
          <div key={group.label} className={styles.navGroup}>
            <p className={styles.navLabel}>{group.label}</p>
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
        ))}
      </nav>

    </aside>
  );
}
