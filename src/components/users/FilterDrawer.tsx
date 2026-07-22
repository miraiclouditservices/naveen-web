"use client";

import React, { useEffect, useState } from "react";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  staffCategoryFilter: string;
  setStaffCategoryFilter: (val: string) => void;
  onReset: () => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  staffCategoryFilter,
  setStaffCategoryFilter,
  onReset,
}: FilterDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  return (
    <div
      className={`position-fixed inset-0 w-100 h-100 d-flex justify-content-end`}
      style={{
        zIndex: 1060,
        top: 0,
        left: 0,
        backgroundColor: isOpen ? "rgba(4, 4, 4, 0.3)" : "rgba(4, 4, 4, 0)",
        backdropFilter: isOpen ? "blur(3px)" : "none",
        transition: "all 0.3s ease-in-out",
        pointerEvents: isOpen ? "auto" : "none",
      }}
      onClick={onClose}
    >
      <div
        className="h-100 border-start d-flex flex-column"
        style={{
          backgroundColor: 'var(--bg-card)',
          width: "100%",
          maxWidth: "380px",
          boxShadow: "-10px 0 25px -5px rgba(0, 0, 0, 0.08)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-app)' }}>
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
              <i className="hgi-stroke hgi-filter" style={{ fontSize: "1rem" }} />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ fontSize: "1rem", color: 'var(--text-main)' }}>Advanced Filters</h5>
              <p className="small mb-0" style={{ fontSize: "0.72rem", color: 'var(--text-muted)' }}>Configure table results and filters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '1.1rem',
              lineHeight: 1,
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-color)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-main)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
          >
            ×
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex-grow-1 overflow-y-auto px-4 py-4" style={{ fontSize: '0.85rem' }}>
          {/* Quick Search */}
          <div className="mb-4">
            <label className="form-label fw-bold text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Search</label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control px-3 py-2 shadow-none"
                placeholder="Search name, email, phone..."
                style={{ borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-card)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="hgi-stroke hgi-search-01 position-absolute" style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: 'var(--text-muted)' }}></i>
            </div>
          </div>

          {/* Access Role */}
          <div className="mb-4">
            <label className="form-label fw-bold text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Access Role</label>
            <select
              className="form-select px-3 py-2 shadow-none"
              style={{ borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-card)' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All Roles">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="FLOOR_ADMIN">Floor Admin</option>
              <option value="OFFICE_OWNER">Office Owner</option>
              <option value="STAFF_ADMIN">Staff Admin</option>
            </select>
          </div>

          {/* User Status */}
          <div className="mb-4">
            <label className="form-label fw-bold text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>User Status</label>
            <select
              className="form-select px-3 py-2 shadow-none"
              style={{ borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-card)' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Staff Category */}
          {roleFilter === "STAFF_ADMIN" && (
            <div className="mb-4">
              <label className="form-label fw-bold text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Staff Category</label>
              <select
                className="form-select px-3 py-2 shadow-none"
                style={{ borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-card)' }}
                value={staffCategoryFilter}
                onChange={(e) => setStaffCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {['Security', 'Watchman', 'Electrician', 'Plumber', 'Helpdesk', 'Gardener', 'Housekeeping', 'Supervisor', 'Other', 'None'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}


        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-top d-flex gap-2 flex-shrink-0" style={{ backgroundColor: 'var(--bg-app)' }}>
          <button
            type="button"
            className="btn w-50 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
            onClick={onReset}
          >
            <i className="hgi-stroke hgi-reload-01" /> Reset All
          </button>
          <button
            type="button"
            className="btn w-50 d-flex align-items-center justify-content-center gap-2 border-0"
            style={{ borderRadius: '6px', fontSize: '0.85rem', backgroundColor: 'var(--dark-section)', color: 'var(--bg-card)', fontWeight: '600' }}
            onClick={onClose}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
