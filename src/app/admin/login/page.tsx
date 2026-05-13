"use client";

import { useState, useEffect, useRef } from "react";
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Layout, ArrowRight, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const router = useRouter();
    const emailInputRef = useRef<HTMLInputElement>(null);

    // Configure Firebase persistence once on mount (prevents first-click timeout)
    useEffect(() => {
        setPersistence(auth, browserSessionPersistence).catch(console.error);
    }, []);

    // System theme sync
    useEffect(() => {
        const root = window.document.documentElement;
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, []);

    // Trusted Device Passwordless Bypass
    useEffect(() => {
        const checkDeviceToken = async () => {
            const deviceToken = localStorage.getItem("admin_deviceToken");
            if (!deviceToken) return;

            setLoading(true);
            try {
                const res = await fetch("/api/admin/auth/device-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ deviceToken })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        router.push("/admin/dashboard");
                    }
                } else {
                    localStorage.removeItem("admin_deviceToken");
                }
            } catch (err) {
                console.error("Device token login failed", err);
            } finally {
                setLoading(false);
            }
        };

        checkDeviceToken();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin/dashboard");
        } catch (err: any) {
            setError("Invalid credentials. Please verify your email and password.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async () => {
        if (!email.trim()) {
            emailInputRef.current?.focus();
            setError("Enter your email address above first, then click Forgot.");
            return;
        }
        setForgotLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage("Password reset email sent! Check your inbox.");
        } catch (err: any) {
            setError("Failed to send reset email. Please check your email address.");
            console.error(err);
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#121212] flex items-center justify-center p-6 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px]"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4"
                    >
                        <Layout size={24} className="text-white" strokeWidth={2.5} />
                    </motion.div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Admin Portal</h1>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest text-[10px]">Management Control System</p>
                </div>

                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 md:p-10 transition-colors duration-300">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Please enter your administrative credentials</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-3 mb-6 text-xs font-bold border border-red-100 dark:border-red-500/20"
                            >
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-lg flex items-center gap-3 mb-6 text-xs font-bold border border-green-100 dark:border-green-500/20"
                            >
                                <CheckCircle size={16} className="shrink-0" />
                                <span>{successMessage}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    ref={emailInputRef}
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@hariharanhub.com"
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5 pl-12 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Password</label>
                                <button
                                    type="button"
                                    onClick={handleForgot}
                                    disabled={forgotLoading}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
                                >
                                    {forgotLoading ? "Sending..." : "Forgot?"}
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5 pl-12 pr-12 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                disabled={loading}
                                className="w-full bg-primary text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In to Dashboard</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                </div>

                {/* Footer Links */}
                <div className="mt-8 flex justify-center gap-6">
                    <Link href="/" className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-primary transition-colors">Main Site</Link>
                    <Link href="/privacy" className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-primary transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-primary transition-colors">Security</Link>
                </div>
            </motion.div>
        </div>
    );
}
