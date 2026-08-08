"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, setStoredToken, setStoredUser } from "@/utils/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      const errMsg = "Please enter your email/username and password.";
      setError(errMsg);
      setToast({ message: errMsg, type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      if (response && response.success && response.token && response.user) {
        setStoredToken(response.token);
        setStoredUser(response.user);
        setToast({ message: "Login successful! Redirecting...", type: "success" });
        setTimeout(() => {
          router.replace('/admin/dashboard');
        }, 400);
      } else if (response && response.error) {
        setError(response.error);
        setToast({ message: response.error, type: "error" });
      } else {
        const errMsg = response?.message || "Invalid credentials. Please try again.";
        setError(errMsg);
        setToast({ message: errMsg, type: "error" });
      }
    } catch (err: any) {
      const errMsg = err.message || "Invalid credentials. Please try again.";
      setError(errMsg);
      setToast({ message: errMsg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-2 p-sm-3 p-lg-4" style={{ backgroundColor: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Floating Toast Notification SMS Banner */}
      {toast && (
        <div
          className="position-fixed top-0 end-0 p-3 p-md-4"
          style={{
            zIndex: 9999,
            animation: "toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <style>{`
            @keyframes toastSlideIn {
              from { transform: translateY(-16px) scale(0.96); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
          `}</style>
          <div
            className="bg-white border rounded-4 shadow-lg p-3 d-flex align-items-center justify-content-between gap-3"
            style={{
              minWidth: 320,
              maxWidth: 420,
              borderColor: toast.type === "error" ? "#fecaca" : "#bbf7d0",
              borderLeft: `4px solid ${toast.type === "error" ? "#dc2626" : "#16a34a"}`,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
            }}
          >
            <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
                style={{
                  width: 38,
                  height: 38,
                  backgroundColor: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
                  color: toast.type === "error" ? "#dc2626" : "#16a34a"
                }}
              >
                <i className={`bi ${toast.type === "error" ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}`} style={{ fontSize: "1.15rem" }}></i>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="fw-bold text-dark text-truncate" style={{ fontSize: "0.88rem", lineHeight: 1.25 }}>
                  {toast.type === "error" ? "Authentication Error" : "Success"}
                </div>
                <div className="text-secondary text-truncate" style={{ fontSize: "0.8rem", marginTop: 2, lineHeight: 1.3 }}>
                  {toast.message}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm p-1 border-0 text-muted shadow-none flex-shrink-0 d-flex align-items-center justify-content-center"
              onClick={() => setToast(null)}
              style={{ width: 24, height: 24, fontSize: "0.85rem", lineHeight: 1 }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Payoneer Style Floating Split Card — Responsive across Mobile, Tablet, Laptop & Desktop */}
      <div
        className="w-100 bg-white shadow-lg overflow-hidden row g-0 position-relative border border-secondary border-opacity-10"
        style={{ maxWidth: 1040, minHeight: 560, borderRadius: 28, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
      >

        {/* Left Panel: Dark Elegant Brand & Hero Preview (Visible on Large Screens) */}
        <div
          className="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-4 p-xl-5 text-white position-relative overflow-hidden"
          style={{ background: '#1c1917' }}
        >
          {/* Subtle Glow Orb */}
          <div
            className="position-absolute top-0 end-0 translate-middle-y rounded-circle pointer-events-none opacity-25"
            style={{
              width: 350,
              height: 350,
              background: 'radial-gradient(circle, var(--brand-orange) 0%, transparent 70%)',
              filter: 'blur(60px)'
            }}
          ></div>

          {/* Top Tagline */}
          <div className="position-relative z-2">
            <p className="mb-0 fw-medium" style={{ color: '#cbd5e1', fontSize: '0.85rem', letterSpacing: '0.01em' }}>
              Global business operations made simple — online solutions for you.
            </p>
          </div>

          {/* Center Heading & Image Showcase */}
          <div className="my-auto py-3 position-relative z-2 text-start">
            <h1 className="text-white mb-4" style={{ fontWeight: 800, fontSize: '3rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
              Manage <br />
              <span style={{ color: 'var(--brand-orange-light)', fontWeight: 800 }}>your business</span>
            </h1>

            {/* Mobile / App Platform Preview */}
            <div className="d-flex justify-content-center mt-3 position-relative">
              <img
                src="/hero-right.png"
                alt="ANVAYA360 Platform"
                className="img-fluid rounded-4 shadow-lg border border-secondary border-opacity-25"
                style={{ maxWidth: '88%', maxHeight: 260, objectFit: 'cover', transform: 'rotate(-2deg)' }}
              />
            </div>
          </div>

          {/* Left Panel Bottom Footer */}
          <div className="d-flex align-items-center justify-content-between extra-small position-relative z-2" style={{ color: '#94a3b8' }}>
            <span>© {new Date().getFullYear()} ANVAYA360 OS</span>
            <span className="badge bg-secondary bg-opacity-25 text-white">v2.4 Live</span>
          </div>
        </div>

        {/* Right Panel: White Clean Sign In Form */}
        <div className="col-lg-6 col-12 bg-white p-4 p-sm-5 d-flex flex-column justify-content-between">

          {/* Right Header: Logo & Sign Up Link */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
            <Link href="/" className="d-flex align-items-center text-decoration-none">
              <img
                src="/brand-logo.png"
                alt="ANVAYA360"
                style={{ height: 46 }}
                className="w-auto object-fit-contain"
              />
            </Link>

            <Link
              href="/register"
              className="text-decoration-none d-inline-flex align-items-center gap-2 fw-semibold"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--text-primary)',
                borderRadius: 999,
                padding: '6px 18px',
                transition: 'all 0.2s'
              }}
            >
              <i className="bi bi-person-plus" /> Sign Up
            </Link>
          </div>

          {/* Form Content Container */}
          <div className="py-2 my-auto" style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>

            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }} className="mb-1">
              Sign In
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }} className="mb-4">
              Enter your credentials to access your operations dashboard
            </p>

            <form onSubmit={handleLogin}>

              {/* Email / Username Field */}
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control px-4 shadow-none"
                  placeholder="Email or Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    height: 48,
                    fontSize: '0.9rem',
                    borderRadius: 999,
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="mb-2">
                <div className="position-relative d-flex align-items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control px-4 shadow-none"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      height: 48,
                      fontSize: '0.9rem',
                      paddingRight: 52,
                      borderRadius: 999,
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      color: 'var(--text-primary)'
                    }}
                    required
                  />
                  <i
                    className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} position-absolute top-50 translate-middle-y`}
                    style={{ right: 18, fontSize: '1rem', cursor: 'pointer', color: 'var(--text-secondary)', zIndex: 5 }}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="d-flex justify-content-start mb-4">
                <a href="#contact" className="extra-small fw-bold text-decoration-none" style={{ color: 'var(--brand-orange)' }}>
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn w-100 border-0 d-flex align-items-center justify-content-center gap-2"
                style={{
                  height: 50,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.01em',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease'
                }}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" />
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right" /> Sign In
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto', color: 'var(--text-secondary)', fontSize: '0.7rem', opacity: 0.85 }}>
            © {new Date().getFullYear()} Anvaya360 Inc. All rights reserved.
          </div>

        </div>

      </div>

    </div>
  );
}

