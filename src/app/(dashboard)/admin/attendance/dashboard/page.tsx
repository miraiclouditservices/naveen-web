"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import {
    Clock,
    UserCheck,
    AlertTriangle,
    UserMinus,
    Calendar,
    ArrowRight,
    TrendingUp,
    MapPin,
    Smartphone,
    User,
    RefreshCw
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

interface Summary {
    total: number;
    present: number;
    late: number;
    absent: number;
    onLeave: number;
    wfh: number;
    presentPercent: number;
}

interface DeptStat {
    department: string;
    total: number;
    present: number;
    percent: number;
}

interface ShiftCount {
    name: string;
    count: number;
    color: string;
}

interface Trend {
    date: string;
    percent: number;
}

interface LeaderboardItem {
    name: string;
    empCode: string;
    department: string;
    lateCount: number;
    absentCount: number;
}

interface Holiday {
    _id: string;
    name: string;
    date: string;
    type: string;
}

interface FeedItem {
    id: string;
    name: string;
    empCode: string;
    action: string;
    time: string;
    status: string;
    location: string;
}

export default function AttendanceDashboard() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [deptStats, setDeptStats] = useState<DeptStat[]>([]);
    const [shiftCounts, setShiftCounts] = useState<ShiftCount[]>([]);
    const [trendData, setTrendData] = useState<Trend[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [punching, setPunching] = useState(false);
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [punchLog, setPunchLog] = useState<any>(null);

    // Clock effect
    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const parsed = JSON.parse(userStr);
                setUserProfile(parsed);
            }

            const res = await api.get("/attendance/dashboard/summary");
            if (res.success) {
                setSummary(res.summary);
                setDeptStats(res.deptWiseStats);
                setShiftCounts(res.shiftCounts);
                setTrendData(res.trendData);
                setLeaderboard(res.leaderboard);
                setHolidays(res.upcomingHolidays);
                setFeed(res.punchFeed);
            }

            if (userStr) {
                const parsed = JSON.parse(userStr);
                if (parsed.employeeId) {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const logRes = await api.get(`/attendance/logs?employeeId=${parsed.employeeId}&fromDate=${todayStr}&toDate=${todayStr}`);
                    if (logRes.success && logRes.data && logRes.data.length > 0) {
                        const todayLog = logRes.data[0];
                        setPunchLog(todayLog);
                        setIsPunchedIn(!!todayLog.checkIn && !todayLog.checkOut);
                    }
                }
            }
        } catch (err) {
            console.error("Error loading dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handlePunch = async (type: "IN" | "OUT") => {
        if (!userProfile?.employeeId) {
            alert("No Employee Profile linked to this user account!");
            return;
        }

        try {
            setPunching(true);
            const payload = {
                employeeId: userProfile.employeeId,
                type,
                lat: 28.6139,
                lng: 77.2090,
                address: "Connaught Place, New Delhi",
                ip: "192.168.1.1",
                device: "Web App (Browser)",
                selfieUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"
            };

            const res = await api.post("/attendance/logs/punch", payload);
            if (res.success) {
                alert(`Successfully Punched ${type}!`);
                setIsPunchedIn(type === "IN");
                fetchData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to process punch request");
        } finally {
            setPunching(false);
        }
    };

    if (loading && !summary) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-80 flex-column gap-3" style={{ backgroundColor: "var(--bg-app)" }}>
                <div className="spinner-border" style={{ color: "var(--dark-section)" }} role="status"></div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading MIRAI Attendance...</span>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-app)", minHeight: "100vh" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>Attendance Dashboard</h2>
                    <p className="mb-0" style={{ color: "var(--text-muted)" }}>Real-time attendance tracking, shift assignments, and analytics.</p>
                </div>
                <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                    onClick={fetchData}
                >
                    <RefreshCw size={16} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Top Grid: Clock Punch Widget & KPIs */}
            <div className="row g-4 mb-4">
                {/* Clock Card */}
                <div className="col-12 col-xl-4">
                    <div
                        className="card shadow-sm h-100 border-0 p-4"
                        style={{
                            backgroundColor: "var(--dark-section)",
                            color: "#fff",
                            borderRadius: "var(--radius-lg)"
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="badge bg-light text-dark fw-bold">Live Punch Card</span>
                            <Clock size={20} style={{ color: "var(--border-color)", opacity: 0.8 }} />
                        </div>
                        <div className="text-center py-4">
                            <h1 className="display-4 fw-bold mb-1">
                                {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
                            </h1>
                            <p className="mb-4" style={{ color: "var(--border-color)", opacity: 0.7 }}>
                                {currentTime ? currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) : ""}
                            </p>

                            {userProfile?.employeeId ? (
                                <div className="d-flex flex-column gap-3 align-items-center">
                                    <p className="small mb-0" style={{ color: "var(--border-color)", opacity: 0.7 }}>
                                        Logged in as: <strong className="text-white">{userProfile.name}</strong>
                                    </p>
                                    {!isPunchedIn ? (
                                        <button
                                            className="btn btn-lg w-75 fw-bold shadow-sm"
                                            style={{ backgroundColor: "#22c55e", color: "#fff", border: "none", borderRadius: "var(--radius-md)" }}
                                            onClick={() => handlePunch("IN")}
                                            disabled={punching}
                                        >
                                            {punching ? "Punching..." : "Punch IN"}
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-lg w-75 fw-bold shadow-sm"
                                            style={{ backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "var(--radius-md)" }}
                                            onClick={() => handlePunch("OUT")}
                                            disabled={punching}
                                        >
                                            {punching ? "Punching..." : "Punch OUT"}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="p-3 rounded-3 text-start small" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "var(--border-color)" }}>
                                    <p className="mb-0"><strong>Note:</strong> Log in as an Employee to record your live punches from this terminal.</p>
                                </div>
                            )}
                        </div>
                        {punchLog && (
                            <div className="pt-3 mt-2 text-start small" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: "var(--border-color)" }}>
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Check In Time:</span>
                                    <span className="text-white">{punchLog.checkIn ? new Date(punchLog.checkIn).toLocaleTimeString() : "-"}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Check Out Time:</span>
                                    <span className="text-white">{punchLog.checkOut ? new Date(punchLog.checkOut).toLocaleTimeString() : "-"}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="col-12 col-xl-8">
                    <div className="row g-3 h-100">
                        {/* Present Card */}
                        <div className="col-6 col-md-4">
                            <div className="card h-100 p-3" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="small fw-semibold" style={{ color: "var(--text-muted)" }}>Present Today</span>
                                    <div className="p-2 rounded" style={{ backgroundColor: "#e2fbe8", color: "#16a34a" }}>
                                        <UserCheck size={20} />
                                    </div>
                                </div>
                                <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>{summary?.present || 0}</h2>
                                <p className="small mb-0 fw-bold" style={{ color: "#16a34a" }}>
                                    {summary?.presentPercent || 0}% present rate
                                </p>
                            </div>
                        </div>

                        {/* Late Card */}
                        <div className="col-6 col-md-4">
                            <div className="card h-100 p-3" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="small fw-semibold" style={{ color: "var(--text-muted)" }}>Late Arrivals</span>
                                    <div className="p-2 rounded" style={{ backgroundColor: "#fffbeb", color: "#d97706" }}>
                                        <AlertTriangle size={20} />
                                    </div>
                                </div>
                                <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>{summary?.late || 0}</h2>
                                <p className="small mb-0" style={{ color: "var(--text-muted)" }}>Requires grace review</p>
                            </div>
                        </div>

                        {/* Absent Card */}
                        <div className="col-6 col-md-4">
                            <div className="card h-100 p-3" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="small fw-semibold" style={{ color: "var(--text-muted)" }}>Absent</span>
                                    <div className="p-2 rounded" style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
                                        <UserMinus size={20} />
                                    </div>
                                </div>
                                <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>{summary?.absent || 0}</h2>
                                <p className="small mb-0" style={{ color: "var(--text-muted)" }}>Unapproved absences</p>
                            </div>
                        </div>

                        {/* On Leave Card */}
                        <div className="col-6 col-md-4">
                            <div className="card h-100 p-3" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="small fw-semibold" style={{ color: "var(--text-muted)" }}>On Leave</span>
                                    <div className="p-2 rounded" style={{ backgroundColor: "rgba(4,4,4,0.06)", color: "var(--dark-section)" }}>
                                        <Calendar size={20} />
                                    </div>
                                </div>
                                <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>{summary?.onLeave || 0}</h2>
                                <p className="small mb-0" style={{ color: "var(--text-muted)" }}>Approved requests</p>
                            </div>
                        </div>

                        {/* WFH Card */}
                        <div className="col-6 col-md-4">
                            <div className="card h-100 p-3" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="small fw-semibold" style={{ color: "var(--text-muted)" }}>WFH / Remote</span>
                                    <div className="p-2 rounded" style={{ backgroundColor: "#ecfeff", color: "#0891b2" }}>
                                        <MapPin size={20} />
                                    </div>
                                </div>
                                <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>{summary?.wfh || 0}</h2>
                                <p className="small mb-0" style={{ color: "var(--text-muted)" }}>Logged remotely</p>
                            </div>
                        </div>

                        {/* Total Headcount Card */}
                        <div className="col-6 col-md-4">
                            <div className="card h-100 p-3" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="small fw-semibold" style={{ color: "var(--text-muted)" }}>Total Roster</span>
                                    <div className="p-2 rounded" style={{ backgroundColor: "rgba(4,4,4,0.06)", color: "var(--dark-section)" }}>
                                        <User size={20} />
                                    </div>
                                </div>
                                <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>{summary?.total || 0}</h2>
                                <p className="small mb-0" style={{ color: "var(--text-muted)" }}>Active roster count</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs Grid */}
            <div className="row g-4 mb-4">
                {/* 7-day Trend Area Chart */}
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 className="fw-bold mb-1" style={{ color: "var(--text-main)" }}>7-Day Attendance Trend</h5>
                                <p className="small mb-0" style={{ color: "var(--text-muted)" }}>Track employee present rate over the past week.</p>
                            </div>
                            <div className="d-flex align-items-center gap-1 small fw-bold" style={{ color: "var(--dark-section)" }}>
                                <TrendingUp size={16} />
                                <span>+2.4% avg</span>
                            </div>
                        </div>
                        <div style={{ width: "100%", height: 260 }}>
                            <ResponsiveContainer>
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--dark-section)" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="var(--dark-section)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                    <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "12px", backgroundColor: "var(--bg-card)" }} />
                                    <Area type="monotone" dataKey="percent" name="Present %" stroke="var(--dark-section)" strokeWidth={2} fillOpacity={1} fill="url(#colorPercent)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Shift Donut Chart / Shift roster allocation count list */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                        <h5 className="fw-bold mb-3" style={{ color: "var(--text-main)" }}>Shift Distribution</h5>
                        <div className="d-flex flex-column gap-3">
                            {shiftCounts.map((shift, idx) => (
                                <div key={idx} className="p-3 rounded border" style={{ backgroundColor: "var(--bg-app)", borderColor: "var(--border-color)" }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="d-inline-block rounded-circle" style={{ width: "12px", height: "12px", backgroundColor: shift.color }}></span>
                                            <span className="fw-semibold small" style={{ color: "var(--text-primary)" }}>{shift.name}</span>
                                        </div>
                                        <span className="badge bg-secondary rounded-pill">{shift.count} emps</span>
                                    </div>
                                    <div className="progress" style={{ height: "6px" }}>
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{
                                                width: `${summary?.total ? (shift.count / summary.total) * 100 : 0}%`,
                                                backgroundColor: shift.color
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Departmentwise, Leaderboard, Holidays, Live Feed */}
            <div className="row g-4">
                {/* Department Wise Bar Chart */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                        <h5 className="fw-bold mb-3" style={{ color: "var(--text-main)" }}>Department-wise Presence</h5>
                        <div style={{ width: "100%", height: 260 }}>
                            <ResponsiveContainer>
                                <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis dataKey="department" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                    <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                    <Tooltip formatter={(value) => [`${value}%`, 'Present Rate']} contentStyle={{ borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "12px", backgroundColor: "var(--bg-card)" }} />
                                    <Bar dataKey="percent" name="Present %" radius={[4, 4, 0, 0]}>
                                        {deptStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.percent > 80 ? "var(--dark-section)" : entry.percent > 50 ? "#d97706" : "#dc2626"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Leaderboard & Holidays */}
                <div className="col-12 col-lg-6">
                    <div className="row g-4 h-100">
                        {/* Late/Absent Leaderboard */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                                <h5 className="fw-bold mb-3" style={{ color: "var(--text-main)" }}>Late/Absent Leaderboard (30d)</h5>
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover mb-0">
                                        <thead>
                                            <tr style={{ color: "var(--text-muted)", fontSize: "0.8rem", borderBottom: "1px solid var(--border-color)" }}>
                                                <th className="py-2">Employee</th>
                                                <th className="py-2">Code</th>
                                                <th className="py-2">Department</th>
                                                <th className="py-2">Late</th>
                                                <th className="py-2">Absent</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-3 small" style={{ color: "var(--text-muted)" }}>No record infractions in last 30 days.</td>
                                                </tr>
                                            ) : (
                                                leaderboard.map((item, idx) => (
                                                    <tr key={idx} className="small" style={{ borderBottom: "1px solid var(--border-color)" }}>
                                                        <td className="py-2"><strong>{item.name}</strong></td>
                                                        <td className="py-2">{item.empCode}</td>
                                                        <td className="py-2">{item.department}</td>
                                                        <td className="py-2"><span className="badge bg-warning-subtle text-warning">{item.lateCount}</span></td>
                                                        <td className="py-2"><span className="badge bg-danger-subtle text-danger">{item.absentCount}</span></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Holidays */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                                <h5 className="fw-bold mb-3" style={{ color: "var(--text-main)" }}>Upcoming Holidays</h5>
                                <div className="d-flex flex-column gap-2">
                                    {holidays.length === 0 ? (
                                        <p className="small mb-0" style={{ color: "var(--text-muted)" }}>No upcoming holidays scheduled.</p>
                                    ) : (
                                        holidays.map((h, idx) => (
                                            <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded border" style={{ backgroundColor: "var(--bg-app)", borderColor: "var(--border-color)" }}>
                                                <div>
                                                    <h6 className="mb-0 fw-bold small text-dark">{h.name}</h6>
                                                    <span className="small" style={{ color: "var(--text-muted)" }}>{new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <span className="badge text-uppercase small" style={{ backgroundColor: "rgba(4,4,4,0.06)", color: "var(--dark-section)" }}>{h.type}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Punch Feed */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                        <h5 className="fw-bold mb-3" style={{ color: "var(--text-main)" }}>Live Punch Feed</h5>
                        <div className="d-flex flex-column gap-3">
                            {feed.length === 0 ? (
                                <p className="text-center py-4 mb-0 small" style={{ color: "var(--text-muted)" }}>No punch activities reported today yet.</p>
                            ) : (
                                feed.map((item, idx) => (
                                    <div key={idx} className="d-flex justify-content-between align-items-center pb-2" style={{ borderBottom: "1px solid var(--border-color)" }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center border" style={{ width: "40px", height: "40px", backgroundColor: "var(--bg-app)", borderColor: "var(--border-color)" }}>
                                                <User size={20} style={{ color: "var(--text-muted)" }} />
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold small text-dark">{item.name} ({item.empCode})</h6>
                                                <div className="d-flex gap-2 small align-items-center mt-1" style={{ color: "var(--text-muted)" }}>
                                                    <span className={`badge ${item.action === 'Checked In' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} small`}>{item.action}</span>
                                                    <span>•</span>
                                                    <span className="d-flex align-items-center gap-1"><MapPin size={12} /> {item.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <span className="fw-bold small text-dark">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
