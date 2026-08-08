"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import styles from "@/styles/modules/Header.module.css";
import Link from "next/link";
import LogoutModal from "@/components/dashboard/LogoutModal";
import { api, getStoredUser, setStoredUser, clearStoredAuth } from "@/utils/api";

export default function Header() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useLayoutEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
  }, []);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res && res.success && res.user) {
          setStoredUser(res.user);
          setUser(res.user);
        }
      } catch (err) {}
    };
    fetchFreshProfile();
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    window.location.href = "/login";
  };

  const displayName = user ? user.name : "Admin User";
  const displayRole = user
    ? (user.role === "Admin" ? "SUPER_ADMIN" : user.role === "Owner" ? "OFFICE_OWNER" : user.role)
    : "SUPER_ADMIN";
  const avatarChar = displayName ? displayName.charAt(0).toUpperCase() : "A";

  return (
    <header
      className={`${styles.header} d-flex align-items-center justify-content-end px-4 bg-white`}
      style={{
        height: "64px",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 999
      }}
    >

      {/* Right: Help & Profile Toolbar */}
      <div className="d-flex align-items-center gap-2">
        {/* Help Button */}
        <button
          className="btn btn-light border d-flex align-items-center justify-content-center p-0 shadow-none"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            borderColor: "#e2e8f0",
            backgroundColor: "#ffffff",
            color: "#0f172a"
          }}
          title="Help & Documentation"
          onClick={() => alert("ANVAYA360 Property Directory Help:\n- Search & Filter properties in real time\n- Toggle between Grid, Table, and Map views\n- Click any property for full details")}
        >
          <i className="bi bi-question-circle fs-5"></i>
        </button>

        {/* Compact Profile Avatar Dropdown */}
        <div className="dropdown ms-1">
          <button
            className="d-flex align-items-center justify-content-center border-0 bg-transparent p-0 shadow-none"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ cursor: "pointer" }}
            title={`Account (${displayName})`}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-xs"
              style={{ width: "38px", height: "38px", backgroundColor: "#0f172a", fontSize: "0.9rem" }}
            >
              {avatarChar}
            </div>
          </button>

          <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2 rounded-3 mt-2" style={{ width: "240px", zIndex: 1060 }}>
            <li className="px-3 py-2 border-bottom mb-2">
              <p className="mb-0 fw-bold text-dark small">{displayName}</p>
              <p className="mb-0 text-muted extra-small">{displayRole}</p>
            </li>
            <li>
              <Link className="dropdown-item rounded-2 py-2 small fw-semibold text-dark" href="/admin/settings">
                <i className="bi bi-person me-2" style={{ color: "#ea580c" }}></i> Profile Settings
              </Link>
            </li>
            <li>
              <Link className="dropdown-item rounded-2 py-2 small fw-semibold text-dark" href="/admin/settings?tab=security">
                <i className="bi bi-shield-lock me-2 text-warning"></i> Security & Lock
              </Link>
            </li>
            <li><hr className="dropdown-divider opacity-10 my-1" /></li>
            <li>
              <button className="dropdown-item rounded-2 py-2 small fw-bold text-danger d-flex align-items-center gap-2" onClick={() => setIsLogoutModalOpen(true)}>
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </li>
          </ul>
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

