"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    CreditCard,
    RefreshCcw,
    Clock,
    FileText,
    UserCheck,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

export default function PaymentPolicy() {
    const sections = [
        {
            title: "Pricing Transparency",
            icon: ShieldCheck,
            content: "We believe in clear, upfront pricing. Our quotes are comprehensive and cover design, development, and basic deployment. Any potential additional costs (like premium plugins or hosting) are discussed before project commencement."
        },
        {
            title: "Payment Structure",
            icon: CreditCard,
            content: "Our standard payment term is 50% advance to initiate the project and the remaining 50% upon completion, prior to final handover. For long-term projects, milestone-based payments can be arranged."
        },
        {
            title: "Refund Policy",
            icon: RefreshCcw,
            content: "Advance payments are non-refundable as they secure your spot in our development queue and cover initial research/planning. If we are unable to fulfill our obligations, a full refund of the current phase will be issued."
        },
        {
            title: "Timeline Dependency",
            icon: Clock,
            content: "Project timelines are contingent upon the timely receipt of content, assets, and feedback from your end. Delays in providing these may result in a shift of the final delivery date."
        },
        {
            title: "Revision Policy",
            icon: FileText,
            content: "We provide 2 rounds of minor revisions within the agreed scope. Significant structural changes requested after the design approval phase will be treated as additional scope and quoted separately."
        },
        {
            title: "Delivery & Support",
            icon: UserCheck,
            content: "Final delivery is made once the full payment is received. We provide 15 days of free technical support post-delivery to ensure everything is running smoothly."
        }
    ];

    return (
        <main className="min-h-screen bg-[#fcfcfc] selection:bg-primary/10 font-poppins">
            <Navbar />

            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm"
                    >
                        <ShieldCheck size={16} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Professional Trust</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900"
                    >
                        Payment & Service <br />
                        <span className="text-primary italic">Policy.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-secondary font-bold text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
                    >
                        We value transparency and mutual respect. This policy outlines how we handle payments, delivery, and professional expectations for our web development projects.
                    </motion.p>
                </div>
            </section>

            <section className="pb-32 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
                        >
                            <div className="w-12 h-12 bg-gray-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <section.icon size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-4">{section.title}</h3>
                            <p className="text-xs font-bold text-gray-500 leading-relaxed">{section.content}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mt-20 bg-gray-900 rounded-[3rem] p-10 md:p-16 text-white text-center space-y-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/30 transition-all" />

                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                            <CheckCircle2 size={40} />
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <h2 className="text-3xl font-black italic tracking-tighter">Ready to start?</h2>
                        <p className="text-gray-400 font-medium text-sm max-w-lg mx-auto leading-relaxed">By engaging our services, you agree to these terms. We are committed to delivering high-quality digital solutions for your business.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                        <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            Submit a Requirement
                        </button>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </main>
    );
}
