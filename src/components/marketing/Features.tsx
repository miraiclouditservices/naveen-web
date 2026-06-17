"use client";

export default function Features() {
  const modules = [
    {
      icon: "bi-building-fill",
      title: "Property Management",
      description: "Manage buildings, floors, units and full property details from one source of truth."
    },
    {
      icon: "bi-people-fill",
      title: "Tenant Management",
      description: "Maintain tenant profiles, documents, agreements and seamless communication."
    },
    {
      icon: "bi-credit-card-fill",
      title: "Payment Management",
      description: "Collect rent, invoices, receipts, GST details and complete payment history."
    },
    {
      icon: "bi-wrench",
      title: "Maintenance Management",
      description: "Raise tickets, assign staff, track status and resolutions in real time."
    },
    {
      icon: "bi-shield-fill-check",
      title: "Visitor & Security",
      description: "Digital visitor entry, security logs and granular access control."
    },
    {
      icon: "bi-boxes",
      title: "Asset Management",
      description: "Track equipment, assets, service history and preventive maintenance."
    },
    {
      icon: "bi-bar-chart-line-fill",
      title: "Reports & Analytics",
      description: "Business insights, financial reports and performance tracking dashboards."
    },
    {
      icon: "bi-person-badge-fill",
      title: "Role-Based Access",
      description: "Granular permissions for admins, staff, owners and tenants."
    }
  ];

  return (
    <section id="features" className="bg-white position-relative overflow-hidden" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-block mb-3">
            <span className="features-badge">Features</span>
          </div>
          <h2 className="section-title fw-bold text-dark mb-3">
            Everything you need to run your portfolio
          </h2>
          <p className="section-subtitle text-muted mx-auto">
            Powerful modules that work together so your team spends less time on operations and more time growing.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="row g-4">
          {modules.map((item, index) => (
            <div className="col-lg-3 col-md-6 col-sm-12 animate__animated animate__fadeInUp" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="feature-module-card">
                {/* Light blue icon circle container */}
                <div className="icon-box mb-4">
                  <i className={`bi ${item.icon} fs-5`}></i>
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
        .features-badge {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #2563eb;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .feature-module-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.01);
          text-align: left;
        }

        .feature-module-card:hover {
          transform: translateY(-5px);
          border-color: #dbeafe;
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.06);
        }

        .icon-box {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .module-title {
          font-size: 0.95rem;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .module-desc {
          font-size: 0.82rem;
          line-height: 1.5;
        }
      `}</style>
    </section>
  );
}
