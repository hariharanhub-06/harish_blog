"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, MapPin, Mail, Phone, Lock, Building, Loader2, Eye, EyeOff, Copy, CheckCircle, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorsModule() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        pickupLocationId: "",
        address: ""
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await fetch("/api/admin/vendors");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
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

    const togglePasswordVisibility = (vendorId: string) => {
        setShowPasswords(prev => ({ ...prev, [vendorId]: !prev[vendorId] }));
    };

    const copyToClipboard = (text: string, vendorId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(vendorId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const generateWhatsAppMessage = (vendor: any) => {
        const loginLink = "https://hmsnacks.in/business/hm-snacks/vendor/login";
        const message = `🎉 Welcome to HM Snacks Vendor Portal!
    
Hello ${vendor.name},

Your Vendor Account has been created. You can now log in to manage your shipments and dimensions.

🔐 *Login Credentials:*
Username: ${vendor.email}
Password: ${vendor.password}

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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vendors</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage manufacturing partners and pickup locations.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
                >
                    <Plus size={20} />
                    Add New Vendor
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 focus:border-black focus:ring-0 transition-all font-medium text-gray-900 shadow-sm"
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredVendors.map((vendor) => (
                        <motion.div
                            layout
                            key={vendor.id}
                            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                                    <Building size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={generateWhatsAppMessage(vendor)}
                                        target="_blank"
                                        className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                                        title="Send Credentials via WhatsApp"
                                    >
                                        <MessageCircle size={18} />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(vendor.id, vendor.name)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">{vendor.name}</h3>
                            <div className="text-sm text-gray-500 font-medium mb-4 flex items-center gap-2">
                                <MapPin size={14} />
                                {vendor.pickupLocationId || "No Pickup ID"}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                {/* Email (Login ID) with Copy */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 flex-1 min-w-0">
                                        <Mail size={16} className="text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{vendor.email}</span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(vendor.email, `email-${vendor.id}`)}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                        title="Copy Email"
                                    >
                                        {copiedId === `email-${vendor.id}` ?
                                            <CheckCircle size={16} className="text-green-500" /> :
                                            <Copy size={16} className="text-gray-400" />
                                        }
                                    </button>
                                </div>

                                {/* Password with Show/Hide and Copy */}
                                <div className="flex items-center justify-between gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 flex-1">
                                        <Lock size={16} className="text-gray-400 flex-shrink-0" />
                                        <span className="font-mono">
                                            {showPasswords[vendor.id] ? vendor.password : "••••••••"}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => togglePasswordVisibility(vendor.id)}
                                            className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                            title={showPasswords[vendor.id] ? "Hide Password" : "Show Password"}
                                        >
                                            {showPasswords[vendor.id] ?
                                                <EyeOff size={16} className="text-gray-500" /> :
                                                <Eye size={16} className="text-gray-400" />
                                            }
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(vendor.password, `pass-${vendor.id}`)}
                                            className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                            title="Copy Password"
                                        >
                                            {copiedId === `pass-${vendor.id}` ?
                                                <CheckCircle size={16} className="text-green-500" /> :
                                                <Copy size={16} className="text-gray-400" />
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <Phone size={16} className="text-gray-400" />
                                    {vendor.phone || "No phone"}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {filteredVendors.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            <Building className="mx-auto w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium">No vendors found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Add New Vendor</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Vendor Name</label>
                                    <input
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        placeholder="e.g. Coimbatore Factory"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Email (Login ID)</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full p-4 bg-gray-50 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            placeholder="vendor@hmsnacks.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Password</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-4 bg-gray-50 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            placeholder="Initial Password"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Shiprocket Pickup Location ID</label>
                                    <input
                                        className="w-full p-4 bg-gray-50 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        placeholder="e.g. 123456"
                                        value={formData.pickupLocationId}
                                        onChange={e => setFormData({ ...formData, pickupLocationId: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-400 mt-2 ml-1">Find this in Shiprocket Settings - Pickups</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Phone</label>
                                        <input
                                            className="w-full p-4 bg-gray-50 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            placeholder="Optional"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Address</label>
                                        <input
                                            className="w-full p-4 bg-gray-50 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            placeholder="Optional"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {submitting ? "Creating..." : "Create Vendor"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
