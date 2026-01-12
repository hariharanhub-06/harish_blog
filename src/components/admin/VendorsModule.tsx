"use client";

import { useState, useEffect } from "react";
import {
    Plus, Search, Trash2, MapPin, Mail, Phone, Lock, Building, Loader2,
    Eye, EyeOff, Copy, CheckCircle, MessageCircle, Banknote, History,
    DollarSign, X, Check, RefreshCw, TrendingUp, Zap, Clock, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Vendor {
    id: string;
    name: string;
    email: string;
    password?: string;
    phone: string;
    pickupLocationId: string;
    address: string;
    totalEarnings: number;
    paidAmount: number;
    pendingBalance: number;
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

export default function VendorsModule() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [history, setHistory] = useState<PayoutHistory[]>([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        pickupLocationId: "",
        address: ""
    });

    const [payoutForm, setPayoutForm] = useState({ amount: "", paymentId: "", method: "UPI", notes: "" });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            // Fetch settlements which includes total data
            const res = await fetch("/api/admin/vendors/settlements");
            if (res.ok) {
                const data = await res.json();
                setVendors(data);
            }
        } catch (error) {
            console.error("Failed to fetch vendors", error);
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

    const handleAddVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowAddModal(false);
                setFormData({ name: "", email: "", password: "", phone: "", pickupLocationId: "", address: "" });
                fetchVendors();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to create vendor");
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete vendor "${name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/vendors?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchVendors();
        } catch (error) {
            alert("Failed to delete vendor");
        }
    };

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

    const togglePasswordVisibility = (vendorId: string) => {
        setShowPasswords(prev => ({ ...prev, [vendorId]: !prev[vendorId] }));
    };

    const copyToClipboard = (text: string, vendorId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(vendorId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const generateWhatsAppMessage = (vendor: any) => {
        const loginLink = "https://hariharanhub.com/business/hm-snacks/vendor/login";
        const message = `🎉 *Welcome to HM Snacks Vendor Portal!*

Hello ${vendor.name},

Your Vendor Account has been created. You can now log in to manage your shipments and dimensions.

🔐 *Login Credentials:*
Username: ${vendor.email}
Password: ${vendor.password || "Contact Admin"}

🚀 *Access Your Dashboard:*
${loginLink}

Please log in and update your package specifications when you have shipments ready.

- Team HM Snacks`;

        return `https://wa.me/91${vendor.phone}?text=${encodeURIComponent(message)}`;
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalLiability = vendors.reduce((acc, v) => acc + (v.pendingBalance || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Building size={150} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter text-pink-500 uppercase">Vendor <span className="text-white">Central</span></h1>
                            <p className="text-gray-400 font-bold mt-2 max-w-md">Manage accounts, settlements, and performance for all manufacturing partners.</p>

                            <div className="mt-8">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Total Network Liability</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-5xl font-black italic tracking-tighter">₹{totalLiability.toLocaleString()}</span>
                                    <div className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={12} /> Pending Settle
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={fetchVendors}
                                className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all"
                            >
                                <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-pink-500/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Plus size={20} /> Add Vendor
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
                        Quick Guide
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                            <p className="text-[11px] font-bold text-gray-500 leading-relaxed">
                                "Click <span className="text-pink-600">Settle Dues</span> to record a bank transfer. Click the <span className="text-emerald-600">WhatsApp icon</span> to send login info."
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                            <CheckCircle size={14} /> System Synchronized
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-[2rem] py-5 pl-14 pr-6 font-black text-sm focus:ring-2 focus:ring-pink-500 shadow-sm transition-all"
                />
            </div>

            {/* Vendor List */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-500" size={48} /></div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filteredVendors.map((vendor) => (
                        <motion.div
                            layout
                            key={vendor.id}
                            className="bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
                        >
                            {/* Card Header: Info & Actions */}
                            <div className="p-8 pb-0 flex justify-between items-start">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 group-hover:text-pink-500 group-hover:bg-pink-50 transition-all">
                                        <Building size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">{vendor.name}</h3>
                                        <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                            <MapPin size={12} /> {vendor.pickupLocationId || "L-ID Missing"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={generateWhatsAppMessage(vendor)}
                                        target="_blank"
                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                        title="WhatsApp Credentials"
                                    >
                                        <MessageCircle size={20} />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(vendor.id, vendor.name)}
                                        className="p-3 bg-gray-50 text-gray-400 hover:text-white hover:bg-rose-500 rounded-2xl transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Middle Section: Financials */}
                            <div className="px-8 mt-8 grid grid-cols-3 gap-6">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Earnings</p>
                                    <p className="text-lg font-black text-gray-900 tracking-tighter text-center italic">₹{(vendor.totalEarnings || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Paid</p>
                                    <p className="text-lg font-black text-emerald-600 tracking-tighter text-center italic">₹{(vendor.paidAmount || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-pink-50 rounded-2xl">
                                    <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-1 text-center">DUE</p>
                                    <p className="text-lg font-black text-pink-600 tracking-tighter text-center italic">₹{(vendor.pendingBalance || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Card Footer: Credentials & Settle */}
                            <div className="p-8 mt-4 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-3 flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 flex-1 min-w-0">
                                            <Mail size={14} className="text-gray-300 flex-shrink-0" />
                                            <span className="text-[11px] font-bold text-gray-600 truncate">{vendor.email}</span>
                                            <button onClick={() => copyToClipboard(vendor.email, `e-${vendor.id}`)} className="ml-auto p-1 hover:bg-gray-50 rounded text-gray-400">
                                                {copiedId === `e-${vendor.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 flex-1">
                                            <Lock size={14} className="text-gray-300" />
                                            <span className="text-[11px] font-bold text-gray-600 tracking-wider">
                                                {showPasswords[vendor.id] ? (vendor.password || "N/A") : "••••••••"}
                                            </span>
                                            <button onClick={() => togglePasswordVisibility(vendor.id)} className="ml-auto p-1 text-gray-400">
                                                {showPasswords[vendor.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <Phone size={10} /> {vendor.phone || "No Contact"}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedVendor(vendor);
                                        fetchHistory(vendor.id);
                                    }}
                                    className="w-full md:w-auto px-8 py-5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                                >
                                    Settle Dues <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {filteredVendors.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <Building className="mx-auto w-16 h-16 mb-4 opacity-10" />
                            <p className="font-black italic text-gray-300">No vendors found in network</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Add New Vendor */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[3rem] p-8 md:p-12 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase mb-2">New <span className="text-pink-600">Vendor</span></h2>
                            <p className="text-gray-400 font-bold mb-10 tracking-tight uppercase text-xs">Create factory account and set pickup location.</p>

                            <form onSubmit={handleAddVendor} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Factory / Vendor Name</label>
                                    <input
                                        required className="w-full p-5 bg-gray-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-pink-500 transition-all border-0 shadow-sm"
                                        placeholder="e.g. Coimbatore Factory Unit-1"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Login Email</label>
                                        <input
                                            required type="email" className="w-full p-5 bg-gray-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-pink-500 transition-all border-0 shadow-sm"
                                            placeholder="vendor@hmsnacks.com"
                                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Initial Password</label>
                                        <input
                                            required type="text" className="w-full p-5 bg-gray-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-pink-500 transition-all border-0 shadow-sm"
                                            placeholder="SecretKey"
                                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Shiprocket Pickup ID</label>
                                    <input
                                        className="w-full p-5 bg-gray-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-pink-500 transition-all border-0 shadow-sm"
                                        placeholder="Enter numeric ID..."
                                        value={formData.pickupLocationId} onChange={e => setFormData({ ...formData, pickupLocationId: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Mobile Number</label>
                                        <input
                                            className="w-full p-5 bg-gray-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-pink-500 transition-all border-0 shadow-sm"
                                            placeholder="For WhatsApp"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Address</label>
                                        <input
                                            className="w-full p-5 bg-gray-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-pink-500 transition-all border-0 shadow-sm"
                                            placeholder="Factory Site"
                                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button" onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-5 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-100 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit" disabled={submitting}
                                        className="flex-1 py-5 bg-pink-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-pink-600 transition-all shadow-xl shadow-pink-200 disabled:opacity-50"
                                    >
                                        {submitting ? "Processing..." : "Register Factory"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Settlement & History (Combined from VendorSettlementsModule) */}
            <AnimatePresence>
                {selectedVendor && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedVendor(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-pink-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-pink-200">
                                        <Banknote size={28} />
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
                                <div className="space-y-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-500 bg-pink-50 w-fit px-4 py-1.5 rounded-full">New Settlement</h4>
                                    <form onSubmit={handleRecordPayout} className="space-y-6">
                                        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Payout Amount (₹)</label>
                                                <input
                                                    type="number" required placeholder="Enter amount..."
                                                    value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                                                    className="w-full bg-white border-0 rounded-2xl py-4 px-6 font-black text-xl text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 transition-all font-mono"
                                                />
                                                <p className="mt-2 ml-1 text-[10px] font-bold text-gray-400">Due: ₹{selectedVendor.pendingBalance.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Ref ID / UTR</label>
                                                <input
                                                    type="text" placeholder="Transaction ID..." value={payoutForm.paymentId}
                                                    onChange={(e) => setPayoutForm({ ...payoutForm, paymentId: e.target.value })}
                                                    className="w-full bg-white border-0 rounded-2xl py-4 px-6 font-bold text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 transition-all"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Method</label>
                                                    <select
                                                        value={payoutForm.method} onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
                                                        className="w-full bg-white border-0 rounded-2xl py-4 px-6 font-bold text-sm text-gray-900 shadow-sm focus:ring-2 focus:ring-pink-500 transition-all"
                                                    >
                                                        <option>UPI</option>
                                                        <option>Bank Transfer</option>
                                                        <option>Cash</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Bank Summary</label>
                                                    <div className="h-[60px] flex items-center px-6 bg-white text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 italic">
                                                        {selectedVendor.bankDetails ? "Data Found" : "Not Provided"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="submit" disabled={submitting || !payoutForm.amount}
                                            className="w-full py-5 bg-pink-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-pink-600 transition-all shadow-2xl shadow-pink-200 disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" /> : <DollarSign />} Complete Payout
                                        </button>
                                    </form>
                                </div>

                                <div className="space-y-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 w-fit px-4 py-1.5 rounded-full">Ledger History</h4>
                                    {fetchingHistory ? (
                                        <div className="py-20 flex justify-center uppercase font-black text-[10px] text-gray-300 animate-pulse">Syncing Ledger...</div>
                                    ) : history.length > 0 ? (
                                        <div className="space-y-4">
                                            {history.map((p) => (
                                                <div key={p.id} className="p-6 bg-white border border-gray-100 rounded-3xl flex items-center justify-between hover:border-emerald-200 transition-all hover:shadow-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                                                            <CheckCircle size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 italic">₹{p.amount.toLocaleString()}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-gray-900 font-mono tracking-tight">{p.method}</p>
                                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{p.paymentId || "Ref-N/A"}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                                            <History size={40} className="mx-auto text-gray-200 mb-4 opacity-10" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No previous payouts found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
