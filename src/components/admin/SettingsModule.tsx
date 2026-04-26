"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Shield, Smartphone, Monitor, Globe, Trash2, LogOut, RefreshCw, CheckCircle2, XCircle, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NEXT_PUBLIC_VAPID_KEY } from "@/lib/webpush";

interface Session {
    id: string;
    userEmail: string;
    deviceName: string;
    browser: string;
    os: string;
    ipAddress: string | null;
    lastActive: string;
    createdAt: string;
}

export default function SettingsModule() {
    const { user, logout } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isPushEnrolling, setIsPushEnrolling] = useState(false);
    const [pushStatus, setPushStatus] = useState<"unsupported" | "default" | "granted" | "denied">("default");

    const currentSessionId = typeof window !== 'undefined' ? localStorage.getItem('admin_sessionId') : null;
    const hasTrustedToken = typeof window !== 'undefined' ? !!localStorage.getItem('admin_deviceToken') : false;

    const fetchSessions = async () => {
        setIsRefreshing(true);
        try {
            const [sessRes, devRes] = await Promise.all([
                fetch("/api/admin/sessions"),
                fetch("/api/admin/devices")
            ]);
            
            if (sessRes.ok) {
                const data = await sessRes.json();
                setSessions(data);
            }
            if (devRes.ok) {
                const devData = await devRes.json();
                setTrustedDevices(devData);
            }
        } catch (error) {
            console.error("Failed to fetch security data", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSessions();

        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPushStatus(Notification.permission);
        } else {
            setPushStatus("unsupported");
        }
    }, []);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
      
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
      
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const handleEnablePush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        
        setIsPushEnrolling(true);
        try {
            const swRegistration = await navigator.serviceWorker.register('/sw.js');
            const permission = await window.Notification.requestPermission();
            setPushStatus(permission);

            if (permission === 'granted') {
                const subscription = await swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(NEXT_PUBLIC_VAPID_KEY)
                });

                await fetch("/api/admin/push", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subscription })
                });
                
                alert("Push Notifications securely enabled for this device!");
            } else {
                alert("Notification permissions denied by user or OS.");
            }
        } catch (error) {
            console.error("Failed to setup push subs", error);
            alert("Error enabling push notifications. Check browser settings.");
        } finally {
            setIsPushEnrolling(false);
        }
    };

    const handleEnrollDevice = async () => {
        setIsEnrolling(true);
        try {
            const ua = window.navigator.userAgent;
            let browserName = "Web Browser";
            if (ua.includes("Chrome")) browserName = "Chrome";
            else if (ua.includes("Safari")) browserName = "Safari";
            else if (ua.includes("Firefox")) browserName = "Firefox";

            let osName = "Unknown OS";
            if (ua.includes("Win")) osName = "Windows";
            else if (ua.includes("Mac")) osName = "MacOS";
            else if (ua.includes("Linux")) osName = "Linux";
            else if (ua.includes("Android")) osName = "Android";
            else if (ua.includes("like Mac")) osName = "iOS";

            const isMobile = /Mobi|Android/i.test(ua);
            const deviceType = isMobile ? "Mobile App" : "Desktop App";

            const res = await fetch("/api/admin/devices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deviceName: `Admin Portal (${deviceType})`,
                    browser: browserName,
                    os: osName
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.rawToken) {
                    localStorage.setItem("admin_deviceToken", data.rawToken);
                    fetchSessions(); // Refresh list to show new device
                }
            }
        } catch (error) {
            console.error("Failed to enroll device", error);
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleRevokeDevice = async (id: string, isCurrentToken: boolean) => {
        setRevokingId(id);
        try {
            const res = await fetch(`/api/admin/devices/${id}`, { method: "DELETE" });
            if (res.ok) {
                setTrustedDevices(trustedDevices.filter(d => d.id !== id));
                if (isCurrentToken) {
                    localStorage.removeItem("admin_deviceToken");
                }
            }
        } catch (error) {
            console.error("Failed to revoke device", error);
        } finally {
            setRevokingId(null);
        }
    };

    const handleRevoke = async (id: string) => {
        setRevokingId(id);
        try {
            const res = await fetch(`/api/admin/sessions?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                if (id === currentSessionId) {
                    logout();
                } else {
                    setSessions(sessions.filter(s => s.id !== id));
                }
            }
        } catch (error) {
            console.error("Failed to revoke session", error);
        } finally {
            setRevokingId(null);
        }
    };

    const handleLogoutAll = async () => {
        if (!confirm("Are you sure you want to logout from all devices? This will also logout your current session.")) return;

        try {
            const res = await fetch("/api/admin/sessions?action=logout-all", { method: "DELETE" });
            if (res.ok) {
                logout();
            }
        } catch (error) {
            console.error("Failed to logout all", error);
        }
    };

    const getDeviceIcon = (os: string) => {
        const lowerOs = os?.toLowerCase() || "";
        if (lowerOs.includes("windows") || lowerOs.includes("mac") || lowerOs.includes("linux")) return Monitor;
        if (lowerOs.includes("android") || lowerOs.includes("ios") || lowerOs.includes("iphone")) return Smartphone;
        return Globe;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading protection layer...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Shield className="text-primary" size={32} />
                        Security Settings
                    </h2>
                    <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Manage your active sessions and devices</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchSessions}
                        disabled={isRefreshing}
                        className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary/20 hover:text-primary transition-all disabled:opacity-50"
                        title="Refresh sessions"
                    >
                        <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={handleLogoutAll}
                        className="px-6 py-3 rounded-2xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100 shadow-sm"
                    >
                        <LogOut size={16} />
                        Logout All Devices
                    </button>
                </div>
            </div>

            {/* Session List */}
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        📱 Active Sessions
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">{sessions.length}</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed max-w-2xl uppercase tracking-wider">
                        Each entry represents a browser or app instance currently logged in as <span className="text-gray-900 italic lowercase">{user?.email}</span>.
                    </p>
                </div>

                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {sessions.map((session) => {
                            const Icon = getDeviceIcon(session.os);
                            const isCurrent = session.id === currentSessionId;

                            return (
                                <motion.div
                                    key={session.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-6 rounded-3xl border ${isCurrent ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-gray-50/50 border-gray-100'} flex items-center justify-between group hover:shadow-md transition-all`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${isCurrent ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-gray-900">{session.deviceName}</span>
                                                {isCurrent && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-sm">
                                                        <CheckCircle2 size={10} />
                                                        This Device
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <span>{session.browser} on {session.os}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span>{session.ipAddress || 'Unknown IP'}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span>Active {new Date(session.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRevoke(session.id)}
                                        disabled={revokingId === session.id}
                                        className={`p-3 rounded-2xl transition-all ${isCurrent ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
                                        title={isCurrent ? "Logout from this device" : "Force logout device"}
                                    >
                                        {revokingId === session.id ? (
                                            <RefreshCw size={18} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Trusted Devices (Passwordless Auth) */}
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            🔑 Passwordless Devices
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black">{trustedDevices.length} Enrolled</span>
                        </h3>
                        <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-wider">
                            Enrolled mobile apps and devices can access the Admin Portal natively without passwords. 
                            Turn your web portal into an "Always-On App" by adding it to your home screen and trusting this device!
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                        {pushStatus !== "granted" && pushStatus !== "unsupported" && (
                            <button
                                onClick={handleEnablePush}
                                disabled={isPushEnrolling}
                                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2 border border-blue-100 shadow-sm disabled:opacity-50"
                            >
                                {isPushEnrolling ? <RefreshCw size={16} className="animate-spin" /> : <BellRing size={16} />}
                                Enable Notifications
                            </button>
                        )}
                        {!hasTrustedToken && (
                            <button
                                onClick={handleEnrollDevice}
                                disabled={isEnrolling}
                                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 border border-emerald-100 shadow-sm disabled:opacity-50"
                            >
                                {isEnrolling ? <RefreshCw size={16} className="animate-spin" /> : <Smartphone size={16} />}
                                Trust This App
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {trustedDevices.length === 0 && (
                            <div className="text-center p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No devices have been enrolled for passwordless access yet.</p>
                            </div>
                        )}
                        {trustedDevices.map((device) => {
                            const Icon = getDeviceIcon(device.os);
                            // We don't have a strict match, but we can assume if hasTrustedToken is true and we just enrolled it, 
                            // we'll just allow revocation which also wipes local storage.
                            const isPotentiallyCurrent = hasTrustedToken && device.os.includes(currentSessionId ? "!" : ""); // simplified

                            return (
                                <motion.div
                                    key={device.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-6 rounded-3xl border bg-gray-50/50 border-gray-100 flex items-center justify-between group hover:shadow-md transition-all`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl bg-white text-emerald-500 shadow-sm border border-emerald-100`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-gray-900">{device.deviceName}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <span>{device.browser} on {device.os}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span>Authorized: {new Date(device.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span>Last Used: {device.lastUsedAt ? new Date(device.lastUsedAt).toLocaleDateString() : 'Never'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRevokeDevice(device.id, isPotentiallyCurrent)}
                                        disabled={revokingId === device.id}
                                        className={`p-3 rounded-2xl transition-all text-gray-300 hover:text-red-500 hover:bg-red-50`}
                                        title="Revoke Passwordless Access"
                                    >
                                        {revokingId === device.id ? (
                                            <RefreshCw size={18} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
                    <Shield size={24} />
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-black text-orange-900 uppercase tracking-widest leading-none">Global Security Protocol</h4>
                    <p className="text-xs font-bold text-orange-700/80 leading-relaxed uppercase tracking-wider">
                        Revoking a session will immediately invalidate access for that specific device. If you suspect unauthorized access, use the "Logout All Devices" button and change your password immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}
