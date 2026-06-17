"use client";

export default function Benefits() {
  const benefits = [
    {
      num: "01",
      title: "Save Time",
      description: "Automate daily property operations and recurring workflows."
    },
    {
      num: "02",
      title: "Reduce Paperwork",
      description: "Digital records, agreements and documents in one secure place."
    },
    {
      num: "03",
      title: "Improve Communication",
      description: "Connect owners, tenants, and staff on a single channel."
    },
    {
      num: "04",
      title: "Increase Transparency",
      description: "Real-time reports and audit-ready financial tracking."
    }
  ];

  return (
    <section id="benefits" className="bg-white position-relative" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-block mb-3">
            <span className="benefits-badge">Benefits</span>
          </div>
          <h2 className="section-title fw-bold text-dark">
            Why teams switch to ANVAYA360
          </h2>
        </div>
        
        {/* Benefits Grid */}
        <div className="row g-4 justify-content-center">
          {benefits.map((item, index) => (
            <div className="col-lg-3 col-md-6 col-sm-12 animate__animated animate__fadeInUp" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="benefit-card h-100">
                {/* Faint watermark number */}
                <div className="watermark-num">{item.num}</div>
                
                {/* Title */}
                <h5 className="benefit-title fw-bold mb-2">{item.title}</h5>
                
                {/* Description */}
                <p className="benefit-desc text-muted mb-0">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx global>{`
        .benefits-badge {
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

        .benefit-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
          padding: 30px 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.01);
          text-align: left;
          position: relative;
        }

        .benefit-card:hover {
          transform: translateY(-5px);
          border-color: #ff7a00;
          box-shadow: 0 10px 25px -5px rgba(255, 111, 0, 0.06);
        }

        .watermark-num {
          font-size: 3.2rem;
          font-weight: 800;
          color: #2563eb;
          opacity: 0.08;
          line-height: 1.1;
          margin-bottom: 6px;
          user-select: none;
          letter-spacing: -0.02em;
        }

        .benefit-title {
          font-size: 0.98rem;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .benefit-desc {
          font-size: 0.82rem;
          line-height: 1.5;
        }
      `}</style>
    </section>
  );
}
