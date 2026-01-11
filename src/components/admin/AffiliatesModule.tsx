"use client";

import { useState, useEffect } from "react";
import {
    Users, CheckCircle, XCircle, Clock,
    MessageCircle, TrendingUp, DollarSign,
    Copy, ExternalLink, RefreshCw, Trash2,
    Package, Star, ShoppingBag, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Affiliate {
    id: string;
    fullName: string;
    mobile: string;
    upiId: string;
    email: string | null;
    socialLink: string | null;
    couponCode: string | null;
    status: "Pending" | "Approved" | "Rejected";
    isActive: boolean;
    totalOrders: number;
    totalCommission: number;
    currentTier: string;
    createdAt: string;
    approvedAt: string | null;
}

export default function AffiliatesModule() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "active" | "all">("pending");
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

    useEffect(() => {
        fetchAffiliates();
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

    const generateWhatsAppMessage = (affiliate: Affiliate) => {
        const groupLink = "https://chat.whatsapp.com/K0tb3d13w77CIcaW7FRU3t";
        const message = `🎉 Congratulations! Your HM Snacks Affiliate Application is Approved!

Welcome to the HM Snacks Affiliate Family! 🍪

📌 Your Unique Coupon Code: ${affiliate.couponCode}
💰 Current Tier: ${affiliate.currentTier}
📈 Next Tier: Starter (8% at 21 orders)

How to Start Earning:
1. Share your code with friends & family
2. They get discount, you earn commission
3. Track your earnings in real-time

Join our exclusive WhatsApp Affiliate Community:
${groupLink}

Start promoting and earning today! 🚀

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
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Commission Paid</p>
                        <h3 className="text-3xl font-black text-gray-900">
                            ₹{affiliates.reduce((acc, a) => acc + (a.totalCommission || 0), 0).toFixed(0)}
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
                                        <div className="flex gap-8 md:px-8 border-x border-gray-50">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Orders</p>
                                                <p className="text-2xl font-black text-gray-900">{affiliate.totalOrders || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Commission</p>
                                                <p className="text-2xl font-black text-emerald-600">₹{affiliate.totalCommission?.toFixed(0) || 0}</p>
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
