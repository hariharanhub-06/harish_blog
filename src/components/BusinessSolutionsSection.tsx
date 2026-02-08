"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Database, Rocket } from "lucide-react";

export default function BusinessSolutionsSection() {
    return (
        <section className="container mx-auto px-6 py-12 md:py-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-orange-600/10 to-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 text-center md:text-left shadow-2xl backdrop-blur-sm overflow-hidden group hover:border-white/20 transition-all duration-500">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700">
                    <Rocket size={200} className="text-white" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl">
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">For Entrepreneurs & Founders</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
                            Business <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">Solutions</span>
                        </h2>
                        <p className="text-gray-400 font-medium leading-relaxed mb-8">
                            Looking to scale? We build high-performance websites and automated CRM systems tailored for small businesses, coaching centers, and startups.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <Link href="/services" className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-lg flex items-center gap-2">
                                <Briefcase size={14} /> Explore Services
                            </Link>
                            <Link href="/crm-solutions" className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-purple-500/20 hover:border-purple-500/50 transition-all flex items-center gap-2">
                                <Database size={14} /> Custom CRM
                            </Link>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-4">
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5 md:w-[280px] hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Free Consultation</span>
                            </div>
                            <p className="text-sm font-bold text-white mb-4">Discuss your project with an expert today.</p>
                            <Link href="/contact-business" className="text-orange-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
                                Book Now <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
