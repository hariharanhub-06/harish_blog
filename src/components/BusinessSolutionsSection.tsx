"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Database, Rocket, Code } from "lucide-react";

export default function BusinessSolutionsSection() {
    return (
        <section className="container mx-auto px-6 py-12 md:py-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-orange-600/10 to-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm overflow-hidden group hover:border-white/20 transition-all duration-500">
                <div className="absolute top-0 right-0 w-full h-full md:w-3/5 opacity-80 group-hover:opacity-100 transition-opacity duration-1000 overflow-hidden rounded-r-[3rem] z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-110 transition-all duration-1000"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-connection-loop-2747-large.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black z-10" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl text-center md:text-left">
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Unified Systems</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
                            Expert <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">Business Solutions</span>
                        </h2>
                        <p className="text-gray-400 font-medium leading-relaxed mb-8">
                            We provide end-to-end digital growth engines and robust financial logistics to scale your operations.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link href="/services" className="px-8 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-orange-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 group whitespace-nowrap">
                                <Code size={18} className="group-hover:rotate-12 transition-transform" /> Business Digital Solution
                            </Link>
                            <Link href="/financial-logistics" className="px-8 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-3 group whitespace-nowrap">
                                <Briefcase size={18} className="group-hover:-rotate-12 transition-transform" /> Financial Logistics
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
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                                className="text-orange-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform"
                            >
                                Book Now <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
