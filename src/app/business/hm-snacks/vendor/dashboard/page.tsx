"use client";

import { useEffect, useState } from "react";
import { useVendorAuth } from "@/lib/vendor-auth-context";
import { useRouter } from "next/navigation";
import { Loader2, Package, LogOut, Truck, MapPin, Calendar, User, Search, ChevronDown, ChevronUp, Wallet, ArrowRight } from "lucide-react";

export default function VendorDashboard() {
    const { vendor, loading, logout } = useVendorAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ pending: 0, shipped: 0, totalOrders: 0, totalEarnings: 0, pendingBalance: 0, paidAmount: 0 });
    const [shipments, setShipments] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Payout State
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState("");
    const [payoutUpi, setPayoutUpi] = useState("");
    const [submittingPayout, setSubmittingPayout] = useState(false);

    useEffect(() => {
        if (!loading && !vendor) {
            router.push("/business/hm-snacks/vendor/login");
        }
    }, [vendor, loading, router]);

    useEffect(() => {
        if (vendor) {
            fetchOrders();
        }
    }, [vendor]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const token = localStorage.getItem("vendor_token");
            if (!token) return;

            const res = await fetch("/api/vendor/orders", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setShipments(data.shipments);
                // Also set financial stats if available
                if (data.stats) {
                    setStats(prev => ({
                        ...prev,
                        totalEarnings: data.stats.totalEarnings || 0,
                        pendingBalance: data.stats.pendingBalance || 0,
                        paidAmount: data.stats.paidAmount || 0,
                    }));
                }

                // Calculate Stats
                const pending = data.shipments.filter((s: any) => s.status === "Pending" || s.status === "Parcel Prepared").length;
                const shipped = data.shipments.filter((s: any) => s.status === "Shipping" || s.status === "Delivered").length;

                setStats(prev => ({
                    ...prev,
                    pending,
                    shipped,
                    totalOrders: data.shipments.length
                }));
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "bg-gray-100 text-gray-600";
            case "Parcel Prepared": return "bg-amber-50 text-amber-600";
            case "Shipping": return "bg-indigo-50 text-indigo-600";
            case "Delivered": return "bg-emerald-50 text-emerald-600";
            case "Cancel": return "bg-rose-50 text-rose-600";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    const handleMarkReadyToShip = async (shipmentId: string) => {
        try {
            // Get dimension values from inputs
            const l = (document.getElementById(`l-${shipmentId}`) as HTMLInputElement)?.value;
            const w = (document.getElementById(`w-${shipmentId}`) as HTMLInputElement)?.value;
            const h = (document.getElementById(`h-${shipmentId}`) as HTMLInputElement)?.value;
            const weight = (document.getElementById(`weight-${shipmentId}`) as HTMLInputElement)?.value;

            if (!l || !w || !h || !weight) {
                alert("Please fill in all package dimensions");
                return;
            }

            const token = localStorage.getItem("vendor_token");
            if (!token) return;

            const res = await fetch(`/api/vendor/shipments/${shipmentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    dimensions: { l: Number(l), w: Number(w), h: Number(h), weight: Number(weight) },
                    readyToShip: true
                })
            });

            if (res.ok) {
                alert("✅ Shipment marked as ready! Admin has been notified.");
                fetchOrders(); // Refresh
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update shipment");
            }
        } catch (error) {
            console.error("Failed to mark ready:", error);
            alert("An error occurred");
        }
    };

    const handleRequestPayout = async () => {
        if (!payoutAmount || Number(payoutAmount) <= 0) return alert("Enter valid amount");
        if (!payoutUpi) return alert("Enter UPI ID");

        setSubmittingPayout(true);
        try {
            const token = localStorage.getItem("vendor_token");
            const res = await fetch("/api/vendor/payouts/request", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ amount: Number(payoutAmount), upiId: payoutUpi })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Payout Requested Successfully!");
                setShowPayoutModal(false);
                setPayoutAmount("");
            } else {
                alert(data.error || "Failed");
            }
        } catch (e) {
            console.error(e);
            alert("Network Error");
        } finally {
            setSubmittingPayout(false);
        }
    };

    if (loading || !vendor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        );
    }

    const filteredShipments = shipments.filter(s =>
        s.displayOrderId?.toLowerCase().includes(search.toLowerCase()) ||
        s.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        s.awbCode?.includes(search)
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Vendor Portal</h1>
                        <p className="text-sm text-gray-500 font-medium">{vendor.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors bg-gray-50 px-4 py-2 rounded-xl"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                            <Package size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Orders</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.pending}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                            <Truck size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shipped</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.shipped}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                            <MapPin size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pickup ID</p>
                            <h3 className="text-xl font-black text-gray-900 truncate max-w-[150px]" title={vendor.pickupLocationId}>{vendor.pickupLocationId || "N/A"}</h3>
                        </div>
                    </div>
                </div>

                {/* Earnings & Payouts Section */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-8">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Earnings</p>
                                <h3 className="text-4xl font-black">₹{stats.totalEarnings?.toLocaleString()}</h3>
                            </div>
                            <div className="w-px h-12 bg-gray-700"></div>
                            <div>
                                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Available for Payout</p>
                                <h3 className="text-2xl font-black">₹{stats.pendingBalance?.toLocaleString()}</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPayoutModal(true)}
                            className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Wallet size={18} /> Request Payout
                        </button>
                    </div>
                    {/* Decorative */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Orders</h2>
                        <div className="relative group w-full sm:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-pink-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search Order ID, Name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64 bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-bold text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    {loadingOrders ? (
                        <div className="py-20 text-center">
                            <Loader2 size={32} className="animate-spin text-pink-500 mx-auto" />
                            <p className="text-gray-400 font-bold mt-4 uppercase tracking-widest text-xs">Loading Orders...</p>
                        </div>
                    ) : filteredShipments.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
                            <Package className="mx-auto w-16 h-16 mb-4 opacity-20" />
                            <h2 className="text-xl font-bold text-gray-900">No Orders Found</h2>
                            <p className="mt-2 text-sm font-medium">Wait for new orders to arrive.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredShipments.map((shipment) => {
                                const isExpanded = expandedId === shipment.id;

                                return (
                                    <div key={shipment.id} className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-pink-200 shadow-xl ring-4 ring-pink-50/50' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
                                        {/* Header - Always Visible */}
                                        <div
                                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                                            onClick={() => setExpandedId(isExpanded ? null : shipment.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${isExpanded ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">{shipment.displayOrderId}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${getStatusColor(shipment.status)}`}>
                                                            {shipment.status}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                            <Calendar size={10} />
                                                            {new Date(shipment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {!isExpanded && (
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-sm font-bold text-gray-900">{shipment.customerName}</p>
                                                        <p className="text-xs text-gray-400">{shipment.city}</p>
                                                    </div>
                                                )}
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-pink-100 text-pink-600 rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                                                    <ChevronDown size={20} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="px-8 pb-8 pt-2 border-t border-gray-100 animation-expand">
                                                <div className="grid lg:grid-cols-2 gap-10 mt-6">
                                                    {/* Left Column: Customer & Logistics */}
                                                    <div className="space-y-6">
                                                        <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5 flex items-center gap-2">
                                                                <User size={14} className="text-gray-300" /> Customer Details
                                                            </h4>
                                                            <div>
                                                                <p className="text-lg font-black text-gray-900">{shipment.customerName}</p>
                                                                <p className="text-sm text-gray-500 font-medium leading-relaxed mt-1">{shipment.city}, {shipment.state}</p>
                                                            </div>
                                                        </div>

                                                        {shipment.awbCode && (
                                                            <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/30">
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-5 flex items-center gap-2">
                                                                    <Truck size={14} className="text-indigo-300" /> Shipping Info
                                                                </h4>
                                                                <div className="flex justify-between items-end">
                                                                    <div>
                                                                        <p className="font-black text-indigo-900">{shipment.courierName || "Shiprocket"}</p>
                                                                        <p className="text-xs font-mono font-bold text-indigo-600/70 mt-1 uppercase tracking-wider">AWB: {shipment.awbCode}</p>
                                                                    </div>
                                                                    {shipment.trackingUrl && (
                                                                        <a href={shipment.trackingUrl} target="_blank" className="text-[10px] font-black text-indigo-600 bg-white px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all">TRACK</a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right Column: Fulfillment & Packing */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-1">Included Items</h4>
                                                            <div className="space-y-3">
                                                                {shipment.items.map((item: any, idx: number) => (
                                                                    <div key={idx} className="flex justify-between items-center group bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                                                            <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                                                                        </div>
                                                                        <span className="text-xs font-black bg-white text-gray-900 px-3 py-1.5 rounded-lg shadow-sm">{item.quantity} {item.unit}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {!shipment.awbCode && shipment.status !== "Delivered" && (
                                                            <div className="pt-6 border-t border-gray-100">
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5 ml-1">Package Specifications</h4>
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                                                    {[
                                                                        { id: 'l', label: 'L (cm)', unit: 'cm', placeholder: '15' },
                                                                        { id: 'w', label: 'W (cm)', unit: 'cm', placeholder: '15' },
                                                                        { id: 'h', label: 'H (cm)', unit: 'cm', placeholder: '5' },
                                                                        { id: 'weight', label: 'Wt (kg)', unit: 'kg', placeholder: '0.5' }
                                                                    ].map((field) => (
                                                                        <div key={field.id} className="space-y-2">
                                                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">{field.label}</label>
                                                                            <input
                                                                                type="number"
                                                                                id={`${field.id}-${shipment.id}`}
                                                                                placeholder={field.placeholder}
                                                                                step={field.id === 'weight' ? '0.01' : '1'}
                                                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleMarkReadyToShip(shipment.id); }}
                                                                    className="w-full py-3 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                                                                >
                                                                    <Package size={16} /> Mark Ready To Ship
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Payout Modal */}
                {showPayoutModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
                            <button
                                onClick={() => setShowPayoutModal(false)}
                                className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <LogOut size={16} className="text-gray-500 rotate-180" />
                            </button>

                            <h3 className="text-2xl font-black text-gray-900 mb-2">Request Payout</h3>
                            <p className="text-sm text-gray-500 font-medium mb-8">Withdraw your earnings to your bank account via UPI.</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            value={payoutAmount}
                                            onChange={(e) => setPayoutAmount(e.target.value)}
                                            className="w-full bg-gray-50 border-0 rounded-2xl py-4 pl-10 pr-4 font-black text-lg focus:ring-2 focus:ring-black transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 text-right">Available: ₹{stats.pendingBalance}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">UPI ID</label>
                                    <input
                                        type="text"
                                        value={payoutUpi}
                                        onChange={(e) => setPayoutUpi(e.target.value)}
                                        className="w-full bg-gray-50 border-0 rounded-2xl py-4 px-4 font-bold text-sm focus:ring-2 focus:ring-black transition-all"
                                        placeholder="username@upi"
                                    />
                                </div>

                                <button
                                    onClick={handleRequestPayout}
                                    disabled={submittingPayout}
                                    className="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {submittingPayout ? <Loader2 className="animate-spin" /> : <>Submit Request <ArrowRight size={18} /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
