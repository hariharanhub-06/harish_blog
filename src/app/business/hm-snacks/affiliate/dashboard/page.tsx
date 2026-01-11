"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingBag,
    DollarSign,
    TrendingUp,
    LogOut,
    RefreshCw,
    Copy,
    ShieldCheck,
    Star,
    Award,
    ChevronRight,
    User,
    MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
    fullName: string;
    couponCode: string;
    status: string;
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    currentTier: string;
    commissionRate: number;
    upiId: string;
}

export default function AffiliateDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchStats = async () => {
        const id = localStorage.getItem("affiliate_id");
        if (!id) {
            router.push("/business/hm-snacks/affiliate/login");
            return;
        }

        setRefreshing(true);
        try {
            const res = await fetch(`/api/affiliate/stats?id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                localStorage.clear();
                router.push("/business/hm-snacks/affiliate/login");
            }
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/business/hm-snacks/affiliate/login");
    };

    const copyCode = () => {
        if (stats?.couponCode) {
            navigator.clipboard.writeText(stats.couponCode);
            alert("Coupon code copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <RefreshCw className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-gray-900 pb-20">
            {/* Top Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                            <Star size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight leading-tight">HM Partners</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Affiliate Dashboard</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 hover:text-red-500 rounded-xl font-bold text-sm transition-all"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 mt-10 space-y-8">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-orange-600 to-pink-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-orange-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                Welcome Back, {stats.fullName.split(' ')[0]}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                                Keep Growing <br />Your Earnings!
                            </h2>
                        </div>

                        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Your Unique Code</p>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-black italic tracking-tighter">{stats.couponCode}</span>
                                <button
                                    onClick={copyCode}
                                    className="p-3 bg-white text-orange-600 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                >
                                    <Copy size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<ShoppingBag className="text-blue-500" />}
                        label="Total Orders"
                        value={stats.totalOrders}
                        sub="Successful referrals"
                        color="bg-blue-50"
                    />
                    <StatCard
                        icon={<DollarSign className="text-emerald-500" />}
                        label="Earnings"
                        value={`₹${stats.totalCommission.toFixed(0)}`}
                        sub="Total commission"
                        color="bg-emerald-50"
                    />
                    <StatCard
                        icon={<TrendingUp className="text-purple-500" />}
                        label="Current Tier"
                        value={stats.currentTier}
                        sub={`${stats.commissionRate}% Commission`}
                        color="bg-purple-50"
                    />
                    <StatCard
                        icon={<ShieldCheck className="text-orange-500" />}
                        label="Account Status"
                        value={stats.status}
                        sub="Verified Partner"
                        color="bg-orange-50"
                    />
                </div>

                {/* Secondary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payout Details */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-gray-900">Payout Details</h3>
                            <button
                                onClick={fetchStats}
                                disabled={refreshing}
                                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-orange-500 transition-all"
                            >
                                <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Registered UPI ID</p>
                                        <p className="text-lg font-black text-gray-900">{stats.upiId}</p>
                                    </div>
                                </div>
                                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">Verified</span>
                            </div>

                            <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shrink-0">
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 mb-1">Weekly Payout Cycle</h4>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                            Your earnings are calculated and sent to your UPI ID every Monday. Minimum payout threshold is ₹500.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help & Support */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-pink-50 rounded-3xl flex items-center justify-center text-pink-500">
                                <MessageCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Need Help?</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Have questions about your earnings or need marketing materials? Our affiliate support team is here for you.
                            </p>
                        </div>

                        <a
                            href="https://chat.whatsapp.com/K0tb3d13w77CIcaW7FRU3t"
                            target="_blank"
                            className="mt-8 w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all group"
                        >
                            Affiliate Group
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, sub, color }: { icon: any, label: string, value: any, sub: string, color: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4"
        >
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <h4 className="text-3xl font-black text-gray-900 mb-1">{value}</h4>
                <p className="text-xs font-bold text-gray-300">{sub}</p>
            </div>
        </motion.div>
    );
}
