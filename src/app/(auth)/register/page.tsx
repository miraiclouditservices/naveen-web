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
      setError("Please fill out all required fields.");
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
        setInfoMessage(`A 6-digit verification code was sent to ${formData.email}.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification email. Please try again.");
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
      setError(err.message || "Registration failed. Verification code may be invalid.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-2 p-sm-3 p-lg-4"
      style={{ backgroundColor: "#f1f5f9", fontFamily: "var(--font-manrope, 'Manrope', system-ui, sans-serif)" }}>
      
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
              Start your <br />
              <span style={{ color: 'var(--brand-orange-light)', fontWeight: 800 }}>free trial</span>
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

        {/* Right Panel: White Clean Register Form */}
        <div className="col-lg-6 col-12 bg-white p-4 p-sm-5 d-flex flex-column justify-content-between">
          
          {/* Right Header: Logo & Sign In Link */}
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
              href="/login"
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
              <i className="bi bi-box-arrow-in-right" /> Sign In
            </Link>
          </div>

          {/* Form Content Container */}
          <div className="py-2 my-auto" style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
            
            {step === 1 ? (
              <>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }} className="mb-1">
                  Create Account
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }} className="mb-4">
                  Fill in your details to set up your organization
                </p>

                <form onSubmit={handleSendOtp}>
                  
                  {/* Full Name */}
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control px-4 shadow-none"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ height: 46, fontSize: '0.88rem', borderRadius: 999, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: 'var(--text-primary)' }}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control px-4 shadow-none"
                      placeholder="Work Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ height: 46, fontSize: '0.88rem', borderRadius: 999, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: 'var(--text-primary)' }}
                      required
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="position-relative d-flex align-items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          maxLength={6}
                          className="form-control px-3 shadow-none"
                          placeholder="Password (6-digit)"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          style={{ height: 46, fontSize: '0.82rem', paddingRight: 36, borderRadius: 999, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: 'var(--text-primary)' }}
                          required
                        />
                        <i
                          className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} position-absolute top-50 translate-middle-y`}
                          style={{ right: 14, fontSize: '0.85rem', zIndex: 5, cursor: 'pointer', color: 'var(--text-secondary)' }}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="position-relative d-flex align-items-center">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          maxLength={6}
                          className="form-control px-3 shadow-none"
                          placeholder="Confirm Pass"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          style={{ height: 46, fontSize: '0.82rem', paddingRight: 36, borderRadius: 999, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: 'var(--text-primary)' }}
                          required
                        />
                        <i
                          className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} position-absolute top-50 translate-middle-y`}
                          style={{ right: 14, fontSize: '0.85rem', zIndex: 5, cursor: 'pointer', color: 'var(--text-secondary)' }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger py-2 px-3 extra-small rounded-3 mb-3 border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center">
                      <i className="bi bi-exclamation-circle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Send OTP Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn w-100 border-0 d-flex align-items-center justify-content-center gap-2 mt-2"
                    style={{
                      height: 50,
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      letterSpacing: '0.01em',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                      transition: 'opacity 0.2s ease, transform 0.2s ease'
                    }}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      <>
                        <i className="bi bi-envelope-check" /> Send Verification OTP
                      </>
                    )}
                  </button>

                </form>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }} className="mb-1">
                  Verify Email
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }} className="mb-4">
                  Enter the 6-digit OTP code sent to your email inbox
                </p>

                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <input
                      type="text"
                      maxLength={6}
                      className="form-control px-4 text-center font-monospace fw-bold shadow-none"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      style={{ height: 54, fontSize: '1.5rem', letterSpacing: '10px', borderRadius: 16, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: 'var(--text-primary)' }}
                      required
                    />
                  </div>

                  {infoMessage && (
                    <div className="alert alert-info py-2 px-3 extra-small rounded-3 mb-3 border-0 bg-info bg-opacity-10 text-info d-flex align-items-center">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      {infoMessage}
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger py-2 px-3 extra-small rounded-3 mb-3 border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center">
                      <i className="bi bi-exclamation-circle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn w-100 border-0 d-flex align-items-center justify-content-center gap-2 mb-3"
                    style={{
                      height: 50,
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      letterSpacing: '0.01em',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                      transition: 'opacity 0.2s ease, transform 0.2s ease'
                    }}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill" /> Verify &amp; Create Account
                      </>
                    )}
                  </button>

                  <div className="d-flex justify-content-between align-items-center px-1">
                    <button
                      type="button"
                      className="btn btn-link p-0 extra-small text-secondary text-decoration-none"
                      onClick={() => { setStep(1); setError(""); setInfoMessage(""); }}
                    >
                      &larr; Edit Info
                    </button>
                    <button
                      type="button"
                      className="btn btn-link p-0 extra-small text-decoration-none fw-bold"
                      style={{ color: 'var(--brand-orange-light)' }}
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
