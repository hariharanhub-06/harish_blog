"use client";

import { useEffect, useState } from "react";
import {
    IndianRupee,
    ShoppingBag,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Clock,
    CheckCircle2,
    Truck,
    Filter,
    Calendar,
    Loader2,
    ArrowRight
} from "lucide-react";

export default function SnacksOverviewModule() {
    const [stats, setStats] = useState<any>({
        revenue: 0,
        ordersByStatus: {},
        lowStock: [],
        outOfStockCount: 0,
        couponStats: []
    });
    const [fetching, setFetching] = useState(true);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    const fetchStats = async () => {
        setFetching(true);
        try {
            const [ordersRes, productsRes, couponsRes] = await Promise.all([
                fetch(`/api/snacks/orders?fromDate=${dateRange.from}&toDate=${dateRange.to}`),
                fetch("/api/snacks/products"),
                fetch("/api/admin/coupons")
            ]);

            if (ordersRes.ok && productsRes.ok && couponsRes.ok) {
                const { orders } = await ordersRes.json();
                const products = await productsRes.json();
                const couponsData = await couponsRes.json();

                const revenue = orders
                    .filter((o: any) => o.status !== "Cancel")
                    .reduce((acc: number, o: any) => acc + o.totalAmount, 0);

                const ordersByStatus = orders.reduce((acc: any, o: any) => {
                    acc[o.status] = (acc[o.status] || 0) + 1;
                    return acc;
                }, {});

                const lowStock = products.filter((p: any) => p.stock > 0 && p.stock < 10);
                const outOfStockCount = products.filter((p: any) => p.stock === 0).length;

                // Coupon Performance
                const couponStats = couponsData
                    .map((c: any) => ({
                        code: c.code,
                        count: c.usageCount || 0,
                        discountValue: c.discountValue,
                        discountType: c.discountType
                    }))
                    .filter((c: any) => c.count > 0)
                    .sort((a: any, b: any) => b.count - a.count);

                setStats({
                    revenue,
                    ordersByStatus,
                    lowStock,
                    outOfStockCount,
                    couponStats
                });
            }
        } catch (error) {
            console.error(error);
        }
        setFetching(false);
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: "Total Revenue", value: `₹${stats.revenue}`, sub: "Confirmed Payments", icon: IndianRupee, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Total Orders", value: Object.values(stats.ordersByStatus).reduce((a: any, b: any) => a + b, 0), sub: "Within selected range", icon: ShoppingBag, color: "text-pink-600", bg: "bg-pink-50" },
        { label: "Out of Stock", value: stats.outOfStockCount, sub: "Products needing refill", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Low Stock", value: stats.lowStock.length, sub: "Less than 10kg left", icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Date Range */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">Business <span className="text-pink-500">Pulse</span></h2>
                    <p className="text-gray-400 font-medium">Real-time performance metrics for HM Snacks.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <Calendar size={18} className="text-gray-400 ml-3" />
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="bg-transparent border-0 text-xs font-black uppercase tracking-widest focus:ring-0"
                    />
                    <ArrowRight size={14} className="text-gray-200" />
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="bg-transparent border-0 text-xs font-black uppercase tracking-widest focus:ring-0 mr-3"
                    />
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-bl-[5rem] translate-x-10 -translate-y-10 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform opacity-30`} />
                        <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-6 relative z-10`}>
                            <card.icon size={24} />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 relative z-10">{card.label}</h3>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter mb-1 relative z-10 italic">{card.value}</p>
                        <p className="text-xs font-medium text-gray-400 relative z-10">{card.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Orders by Status */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black mb-8 flex items-center gap-3 italic">
                        <Clock className="text-pink-500" />
                        Status Distribution
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(stats.ordersByStatus).map(([status, count]: any) => (
                            <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-pink-100 transition-all">
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{status}</span>
                                <span className="text-xl font-black text-gray-900 italic">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coupon Performance */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black mb-8 flex items-center gap-3 italic">
                        <ShoppingBag className="text-indigo-500" />
                        Coupon Performance
                    </h3>
                    <div className="space-y-4">
                        {stats.couponStats.map((coupon: any) => (
                            <div key={coupon.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{coupon.code}</span>
                                    <span className="text-[9px] font-bold text-gray-400">-{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '₹'}</span>
                                </div>
                                <span className="text-xl font-black text-gray-900 italic">{coupon.count} <span className="text-[9px] uppercase tracking-tighter not-italic text-gray-400">used</span></span>
                            </div>
                        ))}
                        {stats.couponStats.length === 0 && (
                            <p className="py-10 text-center text-gray-400 font-bold italic tracking-widest text-xs">No coupon usage recorded yet.</p>
                        )}
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 relative z-10">
                        <AlertTriangle className="text-amber-400" />
                        Restock Alerts
                    </h3>
                    <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats.lowStock.map((prod: any) => (
                            <div key={prod.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group/item hover:bg-white/10 transition-all">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-white">{prod.name}</span>
                                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{prod.stock} Kg Remaining</span>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-400">
                                    <ArrowUpRight size={18} />
                                </div>
                            </div>
                        ))}
                        {stats.lowStock.length === 0 && (
                            <div className="py-10 text-center">
                                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
                                <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Inventory Healthy</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
