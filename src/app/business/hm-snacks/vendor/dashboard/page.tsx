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
                        <div className="grid gap-6">
                            {filteredShipments.map((shipment) => (
                                <div key={shipment.id} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 pb-6 border-b border-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 font-black text-sm">
                                                #{shipment.displayOrderId.split('-')[1] || "ORD"}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900">{shipment.displayOrderId}</h3>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">
                                                    <Calendar size={12} />
                                                    {new Date(shipment.createdAt).toLocaleDateString()}
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    {new Date(shipment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(shipment.status)}`}>
                                            {shipment.status}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <User className="text-gray-300 mt-1" size={18} />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</p>
                                                    <p className="font-bold text-gray-900">{shipment.customerName}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{shipment.city}, {shipment.state}</p>
                                                </div>
                                            </div>
                                            {shipment.awbCode && (
                                                <div className="flex items-start gap-4">
                                                    <Truck className="text-indigo-300 mt-1" size={18} />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logistics</p>
                                                        <p className="font-bold text-indigo-600">{shipment.courierName || "Shiprocket"}</p>
                                                        <p className="text-xs font-mono font-bold text-gray-600 mt-0.5">AWB: {shipment.awbCode}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Items to Pack</p>
                                            <div className="space-y-3">
                                                {shipment.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                                                        <div className="text-xs font-black bg-gray-900 text-white px-2 py-1 rounded-lg">x{item.quantity} {item.unit}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons (Future) */}
                                    {/* 
                                    <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                                            <Truck size={16} /> Mark Ready to Ship
                                        </button>
                                    </div> 
                                    */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
