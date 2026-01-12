"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    UserPlus, Code, Share2, DollarSign, TrendingUp,
    CheckCircle, Gift, Award, Users, Smartphone, MessageCircle, Link as LinkIcon
} from "lucide-react";

const commissionPlans = [
    { name: "Newbie", orders: "0-20", rate: "30%", color: "from-gray-400 to-gray-500" },
    { name: "Starter", orders: "21-50", rate: "35%", color: "from-blue-400 to-blue-500" },
    { name: "Silver", orders: "51-100", rate: "40%", color: "from-gray-300 to-gray-400" },
    { name: "Golden", orders: "101-150", rate: "45%", color: "from-yellow-400 to-yellow-500" },
    { name: "Platinum", orders: "151-180", rate: "50%", color: "from-purple-400 to-purple-500" },
    { name: "Pro", orders: "181-200", rate: "55%", color: "from-pink-400 to-pink-500" },
    { name: "Elite", orders: "201+", rate: "60%", color: "from-orange-500 to-red-500" },
];

const steps = [
    {
        icon: UserPlus,
        title: "Register",
        description: "Fill a simple form with your name, mobile number and UPI ID.",
        color: "bg-blue-500"
    },
    {
        icon: Code,
        title: "Get Your Code",
        description: "You will receive a unique coupon code like HMS12345.",
        color: "bg-green-500"
    },
    {
        icon: Share2,
        title: "Share",
        description: "Share your code on WhatsApp, Instagram, YouTube, and Facebook.",
        color: "bg-purple-500"
    },
    {
        icon: DollarSign,
        title: "Earn",
        description: "Earn commission for every order placed using your code.",
        color: "bg-orange-500"
    },
];

