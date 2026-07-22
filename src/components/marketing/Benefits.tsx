"use client";

export default function Benefits() {
  const benefits = [
    {
      icon: "bi-key",
      title: "One Login",
      description: "Everything managed from one account."
    },
    {
      icon: "bi-grid-1x2",
      title: "Modern Dashboard",
      description: "Real-time business insights."
    },
    {
      icon: "bi-people",
      title: "Role Based Access",
      description: "Control every employee's permissions."
    },
    {
      icon: "bi-cloud",
      title: "Cloud Based",
      description: "Access from anywhere, anytime."
    },
    {
      icon: "bi-shield-check",
      title: "Enterprise Security",
      description: "Bank-grade encryption & compliance."
    },
    {
      icon: "bi-lightning-charge",
      title: "Blazing Fast",
      description: "Engineered for speed at any scale."
    }
  ];

  return (
    <section id="benefits" className="benefits-section position-relative overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-block mb-3">
            <span className="benefits-badge">WHY ANVAYA360</span>
          </div>
          <h2 className="section-title fw-bold text-dark">
            Built for teams that want to<br className="d-none d-sm-block" /> move fast.
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="row g-4 justify-content-center">
          {benefits.map((item, index) => (
            <div className="col-lg-4 col-md-6 col-sm-12 animate__animated animate__fadeInUp" key={index} style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="benefit-card">
                {/* Icon Container */}
                <div className="icon-circle mb-3">
                  <i className={`bi ${item.icon}`}></i>
                </div>

                {/* Title */}
                <h5 className="benefit-title fw-bold mb-2">{item.title}</h5>

                {/* Description */}
                <p className="benefit-desc mb-0">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .benefits-section {
          padding-top: 60px;
          padding-bottom: 60px;
          background-color: var(--bg-card);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }

        .benefits-badge {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 9999px;
          letter-spacing: 0.05em;
        }

        .benefits-section .section-title {
          font-size: 2.2rem;
          color: var(--text-main);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        /* Benefit Cards */
        .benefit-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s ease;
          height: 100%;
          box-shadow: var(--shadow-sm);
          text-align: left;
        }

        .benefit-card:hover {
          transform: translateY(-2px);
          border-color: var(--text-muted);
        }

        .icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--border-color);
          color: var(--dark-section);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .benefit-title {
          font-size: 0.95rem;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .benefit-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        @media (max-width: 991.98px) {
          .benefits-section .section-title {
            font-size: 1.8rem;
          }
          .benefit-card {
            padding: 20px;
          }
        }
      `}</style>
    </section>
  );
}
