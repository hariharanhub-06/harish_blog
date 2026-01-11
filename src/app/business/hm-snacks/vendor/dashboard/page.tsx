"use client";

import { useEffect, useState } from "react";
import { useVendorAuth } from "@/lib/vendor-auth-context";
import { useRouter } from "next/navigation";
import { Loader2, Package, LogOut, Truck, MapPin, Calendar, User, Search } from "lucide-react";

export default function VendorDashboard() {
    const { vendor, loading, logout } = useVendorAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ pending: 0, shipped: 0, totalOrders: 0 });
    const [shipments, setShipments] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [search, setSearch] = useState("");

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

                // Calculate Stats
                const pending = data.shipments.filter((s: any) => s.status === "Pending" || s.status === "Parcel Prepared").length;
                const shipped = data.shipments.filter((s: any) => s.status === "Shipping" || s.status === "Delivered").length;
                setStats({
                    pending,
                    shipped,
                    totalOrders: data.shipments.length
                });
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
                        <div className="grid gap-8">
                            {filteredShipments.map((shipment) => (
                                <div key={shipment.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                                    {/* Card Header: ID and Status */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-gray-50 rounded-2xl">
                                                <Package className="text-gray-400" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{shipment.displayOrderId}</h3>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                                    <Calendar size={12} />
                                                    {new Date(shipment.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    <span className="opacity-30">•</span>
                                                    {new Date(shipment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(shipment.status)}`}>
                                            {shipment.status}
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-10">
                                        {/* Left Column: Customer & Logistics */}
                                        <div className="space-y-8">
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
                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-1">Included Items</h4>
                                                <div className="space-y-3">
                                                    {shipment.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center group">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-pink-500/20 group-hover:bg-pink-500 transition-colors"></div>
                                                                <span className="font-bold text-gray-700">{item.name}</span>
                                                            </div>
                                                            <span className="text-xs font-black bg-gray-900 text-white px-3 py-1.5 rounded-xl min-w-[60px] text-center">{item.quantity} {item.unit}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {!shipment.awbCode && shipment.status !== "Delivered" && (
                                                <div className="pt-6 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5 ml-1">Package Specifications</h4>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                                        {[
                                                            { id: 'l', label: 'Length', unit: 'cm', placeholder: '15' },
                                                            { id: 'w', label: 'Width', unit: 'cm', placeholder: '15' },
                                                            { id: 'h', label: 'Height', unit: 'cm', placeholder: '5' },
                                                            { id: 'weight', label: 'Weight', unit: 'kg', placeholder: '0.5' }
                                                        ].map((field) => (
                                                            <div key={field.id} className="space-y-2">
                                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">{field.label}</label>
                                                                <div className="relative group">
                                                                    <input
                                                                        type="number"
                                                                        id={`${field.id}-${shipment.id}`}
                                                                        placeholder={field.placeholder}
                                                                        step={field.id === 'weight' ? '0.01' : '1'}
                                                                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all group-hover:border-gray-300"
                                                                    />
                                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">{field.unit}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => handleMarkReadyToShip(shipment.id)}
                                                        className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
                                                    >
                                                        <Package size={18} /> Mark Ready To Ship
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