function AffiliatePageContent() {
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        fullName: "",
        mobile: "",
        upiId: "",
        email: "",
        socialLink: "",
        referrerCode: "",
        isPaid: true,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref) {
            setFormData(prev => ({ ...prev, referrerCode: ref }));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/affiliate/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setFormData({
                    fullName: "",
                    mobile: "",
                    upiId: "",
                    email: "",
                    socialLink: "",
                    referrerCode: "",
                    isPaid: true
                });
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const scrollToForm = () => {
        document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto max-w-6xl text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6">
                        Become an Affiliate &<br />
                        <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            Earn With Every Order
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
                        Promote HM Snacks and earn up to <span className="font-bold text-orange-600">20% commission</span> on every successful order.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={scrollToForm}
                            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-105"
                        >
                            Join Now →
                        </button>
                        <Link
                            href="/business/hm-snacks/affiliate/login"
                            className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-100 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all hover:scale-105"
                        >
                            Partner Login
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 h-full">
                                    <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <step.icon className="w-8 h-8 text-white" />
                                    </div>

                                    <div className="absolute top-6 right-6 text-6xl font-black text-gray-100">
                                        {index + 1}
                                    </div>

                                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Commission Plans Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-orange-50">
                <div className="container mx-auto max-w-7xl">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-gray-900">
                        Commission Plans
                    </h2>
                    <p className="text-center text-gray-600 mb-12 italic">
                        Plans are upgraded automatically based on your performance.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                        {commissionPlans.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <div className={`bg-gradient-to-br ${plan.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 h-full flex flex-col justify-between`}>
                                    <div>
                                        <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
                                        <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                                        <p className="text-sm opacity-90 mb-4">{plan.orders} Orders</p>
                                    </div>
                                    <div className="text-4xl font-black">{plan.rate}</div>
                                    <div className="text-xs opacity-75 mt-2">Commission</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tracking Method Section */}
            <section className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-10 text-gray-900">
                        Easy & Transparent Tracking
                    </h2>

                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-10 shadow-xl border border-blue-100">
                        <div className="flex items-start gap-4 mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
                            <p className="text-lg text-gray-700 leading-relaxed">
                                We use <span className="font-bold text-blue-600">coupon-code based tracking</span>. Each affiliate gets a unique coupon code.
                            </p>
                        </div>

                        <div className="flex items-start gap-4 mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
                            <p className="text-lg text-gray-700 leading-relaxed">
                                When customers apply your code during checkout, the order is automatically counted as your sale.
                            </p>
                        </div>

                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
                            <p className="text-lg text-gray-700 leading-relaxed">
                                This ensures <span className="font-bold text-purple-600">simple, accurate, and transparent</span> tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration Form Section */}
            <section id="registration-form" className="py-20 px-4 bg-gradient-to-br from-orange-50 to-pink-50">
                <div className="container mx-auto max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-900">
                        Join as an Affiliate
                    </h2>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-100 border border-green-300 text-green-800 px-6 py-4 rounded-2xl mb-6 text-center font-semibold"
                        >
                            {message}
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-2xl mb-6 text-center font-semibold"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-100">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    pattern="[0-9]{10}"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all"
                                    placeholder="10-digit mobile number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    UPI ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.upiId}
                                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all"
                                    placeholder="yourname@paytm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Referral Code (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.referrerCode}
                                    onChange={(e) => setFormData({ ...formData, referrerCode: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all uppercase"
                                    placeholder="e.g. HMS12345"
                                    disabled={!!searchParams.get("ref")}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4">
                                    Membership Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 gap-4">
                                    <label className={`relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.isPaid ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-100 bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="membership"
                                            checked={formData.isPaid}
                                            onChange={() => setFormData({ ...formData, isPaid: true })}
                                            className="hidden"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-black text-gray-900">Directly Approved (Paid)</span>
                                                <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-black uppercase">₹100</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium italic">Instant approval + eligibility for higher commission tiers.</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 ml-4 flex items-center justify-center ${formData.isPaid ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                                            {formData.isPaid && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </label>

                                    <label className={`relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${!formData.isPaid ? 'border-rose-400 bg-rose-50 shadow-md' : 'border-gray-100 bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="membership"
                                            checked={!formData.isPaid}
                                            onChange={() => setFormData({ ...formData, isPaid: false })}
                                            className="hidden"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-black text-gray-900">Wait for Approval (Non-Paid)</span>
                                                <span className="bg-gray-400 text-white text-[10px] px-2 py-0.5 rounded-lg font-black uppercase">FREE</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium italic">Admin approval required. Permanently limited to "Newbie" tier (30%).</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 ml-4 flex items-center justify-center ${!formData.isPaid ? 'border-rose-400 bg-rose-400' : 'border-gray-300'}`}>
                                            {!formData.isPaid && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Registering..." : formData.isPaid ? "Pay ₹100 & Join" : "Submit Request"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Performance & Payout Info Section */}
            <section className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-900">
                        Performance & Payments
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { icon: TrendingUp, text: "Track sales using your unique coupon code" },
                            { icon: DollarSign, text: "Payouts are processed weekly or monthly" },
                            { icon: Smartphone, text: "Payments via UPI / Bank Transfer" },
                            { icon: CheckCircle, text: "Minimum payout threshold: ₹500" },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100"
                            >
                                <item.icon className="w-10 h-10 text-blue-600 flex-shrink-0" />
                                <p className="text-gray-800 font-semibold">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Motivation Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-12 text-gray-900">
                        Top Affiliate Rewards
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: DollarSign, title: "Bonus Cash", desc: "Top affiliate of the month gets bonus cash", color: "from-green-400 to-emerald-500" },
                            { icon: Gift, title: "Free Snack Box", desc: "Free snack gift box for top performers", color: "from-orange-400 to-pink-500" },
                            { icon: Award, title: "Featured", desc: "Featured on our Instagram page", color: "from-purple-400 to-blue-500" },
                        ].map((reward, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className={`bg-gradient-to-br ${reward.color} text-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105`}
                            >
                                <reward.icon className="w-12 h-12 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold mb-2">{reward.title}</h3>
                                <p className="opacity-90">{reward.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function AffiliatePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        }>
            <AffiliatePageContent />
        </Suspense>
    );
}
