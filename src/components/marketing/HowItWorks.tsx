"use client";

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: "Add Property Details",
      description: "Set up buildings, floors, units, owners and assets in minutes."
    },
    {
      num: 2,
      title: "Manage Tenants & Units",
      description: "Onboard tenants, sign agreements and assign units digitally."
    },
    {
      num: 3,
      title: "Track Payments & Maintenance",
      description: "Automate invoices, collect online and resolve tickets fast."
    },
    {
      num: 4,
      title: "Monitor Reports",
      description: "Real-time dashboards across revenue, occupancy and performance."
    }
  ];

  return (
    <section id="how-it-works" className="bg-white position-relative" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-block mb-3">
            <span className="how-badge">How It Works</span>
          </div>
          <h2 className="section-title fw-bold text-dark">
            Live in four simple steps
          </h2>
        </div>
        
        {/* Steps Grid */}
        <div className="row g-4 justify-content-center">
          {steps.map((step, index) => (
            <div className="col-lg-3 col-md-6 col-sm-12 animate__animated animate__fadeInUp" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="timeline-card">
                {/* Step Header */}
                <div className="d-flex align-items-center gap-2.5 mb-3">
                  <div className="step-circle fw-bold">{step.num}</div>
                  <span className="step-label fw-bold text-uppercase">STEP {step.num}</span>
                </div>
                
                {/* Title */}
                <h5 className="step-title fw-bold mb-2.5">{step.title}</h5>
                
                {/* Description */}
                <p className="step-desc text-muted mb-0">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx global>{`
        .how-badge {
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

        .timeline-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
          padding: 30px 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.01);
          text-align: left;
        }

        .timeline-card:hover {
          transform: translateY(-4px);
          border-color: #ff7a00;
          box-shadow: 0 10px 25px -5px rgba(255, 111, 0, 0.06);
        }

        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ff6f00;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .step-label {
          font-size: 0.72rem;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .step-title {
          font-size: 0.98rem;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .step-desc {
          font-size: 0.82rem;
          line-height: 1.5;
        }

        .gap-2.5 {
          gap: 10px;
        }

        .mb-2.5 {
          margin-bottom: 10px;
        }
      `}</style>
    </section>
  );
}
