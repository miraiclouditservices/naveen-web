"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-lg-4"
      style={{ backgroundColor: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div
        className="w-100 bg-white shadow-lg overflow-hidden row g-0 position-relative border border-secondary border-opacity-10"
        style={{ maxWidth: 840, borderRadius: 28, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
      >
        {/* Left Dark Panel */}
        <div
          className="col-md-5 d-none d-md-flex flex-column justify-content-between p-4 text-white"
          style={{ background: '#1c1917' }}
        >
          <div>
            <span className="badge bg-secondary bg-opacity-25 text-white mb-3">Enterprise SaaS</span>
            <h2 className="text-white fw-bold mb-3" style={{ fontSize: '1.8rem' }}>
              Managed <br />Provisioning
            </h2>
            <p className="text-secondary extra-small mb-0" style={{ color: '#cbd5e1' }}>
              Accounts are provisioned centrally by Ultra Super Admins and Organization Administrators.
            </p>
          </div>
          <div className="extra-small text-muted">
            © {new Date().getFullYear()} Mirai CloudIT SERVICES OS
          </div>
        </div>

        {/* Right Content */}
        <div className="col-md-7 col-12 p-4 p-sm-5 d-flex flex-column justify-content-between">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <Link href="/" className="d-flex align-items-center text-decoration-none">
              <img
                src="/mirai_logo.png"
                alt="Mirai CloudIT SERVICES"
                style={{ height: 44 }}
                className="w-auto object-fit-contain"
              />
            </Link>
            <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1">
              Public Registration Disabled
            </span>
          </div>

          <div className="py-3 text-center text-md-start">
            <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle mb-3 p-3" style={{ width: 64, height: 64 }}>
              <i className="bi bi-shield-lock-fill" style={{ fontSize: '1.75rem' }}></i>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }} className="mb-2">
              Self-Registration Disabled
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }} className="mb-4">
              Public user registration is disabled for security and access compliance. Account provisioning is managed by your <strong>ULTRA_SUPER_ADMIN</strong> or Organization Administrator.
            </p>

            <div className="p-3 bg-light rounded-4 border mb-4 text-start">
              <div className="d-flex align-items-start gap-2">
                <i className="bi bi-info-circle-fill text-primary mt-1"></i>
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  If you need a new Property Management Account or Co-working Space Account, please contact your System Administrator to provision your credentials.
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="btn w-100 border-0 d-inline-flex align-items-center justify-content-center gap-2"
              style={{
                height: 48,
                borderRadius: 999,
                background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.92rem'
              }}
            >
              <i className="bi bi-box-arrow-in-right" /> Return to Sign In
            </Link>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
            Mirai CloudIT SERVICES Security &amp; Access Compliance
          </div>
        </div>
      </div>
    </div>
  );
}
