"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "SUPER_ADMIN"
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (!/^\d{6}$/.test(formData.password)) {
      setError("Password must be exactly 6 digits (numbers only).");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/send-otp', {
        email: formData.email,
        name: formData.name
      });

      if (response.success) {
        setStep(2);
        setInfoMessage(`A 6-digit verification code has been dispatched to ${formData.email}. Please verify your inbox.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification email. Please check your email and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit verification OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otp.trim()
      });

      if (response.success) {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          router.replace('/admin/dashboard');
        } else {
          alert("Account provisioned successfully.");
          router.replace('/login');
        }
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. The verification code may be invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 flex-column flex-md-row font-sans overflow-hidden" style={{ backgroundColor: "#ffffff" }}>

      {/* Left Panel: Brand & Info with Full Background Image */}
      <div
        className="col-12 col-md-6 d-none d-md-flex flex-column justify-content-between p-5 right-panel text-white h-100 position-relative"
        style={{
          backgroundImage: "url('/mirai_property_image.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Light overlay for high contrast text readability */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.3) 0%, rgba(11, 15, 25, 0.6) 100%)',
            zIndex: 1
          }}
        ></div>

        {/* Brand Header */}
        <div className="d-flex align-items-center gap-2.5 position-relative" style={{ zIndex: 2 }}>
          <div>
            <span className="brand-text-kalki" style={{ fontSize: '1.3rem', display: 'block' }}>PMS GLOBAL</span>
            <div className="brand-subtitle text-white-50" style={{ fontSize: '0.55rem', letterSpacing: '0.05em', fontWeight: 700 }}>PROPERTY MANAGEMENT SYSTEM</div>
          </div>
        </div>

        {/* Center Title */}
        <div className="my-auto position-relative" style={{ zIndex: 2 }}>
          <h1 className="fw-bold mb-3" style={{ fontSize: '2.8rem', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
            Smart Property <br />
            Management <br />
            <span style={{ background: 'linear-gradient(135deg, #ffe066 0%, #cc2200 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>Made Simple</span>
          </h1>
          <p className="text-white-50 mb-5 small" style={{ maxWidth: '440px', lineHeight: '1.6' }}>
            Manage your properties, tenants, payments, maintenance, and more from a single powerful platform.
          </p>

          {/* Floating Glassmorphic Badges Row */}
          <div className="glass-features-panel p-3 d-flex justify-content-between text-center mt-5">
            <div className="flex-grow-1">
              <div className="feature-circle bg-blue"><i className="bi bi-building"></i></div>
              <div className="feature-text">Manage Properties</div>
            </div>
            <div className="flex-grow-1">
              <div className="feature-circle bg-green"><i className="bi bi-people"></i></div>
              <div className="feature-text">Happy Tenants</div>
            </div>
            <div className="flex-grow-1">
              <div className="feature-circle bg-orange"><i className="bi bi-credit-card"></i></div>
              <div className="feature-text">Secure Payments</div>
            </div>
            <div className="flex-grow-1">
              <div className="feature-circle bg-purple"><i className="bi bi-bar-chart"></i></div>
              <div className="feature-text">Real-time Analytics</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="position-relative text-white-50 small opacity-55" style={{ zIndex: 2 }}>
          © 2026 PMS GLOBAL Enterprise OS
        </div>
      </div>

      {/* Right Panel: Register Form */}
      <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center p-4 p-md-5 h-100 overflow-y-auto">
        <div className="w-100 mx-auto" style={{ maxWidth: '420px' }}>

          {step === 1 ? (
            <>
              <div className="mb-4 text-start">
                <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Create Account</h2>
                <p className="text-muted" style={{ fontSize: '0.88rem' }}>Register to access the management portal.</p>
              </div>

              <form onSubmit={handleSendOtp}>

                {/* Full Name */}
                <div className="mb-3 text-start">
                  <label className="form-label-custom mb-1.5">Full Name</label>
                  <div className="custom-input-group d-flex align-items-center rounded-3 bg-white">
                    <i className="bi bi-person text-muted px-3" style={{ fontSize: '0.9rem' }}></i>
                    <input
                      type="text"
                      className="form-control border-0 bg-transparent ps-0 shadow-none text-dark"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ fontSize: '0.9rem', height: '44px' }}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-3 text-start">
                  <label className="form-label-custom mb-1.5">Email Address</label>
                  <div className="custom-input-group d-flex align-items-center rounded-3 bg-white">
                    <i className="bi bi-envelope text-muted px-3" style={{ fontSize: '0.9rem' }}></i>
                    <input
                      type="email"
                      className="form-control border-0 bg-transparent ps-0 shadow-none text-dark"
                      placeholder="john@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ fontSize: '0.9rem', height: '44px' }}
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="row g-2 mb-3 text-start">
                  <div className="col-6">
                    <label className="form-label-custom mb-1.5">Password (6 digits)</label>
                    <div className="custom-input-group d-flex align-items-center rounded-3 bg-white justify-content-between">
                      <input
                        type={showPassword ? "text" : "password"}
                        maxLength={6}
                        placeholder="000000"
                        className="form-control border-0 bg-transparent px-3 shadow-none text-dark"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        style={{ fontSize: '0.9rem', height: '44px' }}
                      />
                      <i
                        className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted pe-3 cursor-pointer`}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ fontSize: '0.9rem' }}
                      ></i>
                    </div>
                  </div>

                  <div className="col-6">
                    <label className="form-label-custom mb-1.5">Confirm Password</label>
                    <div className="custom-input-group d-flex align-items-center rounded-3 bg-white justify-content-between">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        maxLength={6}
                        placeholder="000000"
                        className="form-control border-0 bg-transparent px-3 shadow-none text-dark"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        style={{ fontSize: '0.9rem', height: '44px' }}
                      />
                      <i
                        className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted pe-3 cursor-pointer`}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ fontSize: '0.9rem' }}
                      ></i>
                    </div>
                  </div>
                </div>

                {/* Role Details */}
                <div className="mb-4 text-start">
                  <label className="form-label-custom mb-1.5">Account Role</label>
                  <div className="bg-light p-3 rounded-3 border border-emerald border-opacity-10 d-flex align-items-center gap-3">
                    <div className="bg-orange-light text-orange-badge rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                      <i className="bi bi-shield-lock-fill"></i>
                    </div>
                    <div>
                      <p className="fw-bold mb-0 text-dark" style={{ fontSize: '0.82rem' }}>System Administrator</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem', lineHeight: '1.25' }}>Full access to all dashboard modules and user management.</p>
                    </div>
                  </div>
                  <input type="hidden" value="SUPER_ADMIN" />
                </div>

                {error && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4 border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center">
                    <i className="bi bi-exclamation-circle-fill me-2" style={{ fontSize: '0.85rem' }}></i>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-orange-auth w-100 fw-bold transition-all rounded-3"
                  style={{ height: '44px', fontSize: '0.9rem' }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    "Send Verification OTP"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-4 text-start">
                <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Email Verification</h2>
                <p className="text-muted" style={{ fontSize: '0.88rem' }}>Enter the 6-digit OTP code sent to your email.</p>
              </div>

              <form onSubmit={handleRegister}>
                <div className="mb-4 text-start">
                  <label className="form-label-custom mb-1.5">One-Time Password (OTP)</label>
                  <div className="custom-input-group d-flex align-items-center rounded-3 bg-white">
                    <i className="bi bi-key text-muted px-3" style={{ fontSize: '0.9rem' }}></i>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-control border-0 bg-transparent ps-0 shadow-none font-monospace fw-bold tracking-widest text-center"
                      style={{ fontSize: '1.3rem', height: '48px', letterSpacing: '8px' }}
                      required
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                {infoMessage && (
                  <div className="alert alert-info border-0 py-2 px-3 small rounded-3 mb-4 bg-info bg-opacity-10 text-info d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-2" style={{ fontSize: '0.85rem' }}></i>
                    {infoMessage}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4 border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center">
                    <i className="bi bi-exclamation-circle-fill me-2" style={{ fontSize: '0.85rem' }}></i>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-orange-auth w-100 fw-bold transition-all rounded-3 mb-3"
                  style={{ height: '44px', fontSize: '0.9rem' }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    "Verify & Create Account"
                  )}
                </button>

                <div className="d-flex justify-content-between align-items-center px-1">
                  <button
                    type="button"
                    className="btn btn-link p-0 small text-muted text-decoration-none"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => { setStep(1); setError(""); setInfoMessage(""); }}
                  >
                    &larr; Edit Details
                  </button>
                  <button
                    type="button"
                    className="btn btn-link p-0 small text-primary fw-bold text-decoration-none"
                    style={{ fontSize: '0.8rem', color: '#ff6f00' }}
                    disabled={isLoading}
                    onClick={async () => {
                      setError("");
                      setInfoMessage("");
                      setIsLoading(true);
                      try {
                        await api.post('/auth/send-otp', {
                          email: formData.email,
                          name: formData.name
                        });
                        setInfoMessage("Verification OTP resent to your email.");
                      } catch (err: any) {
                        setError(err.message || "Failed to resend OTP.");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Login Redirect */}
          <div className="text-center mt-4">
            <p className="text-muted mb-0" style={{ fontSize: '0.82rem' }}>
              Already have an account? <Link href="/login" className="text-primary text-decoration-none fw-semibold hover-opacity" style={{ color: '#ff6f00' }}>Log In</Link>
            </p>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cinzel:wght@900&family=Orbitron:wght@700;900&display=swap');
        
        .font-sans {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .brand-text-kalki {
          font-family: 'Cinzel', 'Orbitron', serif;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #ffe066 0%, #ff7a00 40%, #ff5500 75%, #cc2200 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 2px 4px rgba(255, 85, 0, 0.2));
        }
        
        .right-panel {
          position: relative;
          overflow: hidden;
        }

        .custom-input-group {
          border: 1px solid #cbd5e1;
          transition: all 0.2s ease-in-out;
          background-color: #ffffff;
        }

        .custom-input-group:focus-within {
          border-color: #ff6f00;
          box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.12);
        }

        .btn-orange-auth {
          background: linear-gradient(135deg, #ff7a00 0%, #ff5500 100%) !important;
          border: none !important;
          color: #ffffff !important;
          box-shadow: 0 8px 15px -3px rgba(255, 111, 0, 0.3);
        }

        .btn-orange-auth:hover {
          background: linear-gradient(135deg, #ff8c00 0%, #ff6f00 100%) !important;
          transform: translateY(-1px);
          box-shadow: 0 12px 20px -3px rgba(255, 111, 0, 0.4);
        }

        .form-label-custom {
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .hover-opacity:hover {
          opacity: 0.8;
        }

        .mb-1.5 { margin-bottom: 6px; }
        .mb-4.5 { margin-bottom: 24px; }

        .bg-orange-light {
          background: rgba(255, 111, 0, 0.1);
        }

        .text-orange-badge {
          color: #ff6f00;
        }

        /* Glassmorphic Features Panel */
        .glass-features-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .feature-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          margin: 0 auto 8px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 0.95rem;
        }
        .feature-circle.bg-blue { background: #2563eb; }
        .feature-circle.bg-green { background: #10b981; }
        .feature-circle.bg-orange { background: #ff6f00; }
        .feature-circle.bg-purple { background: #8b5cf6; }
        .feature-text {
          font-size: 0.62rem;
          color: #ffffff;
          font-weight: 600;
        }

        /* Hide scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
