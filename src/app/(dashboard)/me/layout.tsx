"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/utils/api";
import { Home, ClipboardCheck, CalendarDays, User, LogOut, Bell } from "lucide-react";

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (!token) {
                router.replace("/login");
                return;
            }

            const fetchProfile = async () => {
                try {
                    const res = await api.get("/auth/profile");
                    if (res.success && res.user) {
                        localStorage.setItem("user", JSON.stringify(res.user));
                        setUser(res.user);
                    } else {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        router.replace("/login");
                    }
                } catch (err) {
                    console.error("Profile fetch error:", err);
                    router.replace("/login");
                } finally {
                    setLoading(false);
                }
            };

            fetchProfile();
        }
    }, [router]);

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.replace("/login");
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 flex-column gap-3" style={{ backgroundColor: "#F4F5FA" }}>
                <div className="spinner-border text-primary" style={{ color: "#1E2A78" }} role="status"></div>
                <span style={{ color: "var(--text-muted)", fontFamily: "'Manrope', sans-serif" }}>Loading Employee Portal...</span>
            </div>
        );
    }

    const navigationItems = [
        { name: "Home", path: "/me", icon: Home },
        { name: "Attendance", path: "/me/attendance", icon: ClipboardCheck },
        { name: "Leave", path: "/me/leave", icon: CalendarDays },
        { name: "Profile", path: "/me/profile", icon: User },
    ];

    return (
        <div className="d-flex flex-column flex-md-row min-vh-100" style={{ backgroundColor: "#F4F5FA", fontFamily: "'Manrope', sans-serif" }}>
            {/* Fonts Import */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                :root {
                    --anvaya-primary: #1E2A78;
                    --anvaya-primary-light: rgba(30, 42, 120, 0.08);
                    --anvaya-primary-hover: #131d5b;
                    --anvaya-bg: #F4F5FA;
                }
                body {
                    font-family: 'Manrope', sans-serif;
                }
                /* Micro-animations */
                .hover-scale {
                    transition: all 0.2s ease-in-out;
                }
                .hover-scale:hover {
                    transform: scale(1.02);
                }
                .nav-card-active {
                    background-color: var(--anvaya-primary);
                    color: white !important;
                }
                /* Bottom tab styling for mobile */
                @media (max-width: 767.98px) {
                    .mobile-nav-bottom {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        z-index: 1030;
                        background: rgba(255, 255, 255, 0.85);
                        backdrop-filter: blur(20px);
                        border-top: 1px solid rgba(0, 0, 0, 0.06);
                        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
                    }
                    .main-content-area {
                        padding-bottom: 80px !important;
                    }
                }
            `}</style>

            {/* Desktop Left Sidebar */}
            <aside className="d-none d-md-flex flex-column justify-content-between p-4 bg-white text-dark shadow-sm border-end" style={{ width: "260px", minHeight: "100vh", position: "fixed", left: 0, top: 0, zIndex: 100 }}>
                <div>
                    {/* Brand */}
                    <div className="d-flex align-items-center mb-5 gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-3 text-white" style={{ width: "40px", height: "40px", backgroundColor: "#1E2A78" }}>
                            <ClipboardCheck size={22} />
                        </div>
                        <div>
                            <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>MIRAI</h5>
                            <span className="text-muted small fw-semibold">Employee Hub</span>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="d-flex flex-column gap-2">
                        {navigationItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className={`d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 text-decoration-none fw-semibold ${
                                        isActive ? "text-white" : "text-muted hover-bg-light"
                                    }`}
                                    style={{
                                        backgroundColor: isActive ? "#1E2A78" : "transparent",
                                        transition: "all 0.2s",
                                        fontSize: "0.92rem"
                                    }}
                                >
                                    <IconComponent size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Profile Card & Logout */}
                <div className="border-top pt-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: "38px", height: "38px", backgroundColor: "#1E2A78", fontSize: "0.9rem" }}>
                                {user?.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden" style={{ maxWidth: "120px" }}>
                                <div className="fw-bold text-dark text-truncate small">{user?.name}</div>
                                <div className="text-muted text-truncate" style={{ fontSize: "0.75rem" }}>{user?.role}</div>
                            </div>
                        </div>
                        <button className="btn p-1.5 border-0 text-danger" onClick={handleLogout} title="Log Out">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Top Header */}
            <div className="d-flex d-md-none justify-content-between align-items-center px-4 py-3 bg-white border-bottom sticky-top" style={{ zIndex: 100 }}>
                <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center rounded-2 text-white" style={{ width: "32px", height: "32px", backgroundColor: "#1E2A78" }}>
                        <ClipboardCheck size={18} />
                    </div>
                    <Link href="/" className="text-decoration-none">
                        <span className="fw-bold text-dark mb-0" style={{ fontSize: "1.1rem" }}>MIRAI</span>
                    </Link>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <button className="btn p-1 border-0 position-relative text-muted">
                        <Bell size={20} />
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                    </button>
                    <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: "32px", height: "32px", backgroundColor: "#1E2A78", fontSize: "0.8rem" }} onClick={handleLogout} title="Tap to Log Out">
                        {user?.name?.slice(0, 2).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow-1 main-content-area" style={{ marginLeft: "0px", paddingLeft: "0px" }}>
                {/* Adjust left margin for desktop */}
                <div className="px-3 px-md-5 py-4" style={{ marginLeft: "0px", paddingLeft: "0px" }}>
                    <div className="mx-auto" style={{ maxWidth: "1200px", paddingLeft: "var(--desktop-left-pad, 0px)" }}>
                        {/* CSS Hack to apply margin-left only on desktop screens */}
                        <style>{`
                            @media (min-width: 768px) {
                                .main-content-area {
                                    margin-left: 260px !important;
                                }
                            }
                        `}</style>
                        {children}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Tab Bar */}
            <nav className="d-flex d-md-none mobile-nav-bottom py-2 px-3 justify-content-around">
                {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`d-flex flex-column align-items-center text-decoration-none ${
                                isActive ? "text-primary" : "text-muted"
                            }`}
                            style={{ fontSize: "0.72rem", fontWeight: 600, color: isActive ? "#1E2A78" : "var(--text-muted)" }}
                        >
                            <IconComponent size={20} className="mb-0.5" style={{ color: isActive ? "#1E2A78" : "var(--text-muted)" }} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
