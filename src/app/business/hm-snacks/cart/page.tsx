"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    Truck,
    CreditCard,
    ShieldCheck,
    Package,
    MapPin,
    Loader2,
    CheckCircle2,
    QrCode,
    Smartphone,
    User,
    MessageCircle,
    Mail,
    Home,
    Ticket
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import imageKitLoader from "@/lib/imagekitLoader";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const [step, setStep] = useState(1); // 1: Cart, 2: Checkout
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        address: "",
        pincode: "",
        city: "",
        state: "",
        country: "India",
        utr: ""
    });
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [smartAmount, setSmartAmount] = useState<number | null>(null);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

    // Poll for Payment Status
    useEffect(() => {
        if (step === 3 && pendingOrderId) {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/snacks/orders/${pendingOrderId}/status`);
                    const data = await res.json();
                    if (data.confirmed) {
                        setOrderConfirmed({
                            orderId: pendingOrderId,
                            message: "Payment Confirmed Instantly!"
                        });
                        clearCart();
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 3000); // Check every 3 seconds

            return () => clearInterval(interval);
        }
    }, [step, pendingOrderId, clearCart]);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields = ['name', 'mobile', 'email', 'address', 'pincode', 'city', 'state', 'country'];
        const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.toString().trim());

        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            setStep(2);
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Create Order on Backend (Razorpay)
            // Note: We use 'total' amount.
            const orderRes = await fetch('/api/payment/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total, currency: "INR" })
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                alert("Failed to initiate payment. Please try again.");
                setIsProcessing(false);
                return;
            }

            // 2. Create Order in Database (Status: Pending)
            const dbOrderRes = await fetch('/api/snacks/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    customer: formData,
                    subtotal,
                    shippingCost: shipping,
                    discountAmount,
                    couponCode: appliedCoupon?.code,
                    totalAmount: total,
                    paymentMethod: "Razorpay",
                    paymentId: orderData.id // Save Razorpay Order ID temporarily
                })
            });
            const dbOrderData = await dbOrderRes.json();

            if (!dbOrderData.success) {
                alert("Failed to save order details.");
                setIsProcessing(false);
                return;
            }


            // 3. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_S1hLMtOmZYoOqE", // Fallback if env not loaded yet on client
                amount: orderData.amount,
                currency: orderData.currency,
                name: "HM Snacks",
                description: "Gourmet Snacks Order",
                // image: "/logo.png", // Add logo if available
                order_id: orderData.id,
                handler: async function (response: any) {
                    // 4. Verify Payment on Backend
                    try {
                        const verifyRes = await fetch("/api/payment/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                db_order_id: dbOrderData.orderId
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            setOrderConfirmed({
                                orderId: dbOrderData.orderId,
                                message: "Payment Successful!"
                            });
                            clearCart();
                        } else {
                            alert("Payment verification failed. Please contact support.");
                        }
                    } catch (error) {
                        console.error("Verification Error", error);
                        alert("Payment successful but verification failed locally. Contact support.");
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.mobile,
                },
                theme: {
                    color: "#ec4899", // Pink-500
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                alert(`Payment Failed: ${response.error.description}`);
            });
            rzp1.open();

        } catch (error) {
            console.error("Order error", error);
            alert("Something went wrong initializing payment.");
        }
        setIsProcessing(false);
    };

    if (orderConfirmed) {
        return (
            <div className="container mx-auto px-6 py-32 text-center h-[80vh] flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-200">
                        <CheckCircle2 size={48} />
                    </div>
                </motion.div>
                <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter italic">Order Placed!</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Order ID: {orderConfirmed.orderId}</p>
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-10 inline-block max-w-md">
                    <p className="text-emerald-700 font-bold text-sm">Thank you for your purchase. You will receive a confirmation shortly.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/business/hm-snacks" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all">Back to Shop</Link>
                    <Link href="/business/hm-snacks/track" className="bg-white border-2 border-gray-100 text-gray-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-pink-500 transition-all">Track Order</Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0 && step === 1) { // Only show empty if not in checkout flow
        return (
            <div className="container mx-auto px-6 py-32 text-center">
                <Package size={64} className="text-gray-100 mx-auto mb-6" />
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight italic">Your cart is empty.</h1>
                <Link href="/business/hm-snacks" className="bg-pink-500 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-pink-200 hover:scale-105 transition-all inline-block mt-8">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-5xl font-black text-gray-900 mb-12 tracking-tight italic">My <span className="text-pink-500">Cart</span></h1>

            <div className="grid lg:grid-cols-3 gap-16">
                {/* Left Side */}
                <div className="lg:col-span-2 space-y-12">
                    {step === 1 && (
                        <div className="space-y-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
                                    <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden bg-gray-50 flex-shrink-0">
                                        <Image
                                            loader={imageKitLoader}
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="128px"
                                        />
                                    </div>
                                    <div className="flex-grow text-center sm:text-left">
                                        <h3 className="text-2xl font-black text-gray-900 mb-1">{item.name}</h3>
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                                            <span className="text-xs font-black uppercase tracking-widest text-pink-500">{item.category}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-gray-400">₹{item.price} x {item.quantity} {item.unit}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-4">
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 px-3">
                                                <button
                                                    onClick={() => {
                                                        const step = item.unit === "Kg" ? 0.25 : 5;
                                                        updateQuantity(item.id, item.quantity - step, item.unit);
                                                    }}
                                                    className="p-2 hover:text-pink-500 disabled:opacity-30"
                                                    disabled={item.unit === "Kg" ? item.quantity <= 0.25 : item.quantity <= 10}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-20 text-center font-black text-sm italic">{item.quantity} {item.unit}</span>
                                                <button
                                                    onClick={() => {
                                                        const step = item.unit === "Kg" ? 0.25 : 5;
                                                        updateQuantity(item.id, item.quantity + step, item.unit);
                                                    }}
                                                    className="p-2 hover:text-pink-500"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-rose-500 transition-colors p-2"><Trash2 size={20} /></button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-gray-900 italic">₹{Math.ceil(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-gradient-to-br from-white via-pink-50/30 to-white p-10 rounded-[3rem] shadow-xl border border-pink-100/50 animate-in slide-in-from-left duration-500 relative overflow-hidden">
                            {/* ... Same Form Code ... */}
                            <button
                                onClick={() => setStep(1)}
                                className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-pink-500 hover:text-pink-600 transition-colors group"
                            >
                                <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                                <span>Edit Cart Items</span>
                            </button>

                            <h2 className="text-2xl font-black mb-10 flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200"><MapPin size={24} /></div>
                                Delivery Information
                            </h2>
                            <form className="space-y-6 relative z-10">
                                {/* Only fields are needed here, copying exact input logic for brevity in replacement/or re-using existing via reference if I could, but replacer needs full block. I will implement the form fields exactly as before to ensure no data loss */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2">Full Name</label>
                                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/80 border-2 border-pink-100 rounded-2xl px-5 py-5 font-bold text-gray-900" placeholder="Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2">WhatsApp Mobile</label>
                                        <input required type="tel" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-white/80 border-2 border-pink-100 rounded-2xl px-5 py-5 font-bold text-gray-900" placeholder="Mobile" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2">Email</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/80 border-2 border-pink-100 rounded-2xl px-5 py-5 font-bold text-gray-900" placeholder="Email" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2">Address</label>
                                    <textarea required rows={3} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-white/80 border-2 border-pink-100 rounded-2xl px-5 py-5 font-bold text-gray-900" placeholder="Address..." />
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2">Pincode</label>
                                        <div className="relative">
                                            <input required maxLength={6} value={formData.pincode} onChange={handlePincodeChange} className="w-full bg-white border-0 rounded-xl px-3 py-4 font-bold shadow-sm" placeholder="123456" />
                                            {isPincodeLoading && <Loader2 className="absolute right-3 top-3 animate-spin text-pink-500" size={16} />}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2">City</label>
                                        <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full bg-white border-2 border-pink-100 rounded-xl px-3 py-4 font-bold text-gray-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2">State</label>
                                        <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full bg-white border-2 border-pink-100 rounded-xl px-3 py-4 font-bold text-gray-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2">Country</label>
                                        <input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="w-full bg-white border-2 border-pink-100 rounded-xl px-3 py-4 font-bold text-gray-900" />
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 3 && smartAmount && (
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-emerald-100 animate-in zoom-in-95 duration-500 text-center">
                            <h2 className="text-3xl font-black text-gray-900 mb-2 italic">Scan to <span className="text-emerald-500">Auto-Confirm</span></h2>
                            <p className="text-gray-400 font-bold mb-8 text-sm">Please pay the EXACT amount shown below</p>

                            <div className="relative inline-block mb-8 p-4 bg-white rounded-3xl shadow-lg border border-gray-100">
                                <Image
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=jvharish06.in@okhdfcbank&pn=HM%20Snacks&am=${smartAmount}&cu=INR`)}`}
                                    alt="UPI QR Code"
                                    width={200}
                                    height={200}
                                    unoptimized
                                    className="rounded-xl"
                                />
                                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-3xl animate-pulse"></div>
                            </div>

                            <div className="bg-emerald-50 p-6 rounded-2xl max-w-sm mx-auto mb-8 border border-emerald-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Total Amount to Pay</p>
                                <p className="text-5xl font-black text-emerald-600 tracking-tighter">₹{smartAmount}</p>
                                <p className="text-xs font-bold text-emerald-400 mt-2 italic">Do not round off this amount!</p>
                            </div>

                            <div className="flex items-center justify-center gap-3 text-gray-400 animate-pulse">
                                <Loader2 className="animate-spin" />
                                <span className="font-bold text-xs uppercase tracking-widest">Checking for payment...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Summary & Actions */}
                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-[5rem] translate-x-10 -translate-y-10 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-700" />

                        <h3 className="text-xl font-black text-gray-900 mb-8 italic">Order <span className="text-pink-500">Summary</span></h3>

                        <div className="space-y-6">
                            <div className="flex justify-between text-sm font-bold text-gray-500">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-500">
                                <span>Shipping</span>
                                <span>₹{shipping}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm font-bold text-emerald-500">
                                    <span>Discount</span>
                                    <span>-₹{discountAmount}</span>
                                </div>
                            )}

                            {/* Coupon Input Area */}
                            {step === 1 && (
                                <div className="pt-4 space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="COUPON"
                                            disabled={!!appliedCoupon}
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-xs font-black uppercase focus:ring-2 focus:ring-pink-200"
                                        />
                                        <button onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode} className="bg-gray-900 text-white px-4 rounded-xl font-bold text-[10px]">APPLY</button>
                                    </div>
                                    {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                                    {appliedCoupon && <p className="text-[10px] text-emerald-500 font-bold">Applied!</p>}
                                </div>
                            )}

                            <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total</span>
                                <span className="text-4xl font-black text-gray-900 italic tracking-tighter">₹{step === 3 && smartAmount ? smartAmount : total}</span>
                            </div>
                        </div>

                        {step === 1 && (
                            <button onClick={() => setStep(2)} className="w-full bg-pink-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all mt-10">
                                Checkout
                            </button>
                        )}


                        {step === 2 && (
                            <button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-black transition-all mt-10 flex items-center justify-center gap-2">
                                {isProcessing ? <Loader2 className="animate-spin" /> : "Pay Now (Razorpay)"}
                            </button>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}
