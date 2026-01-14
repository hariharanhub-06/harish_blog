"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cpu,
    Globe,
    Database,
    Zap,
    Shield,
    Boxes,
    Activity,
    Code2,
    Cloud,
    Layout,
    ArrowUpRight
} from "lucide-react";

const NODE_TYPES = [
    {
        id: "web",
        title: "Frontend Evolution",
        icon: Globe,
        color: "from-blue-500 to-cyan-500",
        desc: "High-performance React & Next.js 15 ecosystems with zero-latency interactions.",
        features: ["Server Components", "Micro-animations", "Fluid UI"]
    },
    {
        id: "backend",
        title: "Robust Core",
        icon: Database,
        color: "from-purple-500 to-indigo-500",
        desc: "Scalable PostgreSQL & Node.js architectures designed for enterprise-grade security.",
        features: ["Raw SQL Performance", "Edge Runtime", "Real-time Sync"]
    },
    {
        id: "cloud",
        title: "Cloud Edge",
        icon: Cloud,
        color: "from-emerald-500 to-teal-500",
        desc: "Serverless deployment strategies that minimize globally distributed response times.",
        features: ["Vercel Edge", "AWS Lambda", "Global CDN"]
    },
    {
        id: "security",
        title: "Ironclad Security",
        icon: Shield,
        color: "from-rose-500 to-orange-500",
        desc: "Multi-layer authentication and data encryption protecting your business assets.",
        features: ["Clerk Auth", "AES-256", "Audit Logs"]
    }
];

export default function InnovationHub() {
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const [rotation, setRotation] = useState(0);

    // Auto-rotate effect when no node is active
    useEffect(() => {
        if (activeNode) return;
        const interval = setInterval(() => {
            setRotation(prev => (prev + 0.2) % 360);
        }, 30);
        return () => clearInterval(interval);
    }, [activeNode]);

    return (
        <section id="innovation-hub" className="py-24 px-6 bg-[#030303] relative overflow-hidden min-h-[800px] flex items-center justify-center">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl pointer-events-none">
                <div className="absolute inset-0 border border-white/5 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 md:inset-10 border border-white/5 rounded-full opacity-50"></div>
                <div className="absolute inset-8 md:inset-20 border border-white/5 rounded-full opacity-25"></div>
            </div>

            <div className="container mx-auto max-w-7xl relative z-10 flex flex-col items-center">
                <div className="text-center mb-24 space-y-4">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-blue-400 font-bold tracking-[0.3em] uppercase text-xs"
                    >
                        Interactive Ecosystem
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tight"
                    >
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Innovation Hub</span>
                    </motion.h2>
                    <p className="text-gray-400 font-medium max-w-xl mx-auto text-sm md:text-base">
                        Explore our technical foundation through this interactive matrix of innovation.
                    </p>
                </div>

                {/* Orbit Container */}
                <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
                    {/* Central Core */}
                    <motion.div
                        animate={{
                            scale: activeNode ? 0.9 : 1,
                            rotate: rotation * -0.5
                        }}
                        className="relative z-20 w-32 h-32 md:w-40 md:h-40 glass rounded-[2.5rem] border border-white/10 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.3)] group cursor-pointer"
                        onClick={() => setActiveNode(null)}
                    >
                        <div className="absolute inset-2 border border-white/5 rounded-[2rem] animate-ping opacity-20"></div>
                        <Cpu size={48} className="text-blue-400 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap">
                            Tech Core System
                        </div>
                    </motion.div>

                    {/* Orbiting Nodes */}
                    {NODE_TYPES.map((node, index) => {
                        const angle = (index * (360 / NODE_TYPES.length) + rotation);
                        const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 220;
                        const x = radius * Math.cos((angle * Math.PI) / 180);
                        const y = radius * Math.sin((angle * Math.PI) / 180);

                        return (
                            <motion.div
                                key={node.id}
                                className="absolute z-30"
                                initial={false}
                                animate={{
                                    x,
                                    y,
                                    scale: activeNode === node.id ? 1.2 : 1,
                                    opacity: activeNode && activeNode !== node.id ? 0.3 : 1
                                }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            >
                                <button
                                    onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                                    className={`relative p-5 md:p-6 rounded-2xl glass border transition-all duration-500 group ${activeNode === node.id
                                            ? "border-white/40 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                                            : "border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${node.color} text-white shadow-lg`}>
                                        <node.icon size={24} />
                                    </div>

                                    {/* Line to Core (only visible when active or on desktop) */}
                                    <div
                                        className={`absolute top-1/2 left-1/2 origin-left h-[1px] bg-gradient-to-r from-blue-400/50 to-transparent pointer-events-none transition-opacity duration-500 ${activeNode === node.id ? 'opacity-50' : 'opacity-0'}`}
                                        style={{
                                            width: radius,
                                            transform: `rotate(${angle + 180}deg)`
                                        }}
                                    ></div>
                                </button>
                            </motion.div>
                        );
                    })}

                    {/* Active Node Details Sideboard */}
                    <AnimatePresence>
                        {activeNode && (
                            <motion.div
                                initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                                className="absolute right-[-20%] md:right-[-60%] top-1/2 -translate-y-1/2 w-[280px] md:w-[350px] p-8 glass rounded-[2.5rem] border border-white/20 z-50 shadow-2xl backdrop-blur-3xl"
                            >
                                {NODE_TYPES.find(n => n.id === activeNode) && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${NODE_TYPES.find(n => n.id === activeNode)?.color} flex items-center justify-center text-white shadow-xl`}>
                                                {(() => {
                                                    const Icon = NODE_TYPES.find(n => n.id === activeNode)?.icon;
                                                    return Icon ? <Icon size={24} /> : null;
                                                })()}
                                            </div>
                                            <button
                                                onClick={() => setActiveNode(null)}
                                                className="text-white/40 hover:text-white transition-colors"
                                            >
                                                <Boxes size={20} />
                                            </button>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-black text-white italic tracking-tight mb-2">
                                                {NODE_TYPES.find(n => n.id === activeNode)?.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                                {NODE_TYPES.find(n => n.id === activeNode)?.desc}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Core Capabilities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {NODE_TYPES.find(n => n.id === activeNode)?.features.map((f, i) => (
                                                    <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest transition-colors hover:bg-white/10 cursor-default">
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <button className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl">
                                            Deep Dive <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Visual Guide */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: activeNode ? 0 : 0.5 }}
                    className="mt-32 text-center"
                >
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4">
                        <span className="w-12 h-[1px] bg-white/10"></span>
                        Click a node to deconstruct
                        <span className="w-12 h-[1px] bg-white/10"></span>
                    </p>
                </motion.div>
            </div>

            <style jsx>{`
                .glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
            `}</style>
        </section>
    );
}
