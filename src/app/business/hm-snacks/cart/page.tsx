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
    Home
} from "lucide-react";
import { useCart } from "@/context/CartContext";

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
    const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

    const [shipping, setShipping] = useState(0);

    // Shipping Rates Configuration
    const SHIPPING_RATES: Record<string, number> = {
        "Tamil Nadu": 40,
        "Kerala": 80,
        "Andhra Pradesh": 90,
        "Arunachal Pradesh": 90,
        "Assam": 90,
        "Bihar": 90,
        "Karnataka": 90,
        "Manipur": 90,
        "Chhattisgarh": 200,
        "Goa": 200,
        "Gujarat": 200,
        "Haryana": 200,
        "Himachal Pradesh": 200,
        "Jharkhand": 200,
        "Madhya Pradesh": 200,
        "Maharashtra": 200,
        "Meghalaya": 200,
        "Mizoram": 200,
        "Nagaland": 200,
        "Odisha": 200,
        "Punjab": 200,
        "Rajasthan": 200,
        "Sikkim": 200,
        "Telangana": 200,
        "Uttar Pradesh": 200,
        "Uttarakhand": 200,
        "West Bengal": 200
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalWeight = cart.reduce((acc, item) => acc + (item.unit === "Kg" ? item.quantity : 0.1), 0); // Assuming 0.1kg per batch of pieces for shipping if not specified

    // Calculate Shipping Effect
    useEffect(() => {
        let ratePerKg = 200; // Default fallback for India
        const isAbroad = formData.country.trim().toLowerCase() !== "india";

        if (isAbroad) {
            ratePerKg = 2000;
        } else if (formData.state) {
            // Find rate by state name (case insensitive matching)
            const stateKey = Object.keys(SHIPPING_RATES).find(key =>
                key.toLowerCase() === formData.state.toLowerCase()
            );
            if (stateKey) {
                ratePerKg = SHIPPING_RATES[stateKey];
            }
        }

        // Formula: (Rate * Weight) + 40 (Hidden Packaging)
        // We assume minimum shipping weight of 1kg for calculation if weight is less? 
        // Or proportional? User said "Cost/1kg". Usually implies proportional or per step.
        // Let's do straight multiplication for now: rate * weight. 
        // If weight < 1kg, should we charge for 1kg? "Cost/1kg" usually implies a base rate.
        // Let's use Math.ceil(weight) to charge per started Kg, or just proportional?
        // Given it's courier, it's often per 500g or 1kg steps. 
        // Let's safe-side it: proportional but effectively per kg rate.

        const baseShipping = ratePerKg * totalWeight;
        const packagingCharge = 40;

        setShipping(Math.ceil(baseShipping + packagingCharge));

    }, [formData.state, formData.country, totalWeight]);

    const total = subtotal + shipping;

    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const pin = e.target.value;
        setFormData({ ...formData, pincode: pin });

        if (pin.length === 6) {
            setIsPincodeLoading(true);
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await res.json();
                if (data[0].Status === "Success") {
                    const postOffice = data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev,
                        city: postOffice.Block,
                        state: postOffice.State,
                        country: "India"
                    }));
                }
            } catch (error) {
                console.error("Pincode lookup failed", error);
            }
            setIsPincodeLoading(false);
        }
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.utr || formData.utr.length < 8) {
            alert("Please enter a valid UPI Transaction ID (UTR)");
            return;
        }

        setIsProcessing(true);

        try {
            const res = await fetch('/api/snacks/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    customer: formData,
                    subtotal,
                    shippingCost: shipping,
                    totalAmount: total,
                    paymentMethod: "UPI",
                    utr: formData.utr
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setOrderConfirmed({
                    orderId: data.orderId,
                    message: "Order placed successfully! We will verify your payment shortly."
                });
                clearCart();
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Order error", error);
            alert("Something went wrong.");
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
                <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter italic">Payment Submitted!</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Order ID: {orderConfirmed.orderId}</p>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-10 inline-block max-w-md">
                    <p className="text-amber-600 font-bold text-sm">We are verifying your transaction ID. You will receive a confirmation on WhatsApp shortly.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/business/hm-snacks" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all">Back to Shop</Link>
                    <Link href="/business/hm-snacks/track" className="bg-white border-2 border-gray-100 text-gray-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-pink-500 transition-all">Track Order</Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-6 py-32 text-center">
                <Package size={64} className="text-gray-100 mx-auto mb-6" />
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight italic">Your cart is empty.</h1>
                <p className="text-gray-400 font-medium mb-10">Seems like you haven&apos;t tasted our traditions yet.</p>
                <Link href="/business/hm-snacks" className="bg-pink-500 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-pink-200 hover:scale-105 transition-all inline-block">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-5xl font-black text-gray-900 mb-12 tracking-tight italic">My <span className="text-pink-500">Cart</span></h1>

            <div className="grid lg:grid-cols-3 gap-16">
                {/* Left Side: Cart Items or Form */}
                <div className="lg:col-span-2 space-y-12">
                    {step === 1 ? (
                        <div className="space-y-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
                                    <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden bg-gray-50 flex-shrink-0">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-grow text-center sm:text-left">
                                        <h3 className="text-2xl font-black text-gray-900 mb-1">{item.name}</h3>
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                                            <span className="text-xs font-black uppercase tracking-widest text-pink-500">{item.category}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <span className="text-xs font-black text-gray-400">₹{item.price} / {item.unit}</span>
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
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
                                        <p className="text-3xl font-black text-gray-900 italic">₹{Math.ceil(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-white via-pink-50/30 to-white p-10 rounded-[3rem] shadow-xl border border-pink-100/50 animate-in slide-in-from-left duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-100/20 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32"></div>

                            {/* Back to Cart Button */}
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
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2 flex items-center gap-2">
                                            <User size={12} /> Full Name
                                        </label>
                                        <div className="relative">
                                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/80 border-2 border-pink-100 rounded-2xl pl-12 pr-5 py-5 focus:ring-2 focus:ring-pink-500 focus:border-pink-300 transition-all font-bold text-gray-900 placeholder-gray-300" placeholder="Your full name" />
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={20} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2 flex items-center gap-2">
                                            <MessageCircle size={12} /> WhatsApp Mobile
                                        </label>
                                        <div className="relative">
                                            <input required type="tel" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-white/80 border-2 border-pink-100 rounded-2xl pl-12 pr-5 py-5 focus:ring-2 focus:ring-pink-500 focus:border-pink-300 transition-all font-bold text-gray-900 placeholder-gray-300" placeholder="+91 XXXXX XXXXX" />
                                            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2 flex items-center gap-2">
                                        <Mail size={12} /> Email Address
                                    </label>
                                    <div className="relative">
                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/80 border-2 border-pink-100 rounded-2xl pl-12 pr-5 py-5 focus:ring-2 focus:ring-pink-500 focus:border-pink-300 transition-all font-bold text-gray-900 placeholder-gray-300" placeholder="you@example.com" />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={20} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2 flex items-center gap-2">
                                        <Home size={12} /> Detailed Address
                                    </label>
                                    <div className="relative">
                                        <textarea required rows={3} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-white/80 border-2 border-pink-100 rounded-2xl pl-12 pr-5 py-5 focus:ring-2 focus:ring-pink-500 focus:border-pink-300 transition-all font-bold text-gray-900 placeholder-gray-300" placeholder="House no, Street, Landmark..." />
                                        <Home className="absolute left-4 top-6 text-pink-400" size={20} />
                                    </div>
                                </div>
                                <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-2">Pincode</label>
                                            <div className="relative">
                                                <input required maxLength={6} type="text" value={formData.pincode} onChange={handlePincodeChange} className="w-full bg-white border-0 rounded-xl pl-3 pr-10 py-4 focus:ring-2 focus:ring-pink-500 transition-all font-bold shadow-sm" />
                                                {isPincodeLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-pink-500" />}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-purple-500 ml-2">City</label>
                                            <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full bg-white border-2 border-purple-100 rounded-xl px-3 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-purple-500 ml-2">State</label>
                                            <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full bg-white border-2 border-purple-100 rounded-xl px-3 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-purple-500 ml-2">Country</label>
                                            <input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="w-full bg-white border-2 border-purple-100 rounded-xl px-3 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Side: Order Summary & Payment */}
                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-[5rem] translate-x-10 -translate-y-10 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-700" />

                        <h3 className="text-xl font-black text-gray-900 mb-8 italic">Order <span className="text-pink-500">Summary</span></h3>

                        <div className="space-y-6">
                            <div className="flex justify-between text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors">
                                <span>Gourmet Treats</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors">
                                <span className="flex items-center gap-2 italic">Shipping (Private Courier) <Truck size={14} className="text-pink-500" /></span>
                                <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                            </div>
                            <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total payable</span>
                                    <span className="text-4xl font-black text-gray-900 italic tracking-tighter">₹{total}</span>
                                </div>
                                <ShieldCheck className="text-emerald-500 mb-1" size={32} />
                            </div>
                        </div>

                        {step === 2 && (
                            <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
                                    <Smartphone className="text-pink-500" size={18} />
                                    Step 1: Scan & Pay
                                </h4>
                                <div className="bg-gray-100 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                                    <div className="bg-white p-2 rounded-xl text-center mb-4">
                                        {/* Replace 'hari@okhdfcbank' with your actual UPI ID */}
                                        <Image
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=jvharish06.in@okhdfcbank&pn=HM%20Snacks&am=${total}&cu=INR`)}`}
                                            alt="UPI QR Code"
                                            width={160}
                                            height={160}
                                            unoptimized
                                        />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 text-center">Scan to Pay <span className="text-gray-900">₹{total}</span></p>

                                    {/* Mobile Deep Link */}
                                    <a
                                        href={`upi://pay?pa=jvharish06.in@okhdfcbank&pn=HM%20Snacks&am=${total}&cu=INR`}
                                        className="sm:hidden mt-4 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest w-full text-center hover:bg-gray-800"
                                    >
                                        Tap to Pay on Mobile
                                    </a>

                                    <p className="text-[10px] font-bold text-gray-400 mt-4 text-center max-w-[200px]">
                                        UPI ID: <span className="text-gray-900 select-all">jvharish06.in@okhdfcbank</span>
                                    </p>
                                </div>

                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="text-pink-500" size={18} />
                                    Step 2: Enter Receipt
                                </h4>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Enter UPI Transaction ID (UTR)"
                                        value={formData.utr}
                                        onChange={e => setFormData({ ...formData, utr: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-pink-500 rounded-2xl p-4 font-bold text-center placeholder:text-gray-300 transition-all uppercase placeholder:normal-case"
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium text-center leading-relaxed">
                                        Usually a 12-digit number like <br />
                                        <span className="font-mono bg-gray-100 px-1 rounded text-gray-600">3245xxxx9812</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 1 ? (
                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-pink-500 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-pink-200 hover:bg-pink-600 transition-all mt-10 flex items-center justify-center gap-3"
                            >
                                Continue to Pay <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing || !formData.utr}
                                className="w-full bg-emerald-500 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all mt-6 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                                Submit & Place Order
                            </button>
                        )}
                        {step === 2 && (
                            <button onClick={() => setStep(1)} className="w-full mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Go back to cart</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
