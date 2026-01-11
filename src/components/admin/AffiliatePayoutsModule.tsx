"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    RefreshCw,
    CheckCircle,
    XCircle,
    Search,
    Clock,
    CreditCard,
    Zap,
    Info,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PayoutRequest {
    id: string;
    affiliateId: string;
    affiliateName: string;
    amount: number;
    upiId: string;
    status: "Pending" | "Approved" | "Rejected";
    createdAt: string;
}

export default function AffiliatePayoutsModule() {
    const [requests, setRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<"All" | "Pending" | "Approved">("Pending");
    const [search, setSearch] = useState("");

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/affiliates/payouts");
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (err) {
            console.error("Failed to fetch payouts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handlePayoutAction = async (requestId: string, action: "approve" | "reject") => {
        if (action === "approve" && !confirm("Confirm that you have manually sent the payment via UPI?")) return;

        setUpdatingId(requestId);
        try {
            const res = await fetch("/api/admin/affiliates/payouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action }),
            });

            if (res.ok) {
                fetchPayouts();
            } else {
                alert("Failed to process payout");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesFilter = filter === "All" || r.status === filter;
        const matchesSearch = r.affiliateName.toLowerCase().includes(search.toLowerCase()) ||
            r.upiId.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalPending = requests.filter(r => r.status === 'Pending').reduce((acc, r) => acc + r.amount, 0);

    return (
        <div className="space-y-8">
            {/* Header / Stats Block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Zap size={150} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-2 italic">Payout <span className="text-orange-500">Center</span></h2>
                        <p className="text-gray-400 font-bold mb-8 max-w-md">Manage partner commissions and track withdrawal requests across the snacks network.</p>

                        <div className="flex flex-wrap gap-8 items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">Total Pending Payouts</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-5xl font-black italic tracking-tighter">₹{totalPending.toFixed(0)}</span>
                                    <div className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={12} /> {requests.filter(r => r.status === 'Pending').length} Pending
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={fetchPayouts}
                                className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all"
                            >
                                <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                        <TrendingUp size={100} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Info size={18} className="text-blue-500" />
                        Automation Idea
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 italic">
                            <p className="text-[11px] font-bold text-blue-700 leading-relaxed">
                                "We can automate these via <b>Razorpay Payouts</b>. A weekly script (Cron Job) could fetch all partners with balance &gt; ₹500 and transfer money instantly to their UPI IDs."
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                            <Zap size={14} /> Weekly Schedule • Minimum ₹500
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-50 p-1.5 rounded-2xl w-full md:w-auto">
                    {["Pending", "Approved", "All"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s as any)}
                            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-900"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        placeholder="Search partners or UPI..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border-0 rounded-2xl py-3 pl-12 pr-4 font-bold text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                </div>
            </div>

            {/* Request List */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredRequests.map((request) => (
                        <motion.div
                            key={request.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:shadow-xl hover:border-orange-100 transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-50 rounded-2xl md:rounded-3xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <DollarSign size={24} className="md:w-8 md:h-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        {request.affiliateName}
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">• {new Date(request.createdAt).toLocaleDateString()}</span>
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-gray-400 font-bold">
                                        <div className="flex items-center gap-1.5 text-xs bg-gray-50 px-3 py-1 rounded-lg">
                                            <CreditCard size={12} /> {request.upiId}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto">
                                <div className="text-right flex-grow md:flex-grow-0">
                                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-1">Requested Amount</p>
                                    <p className="text-3xl font-black text-gray-900 italic tracking-tighter">₹{request.amount.toFixed(0)}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {request.status === "Pending" ? (
                                        <>
                                            <button
                                                onClick={() => handlePayoutAction(request.id, "approve")}
                                                disabled={updatingId === request.id}
                                                className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {updatingId === request.id ? <RefreshCw className="animate-spin" size={12} /> : <CheckCircle size={14} />} Mark Paid
                                            </button>
                                            <button
                                                onClick={() => handlePayoutAction(request.id, "reject")}
                                                disabled={updatingId === request.id}
                                                className="px-8 py-3 bg-rose-50 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${request.status === "Approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                            }`}>
                                            {request.status === "Approved" ? <CheckCircle size={14} /> : <XCircle size={14} />} {request.status === 'Approved' ? 'Paid' : 'Rejected'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && filteredRequests.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-6">
                            <DollarSign size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 italic">No requests found</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Filtering for {filter} Payouts</p>
                    </div>
                )}
            </div>
        </div>
    );
}
