"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Clock, Play, Square, MapPin, CheckCircle, Wifi, WifiOff, RefreshCw, AlertTriangle, Coffee } from "lucide-react";

export default function EmployeeHome() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [user, setUser] = useState<any>(null);
    const [todayLog, setTodayLog] = useState<any>(null);
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [activeBreak, setActiveBreak] = useState<any>(null);
    const [todayShift, setTodayShift] = useState<any>(null);
    const [weeklyHours, setWeeklyHours] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Offline queue state
    const [isOnline, setIsOnline] = useState(true);
    const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Network status listener & offline queue loader
    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsOnline(navigator.onLine);
            
            const handleOnline = () => {
                setIsOnline(true);
                syncOfflineQueue();
            };
            const handleOffline = () => setIsOnline(false);

            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);

            const savedQueue = localStorage.getItem("attendance_offline_queue");
            if (savedQueue) {
                setOfflineQueue(JSON.parse(savedQueue));
            }

            return () => {
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
            };
        }
    }, []);

    const fetchHomeData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);

            if (parsedUser.employeeId) {
                // Fetch employee details to get their default shift
                const empRes = await api.get(`/attendance/employees`);
                if (empRes.success && empRes.data) {
                    const currentEmp = empRes.data.find((e: any) => e._id === parsedUser.employeeId);
                    if (currentEmp) {
                        setTodayShift(currentEmp.shiftId);
                    }
                }

                // Fetch today's log
                const todayStr = new Date().toISOString().split("T")[0];
                const logRes = await api.get(`/attendance/logs?employeeId=${parsedUser.employeeId}&fromDate=${todayStr}&toDate=${todayStr}`);
                if (logRes.success && logRes.data && logRes.data.length > 0) {
                    const logObj = logRes.data[0];
                    setTodayLog(logObj);
                    setIsPunchedIn(!!logObj.checkIn && !logObj.checkOut);
                } else {
                    setTodayLog(null);
                    setIsPunchedIn(false);
                }

                // Fetch active break status
                const breakRes = await api.get(`/attendance/logs/break/active?employeeId=${parsedUser.employeeId}`);
                if (breakRes.success && breakRes.activeBreak) {
                    setActiveBreak(breakRes.activeBreak);
                } else {
                    setActiveBreak(null);
                }

                // Fetch last 7 days logs to calculate weekly hours
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const oneWeekAgoStr = oneWeekAgo.toISOString().split("T")[0];
                const weeklyLogsRes = await api.get(`/attendance/logs?employeeId=${parsedUser.employeeId}&fromDate=${oneWeekAgoStr}&toDate=${todayStr}`);
                if (weeklyLogsRes.success && weeklyLogsRes.data) {
                    const totalMins = weeklyLogsRes.data.reduce((sum: number, log: any) => sum + (log.workingMinutes || 0), 0);
                    setWeeklyHours(parseFloat((totalMins / 60).toFixed(1)));
                }
            }
        } catch (err) {
            console.error("Error loading employee home data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, []);

    // Sync queue helper
    const syncOfflineQueue = async () => {
        const queueStr = localStorage.getItem("attendance_offline_queue");
        if (!queueStr) return;
        const queue: any[] = JSON.parse(queueStr);
        if (queue.length === 0) return;

        alert(`Reconnected! Syncing ${queue.length} offline punch(es)...`);
        
        let successCount = 0;
        for (const item of queue) {
            try {
                const res = await api.post("/attendance/logs/punch", item.payload);
                if (res.success) {
                    successCount++;
                }
            } catch (err) {
                console.error("Error syncing offline punch:", err);
            }
        }

        // Clear queue
        localStorage.removeItem("attendance_offline_queue");
        setOfflineQueue([]);
        
        alert(`Successfully synced ${successCount} punch(es) to the server!`);
        fetchHomeData();
    };

    const handlePunch = async (type: "IN" | "OUT") => {
        if (!user?.employeeId) {
            alert("No Employee Profile linked to your user account.");
            return;
        }

        setActionLoading(true);
        try {
            // Geolocation retrieval
            let lat = 28.6139;
            let lng = 77.2090;
            let address = "Connaught Place, New Delhi";

            if (navigator.geolocation) {
                try {
                    const pos: any = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                    address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
                } catch (geoErr) {
                    console.warn("Could not get precise geolocation, using default office location", geoErr);
                }
            }

            const payload = {
                employeeId: user.employeeId,
                type,
                lat,
                lng,
                address,
                ip: "127.0.0.1", // fallback, backend overrides
                device: "Employee Mobile Web Portal",
                selfieUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"
            };

            if (!isOnline) {
                // Offline behavior: queue punch
                const newItem = {
                    id: Date.now().toString(),
                    payload,
                    timestamp: new Date().toISOString(),
                    type
                };
                const updatedQueue = [...offlineQueue, newItem];
                localStorage.setItem("attendance_offline_queue", JSON.stringify(updatedQueue));
                setOfflineQueue(updatedQueue);
                
                alert(`Offline Mode: Punch ${type} saved locally. It will sync automatically when your internet connection is restored.`);
                setIsPunchedIn(type === "IN");
                setActionLoading(false);
                return;
            }

            // Online behavior
            const res = await api.post("/attendance/logs/punch", payload);
            if (res.success) {
                alert(`Successfully Punched ${type}!`);
                setIsPunchedIn(type === "IN");
                fetchHomeData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to log punch.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleBreak = async (action: "START" | "END") => {
        if (!user?.employeeId) return;

        setActionLoading(true);
        try {
            const endpoint = action === "START" ? "/attendance/logs/break/start" : "/attendance/logs/break/end";
            const res = await api.post(endpoint, {
                employeeId: user.employeeId,
                type: "LUNCH" // Default break type
            });

            if (res.success) {
                alert(`Break ${action === "START" ? "Started" : "Ended"} successfully!`);
                fetchHomeData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to process break action.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Offline/Online Ribbon banner */}
            {!isOnline && (
                <div className="alert alert-warning d-flex align-items-center justify-content-between p-3 border-0 rounded-4 shadow-sm mb-4" style={{ backgroundColor: "#fffbeb" }}>
                    <div className="d-flex align-items-center gap-2">
                        <WifiOff className="text-warning animate-pulse-warning" size={20} />
                        <span className="small text-warning-emphasis fw-semibold">You are offline. Punches will be queued locally and synced when connection is active.</span>
                    </div>
                    <span className="badge bg-warning text-dark rounded-pill">{offlineQueue.length} queued</span>
                </div>
            )}

            {/* Dashboard stats row */}
            <div className="row g-4 mb-4">
                {/* Big Clock and FAB Card */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm p-4 text-white text-center d-flex flex-column justify-content-between rounded-4 h-100" style={{ background: "linear-gradient(135deg, #1E2A78 0%, #151F5B 100%)" }}>
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span className="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-1.5 small fw-semibold">
                                    {isOnline ? "Network Connected" : "Offline Mode"}
                                </span>
                                {isOnline ? <Wifi size={18} className="text-success" /> : <WifiOff size={18} className="text-warning" />}
                            </div>
                            <h1 className="display-3 fw-bold mb-1 tracking-tight" style={{ letterSpacing: "-0.03em" }}>
                                {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
                            </h1>
                            <p className="opacity-75 small mb-0 fw-medium">
                                {currentTime ? currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ""}
                            </p>
                        </div>

                        {/* BIG PUNCH BUTTON */}
                        <div className="my-5 d-flex justify-content-center">
                            <button
                                className="btn rounded-circle d-flex flex-column align-items-center justify-content-center shadow-lg hover-scale"
                                style={{
                                    width: "160px",
                                    height: "160px",
                                    backgroundColor: isPunchedIn ? "#EF4444" : "#10B981",
                                    border: "6px solid rgba(255, 255, 255, 0.15)",
                                    color: "white",
                                    transition: "all 0.3s ease"
                                }}
                                disabled={actionLoading}
                                onClick={() => handlePunch(isPunchedIn ? "OUT" : "IN")}
                            >
                                <Clock size={36} className="mb-2" />
                                <span className="fw-bold tracking-wider" style={{ fontSize: "1.1rem" }}>
                                    {isPunchedIn ? "PUNCH OUT" : "PUNCH IN"}
                                </span>
                                <span className="opacity-75" style={{ fontSize: "0.65rem" }}>
                                    {actionLoading ? "Processing..." : "Tap to record"}
                                </span>
                            </button>
                        </div>

                        <div className="d-flex align-items-center justify-content-center gap-2 text-white-50 small">
                            <MapPin size={14} />
                            <span className="text-truncate" style={{ maxWidth: "250px" }}>Delhi Office Geofence</span>
                        </div>
                    </div>
                </div>

                {/* Right Side widgets */}
                <div className="col-12 col-lg-6">
                    <div className="row g-4 h-100">
                        {/* Today's Shift Card */}
                        <div className="col-12 col-md-6">
                            <div className="card border-0 shadow-sm p-4 bg-white rounded-4 h-100">
                                <span className="text-muted small fw-semibold d-block mb-1">TODAY'S SHIFT</span>
                                <h4 className="fw-bold text-dark mb-3">{todayShift ? todayShift.name : "Default Shift"}</h4>
                                {todayShift ? (
                                    <div className="d-flex flex-column gap-2">
                                        <div className="d-flex justify-content-between text-muted small">
                                            <span>Starts:</span>
                                            <span className="fw-bold text-dark">{todayShift.startTime}</span>
                                        </div>
                                        <div className="d-flex justify-content-between text-muted small">
                                            <span>Ends:</span>
                                            <span className="fw-bold text-dark">{todayShift.endTime}</span>
                                        </div>
                                        <div className="d-flex justify-content-between text-muted small">
                                            <span>Grace Period:</span>
                                            <span className="fw-bold text-dark">15 mins</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted small mb-0">No specific shift assigned. Following regular 09:00 AM - 06:00 PM hours.</p>
                                )}
                            </div>
                        </div>

                        {/* Today's Status Card */}
                        <div className="col-12 col-md-6">
                            <div className="card border-0 shadow-sm p-4 bg-white rounded-4 h-100">
                                <span className="text-muted small fw-semibold d-block mb-1">TODAY'S STATUS</span>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <span
                                        className="badge rounded-pill px-3 py-1.5 fw-bold"
                                        style={{
                                            backgroundColor: todayLog?.status === "PRESENT" ? "#e2fbe8" : todayLog?.status === "LATE" ? "#fffbeb" : "#fef2f2",
                                            color: todayLog?.status === "PRESENT" ? "#16a34a" : todayLog?.status === "LATE" ? "#d97706" : "#dc2626"
                                        }}
                                    >
                                        {todayLog ? todayLog.status : "NOT RECORDED"}
                                    </span>
                                </div>
                                <div className="d-flex flex-column gap-2 small">
                                    <div className="d-flex justify-content-between text-muted">
                                        <span>First Check-In:</span>
                                        <span className="fw-bold text-dark">
                                            {todayLog?.checkIn ? new Date(todayLog.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between text-muted">
                                        <span>Last Check-Out:</span>
                                        <span className="fw-bold text-dark">
                                            {todayLog?.checkOut ? new Date(todayLog.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between text-muted">
                                        <span>Total Break:</span>
                                        <span className="fw-bold text-dark">{todayLog?.breakMinutes || 0} mins</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Hours Card */}
                        <div className="col-12 col-md-6">
                            <div className="card border-0 shadow-sm p-4 bg-white rounded-4 h-100">
                                <span className="text-muted small fw-semibold d-block mb-1">HOURS WORKED (LAST 7 DAYS)</span>
                                <h2 className="fw-bold text-dark my-2">{weeklyHours} Hrs</h2>
                                <div className="progress mb-2" style={{ height: "6px" }}>
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ width: `${Math.min((weeklyHours / 40) * 100, 100)}%`, backgroundColor: "#1E2A78" }}
                                    ></div>
                                </div>
                                <span className="text-muted small">Target: 40 hrs / week</span>
                            </div>
                        </div>

                        {/* Break Control Actions Card */}
                        <div className="col-12 col-md-6">
                            <div className="card border-0 shadow-sm p-4 bg-white rounded-4 h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <span className="text-muted small fw-semibold d-block mb-1">BREAK CONTROLS</span>
                                    <p className="text-muted small mb-0">Record lunch, tea, or personal breaks.</p>
                                </div>

                                <div className="d-flex gap-2.5 mt-3">
                                    {!activeBreak ? (
                                        <button
                                            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                            onClick={() => handleBreak("START")}
                                            disabled={actionLoading || !isPunchedIn}
                                        >
                                            <Coffee size={16} />
                                            <span className="small fw-semibold">Start Break</span>
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                            onClick={() => handleBreak("END")}
                                            disabled={actionLoading}
                                        >
                                            <Square size={14} />
                                            <span className="small fw-semibold">End Break</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offline queue items tracker (shown if items are waiting) */}
            {offlineQueue.length > 0 && (
                <div className="card border-0 shadow-sm p-4 bg-white rounded-4 mb-4">
                    <h5 className="fw-bold text-dark mb-3">Offline Operations Queue ({offlineQueue.length})</h5>
                    <div className="d-flex flex-column gap-2">
                        {offlineQueue.map((item) => (
                            <div key={item.id} className="d-flex justify-content-between align-items-center p-2.5 rounded border border-light bg-light small">
                                <div className="d-flex align-items-center gap-2.5">
                                    <span className={`badge ${item.type === 'IN' ? 'bg-success' : 'bg-danger'} rounded-pill`}>
                                        {item.type}
                                    </span>
                                    <span className="text-dark fw-bold">Punch Logged Offline</span>
                                </div>
                                <span className="text-muted">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
