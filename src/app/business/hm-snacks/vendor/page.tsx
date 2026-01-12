"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Package, Truck, Users, TrendingUp, ShieldCheck,
    MessageSquare, CheckCircle, ArrowRight, UserPlus,
    Store, Zap, BarChart3, Globe
} from "lucide-react";

const steps = [
    {
        icon: MessageSquare,
        title: "Report an Enquiry",
        description: "Reach out to us with your snack details and manufacturing capacity.",
        color: "bg-blue-500"
    },
    {
        icon: Users,
        title: "Team Consulting",
        description: "Our experts will guide you through our quality standards and partnership terms.",
        color: "bg-purple-500"
    },
    {
        icon: Store,
        title: "Start Selling",
        description: "Get listed on our platform and reach thousands of snack lovers worldwide.",
        color: "bg-emerald-500"
    },
    {
        icon: ShieldCheck,
        title: "Zero Loss",
        description: "Our efficient inventory and order management system ensures you never lose a penny.",
        color: "bg-orange-500"
    },
    {
        icon: Package,
        title: "Free Packaging",
        description: "We provide high-quality packing materials for every order you receive.",
        color: "bg-pink-500"
    },
    {
        icon: Globe,
        title: "1000+ Affiliates",
        description: "Our massive network of dedicated affiliates will actively promote your products.",
        color: "bg-indigo-500"
    }
];

const benefits = [
    {
        icon: Zap,
        title: "Instant Visibility",
        text: "Launch your products to an established premium audience immediately."
    },
    {
        icon: Truck,
        title: "Global Logistics",
        text: "We handle the end-to-end shipping process via Shiprocket integration."
    },
    {
        icon: BarChart3,
        title: "Growth Analytics",
        text: "Detailed dashboards to track your sales, returns, and customer feedback."
    }
];

function VendorPageContent() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white -z-10" />
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-100/30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto max-w-6xl text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100"
                    >
                        Vendor Partnership Program
                    </motion.div>

                    <h1 className="text-5xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-none">
                        Scale Your Snack Business <br />
                        <span className="text-indigo-600 italic">Globally.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto font-medium">
                        Import your snacks here. We provide the platform, the packaging, and the audience. You provide the taste.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="#enquiry-form"
                            className="w-full sm:w-auto bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black transition-all hover:scale-105 flex items-center justify-center gap-3"
                        >
                            Report Enquiry <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/business/hm-snacks/vendor/login"
                            className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all hover:scale-105 flex items-center justify-center gap-3"
                        >
                            Vendor Login <ArrowRight size={18} />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Procedure Steps */}
            <section className="py-24 px-4 bg-white relative">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Simple <span className="text-indigo-600 italic">Procedure</span></h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Six steps to global success</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative"
                            >
                                <div className="bg-gray-50 rounded-3xl p-10 h-full border border-gray-100 hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500">
                                    <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        <step.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute top-10 right-10 text-7xl font-black text-gray-200/50 -z-0">
                                        0{index + 1}
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 text-gray-900 relative z-10">{step.title}</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed relative z-10">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Join Section */}
            <section className="py-24 px-4 bg-gray-50">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-4xl md:text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-tight">
                                    Why Partner With <br />
                                    <span className="text-indigo-600 italic">HM Snacks?</span>
                                </h2>
                                <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                    We bridge the gap between traditional craftsmen and modern global markets. When you partner with us, you're not just selling a product; you're joining a legacy.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {benefits.map((benefit, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
                                    >
                                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                                            <benefit.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-900 mb-1">{benefit.title}</h4>
                                            <p className="text-gray-500 font-medium">{benefit.text}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                                <img
                                    src="/images/vendor-craftsmanship.png"
                                    className="w-full h-full object-cover"
                                    alt="Vendor Craftsmanship"
                                />
                            </div>
                            <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-3xl shadow-2xl max-w-xs border border-gray-100">
                                <div className="text-4xl font-black text-indigo-600 mb-2">100+</div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Successfull Vendors Already Growing with us</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enquiry Form Section */}
            <section id="enquiry-form" className="py-24 px-4 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-gray-900 rounded-[3rem] p-8 md:p-20 shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full" />

                        <div className="relative z-10 text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Start Your Journey</h2>
                            <p className="text-gray-400 font-medium italic">Fill out the enquiry form below and our team will get back to you within 24 hours.</p>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const formData = new FormData(form);
                                const data = {
                                    name: formData.get("name"),
                                    mobile: formData.get("mobile"),
                                    email: formData.get("email"),
                                    message: `Vendor Enquiry: ${formData.get("message")}`,
                                    category: "Vendor"
                                };

                                const btn = form.querySelector("button");
                                if (btn) {
                                    btn.disabled = true;
                                    btn.innerText = "Processing...";
                                }

                                try {
                                    const res = await fetch("/api/contact", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(data)
                                    });

                                    if (res.ok) {
                                        alert("Thank you! Our team will contact you shortly.");
                                        form.reset();
                                    } else {
                                        alert("Something went wrong. Please try again.");
                                    }
                                } catch (err) {
                                    alert("Submission failed.");
                                } finally {
                                    if (btn) {
                                        btn.disabled = false;
                                        btn.innerText = "Report Enquiry";
                                    }
                                }
                            }}
                            className="space-y-6 relative z-10"
                        >
                            <div className="grid md:grid-cols-2 gap-6">
                                <input required name="name" type="text" placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                                <input required name="mobile" type="tel" placeholder="Mobile Number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            </div>
                            <input required name="email" type="email" placeholder="Business Email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            <textarea required name="message" rows={4} placeholder="Tell us about your products..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none" />
                            <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
                                Report Enquiry
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function VendorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <VendorPageContent />
        </Suspense>
    );
}
