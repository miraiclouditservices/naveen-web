"use client";

export default function Features() {
  const modules = [
    {
      icon: "bi-funnel",
      title: "CRM",
      description: "Leads, deals, pipeline"
    },
    {
      icon: "bi-building",
      title: "Property",
      description: "Buildings, units, tenants"
    },
    {
      icon: "bi-border-all",
      title: "Coworking",
      description: "Seats, rooms, memberships"
    },
    {
      icon: "bi-person-badge",
      title: "Visitor",
      description: "QR passes & approvals"
    },
    {
      icon: "bi-clock",
      title: "Attendance",
      description: "Shifts, leaves, holidays"
    },
    {
      icon: "bi-people",
      title: "Employees",
      description: "People & documents"
    },
    {
      icon: "bi-ticket-detailed",
      title: "Helpdesk",
      description: "Tickets & SLA"
    },
    {
      icon: "bi-box-seam",
      title: "Assets",
      description: "QR, AMC, warranty"
    },
    {
      icon: "bi-truck",
      title: "Vendor",
      description: "Contracts & payables"
    },
    {
      icon: "bi-file-earmark-bar-graph",
      title: "Reports",
      description: "Excel, CSV, PDF"
    },
    {
      icon: "bi-graph-up-arrow",
      title: "Analytics",
      description: "Live dashboards"
    },
    {
      icon: "bi-stars",
      title: "AI Assistant",
      description: "Predictive insights"
    }
  ];

  return (
    <section id="features" className="features-section position-relative overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-block mb-3">
            <span className="features-badge">MODULES</span>
          </div>
          <h2 className="section-title fw-bold text-dark mb-3">
            Twelve modules. One<br className="d-none d-sm-block" /> intelligent platform.
          </h2>
          <p className="section-subtitle text-muted mx-auto">
            Turn on what you need today. Add the rest whenever you're ready.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="row g-4">
          {modules.map((item, index) => (
            <div className="col-lg-3 col-md-6 col-sm-12 animate__animated animate__fadeInUp" key={index} style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="feature-module-card">
                {/* Icon box container */}
                <div className="icon-box mb-3">
                  <i className={`bi ${item.icon}`}></i>
                </div>
                
                {/* Title */}
                <h5 className="module-title fw-bold mb-2">{item.title}</h5>
                
                {/* Description */}
                <p className="module-desc text-muted mb-0">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .features-section {
          padding-top: 60px;
          padding-bottom: 60px;
          background-color: var(--bg-card);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }

        .features-badge {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 9999px;
          letter-spacing: 0.05em;
        }

        .features-section .section-title {
          font-size: 2.2rem;
          color: var(--text-main);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .features-section .section-subtitle {
          font-size: 1.05rem;
          color: var(--text-primary);
          max-width: 600px;
        }

        .feature-module-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s ease;
          height: 100%;
          box-shadow: var(--shadow-sm);
          text-align: left;
        }

        .feature-module-card:hover {
          transform: translateY(-2px);
          border-color: var(--text-muted);
        }

        .icon-box {
          width: 32px;
          height: 32px;
          background: var(--border-color);
          color: var(--dark-section);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .module-title {
          font-size: 0.95rem;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .module-desc {
          font-size: 0.8rem;
          line-height: 1.5;
        }

        @media (max-width: 991.98px) {
          .features-section .section-title {
            font-size: 1.8rem;
          }
          .feature-module-card {
            padding: 20px;
          }
        }
      `}</style>
    </section>
  );
}
