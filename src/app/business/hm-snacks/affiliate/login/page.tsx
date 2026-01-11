"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogIn, Smartphone, Key, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AffiliateLoginPage() {
    const [mobile, setMobile] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/affiliate/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, couponCode }),
            });

            const data = await res.json();

            if (res.ok) {
                // Store affiliate ID in localStorage for the session
                localStorage.setItem("affiliate_id", data.affiliate.id);
                localStorage.setItem("affiliate_name", data.affiliate.fullName);
                router.push("/business/hm-snacks/affiliate/dashboard");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center px-4">
            <Link
                href="/business/hm-snacks/affiliate"
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-all font-bold"
            >
                <ArrowLeft size={20} /> Back to info
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full -mr-16 -mt-16 blur-3xl" />

                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-orange-200">
                            <LogIn size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Affiliate Login</h1>
                        <p className="text-gray-400 font-medium">Access your partner dashboard</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Registered Mobile</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input
                                    type="tel"
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="10-digit number"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Affiliate Coupon Code</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="e.g. HMS12345"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all uppercase"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-200 hover:shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50"
                        >
                            {loading ? "Authenticating..." : "Login to Dashboard"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm font-medium">
                            Don't have an account?{" "}
                            <Link href="/business/hm-snacks/affiliate#registration-form" className="text-orange-500 font-bold hover:underline">
                                Register now
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
