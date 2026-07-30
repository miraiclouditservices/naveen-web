"use client";

import React from "react";

interface Industry {
  icon: string;
  name: string;
  desc: string;
  badge: string;
}

export default function WhoUses() {
  const industries: Industry[] = [
    {
      icon: "bi-building-fill-gear",
      name: "Commercial Buildings",
      desc: "Manage office towers, commercial leases, maintenance, and tenant operations.",
      badge: "Leases & CAM"
    },
    {
      icon: "bi-border-all",
      name: "Coworking Spaces",
      desc: "Flex desks, private suites, member subscriptions, and credit billing.",
      badge: "Flex Desks"
    },
    {
      icon: "bi-houses-fill",
      name: "Property Management",
      desc: "Multi-tenant apartments, automated rent collection, and resident passes.",
      badge: "Resident Hub"
    },
    {
      icon: "bi-house-gear-fill",
      name: "Industrial Parks",
      desc: "Warehouses, dock loading bays, heavy asset compliance, and security.",
      badge: "Logistics Hub"
    },
    {
      icon: "bi-briefcase-fill",
      name: "Corporate Offices",
      desc: "Employee directories, visitor QR approvals, attendance, and desk booking.",
      badge: "Workforce & Ops"
    },
    {
      icon: "bi-backpack-fill",
      name: "Schools & Colleges",
      desc: "Staff attendance, campus security, visitor tracking, and asset maintenance.",
      badge: "Campus Security"
    },
    {
      icon: "bi-hospital-fill",
      name: "Hospitals & Healthcare",
      desc: "Facility operations, staff shifts, visitor logs, and medical asset tracking.",
      badge: "Healthcare Ops"
    },
    {
      icon: "bi-building-fill",
      name: "Hotels & Hospitality",
      desc: "Serviced apartments, guest checkouts, housekeeping dispatch, and billing.",
      badge: "Guest Stay"
    },
    {
      icon: "bi-shop-window",
      name: "Retail Chains",
      desc: "Store rosters, revenue share leases, footfall analytics, and maintenance.",
      badge: "Retail Analytics"
    },
    {
      icon: "bi-gear-wide-connected",
      name: "Manufacturing",
      desc: "Plant workforce attendance, shift schedules, vendor payables, and AMC.",
      badge: "Plant & Asset"
    },
    {
      icon: "bi-bank2",
      name: "Government Bodies",
      desc: "Public infrastructure, visitor security, audit compliance, and SLA logs.",
      badge: "Compliance"
    },
    {
      icon: "bi-tools",
      name: "Facility Management",
      desc: "End-to-end multi-site operations, vendor dispatch, and ticketing SLA.",
      badge: "Full Suite"
    }
  ];

  return (
    <section id="who-uses" className="py-5 bg-light border-bottom position-relative overflow-hidden">
      <div className="container py-lg-3 position-relative z-2">
        
        {/* Header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
            <span className="mkt-pulse-dot"></span>
            <span>INDUSTRIES & ECOSYSTEM</span>
          </div>
          <h2 className="mkt-title mb-3">Built for Every Modern Business</h2>
          <p className="mkt-subtitle mx-auto text-secondary">
            One platform designed for organisations that manage people, properties, operations and customers.
          </p>
        </div>

        {/* Industry Cards Grid */}
        <div className="row g-4">
          {industries.map((ind, idx) => (
            <div className="col-lg-3 col-md-6 col-sm-12 animate-fade-up" key={idx} style={{ animationDelay: `${idx * 0.04}s` }}>
              <div className="mkt-card-clean p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle p-2" style={{ width: 44, height: 44, background: 'var(--brand-orange)_BG', color: 'var(--brand-orange)' }}>
                      <i className={`bi ${ind.icon} fs-5`}></i>
                    </div>
                    <span className="badge" style={{ background: 'var(--brand-orange)_BG', color: 'var(--brand-orange)', border: '1px solid var(--brand-orange)_BORDER', fontSize: '0.68rem' }}>
                      {ind.badge}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2 fs-6">{ind.name}</h5>
                  <p className="text-muted small mb-0 line-clamp-2" style={{ lineHeight: 1.5 }}>
                    {ind.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-top d-flex align-items-center justify-content-between">
                  <span className="extra-small text-muted fw-bold text-uppercase">Tailored Workflow</span>
                  <i className="bi bi-arrow-right text-orange" style={{ color: 'var(--brand-orange)' }}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
