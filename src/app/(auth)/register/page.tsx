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
    <div className="min-vh-100 d-flex flex-column flex-lg-row overflow-hidden bg-white">
      {/* Brand Side */}
      <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #002855 0%, #014aad 100%)',
          color: 'white'
        }}>
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          zIndex: 0
        }}></div>

        <div className="position-relative z-1">
          <div className="d-flex align-items-center gap-2.5 mb-5">
            <div 
              className="d-flex align-items-center justify-content-center text-dark fw-bold bg-white shadow-sm" 
              style={{ 
                width: '38px', 
                height: '38px', 
                fontSize: '1.1rem',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              N
            </div>
            <span className="fw-bold fs-4 tracking-tight text-white" style={{ letterSpacing: '-0.03em' }}>Naveen</span>
          </div>

          <div className="mt-5 pt-4">
            <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-0.04em', lineHeight: '1.2' }}>
              Join the <br />
              <span className="text-white text-opacity-75">Network.</span>
            </h1>
            <p className="fw-light text-white text-opacity-80" style={{ maxWidth: '440px', fontSize: '1.1rem' }}>
              Verify your email address to automatically provision a system administrator profile with global workspace control.
            </p>
          </div>
        </div>

        <div className="position-relative z-1 d-flex justify-content-between align-items-center small text-white text-opacity-40 fw-bold text-uppercase" style={{ letterSpacing: '0.1em', fontSize: '0.65rem' }}>
          <div>v4.2.0 Build</div>
          <div>© 2026 Naveen</div>
        </div>
      </div>

      {/* Register Form Side */}
      <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center p-4 p-md-5">
        <div className="w-100" style={{ maxWidth: '400px' }}>

          {step === 1 ? (
            <>
              <div className="mb-4">
                <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em', fontSize: '1.5rem' }}>Create Account</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Register to access the management portal.</p>
              </div>

              <form onSubmit={handleSendOtp}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Full Name</label>
                    <div className="input-group border-bottom pb-1">
                      <span className="input-group-text bg-transparent border-0 px-0 me-3"><i className="bi bi-person text-muted"></i></span>
                      <input
                        type="text"
                        className="form-control bg-transparent border-0 px-0 shadow-none"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Corporate Email</label>
                    <div className="input-group border-bottom pb-1">
                      <span className="input-group-text bg-transparent border-0 px-0 me-3"><i className="bi bi-envelope text-muted"></i></span>
                      <input
                        type="email"
                        className="form-control bg-transparent border-0 px-0 shadow-none"
                        required
                        placeholder="john.doe@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Password</label>
                    <div className="input-group border-bottom pb-1 align-items-center">
                      <span className="input-group-text bg-transparent border-0 px-0 me-3"><i className="bi bi-lock text-muted"></i></span>
                      <input
                        type={showPassword ? "text" : "password"}
                        maxLength={6}
                        placeholder="000000"
                        className="form-control bg-transparent border-0 px-0 shadow-none"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      />
                      <button
                        type="button"
                        className="btn bg-transparent border-0 pe-0 shadow-none text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Confirm</label>
                    <div className="input-group border-bottom pb-1 align-items-center">
                      <span className="input-group-text bg-transparent border-0 px-0 me-3"><i className="bi bi-shield-lock text-muted"></i></span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        maxLength={6}
                        placeholder="000000"
                        className="form-control bg-transparent border-0 px-0 shadow-none"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      />
                      <button
                        type="button"
                        className="btn bg-transparent border-0 pe-0 shadow-none text-muted"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Account Role</label>
                    <div className="bg-light p-3 rounded shadow-sm border border-emerald border-opacity-25 d-flex align-items-center gap-3">
                      <div className="bg-emerald bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                        <i className="bi bi-shield-lock-fill"></i>
                      </div>
                      <div>
                        <p className="fw-bold mb-0 text-dark" style={{ fontSize: '0.85rem' }}>System Administrator</p>
                        <p className="text-muted small mb-0" style={{ fontSize: '0.7rem' }}>Full access to all dashboard modules and user management.</p>
                      </div>
                    </div>
                    <input type="hidden" value="SUPER_ADMIN" />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger border-0 py-2 small fw-medium mt-4 mb-0" style={{ borderRadius: '0.5rem', backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
                    <i className="bi bi-exclamation-circle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-emerald w-100 py-3 fw-bold text-white shadow-emerald rounded-pill transition-all mt-4 mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? "SENDING VERIFICATION CODE..." : "SEND VERIFICATION OTP"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em', fontSize: '1.5rem' }}>Email Verification</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Enter the 6-digit OTP code sent to your email.</p>
              </div>

              <form onSubmit={handleRegister}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>One-Time Password (OTP)</label>
                    <div className="input-group border-bottom pb-1">
                      <span className="input-group-text bg-transparent border-0 px-0 me-3"><i className="bi bi-key text-muted"></i></span>
                      <input
                        type="text"
                        maxLength={6}
                        className="form-control bg-transparent border-0 px-0 shadow-none font-monospace fw-bold tracking-widest text-center"
                        style={{ fontSize: '1.4rem', letterSpacing: '8px' }}
                        required
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                </div>

                {infoMessage && (
                  <div className="alert alert-info border-0 py-2 small fw-medium mt-4 mb-0" style={{ borderRadius: '0.5rem', backgroundColor: '#EFF6FF', color: '#1E40AF' }}>
                    <i className="bi bi-info-circle-fill me-2"></i>
                    {infoMessage}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger border-0 py-2 small fw-medium mt-4 mb-0" style={{ borderRadius: '0.5rem', backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
                    <i className="bi bi-exclamation-circle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-emerald w-100 py-3 fw-bold text-white shadow-emerald rounded-pill transition-all mt-4 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? "VERIFYING..." : "VERIFY & CREATE ACCOUNT"}
                </button>

                <div className="d-flex justify-content-between align-items-center">
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
                    style={{ fontSize: '0.8rem' }}
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

          <div className="text-center mt-4">
            <p className="text-muted small mb-0">
              Already have an account? <Link href="/login" className="text-primary fw-bold text-decoration-none">Log In</Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .bg-emerald { background-color: #014aad !important; }
        .text-primary { color: #014aad !important; }
        .btn-emerald { background-color: #014aad; border: none; }
        .btn-emerald:hover { background-color: #013a8a; transform: translateY(-1px); }
        .shadow-emerald { box-shadow: 0 10px 15px -3px rgba(1, 74, 173, 0.3); }
        .tracking-tight { letter-spacing: -0.02em; }
      `}</style>
    </div>
  );
}
