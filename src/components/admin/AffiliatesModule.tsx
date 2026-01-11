"use client";

import { useState, useEffect } from "react";
import {
    Users, CheckCircle, XCircle, Clock,
    MessageCircle, TrendingUp, DollarSign,
    Copy, ExternalLink, RefreshCw, Trash2,
    Package, Star, ShoppingBag, ShieldCheck, Save,
    Edit, GitBranch, Eye, ChevronRight, X
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
    const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
    const [viewingTree, setViewingTree] = useState<string | null>(null);
    const [treeData, setTreeData] = useState<any>(null);
    const [treeLoading, setTreeLoading] = useState(false);

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

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAffiliate) return;
        setUpdatingId(editingAffiliate.id);
        try {
            const res = await fetch("/api/admin/affiliates", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingAffiliate),
            });

            if (res.ok) {
                await fetchAffiliates();
                setEditingAffiliate(null);
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error saving profile", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const fetchTree = async (id: string) => {
        setTreeLoading(true);
        try {
            const res = await fetch(`/api/affiliate/stats?id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setTreeData(data);
                setViewingTree(id);
            }
        } catch (err) {
            console.error("Failed to fetch tree", err);
        } finally {
            setTreeLoading(false);
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
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Total Affiliates</p>
                        <h3 className="text-xl font-black text-gray-900">{affiliates.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Total Orders</p>
                        <h3 className="text-xl font-black text-gray-900">
                            {affiliates.reduce((acc, a) => acc + (a.totalOrders || 0), 0)}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Total Earnings</p>
                        <h3 className="text-xl font-black text-gray-900">
                            ₹{affiliates.reduce((acc, a) => acc + (a.totalEarnings || 0), 0).toFixed(0)}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Tabs and Controls */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex p-1.5 bg-gray-50 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "pending" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-primary"}`}
                    >
                        <Clock size={14} />
                        Pending ({affiliates.filter(a => a.status === "Pending").length})
                    </button>
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "active" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-emerald-600"}`}
                    >
                        <CheckCircle size={14} />
                        Active ({affiliates.filter(a => a.status === "Approved").length})
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-900"}`}
                    >
                        <Users size={14} />
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab("payouts")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "payouts" ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-orange-600"}`}
                    >
                        <DollarSign size={14} />
                        Payouts ({payoutRequests.filter(p => p.status === "Pending").length})
                    </button>
                    <button
                        onClick={() => setActiveTab("config")}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "config" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-blue-600"}`}
                    >
                        <RefreshCw size={14} />
                        Config
                    </button>
                </div>

                <button
                    onClick={fetchAffiliates}
                    className="p-3 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-all"
                    title="Refresh List"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
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
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-gray-900">{request.affiliateName}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UPI: {request.upiId}</p>
                                        </div>
                                    </div>

                                    <div className="text-center px-6 border-x border-gray-50">
                                        <p className="text-[9px] font-black uppercase text-gray-400 mb-0.5">Amount</p>
                                        <p className="text-xl font-black text-gray-900">₹{request.amount}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        {request.status === "Pending" ? (
                                            <>
                                                <button
                                                    onClick={() => handlePayoutAction(request.id, "approve")}
                                                    disabled={updatingId === request.id}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-black text-[10px] uppercase hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-200"
                                                >
                                                    Paid
                                                </button>
                                                <button
                                                    onClick={() => handlePayoutAction(request.id, "reject")}
                                                    disabled={updatingId === request.id}
                                                    className="px-4 py-2 bg-red-50 text-red-500 rounded-lg font-black text-[10px] uppercase hover:bg-red-100"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest ${request.status === "Approved" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-4 md:p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
                                    {/* Name and Basic Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-black text-base">
                                                {affiliate.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                                                    {affiliate.fullName}
                                                    {affiliate.status === "Approved" && (
                                                        <ShieldCheck size={16} className="text-emerald-500" />
                                                    )}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                                    <span>{affiliate.mobile}</span>
                                                    {affiliate.email && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate max-w-[150px]">{affiliate.email}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100">
                                                UPI: {affiliate.upiId}
                                            </span>
                                            {affiliate.socialLink && (
                                                <a
                                                    href={affiliate.socialLink}
                                                    target="_blank"
                                                    className="px-2.5 py-1 bg-blue-50 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-blue-100 transition-all border border-blue-100"
                                                >
                                                    Social <ExternalLink size={9} />
                                                </a>
                                            )}
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${affiliate.status === "Approved" ? "text-emerald-600 bg-emerald-50 border-emerald-100" :
                                                affiliate.status === "Rejected" ? "text-red-600 bg-red-50 border-red-100" :
                                                    "text-amber-600 bg-amber-50 border-amber-100"
                                                }`}>
                                                {affiliate.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Coupon and Tier */}
                                    {affiliate.status === "Approved" && (
                                        <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl min-w-[140px] border border-gray-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Coupon</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-pink-500 italic tracking-tighter">
                                                    {affiliate.couponCode}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(affiliate.couponCode || "");
                                                        alert("Code copied!");
                                                    }}
                                                    className="p-1 hover:text-primary transition-all text-gray-400"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                            <div className={`mt-2 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getTierColor(affiliate.currentTier)}`}>
                                                {affiliate.currentTier}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    {affiliate.status === "Approved" && (
                                        <div className="grid grid-cols-5 gap-3 md:px-5 border-y md:border-y-0 md:border-x border-gray-50 py-4 md:py-0 w-full md:w-auto">
                                            <div className="text-center">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Orders</p>
                                                <p className="text-sm font-black text-gray-900">{affiliate.totalOrders || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Sales</p>
                                                <p className="text-sm font-black text-blue-600">₹{(affiliate.totalSalesAmount || 0).toFixed(0)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Direct</p>
                                                <p className="text-sm font-black text-gray-900">₹{(affiliate.directEarnings || 0).toFixed(0)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">MLM</p>
                                                <p className="text-sm font-black text-emerald-600">
                                                    ₹{(Number(affiliate.level1Earnings || 0) + Number(affiliate.level2Earnings || 0) + Number(affiliate.level3Earnings || 0)).toFixed(0)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Pending</p>
                                                <p className="text-sm font-black text-orange-500">₹{(affiliate.pendingBalance || 0).toFixed(0)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto">
                                        {affiliate.status === "Pending" ? (
                                            <>
                                                <button
                                                    onClick={() => handleAction(affiliate.id, "approve")}
                                                    disabled={updatingId === affiliate.id}
                                                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(affiliate.id, "reject")}
                                                    disabled={updatingId === affiliate.id}
                                                    className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-500 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <div className="grid grid-cols-3 lg:grid-cols-2 gap-1.5 w-full">
                                                {affiliate.status === "Approved" && (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingAffiliate(affiliate)}
                                                            className="px-2 py-1.5 bg-gray-50 text-gray-600 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5"
                                                        >
                                                            <Edit size={12} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => fetchTree(affiliate.id)}
                                                            className="px-2 py-1.5 bg-purple-50 text-purple-600 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-purple-100 transition-all flex items-center justify-center gap-1.5"
                                                        >
                                                            <GitBranch size={12} /> Tree
                                                        </button>
                                                        <a
                                                            href={generateWhatsAppMessage(affiliate)}
                                                            target="_blank"
                                                            className="px-2 py-1.5 bg-emerald-500 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-200"
                                                        >
                                                            <MessageCircle size={12} /> WA
                                                        </a>
                                                        <button
                                                            onClick={() => handleUpdateStats(affiliate.id)}
                                                            disabled={updatingId === affiliate.id}
                                                            className="px-2 py-1.5 bg-blue-50 text-blue-500 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5"
                                                            title="Sync"
                                                        >
                                                            <RefreshCw size={12} className={updatingId === affiliate.id ? "animate-spin" : ""} /> Sync
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(affiliate.id)}
                                                    disabled={updatingId === affiliate.id}
                                                    className="px-2 py-1.5 bg-rose-50 text-rose-500 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Trash2 size={12} /> Del
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingAffiliate && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden"
                        >
                            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Edit Partner Profile</h3>
                                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">Update basic info and credentials</p>
                                </div>
                                <button onClick={() => setEditingAffiliate(null)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveProfile} className="p-6 md:p-8 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1.5">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingAffiliate.fullName}
                                            onChange={(e) => setEditingAffiliate({ ...editingAffiliate, fullName: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1.5">Mobile Number</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingAffiliate.mobile}
                                            onChange={(e) => setEditingAffiliate({ ...editingAffiliate, mobile: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1.5">UPI ID</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingAffiliate.upiId}
                                            onChange={(e) => setEditingAffiliate({ ...editingAffiliate, upiId: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1.5">Login Password</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingAffiliate.password}
                                            onChange={(e) => setEditingAffiliate({ ...editingAffiliate, password: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            value={editingAffiliate.email || ""}
                                            onChange={(e) => setEditingAffiliate({ ...editingAffiliate, email: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1.5">Current Tier</label>
                                        <select
                                            value={editingAffiliate.currentTier}
                                            onChange={(e) => setEditingAffiliate({ ...editingAffiliate, currentTier: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                        >
                                            {["Newbie", "Starter", "Silver", "Golden", "Platinum", "Pro", "Elite"].map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    disabled={updatingId === editingAffiliate.id}
                                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {updatingId === editingAffiliate.id ? <RefreshCw className="animate-spin" /> : <Save size={14} />}
                                    Save Changes
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Tree Modal */}
            <AnimatePresence>
                {viewingTree && treeData && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
                        >
                            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">{treeData.fullName}'s Network</h3>
                                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">Binary Downline Visualization</p>
                                </div>
                                <button onClick={() => setViewingTree(null)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-all border border-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-6 bg-[#F9FBFF] scrollbar-hide">
                                <div className="flex justify-center min-w-[800px]">
                                    <div className="relative pt-12">
                                        <AdminTreeNode name={treeData.fullName} isSelf />
                                        <div className="flex justify-between w-[300px] mx-auto">
                                            <div className="w-1/2 border-t-2 border-l-2 border-gray-200 h-6 rounded-tl-xl" />
                                            <div className="w-1/2 border-t-2 border-r-2 border-gray-200 h-6 rounded-tr-xl" />
                                        </div>
                                        <div className="flex justify-between w-[400px] mx-auto">
                                            <div className="flex-1 flex flex-col items-center">
                                                {treeData.downline?.left ? (
                                                    <AdminTreeNode name={treeData.downline.left.fullName} amount={treeData.downline.left.totalSalesAmount} />
                                                ) : <AdminEmptyNode big />}
                                            </div>
                                            <div className="flex-1 flex flex-col items-center">
                                                {treeData.downline?.right ? (
                                                    <AdminTreeNode name={treeData.downline.right.fullName} amount={treeData.downline.right.totalSalesAmount} />
                                                ) : <AdminEmptyNode big />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 text-center">
                                    <p className="text-gray-400 font-bold text-[10px]">Note: Level 1 quick-view. Full tree in dashboard.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AdminTreeNode({ name, isSelf, mini, amount }: any) {
    return (
        <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`${mini ? 'w-20 p-2' : isSelf ? 'w-32 p-3' : 'w-28 p-2'} bg-white border border-gray-100 shadow-lg rounded-2xl flex flex-col items-center gap-1.5 group hover:border-blue-500 transition-all z-10 mx-auto mb-3 border-2`}
        >
            <div className={`${mini ? 'w-6 h-6 text-[7px]' : isSelf ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-[11px]'} ${isSelf ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'} rounded-xl flex items-center justify-center font-black group-hover:rotate-12 transition-transform shadow-md`}>
                {name.charAt(0)}
            </div>
            <p className={`${mini ? 'text-[7px]' : 'text-[10px]'} font-black text-gray-900 truncate w-full text-center leading-tight`}>{name}</p>
            {!mini && amount !== undefined && (
                <p className="text-[9px] font-black text-blue-500 bg-blue-50 px-2.5 py-0.5 rounded-full">₹{amount.toFixed(0)}</p>
            )}
        </motion.div>
    );
}

function AdminEmptyNode({ big }: any) {
    return (
        <div className={`${big ? 'w-28 h-20' : 'w-16 h-8'} border border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 uppercase font-black text-[7px] tracking-widest bg-white`}>
            Slot Available
        </div>
    );
}
