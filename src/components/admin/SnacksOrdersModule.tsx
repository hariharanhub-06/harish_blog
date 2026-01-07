"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Search,
    Filter,
    Calendar,
    Eye,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Loader2,
    X,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    ArrowRight,
    Trash2
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const STATUSES = ["All", "Payment Confirmed", "Parcel Prepared", "Shipping", "Delivered", "Cancel"];

export default function SnacksOrdersModule() {
    const [orders, setOrders] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [shippingData, setShippingData] = useState({ courier: "", tracking: "" });

    const fetchOrders = useCallback(async () => {
        setFetching(true);
        const params = new URLSearchParams();
        if (statusFilter !== "All") params.append("status", statusFilter);
        if (search) params.append("search", search);

        const res = await fetch(`/api/snacks/orders?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();
            setOrders(data);
        }
        setFetching(false);
    }, [statusFilter, search]);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        if (newStatus === "Shipping") {
            setShowShippingModal(true);
            return;
        }
        await updateStatus(orderId, newStatus);
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("Are you sure? This will permanently delete the order from the database.")) return;

        const res = await fetch(`/api/snacks/orders/${orderId}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setSelectedOrder(null);
            fetchOrders();
        } else {
            alert("Failed to delete order");
        }
    };

    const updateStatus = async (orderId: string, newStatus: string, extraData = {}) => {
        const res = await fetch(`/api/snacks/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus, ...extraData }),
        });
        if (res.ok) {
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                // Determine shipment ID and courier name to update local state optimistically or just fetch fresh
                const updated = { ...selectedOrder, status: newStatus, ...extraData };
                setSelectedOrder(updated);
            }
            setShowShippingModal(false);
            setShippingData({ courier: "", tracking: "" });
        }
    };

    const submitShipping = async () => {
        if (!selectedOrder) return;
        await updateStatus(selectedOrder.id, "Shipping", {
            shipmentId: shippingData.tracking,
            courierName: shippingData.courier
        });
    };

    const sendWhatsAppUpdate = () => {
        if (!selectedOrder) return;

        let message = `Hello ${selectedOrder.customerName}, your HM Snacks order *${selectedOrder.orderId}* is currently *${selectedOrder.status}*.`;

        if (selectedOrder.status === "Shipping") {
            message += `\n\nIt was shipped via *${selectedOrder.courierName || "Courier"}*.\nTracking ID: *${selectedOrder.shipmentId}*`;
            message += `\n\nTrack your order here: https://hm-snacks.com/business/hm-snacks/track?orderId=${selectedOrder.orderId}`;
        }

        if (selectedOrder.status === "Payment Confirmed") {
            message += `\n\nWe have received your payment of ₹${selectedOrder.totalAmount}. We will pack it shortly!`;
        }

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/${selectedOrder.customerMobile}?text=${encodedMsg}`, '_blank');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Payment Confirmed": return "bg-blue-50 text-blue-600";
            case "Parcel Prepared": return "bg-amber-50 text-amber-600";
            case "Shipping": return "bg-indigo-50 text-indigo-600";
            case "Delivered": return "bg-emerald-50 text-emerald-600";
            case "Cancel": return "bg-rose-50 text-rose-600";
            case "Pending Verification": return "bg-purple-50 text-purple-600 animate-pulse";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Orders Tracking</h2>
                    <p className="text-gray-400 font-medium">Manage and track customer shipments.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group flex-grow sm:min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-pink-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Order ID, Mobile, Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
                            className="w-full bg-gray-50 border-0 rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-pink-500 transition-all font-bold"
                        />
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-2xl w-fit">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-900"
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Order details</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900 leading-none mb-1">{order.orderId}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{order.customerName}</span>
                                            <span className="text-xs text-gray-400">{order.customerMobile}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black text-gray-900">₹{order.totalAmount}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-all group-hover:scale-110"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && !fetching && (
                    <div className="py-24 text-center">
                        <Package size={48} className="text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No matching orders found.</p>
                    </div>
                )}
                {fetching && (
                    <div className="py-24 flex justify-center">
                        <Loader2 size={32} className="text-pink-500 animate-spin" />
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedOrder(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Modal Header */}
                        <div className="p-8 md:p-12 border-b border-gray-100 flex justify-between items-center bg-[#fafafa]">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-pink-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-pink-200">
                                    <Package size={32} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic">{selectedOrder.orderId}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={sendWhatsAppUpdate} className="p-4 bg-green-500 text-white hover:bg-green-600 rounded-2xl transition-all shadow-lg shadow-green-200" title="Send WhatsApp Update">
                                    <Phone size={24} />
                                </button>
                                <button onClick={() => setSelectedOrder(null)} className="p-4 hover:bg-gray-200 rounded-2xl transition-all">
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-grow overflow-y-auto p-8 md:p-12 space-y-12">
                            <div className="grid md:grid-cols-2 gap-12">
                                {/* Customer Info */}
                                <div className="space-y-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-500 bg-pink-50 w-fit px-4 py-1.5 rounded-full">Customer Intelligence</h4>
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><User size={18} /></div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name</span>
                                                <span className="font-black text-gray-900">{selectedOrder.customerName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Phone size={18} /></div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp</span>
                                                <span className="font-black text-gray-900">{selectedOrder.customerMobile}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><MapPin size={18} /></div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Delivery Address</span>
                                                <span className="font-bold text-gray-600 text-sm">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics / Payment */}
                                <div className="space-y-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 w-fit px-4 py-1.5 rounded-full">Logistics & Payments</h4>
                                    <div className="p-8 bg-gray-50 rounded-[2rem] space-y-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment (UTR)</span>
                                            <span className="text-xs font-black text-gray-900 tracking-tight">{selectedOrder.paymentId || "PENDING"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Courier</span>
                                            <span className="text-xs font-black text-gray-900 tracking-tight">{selectedOrder.courierName || "UNASSIGNED"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Tracking Info</span>
                                            <span className="text-xs font-black text-gray-900 tracking-tight font-mono">{selectedOrder.shipmentId || "UNASSIGNED"}</span>
                                        </div>
                                        <div className="pt-6 border-t border-gray-200">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Revenue</span>
                                                    <span className="text-4xl font-black text-gray-900 italic">₹{selectedOrder.totalAmount}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</span>
                                                    <p className="text-sm font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">{selectedOrder.paymentMethod || "UPI"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Items Purchased</h4>
                                <div className="grid gap-4">
                                    {(selectedOrder.items as any[]).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-6 p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-xl transition-all">
                                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                                {item.imageUrl ? (
                                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                                                ) : (
                                                    <Package size={24} className="m-auto text-gray-200" />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h5 className="font-black text-gray-900">{item.name}</h5>
                                                <p className="text-xs font-bold text-gray-400">Qty: {item.quantity} Kg</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-black text-gray-900 italic">₹{Math.ceil(item.pricePerKg * item.quantity)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Status Actions */}
                        <div className="p-8 bg-[#fafafa] border-t border-gray-100 flex flex-wrap gap-3 items-center">
                            <div className="flex flex-wrap gap-3 flex-grow">
                                {STATUSES.filter(s => s !== "All").map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleUpdateStatus(selectedOrder.id, s)}
                                        className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder.status === s
                                            ? "bg-gray-900 text-white shadow-xl scale-105"
                                            : "bg-white text-gray-400 border border-gray-200 hover:border-gray-900 hover:text-gray-900"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                className="p-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-rose-100 ml-auto"
                                title="Delete Order"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Shipping Details Modal */}
            {showShippingModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <Truck className="text-pink-500" /> Shipping Details
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Courier Partner Name</label>
                                <input
                                    value={shippingData.courier}
                                    onChange={(e) => setShippingData({ ...shippingData, courier: e.target.value })}
                                    placeholder="e.g. DTDC, Professional, Shiprocket"
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Tracking / Awb Number</label>
                                <input
                                    value={shippingData.tracking}
                                    onChange={(e) => setShippingData({ ...shippingData, tracking: e.target.value })}
                                    placeholder="e.g. SHP-992838382"
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => setShowShippingModal(false)}
                                    className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-500 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitShipping}
                                    disabled={!shippingData.courier || !shippingData.tracking}
                                    className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-gray-900 text-white hover:bg-pink-500 disabled:opacity-50 transition-all"
                                >
                                    Confirm Shipment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
