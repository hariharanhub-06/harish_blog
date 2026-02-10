"use client";

import { ArrowRight, CheckCircle2, ShieldCheck, IndianRupee, Briefcase, Rocket, Home, Building2, UserCheck, ShieldClose, HandCoins, FileCheck, Landmark, Phone, MessageSquare, Mail, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { MatrixBackground } from "@/components/MatrixBackground";
import ContactBusinessSection from "@/components/ContactBusinessSection";

export default function FinancialLogisticsPage() {
    const loanTypes = [
        {
            title: "Personal Loan",
            icon: UserCheck,
            desc: "Unsecured personal funding with competitive interest rates and fast processing.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Unsecured Loan",
            icon: ShieldClose,
            desc: "Get funding based on your creditworthiness without collateral requirements.",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Secured Loan",
            icon: ShieldCheck,
            desc: "Asset-backed loans offering lower interest rates and higher loan amounts.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "LAP (Loan Against Property)",
            icon: Landmark,
            desc: "Utilize your property's value to secure large-scale funding for any purpose.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            title: "Business Loan",
            icon: Building2,
            desc: "Tailored financial solutions to scale your business operations and capital.",
            color: "text-pink-500",
            bg: "bg-pink-500/10"
        },
        {
            title: "Two Wheeler Finance",
            icon: Rocket,
            desc: "Quick and easy financing for your motorcycle or scooter with minimal documentation.",
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
            isVehicle: true
        },
        {
            title: "Four Wheeler Finance",
            icon: Landmark,
            desc: "Premium car financing with flexible repayment tenures and quick approvals.",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            isVehicle: true
        }
    ];

    const processSteps = [
        { step: "01", title: "Submit Application", desc: "Fill out our simple digital form with your basic details." },
        { step: "02", title: "Document Review", desc: "Our specialists quickly review your KYC and income proofs." },
        { step: "03", title: "Bank Matching", desc: "We find the best bank offers matching your credit profile." },
        { step: "04", title: "Approval & Payout", desc: "Get sanctioned and have the funds disbursed to your account." }
    ];

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-white relative flex flex-col">
            <MatrixBackground />

            {/* Hero Section */}
            <section className="container mx-auto px-6 pt-12 pb-20 text-center relative z-10">
                <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Financial Logistics</span>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-tight">
                    Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">Loan Consultancy</span> <br className="hidden md:block" /> For Your Dreams
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10 font-medium">
                    Hassle-free financial solutions tailored to your profile. From personal needs to business scaling, we bridge the gap between you and the right funding.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link href="#loan-types" className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-xl">
                        View Loan Options
                    </Link>
                    <Link href="#contact" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm">
                        Get Free Consultation
                    </Link>
                </div>
            </section>

            {/* Loan Types Grid */}
            <section id="loan-types" className="container mx-auto px-6 py-20 relative z-10 scroll-mt-20">
                <div className="flex flex-col items-center mb-16 text-center">
                    <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Our Services</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Financial <span className="text-orange-500">Logistics</span></h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-sm font-medium mt-4">We simplify the complex world of finance, helping you secure the best rates with minimal effort.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loanTypes.map((loan, i) => (
                        <div key={i} className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all hover:-translate-y-1 duration-300 flex flex-col h-full">
                            <div className={`w-14 h-14 ${loan.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                <loan.icon className={loan.color} size={28} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-white group-hover:text-orange-500 transition-colors">{loan.title}</h3>
                            <p className="text-gray-400 text-xs font-bold leading-relaxed flex-grow">
                                {loan.desc}
                            </p>
                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${loan.color}`}>Fast Processing</span>
                                <div className="p-2 bg-white/5 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                    <ArrowUpRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Process Section */}
            <section className="container mx-auto px-6 py-20 relative z-10 border-t border-white/5">
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-16">
                    <div className="text-center mb-16">
                        <span className="text-purple-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Process</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">How It <span className="text-purple-500">Works</span></h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {processSteps.map((item, i) => (
                            <div key={i} className="relative group text-center">
                                <div className="text-5xl font-black text-white/5 absolute -top-4 left-1/2 -translate-x-1/2 group-hover:text-purple-500/10 transition-colors">{item.step}</div>
                                <div className="relative z-10">
                                    <h4 className="text-sm font-black uppercase tracking-tight mb-3 text-white">{item.title}</h4>
                                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-white/10" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="container mx-auto px-6 py-20 relative z-10">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-orange-600/10 to-purple-600/10 border border-white/10 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden">
                    <HandCoins size={200} className="absolute -bottom-10 -right-10 text-white opacity-5 pointer-events-none" />
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
                        Need Financial Support? <br /> <span className="text-orange-500">We've Got You Covered.</span>
                    </h2>
                    <p className="text-gray-400 font-medium mb-10 max-w-xl mx-auto">
                        Don't let capital hold you back. Let our experts find you the best loan tailored to your budget and needs.
                    </p>
                    <Link href="#contact" className="inline-flex items-center gap-3 px-10 py-5 bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20">
                        Start Application Now <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <ContactBusinessSection category="Financial Logistics" />
        </div>
    );
}
