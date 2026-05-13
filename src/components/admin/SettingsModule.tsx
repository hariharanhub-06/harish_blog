"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Shield, Smartphone, Monitor, Globe, Trash2, LogOut, RefreshCw, CheckCircle2, BellRing, Eye, EyeOff, KeyRound, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NEXT_PUBLIC_VAPID_KEY } from "@/lib/vapid";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
    const [fetchError, setFetchError] = useState("");
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isPushEnrolling, setIsPushEnrolling] = useState(false);
    const [pushStatus, setPushStatus] = useState<"unsupported" | "default" | "granted" | "denied">("default");
    const [pushMessage, setPushMessage] = useState("");

    // Change password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState("");

    const currentSessionId = typeof window !== 'undefined' ? localStorage.getItem('admin_sessionId') : null;
    const hasTrustedToken = typeof window !== 'undefined' ? !!localStorage.getItem('admin_deviceToken') : false;

    const fetchSessions = async () => {
        setIsRefreshing(true);
        setFetchError("");
        const sid = localStorage.getItem('admin_sessionId') || '';
        try {
            const [sessRes, devRes] = await Promise.all([
                fetch("/api/admin/sessions", { headers: { 'X-Session-Id': sid } }),
                fetch("/api/admin/devices", { headers: { 'X-Session-Id': sid } })
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
            setFetchError("Failed to load security data. Please refresh.");
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
            .replace(/-/g, '+')
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
        setPushMessage("");
        const sid = localStorage.getItem('admin_sessionId') || '';
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
                    headers: {
                        "Content-Type": "application/json",
                        "X-Session-Id": sid
                    },
                    body: JSON.stringify({ subscription })
                });

                setPushMessage("Push notifications enabled for this device!");
            } else {
                setPushMessage("Notification permissions denied. Please allow in browser settings.");
            }
        } catch (error) {
            console.error("Failed to setup push subs", error);
            setPushMessage("Error enabling push notifications. Check browser settings.");
        } finally {
            setIsPushEnrolling(false);
        }
    };

    const handleEnrollDevice = async () => {
        setIsEnrolling(true);
        const sid = localStorage.getItem('admin_sessionId') || '';
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
                headers: {
                    "Content-Type": "application/json",
                    "X-Session-Id": sid
                },
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
                    fetchSessions();
                }
            }
        } catch (error) {
            console.error("Failed to enroll device", error);
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleRevokeDevice = async (id: string) => {
        setRevokingId(id);
        const sid = localStorage.getItem('admin_sessionId') || '';
        try {
            const res = await fetch(`/api/admin/devices/${id}`, {
                method: "DELETE",
                headers: { "X-Session-Id": sid }
            });
            if (res.ok) {
                setTrustedDevices(trustedDevices.filter(d => d.id !== id));
                // Always clear local token when revoking any device (safest approach)
                if (hasTrustedToken) {
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
            const sid = localStorage.getItem('admin_sessionId') || '';
            const res = await fetch(`/api/admin/sessions?id=${id}`, { method: "DELETE", headers: { 'X-Session-Id': sid } });
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
            const sid = localStorage.getItem('admin_sessionId') || '';
            const res = await fetch("/api/admin/sessions?action=logout-all", { method: "DELETE", headers: { 'X-Session-Id': sid } });
            if (res.ok) {
                logout();
            }
        } catch (error) {
            console.error("Failed to logout all", error);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdError("");
        setPwdSuccess("");

        if (newPassword !== confirmPassword) {
            setPwdError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setPwdError("New password must be at least 6 characters.");
            return;
        }

        setPwdLoading(true);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser || !user?.email) throw new Error("Not authenticated");

            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);

            setPwdSuccess("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                setPwdError("Current password is incorrect.");
            } else if (err.code === "auth/weak-password") {
                setPwdError("New password is too weak. Use at least 6 characters.");
            } else {
                setPwdError("Failed to change password. Please try again.");
            }
            console.error(err);
        } finally {
            setPwdLoading(false);
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
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Shield className="text-primary" size={32} />
                        Security Settings
                    </h2>
                    <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Manage your active sessions, devices and password</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchSessions}
                        disabled={isRefreshing}
                        className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-primary/20 hover:text-primary transition-all disabled:opacity-50"
                        aria-label="Refresh sessions"
                    >
                        <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={handleLogoutAll}
                        className="px-6 py-3 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center gap-2 border border-red-100 dark:border-red-500/20 shadow-sm"
                    >
                        <LogOut size={16} />
                        Logout All Devices
                    </button>
                </div>
            </div>

            {fetchError && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold">
                    <AlertCircle size={16} />
                    {fetchError}
                </div>
            )}

            {/* Change Password Card */}
            <div className="bg-white dark:bg-[#1e1e1e] p-6 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <KeyRound size={20} className="text-primary" /> Change Password
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Update your admin portal password</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    {pwdError && (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold">
                            <AlertCircle size={14} /> {pwdError}
                        </div>
                    )}
                    {pwdSuccess && (
                        <div className="bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl p-3 flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold">
                            <CheckCircle2 size={14} /> {pwdSuccess}
                        </div>
                    )}

                    {[
                        { label: "Current Password", value: currentPassword, setter: setCurrentPassword, show: showCurrentPwd, toggle: () => setShowCurrentPwd(v => !v) },
                        { label: "New Password", value: newPassword, setter: setNewPassword, show: showNewPwd, toggle: () => setShowNewPwd(v => !v) },
                        { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword, show: showNewPwd, toggle: () => setShowNewPwd(v => !v) },
                    ].map(({ label, value, setter, show, toggle }, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</label>
                            <div className="relative">
                                <input
                                    type={show ? "text" : "password"}
                                    value={value}
                                    onChange={e => setter(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-3 pr-10 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={toggle}
                                    aria-label={show ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={pwdLoading}
                        className="w-full py-3 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {pwdLoading ? <><RefreshCw size={14} className="animate-spin" /> Changing...</> : "Change Password"}
                    </button>
                </form>
            </div>

            {/* Session List */}
            <div className="bg-white dark:bg-[#1e1e1e] p-6 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                        📱 Active Sessions
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">{sessions.length}</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed max-w-2xl uppercase tracking-wider">
                        Each entry represents a browser or app instance currently logged in as <span className="text-gray-900 dark:text-gray-100 italic lowercase">{user?.email}</span>.
                    </p>
                </div>

                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {sessions.length === 0 && (
                            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No active sessions found.</p>
                            </div>
                        )}
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
                                    className={`p-6 rounded-3xl border ${isCurrent ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-700'} flex items-center justify-between group hover:shadow-md transition-all`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${isCurrent ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-gray-800 text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700'}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-gray-900 dark:text-white">{session.deviceName}</span>
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
                                        className="p-3 rounded-2xl transition-all text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        aria-label={isCurrent ? "Logout from this device" : "Force logout device"}
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
            <div className="bg-white dark:bg-[#1e1e1e] p-6 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                            🔑 Passwordless Devices
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black">{trustedDevices.length} Enrolled</span>
                        </h3>
                        <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-wider">
                            Enrolled devices can access the Admin Portal without passwords.
                            Add the portal to your home screen and trust this device for seamless access!
                        </p>
                        {pushMessage && (
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{pushMessage}</p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                        {pushStatus !== "granted" && pushStatus !== "unsupported" && (
                            <button
                                onClick={handleEnablePush}
                                disabled={isPushEnrolling}
                                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2 border border-blue-100 dark:border-blue-500/20 shadow-sm disabled:opacity-50"
                            >
                                {isPushEnrolling ? <RefreshCw size={16} className="animate-spin" /> : <BellRing size={16} />}
                                Enable Notifications
                            </button>
                        )}
                        {!hasTrustedToken && (
                            <button
                                onClick={handleEnrollDevice}
                                disabled={isEnrolling}
                                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-black text-xs uppercase tracking-widest hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-500/20 shadow-sm disabled:opacity-50"
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
                            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No devices enrolled for passwordless access yet.</p>
                            </div>
                        )}
                        {trustedDevices.map((device) => {
                            const Icon = getDeviceIcon(device.os);

                            return (
                                <motion.div
                                    key={device.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-6 rounded-3xl border bg-gray-50/50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 text-emerald-500 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{device.deviceName}</span>
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
                                        onClick={() => handleRevokeDevice(device.id)}
                                        disabled={revokingId === device.id}
                                        className="p-3 rounded-2xl transition-all text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        aria-label="Revoke passwordless access"
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
            <div className="bg-orange-50/50 dark:bg-orange-500/5 p-8 rounded-[2rem] border border-orange-100 dark:border-orange-500/20 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-500/20 text-orange-600">
                    <Shield size={24} />
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-black text-orange-900 dark:text-orange-400 uppercase tracking-widest leading-none">Global Security Protocol</h4>
                    <p className="text-xs font-bold text-orange-700/80 dark:text-orange-400/70 leading-relaxed uppercase tracking-wider">
                        Revoking a session immediately invalidates access for that device. If you suspect unauthorized access, use "Logout All Devices" and change your password immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}
