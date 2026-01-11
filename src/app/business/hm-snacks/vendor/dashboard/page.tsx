"use client";

import { useEffect, useState } from "react";
import { useVendorAuth } from "@/lib/vendor-auth-context";
import { useRouter } from "next/navigation";
import { Loader2, Package, LogOut, Truck, MapPin } from "lucide-react";

export default function VendorDashboard() {
    const { vendor, loading, logout } = useVendorAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ pending: 0, shipped: 0 });

    useEffect(() => {
        if (!loading && !vendor) {
            router.push("/business/hm-snacks/vendor/login");
        }
    }, [vendor, loading, router]);

    if (loading || !vendor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Vendor Portal</h1>
                        <p className="text-sm text-gray-500 font-medium">{vendor.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Pending Orders</p>
                                <h3 className="text-3xl font-black text-gray-900">{stats.pending}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                <Truck size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Shipped</p>
                                <h3 className="text-3xl font-black text-gray-900">{stats.shipped}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Pickup ID</p>
                                <h3 className="text-xl font-bold text-gray-900">{vendor.pickupLocationId || "N/A"}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
                    <Package className="mx-auto w-16 h-16 mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-gray-900">No Orders Yet</h2>
                    <p className="mt-2">New orders will appear here automatically.</p>
                </div>
            </main>
        </div>
    );
}
