"use client";

export default function CTA() {
  return (
    <section className="bg-white position-relative" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
      <div className="container">
        <div className="cta-card text-center text-white position-relative overflow-hidden">
          {/* Subtle grid mesh overlay */}
          <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px', zIndex: 0 }}></div>
          
          <div className="position-relative" style={{ zIndex: 1 }}>
            {/* Orange Capsule Badge */}
            <div className="d-inline-block mb-3.5">
              <span className="cta-badge">Ready When You Are</span>
            </div>
            
            {/* Title */}
            <h2 className="cta-title fw-bold mb-3">
              Transform Your Property Management Experience
            </h2>
            
            {/* Subtitle */}
            <p className="cta-subtitle opacity-85 mx-auto mb-4.5">
              Move from manual operations to a smart digital property ecosystem — in days, not months.
            </p>
            
            {/* Buttons Group */}
            <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
              <button className="btn btn-orange-cta rounded-pill px-4 py-2.5 fw-bold text-white transition-all hover-lift d-flex align-items-center gap-2">
                Get Started
                <i className="bi bi-arrow-right"></i>
              </button>
              
              <button className="btn btn-outline-light rounded-pill px-4 py-2.5 fw-bold transition-all hover-lift">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .cta-card {
          background-color: #0f172a;
          border-radius: 24px;
          padding: 60px 40px;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.3);
        }

        .cta-badge {
          background: rgba(255, 111, 0, 0.15);
          border: 1px solid rgba(255, 111, 0, 0.3);
          color: #ff8c00;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cta-title {
          font-size: clamp(1.6rem, 3.2vw, 2.2rem);
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        .cta-subtitle {
          font-size: 0.95rem;
          max-width: 580px;
          line-height: 1.6;
        }

        .btn-orange-cta {
          background: linear-gradient(135deg, #ff7a00 0%, #ff5500 100%) !important;
          border: none !important;
          box-shadow: 0 8px 15px -3px rgba(255, 111, 0, 0.3);
        }

        .btn-orange-cta:hover {
          background: linear-gradient(135deg, #ff8c00 0%, #ff6f00 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -3px rgba(255, 111, 0, 0.4);
        }

        .btn-outline-light {
          border-color: rgba(255, 255, 255, 0.25) !important;
          background: transparent !important;
        }

        .btn-outline-light:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
          transform: translateY(-2px);
        }

        .hover-lift {
          transition: all 0.2s ease-in-out;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .mb-3.5 {
          margin-bottom: 14px;
        }

        .mb-4.5 {
          margin-bottom: 24px;
        }
      `}</style>
    </section>
  );
}
