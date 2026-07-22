"use client";

import React from "react";

interface UnitFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  properties: any[];
  floors: any[];
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  selectedFloorId: string;
  setSelectedFloorId: (id: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function UnitFilterDrawer({
  isOpen,
  onClose,
  properties,
  floors,
  selectedPropertyId,
  setSelectedPropertyId,
  selectedFloorId,
  setSelectedFloorId,
  statusFilter,
  setStatusFilter,
  onApply,
  onReset,
}: UnitFilterDrawerProps) {
  const filteredFloors = floors.filter(
    (f) =>
      selectedPropertyId === "all" ||
      f.property === selectedPropertyId ||
      (f.property && f.property._id === selectedPropertyId)
  );

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.3)",
            zIndex: 1000,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : -340,
          width: 340,
          height: "100vh",
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-color)",
          zIndex: 1001,
          transition: "right 0.3s ease-in-out",
          padding: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
            Filter Units
          </span>
          <button onClick={onClose} className="btn-close shadow-none" style={{ fontSize: "0.8rem" }} />
        </div>

        <div className="flex-grow-1">
          {/* Property Filter */}
          <div className="mb-4">
            <label className="form-label fw-bold text-muted" style={{ fontSize: "0.76rem", textTransform: "uppercase" }}>
              Property Name
            </label>
            <select
              className="form-select shadow-none"
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setSelectedFloorId("all");
              }}
              style={{ fontSize: "0.85rem", borderRadius: "6px" }}
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.propertyName}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Filter */}
          <div className="mb-4">
            <label className="form-label fw-bold text-muted" style={{ fontSize: "0.76rem", textTransform: "uppercase" }}>
              Floor Level
            </label>
            <select
              className="form-select shadow-none"
              value={selectedFloorId}
              onChange={(e) => setSelectedFloorId(e.target.value)}
              disabled={selectedPropertyId === "all"}
              style={{ fontSize: "0.85rem", borderRadius: "6px" }}
            >
              <option value="all">All Floors</option>
              {filteredFloors.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.floorName || `Floor ${f.floorNumber}`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="mb-4">
            <label className="form-label fw-bold text-muted" style={{ fontSize: "0.76rem", textTransform: "uppercase" }}>
              Operational Status
            </label>
            <select
              className="form-select shadow-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: "0.85rem", borderRadius: "6px" }}
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Drawer Actions */}
        <div className="d-flex gap-2 pt-3 border-top">
          <button
            onClick={onReset}
            className="btn btn-sm btn-light border flex-grow-1 py-2"
            style={{ fontSize: "0.82rem", fontWeight: 600, borderRadius: "6px" }}
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="btn btn-sm text-white flex-grow-1 py-2"
            style={{ backgroundColor: "var(--dark-section)", fontSize: "0.82rem", fontWeight: 600, borderRadius: "6px" }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
