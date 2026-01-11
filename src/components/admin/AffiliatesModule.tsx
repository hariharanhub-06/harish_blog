"use client";

import { useState, useEffect } from "react";
import {
    Users, CheckCircle, XCircle, Clock,
    MessageCircle, TrendingUp, DollarSign,
    Copy, ExternalLink, RefreshCw, Trash2,
    Package, Star, ShoppingBag, ShieldCheck, Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Affiliate {
    id: string;
    fullName: string;
    mobile: string;
    password?: string;
    upiId: string;
    email: string | null;
    socialLink: string | null;
    couponCode: string | null;
    referrerId: string | null;
    parentId: string | null;
    position: 'left' | 'right' | null;
    status: "Pending" | "Approved" | "Rejected";
    isActive: boolean;
    totalOrders: number;
    totalSalesAmount: number;
    totalEarnings: number;
    directEarnings: number;
    level1Earnings: number;
    level2Earnings: number;
    level3Earnings: number;
    pendingBalance: number;
    paidBalance: number;
    currentTier: string;
    createdAt: string;
    approvedAt: string | null;
}

export default function AffiliatesModule() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "active" | "all" | "payouts" | "config">("pending");
    const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
    const [config, setConfig] = useState<any>({ directSplit: 50, level1Split: 20, level2Split: 18, level3Split: 12 });
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchAffiliates = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/affiliates");
            if (res.ok) {
                const data = await res.json();
                setAffiliates(data);
            }
        } catch (error) {
            console.error("Failed to fetch affiliates", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPayouts = async () => {
        try {
            const res = await fetch("/api/admin/affiliates/payouts");
            if (res.ok) {
                const data = await res.json();
                setPayoutRequests(data);
            }
        } catch (err) {
            console.error("Failed to fetch payouts", err);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/admin/affiliates/config");
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
            }
        } catch (err) {
            console.error("Failed to fetch config", err);
        }
    };

    useEffect(() => {
        fetchAffiliates();
        fetchPayouts();
        fetchConfig();
    }, []);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        setUpdatingId(id);
        try {
            const res = await fetch("/api/admin/affiliates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action }),
            });

            if (res.ok) {
                await fetchAffiliates();
            } else {
                alert("Failed to process request");
            }
        } catch (error) {
            console.error("Error processing affiliate action", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleUpdateStats = async (id: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch("/api/admin/affiliates", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                await fetchAffiliates();
            }
        } catch (error) {
            console.error("Error updating affiliate stats", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this affiliate?")) return;

        setUpdatingId(id);
        try {
            const res = await fetch(`/api/admin/affiliates?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await fetchAffiliates();
            }
        } catch (error) {
            console.error("Error deleting affiliate", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePayoutAction = async (requestId: string, action: "approve" | "reject") => {
        setUpdatingId(requestId);
        try {
            const res = await fetch("/api/admin/affiliates/payouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action }),
            });

            if (res.ok) {
                await fetchPayouts();
                await fetchAffiliates();
            } else {
                alert("Failed to process payout");
            }
        } catch (error) {
            console.error("Error processing payout action", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingId("config");
        try {
            const res = await fetch("/api/admin/affiliates/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                alert("Configuration saved successfully!");
            } else {
                alert("Failed to save configuration");
            }
        } catch (error) {
            console.error("Error saving config", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const generateWhatsAppMessage = (affiliate: Affiliate) => {
        const groupLink = "https://chat.whatsapp.com/K0tb3d13w77CIcaW7FRU3t";
        const dashboardLink = "https://hmsnacks.in/business/hm-snacks/affiliate/login";

        const message = `🎉 Congratulations! Your HM Snacks Affiliate Application is Approved!

Welcome to the HM Snacks Partner Family! 🍪

📌 Your Official Code: ${affiliate.couponCode}
🔐 Your Login Password: ${affiliate.password}

🚀 Access Your Partner Dashboard:
${dashboardLink}
(Login with your Mobile Number & Password)

💰 Your Commission Plan:
- Direct Sales: 10%
- Level 1 Downline: 2.0%
- Level 2 Downline: 1.8%
- Level 3 Downline: 1.6%

Join our exclusive WhatsApp Partner Community:
${groupLink}

Start promoting and tracking your binary team growth today! 🚀

- Team HM Snacks`;

        return `https://wa.me/91${affiliate.mobile}?text=${encodeURIComponent(message)}`;
    };

    const filteredAffiliates = affiliates.filter(a => {
        if (activeTab === "pending") return a.status === "Pending";
        if (activeTab === "active") return a.status === "Approved";
        return true;
    });

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "Elite": return "text-orange-600 bg-orange-50 border-orange-200";
            case "Pro": return "text-pink-600 bg-pink-50 border-pink-200";
            case "Platinum": return "text-purple-600 bg-purple-50 border-purple-200";
            case "Golden": return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "Silver": return "text-gray-600 bg-gray-50 border-gray-200";
            case "Starter": return "text-blue-600 bg-blue-50 border-blue-200";
            default: return "text-gray-500 bg-gray-50 border-gray-100";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Affiliates</p>
                        <h3 className="text-3xl font-black text-gray-900">{affiliates.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-pink-50 rounded-3xl flex items-center justify-center text-pink-500">
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Orders</p>
                        <h3 className="text-3xl font-black text-gray-900">
                            {affiliates.reduce((acc, a) => acc + (a.totalOrders || 0), 0)}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Earnings Generated</p>
                        <h3 className="text-3xl font-black text-gray-900">
                            ₹{affiliates.reduce((acc, a) => acc + (a.totalEarnings || 0), 0).toFixed(0)}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Tabs and Controls */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex p-2 bg-gray-50 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "pending" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-primary"}`}
                    >
                        <Clock size={16} />
                        Pending ({affiliates.filter(a => a.status === "Pending").length})
                    </button>
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "active" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-emerald-600"}`}
                    >
                        <CheckCircle size={16} />
                        Active ({affiliates.filter(a => a.status === "Approved").length})
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-900"}`}
                    >
                        <Users size={16} />
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab("payouts")}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "payouts" ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-orange-600"}`}
                    >
                        <DollarSign size={16} />
                        Payouts ({payoutRequests.filter(p => p.status === "Pending").length})
                    </button>
                    <button
                        onClick={() => setActiveTab("config")}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "config" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-blue-600"}`}
                    >
                        <RefreshCw size={16} />
                        Split Config
                    </button>
                </div>

                <button
                    onClick={fetchAffiliates}
                    className="p-4 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all"
                    title="Refresh List"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                            <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-gray-400 font-bold">Fetching Affiliate Data...</p>
                        </div>
                    ) : activeTab === "config" ? (
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Profit Pool Split Configuration</h3>
                                <p className="text-gray-400 font-medium">Define how the calculated profit pool is distributed across levels.</p>
                            </div>

                            <form onSubmit={handleSaveConfig} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Direct Split (%)</label>
                                        <input
                                            type="number"
                                            value={config.directSplit}
                                            onChange={(e) => setConfig({ ...config, directSplit: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Level 1 Split (%)</label>
                                        <input
                                            type="number"
                                            value={config.level1Split}
                                            onChange={(e) => setConfig({ ...config, level1Split: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Level 2 Split (%)</label>
                                        <input
                                            type="number"
                                            value={config.level2Split}
                                            onChange={(e) => setConfig({ ...config, level2Split: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Level 3 Split (%)</label>
                                        <input
                                            type="number"
                                            value={config.level3Split}
                                            onChange={(e) => setConfig({ ...config, level3Split: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-600 text-center uppercase tracking-widest">
                                        Total Split: {(Number(config.directSplit) + Number(config.level1Split) + Number(config.level2Split) + Number(config.level3Split)).toFixed(0)}%
                                    </p>
                                </div>

                                <button
                                    disabled={updatingId === "config"}
                                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {updatingId === "config" ? <RefreshCw className="animate-spin" /> : <Save className="hidden" />}
                                    Save Configuration
                                </button>
                            </form>
                        </div>
                    ) : activeTab === "payouts" ? (
                        payoutRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                                <DollarSign className="w-16 h-16 text-gray-100 mb-4" />
                                <p className="text-gray-400 font-bold">No payout requests found.</p>
                            </div>
                        ) : (
                            payoutRequests.map((request) => (
                                <motion.div
                                    key={request.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                            <DollarSign size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-900">{request.affiliateName}</h4>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">UPI: {request.upiId}</p>
                                        </div>
                                    </div>

                                    <div className="text-center px-10 border-x border-gray-50">
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Request Amount</p>
                                        <p className="text-3xl font-black text-gray-900">₹{request.amount}</p>
                                    </div>

                                    <div className="flex gap-3">
                                        {request.status === "Pending" ? (
                                            <>
                                                <button
                                                    onClick={() => handlePayoutAction(request.id, "approve")}
                                                    disabled={updatingId === request.id}
                                                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                                                >
                                                    Mark Paid
                                                </button>
                                                <button
                                                    onClick={() => handlePayoutAction(request.id, "reject")}
                                                    disabled={updatingId === request.id}
                                                    className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-black text-xs uppercase hover:bg-red-100"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest ${request.status === "Approved" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                                {request.status}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )
                    ) : filteredAffiliates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                            <Users className="w-16 h-16 text-gray-100 mb-4" />
                            <p className="text-gray-400 font-bold">No affiliates found in this category.</p>
                        </div>
                    ) : (
                        filteredAffiliates.map((affiliate) => (
                            <motion.div
                                key={affiliate.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                                    {/* Name and Basic Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl">
                                                {affiliate.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                                    {affiliate.fullName}
                                                    {affiliate.status === "Approved" && (
                                                        <ShieldCheck size={20} className="text-emerald-500" />
                                                    )}
                                                </h4>
                                                <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                                    <span>{affiliate.mobile}</span>
                                                    {affiliate.email && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{affiliate.email}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                UPI: {affiliate.upiId}
                                            </span>
                                            {affiliate.socialLink && (
                                                <a
                                                    href={affiliate.socialLink}
                                                    target="_blank"
                                                    className="px-4 py-1.5 bg-blue-50 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-all border border-blue-100"
                                                >
                                                    Social Link <ExternalLink size={10} />
                                                </a>
                                            )}
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${affiliate.status === "Approved" ? "text-emerald-600 bg-emerald-50 border-emerald-100" :
                                                affiliate.status === "Rejected" ? "text-red-600 bg-red-50 border-red-100" :
                                                    "text-amber-600 bg-amber-50 border-amber-100"
                                                }`}>
                                                {affiliate.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Coupon and Tier */}
                                    {affiliate.status === "Approved" && (
                                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl min-w-[200px] border border-gray-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Coupon Code</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-black text-pink-500 italic tracking-tighter">
                                                    {affiliate.couponCode}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(affiliate.couponCode || "");
                                                        alert("Code copied!");
                                                    }}
                                                    className="p-1.5 hover:text-primary transition-all"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                            <div className={`mt-3 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getTierColor(affiliate.currentTier)}`}>
                                                {affiliate.currentTier} Tier
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    {affiliate.status === "Approved" && (
                                        <div className="flex gap-6 md:px-8 border-x border-gray-50">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Direct</p>
                                                <p className="text-xl font-black text-gray-900">₹{affiliate.directEarnings?.toFixed(0) || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">MLM Levels</p>
                                                <p className="text-xl font-black text-emerald-600">
                                                    ₹{(Number(affiliate.level1Earnings || 0) + Number(affiliate.level2Earnings || 0) + Number(affiliate.level3Earnings || 0)).toFixed(0)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Pending Payout</p>
                                                <p className="text-xl font-black text-orange-500">₹{affiliate.pendingBalance?.toFixed(0) || 0}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col gap-3">
                                        {affiliate.status === "Pending" ? (
                                            <>
                                                <button
                                                    onClick={() => handleAction(affiliate.id, "approve")}
                                                    disabled={updatingId === affiliate.id}
                                                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(affiliate.id, "reject")}
                                                    disabled={updatingId === affiliate.id}
                                                    className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {affiliate.status === "Approved" && (
                                                    <>
                                                        <a
                                                            href={generateWhatsAppMessage(affiliate)}
                                                            target="_blank"
                                                            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                                        >
                                                            <MessageCircle size={16} />
                                                            Notify
                                                        </a>
                                                        <button
                                                            onClick={() => handleUpdateStats(affiliate.id)}
                                                            disabled={updatingId === affiliate.id}
                                                            className="px-6 py-3 bg-blue-50 text-blue-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                                                            title="Recalculate Stats"
                                                        >
                                                            <RefreshCw size={16} className={updatingId === affiliate.id ? "animate-spin" : ""} />
                                                            Sync
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(affiliate.id)}
                                                    disabled={updatingId === affiliate.id}
                                                    className="px-6 py-3 bg-rose-50 text-rose-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
