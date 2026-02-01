"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, IndianRupee, ShieldCheck } from "lucide-react";

// Declare Razorpay on window
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface Session {
    id: string;
    title: string;
    price: number;
}

interface SessionRegistrationModalProps {
    session: Session;
    onClose: () => void;
}

export default function SessionRegistrationModal({ session, onClose }: SessionRegistrationModalProps) {
    const [step, setStep] = useState(1); // 1: Details, 2: Success
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        mobile: ""
    });

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        if (!form.name || !form.email || !form.mobile) {
            alert("Please fill all details");
            return;
        }

        setLoading(true);

        try {
            if (!window.Razorpay) {
                alert("Payment gateway is still loading. Please try again in a few seconds.");
                return;
            }
            // 1. Create Order (Only if not free)
            let orderData = { id: "", amount: 0, currency: "INR" };

            if (session.price > 0) {
                const orderRes = await fetch("/api/sessions/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: session.id })
                });

                const data = await orderRes.json();
                if (!orderRes.ok) throw new Error(data.error || "Order creation failed");
                orderData = data;
            } else {
                // For free sessions, directly verify/register
                const verifyRes = await fetch("/api/sessions/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: session.id,
                        userData: form,
                        isFree: true
                    })
                });

                if (verifyRes.ok) {
                    setStep(2);
                    setLoading(false);
                    return;
                } else {
                    const errorData = await verifyRes.json();
                    throw new Error(errorData.error || "Free registration failed");
                }
            }

            // 2. Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Harish Blog",
                description: session.title,
                order_id: orderData.id,
                handler: async (response: any) => {
                    // 3. Verify Payment
                    const verifyRes = await fetch("/api/sessions/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            sessionId: session.id,
                            userData: form
                        })
                    });

                    if (verifyRes.ok) {
                        setStep(2);
                    } else {
                        alert("Payment verification failed!");
                    }
                },
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.mobile
                },
                theme: {
                    color: "#000000"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            console.error("Payment failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Payment init failed. Please try again.";
            alert(`Payment Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 w-full">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>

                <div className="p-8 overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black tracking-tight">Register</h2>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Amount</p>
                                    <p className="text-xl font-black text-primary">₹{session.price}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Full Name</label>
                                    <input
                                        required
                                        className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                        placeholder="john@example.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Mobile Number</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                        placeholder="+91 98765 43210"
                                        value={form.mobile}
                                        onChange={e => setForm({ ...form, mobile: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {loading ? "Processing..." : (session.price === 0 ? "Register Now (Free)" : `Pay ₹${session.price} Securely`)}
                            </button>

                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold flex items-center justify-center gap-1.5">
                                    <ShieldCheck size={12} />
                                    Secured by Razorpay
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-6 py-8 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                                <Check size={40} strokeWidth={4} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Registration Confirmed!</h2>
                                <p className="text-gray-500 font-medium">
                                    Payment Successful. You have access to the session.
                                </p>
                            </div>
                            <div className="bg-emerald-50 p-6 rounded-2xl text-emerald-900 text-sm font-medium">
                                We have sent the <strong>Join Link</strong> to your email ({form.email}).
                            </div>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
