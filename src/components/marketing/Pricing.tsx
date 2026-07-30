"use client";

import React, { useState } from "react";

export default function Pricing() {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      name: "Starter",
      badge: "Small Portfolios",
      priceMonthly: "$49",
      priceAnnual: "$39",
      desc: "Perfect for single buildings, small offices, or growing properties.",
      features: [
        "Up to 50 Property Units / Desks",
        "CRM & Property Management",
        "Visitor QR Gate Passes",
        "Basic Helpdesk Ticketing",
        "Standard Reports (PDF/Excel)",
        "Email Support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Business",
      badge: "⭐ MOST POPULAR",
      priceMonthly: "$149",
      priceAnnual: "$119",
      desc: "Comprehensive suite for commercial complexes, coworking & enterprises.",
      features: [
        "Up to 500 Property Units / Desks",
        "All 12 Modules Included",
        "AI Assistant & Copilot Alerts",
        "Geo-Fence Mobile Attendance",
        "Vendor & Asset AMC Tracking",
        "Priority 24/7 Support"
      ],
      cta: "Book Free Demo",
      popular: true
    },
    {
      name: "Enterprise",
      badge: "Custom Scale",
      priceMonthly: "Custom",
      priceAnnual: "Custom",
      desc: "Tailored infrastructure, multi-region compliance, and custom API integrations.",
      features: [
        "Unlimited Units & Locations",
        "Custom Workflows & API Webhooks",
        "Dedicated Account Manager",
        "99.99% Uptime Guarantee SLA",
        "Custom Training & Onboarding",
        "Dedicated Server Instance"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-5 bg-light border-bottom position-relative">
      <div className="container py-lg-4">
        
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2 mb-3 mkt-badge">
            <span className="mkt-pulse-dot"></span>
            <span>TRANSPARENT PRICING</span>
          </div>
          <h2 className="mkt-title mb-3">Simple Plans for Every Scale</h2>
          <p className="mkt-subtitle mx-auto text-secondary">
            Choose the plan that fits your business needs. Upgrade or scale anytime.
          </p>

          {/* Billing Toggle */}
          <div className="d-inline-flex align-items-center gap-3 p-1.5 rounded-pill bg-white border mt-3 shadow-sm">
            <button 
              className={`btn btn-sm rounded-pill fw-bold px-3 ${!annualBilling ? "btn-dark" : "btn-light text-muted"}`}
              onClick={() => setAnnualBilling(false)}
            >
              Monthly Billing
            </button>
            <button 
              className={`btn btn-sm rounded-pill fw-bold px-3 ${annualBilling ? "btn-orange text-white" : "btn-light text-muted"}`}
              style={{ background: annualBilling ? 'var(--brand-orange)' : undefined }}
              onClick={() => setAnnualBilling(true)}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="row g-4 justify-content-center align-items-stretch">
          {plans.map((plan, idx) => (
            <div className="col-lg-4 col-md-6 col-sm-12 animate-fade-up" key={idx} style={{ animationDelay: `${idx * 0.06}s` }}>
              <div 
                className={`mkt-card-clean p-4 h-100 d-flex flex-column justify-content-between position-relative ${
                  plan.popular ? "border-2" : ""
                }`}
                style={{ borderColor: plan.popular ? 'var(--brand-orange)' : 'var(--border-light)' }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="fw-extrabold text-dark mb-0">{plan.name}</h4>
                    <span 
                      className="badge rounded-pill" 
                      style={{ 
                        background: plan.popular ? 'var(--brand-orange)' : 'var(--brand-orange)_BG', 
                        color: plan.popular ? '#ffffff' : 'var(--brand-orange)',
                        border: '1px solid var(--brand-orange)_BORDER',
                        fontSize: '0.68rem'
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <p className="text-muted small mb-4">{plan.desc}</p>

                  <div className="mb-4 pb-3 border-bottom">
                    <div className="d-flex align-items-baseline gap-1">
                      <span className="display-5 fw-extrabold text-dark" style={{ color: plan.popular ? 'var(--brand-orange)' : undefined }}>
                        {annualBilling ? plan.priceAnnual : plan.priceMonthly}
                      </span>
                      {plan.priceMonthly !== "Custom" && <span className="text-muted small">/ month</span>}
                    </div>
                    {annualBilling && plan.priceMonthly !== "Custom" && (
                      <span className="extra-small text-success fw-bold d-block mt-1">Billed annually (Save 20%)</span>
                    )}
                  </div>

                  <h6 className="extra-small text-muted fw-bold text-uppercase mb-3">Plan Features</h6>
                  <ul className="list-unstyled mb-4 d-flex flex-column gap-2">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="small text-secondary d-flex align-items-center gap-2">
                        <i className="bi bi-check-circle-fill" style={{ color: 'var(--brand-orange)' }}></i>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a 
                  href="#cta" 
                  className={`w-100 text-center text-decoration-none ${
                    plan.popular ? "btn-orange-primary" : "btn-orange-outline"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Compare */}
        <div className="text-center mt-5">
          <a href="#comparison" className="text-decoration-none fw-bold small me-3" style={{ color: 'var(--brand-orange)' }}>
            Compare All Features <i className="bi bi-arrow-right"></i>
          </a>
        </div>

      </div>
    </section>
  );
}
