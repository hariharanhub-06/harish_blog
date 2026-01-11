"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    RefreshCw,
    CheckCircle,
    Search,
    Clock,
    CreditCard,
    Zap,
    TrendingUp,
    History,
    ArrowRight,
    User,
    Banknote,
    X,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VendorSettlement {
    id: string;
    name: string;
    email: string;
    totalEarnings: number;
    paidAmount: number;
    pendingBalance: number;
    phone: string;
    bankDetails: any;
}

interface PayoutHistory {
    id: string;
    amount: number;
    paymentId: string;
    method: string;
    createdAt: string;
    notes: string;
}

export default function VendorSettlementsModule() {
    const [vendors, setVendors] = useState<VendorSettlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedVendor, setSelectedVendor] = useState<VendorSettlement | null>(null);
    const [history, setHistory] = useState<PayoutHistory[]>([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [payoutForm, setPayoutForm] = useState({ amount: "", paymentId: "", method: "UPI", notes: "" });
    const [submitting, setSubmitting] = useState(false);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/vendors/settlements");
            if (res.ok) {
                const data = await res.json();
                setVendors(data);
            }
        } catch (err) {
            console.error("Failed to fetch vendors", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (vendorId: string) => {
        setFetchingHistory(true);
        try {
            const res = await fetch(`/api/admin/vendors/settlements?vendorId=${vendorId}`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setFetchingHistory(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleRecordPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendor || !payoutForm.amount) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/vendors/settlements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vendorId: selectedVendor.id,
                    ...payoutForm
                }),
            });

            if (res.ok) {
                alert("Payout recorded successfully");
                setPayoutForm({ amount: "", paymentId: "", method: "UPI", notes: "" });
                fetchVendors();
                fetchHistory(selectedVendor.id);
                // Also update local selectedVendor balance for immediate UI feedback
                setSelectedVendor(prev => {
                    if (!prev) return null;
                    const amt = Number(payoutForm.amount);
                    return {
                        ...prev,
                        paidAmount: prev.paidAmount + amt,
                        pendingBalance: prev.pendingBalance - amt
                    };
                });
            } else {
                alert("Failed to record payout");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalLiability = vendors.reduce((acc, v) => acc + (v.pendingBalance || 0), 0);

    return (
        <div className="space-y-8">
            {/* Header / Stats Block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Banknote size={150} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-2 italic tracking-tighter text-pink-500 uppercase">Vendor <span className="text-white">Settlements</span></h2>
                        <p className="text-gray-400 font-bold mb-8 max-w-md">Track and process payments for snacks manufacturing partners across the network.</p>

                        <div className="flex flex-wrap gap-8 items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Total Net Liability</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-5xl font-black italic tracking-tighter">₹{totalLiability.toLocaleString()}</span>
                                    <div className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={12} /> Pending Settlement
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={fetchVendors}
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
                        <Zap size={18} className="text-pink-500" />
                        Quick Settlement Guide
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 italic">
                            <p className="text-[11px] font-bold text-pink-700 leading-relaxed">
                                "Earnings are credited to vendors automatically when a shipment is marked as <b>Delivered</b>. Payments should be recorded manually after the bank transfer."
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                            <CheckCircle size={14} /> Handyman Verified
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-50 p-1.5 rounded-2xl w-full md:w-auto">
                    <button className="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-gray-900 shadow-sm">
                        All Vendors
                    </button>
                    <button className="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900">
                        High Liability
                    </button>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        placeholder="Search vendors by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border-0 rounded-2xl py-3 pl-12 pr-4 font-bold text-sm focus:ring-2 focus:ring-pink-500 transition-all"
                    />
                </div>
            </div>

            {/* Vendor List */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredVendors.map((vendor) => (
                        <motion.div
                            key={vendor.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-8 group hover:shadow-xl hover:border-pink-100 transition-all"
                        >
                            <div className="flex items-center gap-6 flex-grow max-w-md">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-pink-50 rounded-2xl md:rounded-3xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                                    <User size={24} className="md:w-8 md:h-8" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xl font-black text-gray-900 truncate uppercase tracking-tighter">{vendor.name}</h4>
                                    <p className="text-xs font-bold text-gray-400 mt-0.5 truncate">{vendor.email}</p>
                                    {vendor.bankDetails && (
                                        <div className="inline-flex mt-2 px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            Bank Data Found
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 md:gap-12 flex-grow">
                                <div className="text-center xl:text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-1">Total Earned</p>
                                    <p className="text-2xl font-black text-gray-900 italic tracking-tighter">₹{(vendor.totalEarnings || 0).toLocaleString()}</p>
                                </div>
                                <div className="text-center xl:text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-1">Already Paid</p>
                                    <p className="text-2xl font-black text-emerald-500 italic tracking-tighter">₹{(vendor.paidAmount || 0).toLocaleString()}</p>
                                </div>
                                <div className="text-center xl:text-right">
                                    <p className="text-[10px] font-black uppercase text-pink-500 tracking-widest mb-1">DUE BALANCE</p>
                                    <p className="text-3xl font-black text-gray-900 bg-pink-50 px-4 py-1 rounded-xl inline-block italic tracking-tighter">₹{(vendor.pendingBalance || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedVendor(vendor);
                                        fetchHistory(vendor.id);
                                    }}
                                    className="px-8 flex-grow xl:flex-grow-0 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                                >
                                    Settle Dues <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && filteredVendors.length === 0 && (
                    <div className="py-24 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <Loader2 size={40} className="mx-auto text-gray-200 mb-6 animate-spin" />
                        <h3 className="text-xl font-black text-gray-900 mb-2 italic">Searching snack network...</h3>
                    </div>
                )}
            </div>

            {/* Payout & History Modal */}
            {selectedVendor && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedVendor(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-pink-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-pink-200">
                                    <History size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">{selectedVendor.name}</h3>
                                    <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Settlement Ledger & Payment Processing</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedVendor(null)} className="p-4 hover:bg-gray-200 rounded-2xl transition-all">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Record Payout Form */}
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-500 bg-pink-50 w-fit px-4 py-1.5 rounded-full">New Settlement</h4>
                                <form onSubmit={handleRecordPayout} className="space-y-6">
                                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Payout Amount (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                placeholder="Enter amount to pay..."
                                                value={payoutForm.amount}
                                                onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                                                className="w-full bg-white border-0 rounded-2xl py-4 px-6 font-black text-xl text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 transition-all"
                                            />
                                            <p className="mt-2 ml-1 text-[10px] font-bold text-gray-400">Current balance: ₹{selectedVendor.pendingBalance.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Reference ID / UTR</label>
                                            <input
                                                type="text"
                                                placeholder="Enter payment reference..."
                                                value={payoutForm.paymentId}
                                                onChange={(e) => setPayoutForm({ ...payoutForm, paymentId: e.target.value })}
                                                className="w-full bg-white border-0 rounded-2xl py-4 px-6 font-bold text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Method</label>
                                                <select
                                                    value={payoutForm.method}
                                                    onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
                                                    className="w-full bg-white border-0 rounded-2xl py-4 px-6 font-bold text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 transition-all appearance-none"
                                                >
                                                    <option>UPI</option>
                                                    <option>Bank Transfer</option>
                                                    <option>Cash</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Bank Summary</label>
                                                <div className="h-[60px] flex items-center px-6 bg-pink-50 text-pink-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-pink-100">
                                                    {selectedVendor.bankDetails ? "Details Available" : "No Bank Details"}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Internal Notes</label>
                                            <textarea
                                                rows={3}
                                                placeholder="Add private note for this payout..."
                                                value={payoutForm.notes}
                                                onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                                                className="w-full bg-white border-0 rounded-2xl py-4 px-6 font-bold text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting || !payoutForm.amount}
                                        className="w-full py-5 bg-pink-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-pink-600 transition-all shadow-2xl shadow-pink-200 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : <DollarSign />} Confirm & Clear Settlement
                                    </button>
                                </form>
                            </div>

                            {/* Payout History */}
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 w-fit px-4 py-1.5 rounded-full">Payment History Log</h4>
                                {fetchingHistory ? (
                                    <div className="py-20 flex justify-center uppercase font-black text-[10px] text-gray-400 tracking-widest animate-pulse">
                                        Loading Ledger...
                                    </div>
                                ) : history.length > 0 ? (
                                    <div className="space-y-4">
                                        {history.map((p) => (
                                            <div key={p.id} className="p-6 bg-white border border-gray-100 rounded-3xl flex items-center justify-between group hover:border-emerald-200 transition-all hover:shadow-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                                                        <CheckCircle size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">₹{p.amount.toLocaleString()}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()} • {p.method}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ref ID</p>
                                                    <p className="text-[10px] font-bold text-gray-900 font-mono tracking-tight">{p.paymentId || "N/A"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                                        <History size={40} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No payout records found for this vendor.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
