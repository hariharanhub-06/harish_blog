"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Shield, Smartphone, Monitor, Globe, Trash2, LogOut, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

    const currentSessionId = typeof window !== 'undefined' ? localStorage.getItem('admin_sessionId') : null;

    const fetchSessions = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/admin/sessions");
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

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
