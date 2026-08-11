"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import PropertyModal from "./PropertyModal";

interface OrganizationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
  user: any;
  onUpdate?: () => void;
}

export default function OrganizationDetailsModal({
  isOpen,
  onClose,
  account,
  user,
  onUpdate
}: OrganizationDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"PROPERTIES" | "PROFILE">("PROPERTIES");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  const rawRole = user?.role || "";
  const isUltraSuperAdmin = rawRole === "ULTRA_SUPER_ADMIN" || rawRole === "Ultra Super Admin" || rawRole === "ULTRA_ADMIN";

  const fetchOrganizationProperties = async () => {
    if (!account?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/saas/accounts/${account._id}/properties`).catch(() => null);
      if (res && res.success) {
        setProperties(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching organization properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && account?._id) {
      fetchOrganizationProperties();
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  const isCoworking = account.account_type === "COWORKING" || account.account_type === "Partner";

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ backgroundColor: "rgba(15, 23, 42, 0.68)", backdropFilter: "blur(6px)", zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: 1040 }}>
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            
            {/* Modal Top Banner & Header */}
            <div className="modal-header border-0 bg-dark text-white p-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className={`rounded-3 d-flex align-items-center justify-content-center fw-bold ${
                    isCoworking ? "bg-primary text-white" : "bg-warning text-dark"
                  }`}
                  style={{ width: 48, height: 48, fontSize: "1.1rem" }}
                >
                  {account.company_name?.substring(0, 2).toUpperCase() || "OR"}
                </div>

                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-warning text-dark extra-small fw-bold">
                      {isCoworking ? "Co-Working Infrastructure" : "Property Management"}
                    </span>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 extra-small">
                      <i className="bi bi-check-circle-fill me-1" /> Active Organization
                    </span>
                  </div>

                  <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: "1.25rem" }}>
                    {account.company_name}
                  </h5>

                  <div className="extra-small text-white-50 mt-1 d-flex align-items-center gap-2">
                    <span className="font-monospace text-warning">{account.account_code || "ACC-LIVE"}</span>
                    <span>•</span>
                    <span>Primary Admin: <strong>{account.primary_contact || account.owner_id?.name || "Admin"}</strong> ({account.email})</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-close btn-close-white shadow-none"
                onClick={onClose}
              ></button>
            </div>

            {/* Modal Header Tabs Bar */}
            <div className="px-4 pt-3 bg-light border-bottom d-flex align-items-center justify-content-between">
              <div className="d-flex gap-2">
                <button
                  onClick={() => setActiveTab("PROPERTIES")}
                  className={`btn btn-sm rounded-top-3 px-4 py-2 fw-semibold transition-all ${
                    activeTab === "PROPERTIES"
                      ? "bg-white text-dark border border-bottom-0 shadow-sm"
                      : "text-muted hover-text-dark"
                  }`}
                  style={{ fontSize: "0.88rem" }}
                >
                  <i className="bi bi-building me-2 text-warning" />
                  Properties &amp; Workspaces ({properties.length})
                </button>

                <button
                  onClick={() => setActiveTab("PROFILE")}
                  className={`btn btn-sm rounded-top-3 px-4 py-2 fw-semibold transition-all ${
                    activeTab === "PROFILE"
                      ? "bg-white text-dark border border-bottom-0 shadow-sm"
                      : "text-muted hover-text-dark"
                  }`}
                  style={{ fontSize: "0.88rem" }}
                >
                  <i className="bi bi-info-circle me-2 text-info" />
                  Organization Profile &amp; Identifiers
                </button>
              </div>

              {/* ULTRA_SUPER_ADMIN ONLY Action: "+ Create Property / Workspace" */}
              {isUltraSuperAdmin && activeTab === "PROPERTIES" && (
                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setIsAddPropertyModalOpen(true);
                  }}
                  className="btn btn-warning btn-sm rounded-pill px-4 fw-bold text-dark shadow-sm mb-1 d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-plus-circle-fill" />
                  Create Property / Workspace
                </button>
              )}
            </div>

            {/* Modal Content Body */}
            <div className="modal-body p-4" style={{ maxHeight: "calc(80vh - 120px)", overflowY: "auto", background: "#f8fafc" }}>
              
              {/* TAB 1: PROPERTIES & WORKSPACES */}
              {activeTab === "PROPERTIES" && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Managed Properties &amp; Workspaces</h6>
                      <span className="extra-small text-muted">
                        All real estate towers, hubs &amp; co-working locations provisioned for {account.company_name}.
                      </span>
                    </div>

                    {isUltraSuperAdmin && (
                      <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 px-3 py-1 extra-small">
                        <i className="bi bi-shield-check me-1" /> Only ULTRA_SUPER_ADMIN can add or edit properties here
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm text-dark me-2" role="status" />
                      Loading Organization Properties...
                    </div>
                  ) : properties.length === 0 ? (
                    <div className="card border-0 rounded-4 p-5 text-center bg-white border border-light shadow-sm">
                      <div className="mx-auto mb-3 rounded-circle bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: 64, height: 64 }}>
                        <i className="bi bi-building-x" style={{ fontSize: "2.2rem" }} />
                      </div>
                      <h6 className="fw-bold text-dark mb-1">No Properties Created Yet</h6>
                      <p className="extra-small text-muted mb-3" style={{ maxWidth: 460, margin: "0 auto" }}>
                        No property or workspace is currently attached to {account.company_name}.
                        {isUltraSuperAdmin && " As ULTRA_SUPER_ADMIN, click '+ Create Property / Workspace' above to add one."}
                      </p>
                      {isUltraSuperAdmin && (
                        <div>
                          <button
                            onClick={() => {
                              setEditingProperty(null);
                              setIsAddPropertyModalOpen(true);
                            }}
                            className="btn btn-sm btn-warning rounded-pill px-4 fw-bold text-dark shadow-sm d-inline-flex align-items-center gap-2"
                          >
                            <i className="bi bi-plus-circle-fill" /> Create Property Now
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="row g-3">
                      {properties.map((prop) => (
                        <div key={prop._id} className="col-md-6">
                          <div className="card border-0 rounded-4 p-3 bg-white shadow-sm border border-light h-100">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <div className="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                  <i className="bi bi-building" style={{ fontSize: "1.1rem" }} />
                                </div>
                                <div>
                                  <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.92rem" }}>
                                    {prop.propertyName}
                                  </h6>
                                  <span className="extra-small text-muted font-monospace">{prop.propertyCode}</span>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2">
                                <span className="badge rounded-pill bg-light text-dark border px-3 py-1 extra-small">
                                  {prop.propertyCategory || prop.propertyType || "Commercial"}
                                </span>

                                {/* ULTRA_SUPER_ADMIN Edit Property Action Button */}
                                {isUltraSuperAdmin && (
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-outline-dark rounded-pill px-2.5 py-1 extra-small fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                                    onClick={() => {
                                      setEditingProperty(prop);
                                      setIsAddPropertyModalOpen(true);
                                    }}
                                  >
                                    <i className="bi bi-pencil-square" /> Edit
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="bg-light p-2.5 rounded-3 mb-2 extra-small">
                              <div className="row g-1">
                                <div className="col-6"><strong>Building:</strong> {prop.building || "Main Hub"}</div>
                                <div className="col-6"><strong>Total Area:</strong> {prop.totalSft?.toLocaleString() || "10,000"} Sq.Ft</div>
                                <div className="col-6"><strong>Total Floors:</strong> {prop.totalFloors || 1}</div>
                                <div className="col-6"><strong>Location:</strong> {prop.city || "Hyderabad"}</div>
                                <div className="col-12 mt-1 pt-1 border-top"><strong className="text-secondary"><i className="bi bi-diagram-3 me-1" />Org ID:</strong> <span className="font-monospace text-dark">{prop.orgId?.code || prop.orgId?._id || account.org_id || account.account_code || "ORG-ACTIVE"}</span> ({account.company_name})</div>
                              </div>
                            </div>

                            <div className="d-flex align-items-center justify-content-between extra-small text-muted pt-1">
                              <span><i className="bi bi-geo-alt me-1" /> {prop.propertyAddress || prop.city}</span>
                              <span className="badge bg-success bg-opacity-10 text-success">Active</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ORGANIZATION PROFILE */}
              {activeTab === "PROFILE" && (
                <div className="bg-white p-4 rounded-4 border shadow-sm">
                  <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Master Organization Identifiers</h6>
                  <div className="row g-3 extra-small">
                    <div className="col-md-6">
                      <strong className="text-muted d-block">Company / Entity Name:</strong>
                      <span className="fw-bold text-dark font-lg">{account.company_name}</span>
                    </div>
                    <div className="col-md-6">
                      <strong className="text-muted d-block">Infrastructure Type:</strong>
                      <span className="fw-bold text-dark">{account.account_type === "COWORKING" ? "Co-working Space" : "Property Management"}</span>
                    </div>
                    <div className="col-md-6">
                      <strong className="text-muted d-block">Primary Administrator:</strong>
                      <span className="fw-bold text-dark">{account.primary_contact || account.owner_id?.name} ({account.email})</span>
                    </div>
                    <div className="col-md-6">
                      <strong className="text-muted d-block">Phone Number:</strong>
                      <span className="fw-bold text-dark">{account.phone || "N/A"}</span>
                    </div>
                    <div className="col-md-6">
                      <strong className="text-muted d-block">Industry &amp; Category:</strong>
                      <span className="fw-bold text-dark">{account.industry || "Real Estate"} ({account.business_category || "Commercial"})</span>
                    </div>
                    <div className="col-md-6">
                      <strong className="text-muted d-block">Registered Address:</strong>
                      <span className="fw-bold text-dark">{account.address || "Central Office"}, {account.city}, {account.state}</span>
                    </div>
                    <div className="col-md-6">
                      <strong className="text-muted d-block">GST / PAN Identifiers:</strong>
                      <span className="fw-bold text-dark">{account.gst_number || account.pan_number || "N/A"}</span>
                    </div>
                    <div className="col-md-6">
                      <strong className="text-muted d-block">Account Status:</strong>
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1">Provisioned &amp; Active</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* Primary PropertyModal used for Organization Property Creation & Editing */}
      {isAddPropertyModalOpen && (
        <PropertyModal
          isOpen={isAddPropertyModalOpen}
          onClose={() => {
            setIsAddPropertyModalOpen(false);
            setEditingProperty(null);
          }}
          editData={editingProperty}
          account={account}
          onSave={async (formData) => {
            let res;
            if (editingProperty?._id) {
              res = await api.put(`/properties/${editingProperty._id}`, formData);
            } else {
              res = await api.post(`/saas/accounts/${account._id}/properties`, formData);
            }
            if (res && res.success) {
              await fetchOrganizationProperties();
              if (onUpdate) onUpdate();
              setEditingProperty(null);
            } else {
              throw new Error(res?.error || "Failed to save property for Organization.");
            }
          }}
        />
      )}
    </>
  );
}
