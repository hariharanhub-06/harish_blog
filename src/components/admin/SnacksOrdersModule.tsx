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
    Trash2,
    Download
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const STATUSES = ["All", "Payment Confirmed", "Parcel Prepared", "Shipping", "Delivered", "Cancel", "Shadow"];

export default function SnacksOrdersModule() {
    const [orders, setOrders] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });
    const [statusFilter, setStatusFilter] = useState("Payment Confirmed");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [fetchingDetailId, setFetchingDetailId] = useState<string | null>(null);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [shippingData, setShippingData] = useState({ courier: "", tracking: "" });
    const [cancelReason, setCancelReason] = useState("");

    const fetchOrders = useCallback(async (offset = 0) => {
        setFetching(true);
        const params = new URLSearchParams();
        if (statusFilter !== "All") {
            const apiStatus = statusFilter === "Shadow" ? "Pending Verification" : statusFilter;
            params.append("status", apiStatus);
        }
        if (search) params.append("search", search);
        params.append("limit", "10");
        params.append("offset", offset.toString());
        params.append("lean", "true"); // Save bandwidth for list view

        const res = await fetch(`/api/snacks/orders?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();
            setOrders(data.orders);
            setPagination(data.pagination);
        }
        setFetching(false);
    }, [statusFilter, search]);

    useEffect(() => {
        fetchOrders(0);
    }, [statusFilter]);

    const fetchOrderDetails = async (orderId: string) => {
        setFetchingDetailId(orderId);
        try {
            const res = await fetch(`/api/snacks/orders/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedOrder(data);
            }
        } catch (error) {
            console.error("Fetch order details error:", error);
        } finally {
            setFetchingDetailId(null);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        if (newStatus === "Shipping") {
            setShowShippingModal(true);
            return;
        }
        if (newStatus === "Cancel") {
            setShowCancelModal(true);
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

    const submitCancel = async () => {
        if (!selectedOrder) return;
        await updateStatus(selectedOrder.id, "Cancel", {
            cancelReason: cancelReason
        });
        setShowCancelModal(false);
        setCancelReason("");
    };

    const handleShipRocket = async () => {
        if (!selectedOrder) return;
        if (!confirm("Create Shiprocket Order & AWB? This will book the shipment.")) return;

        try {
            const res = await fetch("/api/admin/ship", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: selectedOrder.id }),
            });
            const data = await res.json();

            if (res.ok) {
                alert(`Success! AWB: ${data.awbCode || "Generated"}`);
                fetchOrderDetails(selectedOrder.id);
                fetchOrders();
            } else {
                alert(`Failed: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Network Error");
        }
    };

    const handleResetShipment = async () => {
        if (!selectedOrder) return;
        if (!confirm("Are you sure? This will clear the Shiprocket Order ID and allow you to book a new shipment. Use this ONLY if you have cancelled the previous shipment in Shiprocket.")) return;

        try {
            const res = await fetch(`/api/snacks/orders/${selectedOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "Payment Confirmed",
                    shiprocketOrderId: null,
                    shipmentId: null,
                    awbCode: null,
                    courierName: null
                }),
            });

            if (res.ok) {
                alert("Shipment data reset successfully.");
                fetchOrderDetails(selectedOrder.id);
                fetchOrders();
            } else {
                alert("Failed to reset shipment data.");
            }
        } catch (error) {
            console.error(error);
            alert("Network Error");
        }
    };

    const sendWhatsAppUpdate = () => {
        if (!selectedOrder) return;

        let message = `Hello ${selectedOrder.customerName}, your HM Snacks order *${selectedOrder.orderId}* is currently *${selectedOrder.status}*.`;

        if (selectedOrder.status === "Shipping") {
            message += `\n\nIt was shipped via *${selectedOrder.courierName || "Courier"}*.\nTracking ID: *${selectedOrder.shipmentId}*`;
            message += `\n\nTrack your order here: https://hariharanhub.com/business/hm-snacks/track?orderId=${selectedOrder.orderId}`;
        }

        if (selectedOrder.status === "Payment Confirmed") {
            message += `\n\nWe have received your payment of ₹${selectedOrder.totalAmount}. We will pack it shortly!`;
        }

        if (selectedOrder.status === "Cancel") {
            message += `\n\nUnfortunately, your order has been cancelled.\nReason: *${selectedOrder.cancelReason || "Not specified"}*`;
            message += `\n\nIf you have already paid, our team will process your refund shortly.`;
        }

        if (selectedOrder.status === "Delivered") {
            const firstItem = selectedOrder.items?.[0];
            message += `\n\nYour order has been delivered! Hope you loved the snacks. 😊`;
            if (firstItem) {
                message += `\n\n*Write a Review:* https://hariharanhub.com/business/hm-snacks?product=${firstItem.id || firstItem.productId}&review=true`;
            }
        }

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/${selectedOrder.customerMobile}?text=${encodedMsg}`, '_blank');
    };

    const exportToCSV = () => {
        if (orders.length === 0) return;

        // Header
        const headers = ["Order ID", "Date", "Customer Name", "Mobile", "Amount (Total)", "Base Price (95%)", "GST (5%)", "Status", "Items"];

        // Data
        const rows = orders.map(order => {
            const total = parseFloat(order.totalAmount || 0);
            const gst = (total * 5) / 105;
            const base = total - gst;

            return [
                order.orderId,
                new Date(order.createdAt).toLocaleDateString(),
                `"${order.customerName}"`,
                order.customerMobile,
                total.toFixed(2),
                base.toFixed(2),
                gst.toFixed(2),
                order.status,
                `"${(order.items || []).map((i: any) => `${i.name} (${i.quantity}${i.unit || 'Kg'})`).join(', ')}"`
            ];
        });

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `HM-Snacks-Orders-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Payment Confirmed": return "bg-blue-50 text-blue-600";
            case "Parcel Prepared": return "bg-amber-50 text-amber-600";
            case "Shipping": return "bg-indigo-50 text-indigo-600";
            case "Delivered": return "bg-emerald-50 text-emerald-600";
            case "Cancel": return "bg-rose-50 text-rose-600";
            case "Pending Verification": return "bg-purple-50 text-purple-600 animate-pulse";
            case "Shadow": return "bg-purple-50 text-purple-600";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
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
                            className="w-full bg-gray-50 border-0 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-pink-500 transition-all font-bold"
                        />
                    </div>
                    <button
                        onClick={() => fetchOrders(0)}
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
                    >
                        Search
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={orders.length === 0}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download size={16} /> Export CSV
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
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
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
                                            onClick={() => fetchOrderDetails(order.id)}
                                            disabled={fetchingDetailId === order.id}
                                            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-pink-50 hover:text-pink-500 transition-all group-hover:scale-110 disabled:opacity-50"
                                        >
                                            {fetchingDetailId === order.id ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
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

                {/* Pagination Controls */}
                {!fetching && pagination.total > pagination.limit && (
                    <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-white">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} orders
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchOrders(pagination.offset - pagination.limit)}
                                disabled={pagination.offset === 0}
                                className="px-6 py-2 bg-gray-50 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all disabled:opacity-20"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchOrders(pagination.offset + pagination.limit)}
                                disabled={pagination.offset + pagination.limit >= pagination.total}
                                className="px-6 py-2 bg-gray-50 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all disabled:opacity-20"
                            >
                                Next
                            </button>
                        </div>
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
                        <div className="p-4 md:p-12 border-b border-gray-100 flex justify-between items-center bg-[#fafafa]">
                            <div className="flex items-center gap-3 md:gap-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-500 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-pink-200 flex-shrink-0">
                                    <Package size={24} className="md:w-8 md:h-8" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h3 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter italic truncate">{selectedOrder.orderId}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-0.5 md:mt-1">
                                        <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">• {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={sendWhatsAppUpdate} className="p-3 md:p-4 bg-green-500 text-white hover:bg-green-600 rounded-xl md:rounded-2xl transition-all shadow-lg shadow-green-200 flex-shrink-0" title="Send WhatsApp Update">
                                    <Phone size={20} className="md:w-6 md:h-6" />
                                </button>
                                <button onClick={() => setSelectedOrder(null)} className="p-3 md:p-4 hover:bg-gray-200 rounded-xl md:rounded-2xl transition-all flex-shrink-0">
                                    <X size={20} className="text-gray-400 md:w-6 md:h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-grow overflow-y-auto p-4 md:p-12 space-y-8 md:space-y-12">
                            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
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
                                    <div className="p-5 md:p-8 bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] space-y-5 md:space-y-6">
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest flex-shrink-0">Payment (UTR)</span>
                                            <span className="text-[10px] md:text-xs font-black text-gray-900 tracking-tight truncate">{selectedOrder.paymentId || "PENDING"}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest flex-shrink-0">Courier</span>
                                            <span className="text-[10px] md:text-xs font-black text-gray-900 tracking-tight truncate">{selectedOrder.courierName || "UNASSIGNED"}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest flex-shrink-0">Tracking Info</span>
                                            <span className="text-[10px] md:text-xs font-black text-gray-900 tracking-tight font-mono truncate">{selectedOrder.shipmentId || "UNASSIGNED"}</span>
                                        </div>
                                        {selectedOrder.status === "Cancel" && (
                                            <div className="pt-4 border-t border-rose-100">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 block mb-1">Cancellation Reason</span>
                                                <p className="text-xs font-bold text-gray-600 bg-rose-50 p-3 rounded-xl border border-rose-100">{selectedOrder.cancelReason || "No reason provided."}</p>
                                            </div>
                                        )}

                                        {/* Shiprocket Section */}
                                        {selectedOrder.shiprocketOrderId ? (
                                            <div className="pt-4 border-t border-indigo-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Shiprocket Order</span>
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shadow-sm">{selectedOrder.shiprocketOrderId}</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AWB Code</span>
                                                    <span className="text-xs font-black text-gray-900 font-mono tracking-tight">{selectedOrder.awbCode || "Generating..."}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleResetShipment()}
                                                    className="w-full py-2 bg-gray-100 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center gap-2 border border-gray-200"
                                                >
                                                    <X size={14} /> Reset Shipment Data
                                                </button>
                                            </div>
                                        ) : (
                                            selectedOrder.status === "Payment Confirmed" && (
                                                <div className="pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleShipRocket()}
                                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                                    >
                                                        <Truck size={16} /> Ship with Shiprocket
                                                    </button>
                                                </div>
                                            )
                                        )}
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
                                                <p className="text-xs font-bold text-gray-400">Qty: {item.quantity} {item.unit || 'Kg'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-black text-gray-900 italic">₹{Math.ceil((item.price || item.pricePerKg) * item.quantity)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Status Actions */}
                        <div className="p-4 md:p-8 bg-[#fafafa] border-t border-gray-100 flex flex-wrap gap-2 md:gap-3 items-center">
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3 flex-grow">
                                {STATUSES.filter(s => s !== "All").map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleUpdateStatus(selectedOrder.id, s)}
                                        className={`px-3 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder.status === s
                                            ? "bg-gray-900 text-white shadow-xl scale-[1.02] md:scale-105"
                                            : "bg-white text-gray-400 border border-gray-200 hover:border-gray-900 hover:text-gray-900"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                className="p-3 md:p-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl md:rounded-2xl transition-all border border-rose-100 ml-auto flex-shrink-0"
                                title="Delete Order"
                            >
                                <Trash2 size={20} className="md:w-6 md:h-6" />
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
            {/* Cancel Reason Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <XCircle className="text-rose-500" /> Cancel Order
                        </h3>
                        <p className="text-gray-500 font-medium mb-6 italic text-sm">Please provide a reason for cancelling this order. This will be visible to the customer in their WhatsApp update.</p>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Cancellation Reason</label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="e.g. Out of stock, Delivery area not covered, etc."
                                    rows={4}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold resize-none focus:ring-2 focus:ring-rose-500 transition-all font-sans"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason("");
                                    }}
                                    className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-500 hover:bg-gray-100"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={submitCancel}
                                    disabled={!cancelReason}
                                    className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 transition-all shadow-lg shadow-rose-200"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
