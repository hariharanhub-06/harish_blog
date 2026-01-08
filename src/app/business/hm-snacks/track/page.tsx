"use client";

import { useState } from "react";
import { Search, Package, Truck, CheckCircle2, AlertCircle, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

type OrderStatus = "Payment Confirmed" | "Parcel Prepared" | "Shipping" | "Delivered" | "Cancel";

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const res = await fetch(`/api/snacks/track?orderId=${orderId.trim()}`);
            const data = await res.json();

            if (res.ok) {
                setOrder(data);
            } else {
                setError(data.error || "Order not found");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status: string) => {
        if (status === "Cancel") return -1;
        const steps = ["Pending Payment", "Payment Confirmed", "Parcel Prepared", "Shipping", "Delivered"];
        return steps.indexOf(status);
    };

    const currentStep = order ? getStatusStep(order.status) : 0;

    return (
        <div className="container mx-auto px-6 py-24 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter italic">Track Your <span className="text-pink-500">Treats</span></h1>
                    <p className="text-gray-400 font-medium">Enter your Order ID to see where your snacks are.</p>
                </div>

                <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-pink-100 border border-pink-50 flex items-center mb-16">
                    <div className="pl-6 text-pink-500"><Search size={24} /></div>
                    <form onSubmit={handleTrack} className="flex-grow flex">
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="e.g. HMS-1701234567"
                            className="w-full bg-transparent border-0 h-16 px-4 text-lg font-black text-gray-900 placeholder:text-gray-300 focus:ring-0 uppercase placeholder:normal-case"
                        />
                        <button
                            type="button" // Prevent form sub (handled by form) or use submit
                            onClick={handleTrack}
                            disabled={loading}
                            className="bg-gray-900 text-white px-8 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-pink-500 transition-all m-2 disabled:opacity-50"
                        >
                            {loading ? "..." : "Track"}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="p-6 bg-red-50 text-red-500 text-center rounded-2xl font-bold mb-8 animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {order && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-2xl space-y-12"
                    >
                        {/* Status Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">{order.orderId}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest ${order.status === 'Cancel' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                {order.status}
                            </div>
                        </div>

                        {/* Tracker Visual */}
                        {order.status !== "Cancel" ? (
                            <div className="relative">
                                {/* Connecting Line */}
                                <div className="absolute left-[19px] top-0 bottom-0 w-1 bg-gray-100 md:left-0 md:right-0 md:top-[19px] md:bottom-auto md:h-1 md:w-full" />

                                <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
                                    {[
                                        { label: "Ordered", icon: CheckCircle2, step: 1 },
                                        { label: "Packed", icon: Package, step: 2 },
                                        { label: "Shipped", icon: Truck, step: 3 },
                                        { label: "Delivered", icon: MapPin, step: 4 }
                                    ].map((s, i) => {
                                        const isCompleted = currentStep >= s.step;
                                        const isCurrent = currentStep === s.step;
                                        return (
                                            <div key={s.label} className="flex md:flex-col items-center gap-6 md:gap-4 group">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 ${isCompleted ? "bg-pink-500 text-white shadow-lg shadow-pink-200" : "bg-gray-100 text-gray-300"}`}>
                                                    <s.icon size={20} />
                                                </div>
                                                <div className="md:text-center">
                                                    <p className={`font-black text-sm uppercase tracking-widest transition-colors ${isCompleted ? "text-gray-900" : "text-gray-300"}`}>{s.label}</p>
                                                    {isCurrent && <p className="text-[10px] font-bold text-pink-500 animate-pulse">In Progress</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-red-50 rounded-3xl border border-red-100 p-8 space-y-4">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Order Cancelled</h3>
                                    <p className="text-gray-500 font-medium italic">Reason: "{order.cancelReason || "Not specified"}"</p>
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-4 border-t border-red-100">If you have already paid, our team will process your refund shortly.</p>
                            </div>
                        )}

                        {/* Order Items Summary */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Items in this Order</h3>
                            <div className="space-y-4">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 md:gap-6 p-4 bg-gray-50 rounded-2xl">
                                        <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0">
                                            {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900">{item.name}</h4>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Qty: {item.quantity} {item.unit || 'Kg'}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className="font-black text-gray-900 italic">₹{Math.ceil((item.price || item.pricePerKg) * item.quantity)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-baseline pt-4 border-t border-gray-50">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Paid</span>
                                <span className="text-3xl font-black text-gray-900 italic tracking-tighter">₹{order.totalAmount}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/business/hm-snacks" className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs text-center hover:bg-gray-800 transition-all">
                                Order Again
                            </Link>
                            <Link href="/business/hm-snacks#contact" className="flex-1 bg-white border-2 border-gray-100 text-gray-900 py-4 rounded-xl font-black uppercase tracking-widest text-xs text-center hover:border-pink-500 hover:text-pink-500 transition-all">
                                Support
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
