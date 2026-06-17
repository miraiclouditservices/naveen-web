"use client";

export default function Roles() {
  const portfolios = [
    {
      title: "Apartment Management",
      icon: "bi-house-door-fill",
      features: ["Flats & residents", "Maintenance fees", "Complaints & notices"]
    },
    {
      title: "Commercial Property",
      icon: "bi-briefcase-fill",
      features: ["Office spaces", "Rental agreements", "Tenant billing"]
    },
    {
      title: "IT Park Management",
      icon: "bi-cpu-fill",
      features: ["Multiple companies", "Access control", "Facility operations"]
    },
    {
      title: "Shopping Malls",
      icon: "bi-bag-fill",
      features: ["Shops & vendors", "Rent tracking", "Footfall insights"]
    },
    {
      title: "Co-working Spaces",
      icon: "bi-people-fill",
      features: ["Seats & desks", "Memberships", "Automated billing"]
    },
    {
      title: "Hotels & Service Apts",
      icon: "bi-building-fill",
      features: ["Rooms & guests", "Operations", "Daily revenue"]
    },
    {
      title: "Industrial & Warehouse",
      icon: "bi-house-gear-fill",
      features: ["Assets & inventory", "Security", "Compliance"]
    },
    {
      title: "Real Estate Portfolios",
      icon: "bi-buildings-fill",
      features: ["Multi-property", "Owners & investors", "Consolidated reporting"]
    }
  ];

  return (
    <section className="bg-light position-relative" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-block mb-3">
            <span className="solutions-badge">Solutions</span>
          </div>
          <h2 className="section-title fw-bold text-dark mb-3">
            Built for every kind of property portfolio
          </h2>
          <p className="section-subtitle text-muted mx-auto">
            One platform, tailored workflows — from a single building to thousands of units across markets.
          </p>
        </div>

        {/* Portfolios Grid */}
        <div className="row g-4">
          {portfolios.map((item, index) => (
            <div className="col-lg-3 col-md-6 col-sm-12 animate__animated animate__fadeInUp" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="portfolio-card">
                {/* Dark Navy Circle Icon */}
                <div className="icon-circle mb-4">
                  <i className={`bi ${item.icon} fs-5`}></i>
                </div>
                
                {/* Title */}
                <h5 className="card-title fw-bold mb-3">{item.title}</h5>
                
                {/* Checklist Features */}
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2.5">
                  {item.features.map((feature, idx) => (
                    <li className="d-flex align-items-center gap-2" key={idx}>
                      <i className="bi bi-check text-primary-blue fs-5 fw-bold"></i>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .solutions-badge {
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

        .section-title {
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          color: #0f172a !important;
          letter-spacing: -0.02em;
        }

        .section-subtitle {
          font-size: 0.95rem;
          max-width: 580px;
          line-height: 1.6;
        }

        .portfolio-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
          padding: 30px 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          height: 100%;
          box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);
          text-align: left;
        }

        .portfolio-card::after {
          content: '';
          position: absolute;
          top: -24px;
          right: -24px;
          width: 80px;
          height: 80px;
          background: #eff6ff;
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .portfolio-card:hover {
          transform: translateY(-5px);
          border-color: #dbeafe;
          box-shadow: 0 12px 25px -5px rgba(37, 99, 235, 0.08);
        }

        .portfolio-card:hover::after {
          background: #dbeafe;
          transform: scale(1.1);
        }

        .icon-circle {
          width: 44px;
          height: 44px;
          background: #0f172a;
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .card-title {
          font-size: 0.98rem;
          color: #0f172a;
          position: relative;
          z-index: 2;
          letter-spacing: -0.01em;
        }

        .feature-text {
          font-size: 0.82rem;
          color: #64748b;
          font-weight: 500;
        }

        .text-primary-blue {
          color: #2563eb;
        }
      `}</style>
    </section>
  );
}
