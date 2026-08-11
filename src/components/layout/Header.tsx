"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import styles from "@/styles/modules/Header.module.css";
import Link from "next/link";
import LogoutModal from "@/components/dashboard/LogoutModal";
import { api, getStoredUser, setStoredUser, clearStoredAuth } from "@/utils/api";

export default function Header() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Real-time API Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);

  useLayoutEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
  }, []);

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await api.get('/notifications');
      if (res && res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
        if (typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        } else {
          setUnreadCount(res.data.filter((n: any) => !n.readStatus && !n.isRead).length);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res && res.success && res.user) {
          setStoredUser(res.user);
          setUser(res.user);
        }
      } catch (err) { }
    };
    fetchFreshProfile();
    fetchNotifications();

    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    window.location.href = "/login";
  };

  const formatRole = (roleStr?: string) => {
    if (!roleStr) return "SUPER ADMIN";
    if (roleStr === "SUPER_ADMIN" || roleStr === "Admin" || roleStr === "Super Admin") return "SUPER ADMIN";
    if (roleStr === "OFFICE_OWNER" || roleStr === "OFFICE_ADMIN" || roleStr === "Office Owner" || roleStr === "Owner") return "OFFICE ADMIN";
    if (roleStr === "FLOOR_ADMIN" || roleStr === "Floor Admin") return "FLOOR ADMIN";
    if (roleStr === "STAFF_ADMIN" || roleStr === "Staff Admin") return "STAFF ADMIN";
    if (roleStr === "HR_ADMIN" || roleStr === "HR Admin") return "HR ADMIN";
    if (roleStr === "Tenant" || roleStr === "TENANT") return "TENANT";
    return roleStr.replace(/_/g, " ").toUpperCase();
  };

  const formatTimeAgo = (dateStr?: string | Date) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Just now";
    const diffSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  const displayName = user ? user.name : "Tungana Naveen";
  const avatarChar = displayName ? displayName.charAt(0).toUpperCase() : "T";

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    const isUnread = !notif.readStatus && !notif.isRead;
    if (isUnread && notif._id) {
      try {
        await api.put(`/notifications/${notif._id}/read`, {});
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, readStatus: true, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }
  };

  return (
    <header
      className={`${styles.header} d-flex align-items-center justify-content-end px-4 shadow-none`}
      style={{
        height: "52px",
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "none",
        position: "sticky",
        top: 0,
        zIndex: 999
      }}
    >

      {/* Right Toolbar: Notifications, Help & Profile Dropdown */}
      <div className="d-flex align-items-center" style={{ gap: "10px" }}>

        {/* Notifications Dropdown */}
        <div className="dropdown">
          <button
            className="btn border d-flex align-items-center justify-content-center p-0 shadow-none position-relative"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            onClick={fetchNotifications}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text-primary)"
            }}
            title="Notifications"
          >
            <i className="bi bi-bell" style={{ fontSize: "1rem" }}></i>
            {unreadCount > 0 && (
              <span
                className="position-absolute badge rounded-circle border"
                style={{
                  top: "2px",
                  right: "2px",
                  width: "8px",
                  height: "8px",
                  padding: 0,
                  backgroundColor: "var(--error)",
                  borderColor: "var(--surface)"
                }}
              ></span>
            )}
          </button>

          <div
            className="dropdown-menu dropdown-menu-end border shadow-none p-0 rounded-4 mt-2 overflow-hidden"
            style={{
              width: "320px",
              zIndex: 1060,
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "none"
            }}
          >
            {/* Header */}
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ backgroundColor: "var(--muted)" }}>
              <div className="d-flex align-items-center gap-2">
                <h6 className="fw-bold mb-0" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>Notifications</h6>
                {unreadCount > 0 && (
                  <span className="badge rounded-pill px-2" style={{ fontSize: "0.62rem", backgroundColor: "var(--button-primary)", color: "var(--button-text)" }}>
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="btn btn-link p-0 text-decoration-none small"
                  style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-auto" style={{ maxHeight: "320px", scrollbarWidth: "thin" }}>
              {isLoadingNotifications && notifications.length === 0 ? (
                <div className="p-4 text-center small" style={{ color: "var(--text-secondary)" }}>
                  <span className="spinner-border spinner-border-sm me-2" role="status" style={{ color: "var(--text-primary)" }}></span>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center small" style={{ color: "var(--text-secondary)" }}>
                  <i className="bi bi-bell-slash d-block mb-1 fs-4" style={{ color: "var(--text-secondary)" }}></i>
                  No notifications available
                </div>
              ) : (
                notifications.map((n: any) => {
                  const isRead = n.readStatus || n.isRead;
                  return (
                    <div
                      key={n._id || n.id}
                      className="p-3 border-bottom"
                      style={{
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        opacity: isRead ? 0.75 : 1,
                        backgroundColor: isRead ? "var(--surface)" : "var(--secondary)",
                        transition: "all 0.2s"
                      }}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong className="fw-semibold" style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                          {n.title || "System Alert"}
                        </strong>
                        <span className="extra-small" style={{ color: "var(--text-secondary)" }}>
                          {formatTimeAgo(n.createdAt || n.notificationTime || n.time)}
                        </span>
                      </div>
                      <p className="mb-0" style={{ fontSize: "0.74rem", lineHeight: "1.35", color: "var(--text-secondary)" }}>
                        {n.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-2 border-top text-center" style={{ backgroundColor: "var(--muted)" }}>
              <Link href="/admin/settings" className="small fw-semibold text-decoration-none" style={{ fontSize: "0.74rem", color: "var(--text-primary)" }}>
                View all activity logs <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Button */}
        <button
          className="btn border d-flex align-items-center justify-content-center p-0 shadow-none"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
            color: "var(--text-primary)"
          }}
          title="Help & Documentation"
          onClick={() => alert("ANVAYA360 Property Directory Help:\n- Search & Filter properties in real time\n- Toggle between Grid, Table, and Map views\n- Click any property for full details")}
        >
          <i className="bi bi-question-circle" style={{ fontSize: "1rem" }}></i>
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="dropdown">
          <button
            className="d-flex align-items-center justify-content-center border-0 bg-transparent p-0 shadow-none"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ cursor: "pointer" }}
            title={`Account (${displayName})`}
          >
            <div
              className="d-flex align-items-center justify-content-center fw-bold shadow-none"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "var(--button-primary)",
                color: "var(--button-text)",
                fontSize: "0.9rem"
              }}
            >
              {avatarChar}
            </div>
          </button>

          <div
            className="dropdown-menu dropdown-menu-end border shadow-none p-4 rounded-4 mt-2"
            style={{
              width: "270px",
              zIndex: 1060,
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              borderRadius: "16px",
              boxShadow: "none"
            }}
          >
            {/* Header User Row: Avatar + Name + Role Badge */}
            <div className="d-flex align-items-center gap-3">
              {/* Circular Avatar */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{
                  width: "46px",
                  height: "46px",
                  backgroundColor: "var(--muted)",
                  color: "var(--text-primary)",
                  fontSize: "1.15rem"
                }}
              >
                {avatarChar}
              </div>

              {/* Name & Role Badge */}
              <div className="d-flex flex-column text-truncate">
                <span
                  className="fw-bold text-truncate"
                  style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.2", marginBottom: "4px" }}
                >
                  {displayName}
                </span>
                <div>
                  <span
                    className="badge border d-inline-flex align-items-center gap-1"
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      backgroundColor: "var(--secondary)",
                      borderColor: "var(--border)",
                      color: "var(--success)",
                      borderRadius: "6px",
                      padding: "3px 7px",
                      letterSpacing: "0.02em"
                    }}
                  >
                    <i className="bi bi-shield-check" style={{ fontSize: "0.7rem", color: "var(--success)" }}></i>
                    {formatRole(user?.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <hr style={{ margin: "14px 0", borderColor: "var(--border)", opacity: 0.8 }} />

            {/* Menu Options */}
            <div className="d-flex flex-column gap-1">
              <Link
                href="/admin/settings"
                className="d-flex align-items-center justify-content-between py-2 text-decoration-none rounded-2 px-1"
                style={{ color: "var(--text-primary)", transition: "all 0.15s" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-person" style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}></i>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Profile Settings</span>
                </div>
                <i className="bi bi-chevron-right" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}></i>
              </Link>

              <Link
                href="/admin/settings?tab=security"
                className="d-flex align-items-center justify-content-between py-2 text-decoration-none rounded-2 px-1"
                style={{ color: "var(--text-primary)", transition: "all 0.15s" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-shield" style={{ fontSize: "1.05rem", color: "var(--text-secondary)" }}></i>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Security & Lock</span>
                </div>
                <i className="bi bi-chevron-right" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}></i>
              </Link>
            </div>

            {/* Divider Line */}
            <hr style={{ margin: "14px 0", borderColor: "var(--border)", opacity: 0.8 }} />

            {/* Logout Action */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="d-flex align-items-center gap-3 w-100 border-0 bg-transparent p-0 text-start px-1 py-1"
              style={{ color: "var(--error)", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: "1.1rem", color: "var(--error)" }}></i>
              <span>Logout</span>
            </button>
          </div>
        </div>

      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}
