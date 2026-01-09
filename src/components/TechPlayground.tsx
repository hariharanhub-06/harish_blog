"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Cpu, Zap, Box, Layers, Play, RefreshCw, CheckCircle2 } from "lucide-react";

export default function TechPlayground() {
    const [activeDemo, setActiveDemo] = useState<"terminal" | "architecture" | "deployment">("terminal");

    const demos = [
        { id: "terminal", title: "Smart Terminal", icon: Terminal, color: "from-emerald-500 to-teal-500" },
        { id: "architecture", title: "Live Architecture", icon: Cpu, color: "from-blue-500 to-indigo-500" },
        { id: "deployment", title: "Safe Deployment", icon: Zap, color: "from-purple-500 to-pink-500" },
    ];

    return (
        <section id="playground" className="py-24 px-6 bg-[#030303] relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-blue-400 font-bold tracking-[0.2em] uppercase text-sm">Interactive lab</span>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Playground</span></h2>
                    <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">
                        Experience our technical capabilities through live interactive simulations.
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Navigation */}
                    <div className="lg:col-span-1 space-y-4">
                        {demos.map((demo) => (
                            <button
                                key={demo.id}
                                onClick={() => setActiveDemo(demo.id as any)}
                                className={`w-full p-6 rounded-3xl border transition-all flex items-center gap-4 text-left group overflow-hidden relative ${activeDemo === demo.id
                                    ? "bg-white/10 border-white/20 text-white shadow-2xl"
                                    : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                                    }`}
                            >
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${demo.color} text-white`}>
                                    <demo.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold uppercase tracking-widest text-[10px] mb-1 opacity-50">Module</p>
                                    <p className="font-black text-lg">{demo.title}</p>
                                </div>
                                {activeDemo === demo.id && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-4 md:p-8 min-h-[500px] relative overflow-hidden shadow-2xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeDemo}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="h-full w-full"
                            >
                                {activeDemo === "terminal" && <TerminalDemo />}
                                {activeDemo === "architecture" && <ArchitectureDemo />}
                                {activeDemo === "deployment" && <DeploymentDemo />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TerminalDemo() {
    const [lines, setLines] = useState([
        { text: "system init --verbose", type: "input" },
        { text: "Loading kernel components...", type: "output" },
        { text: "Optimizing UI runtime (Next.js 15)...", type: "output" },
        { text: "Establishing secure SSL tunnel...", type: "output" },
        { text: "System Ready. Execute command?", type: "system" },
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const runScan = () => {
        if (isTyping) return;
        setIsTyping(true);
        const newLines = [...lines, { text: "audit network --deep", type: "input" }];
        setLines(newLines);

        setTimeout(() => {
            setLines(prev => [...prev, { text: "Scanning 1.2k assets...", type: "output" }]);
            setTimeout(() => {
                setLines(prev => [...prev, { text: "Result: 0 Vulnerabilities. Performance Score: 98/100", type: "success" }]);
                setIsTyping(false);
            }, 1000);
        }, 800);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="bg-black/40 rounded-3xl p-6 font-mono text-sm h-full border border-white/5 space-y-3 overflow-y-auto">
                {lines.map((line, i) => (
                    <div key={i} className="flex gap-3">
                        <span className={`opacity-50 ${line.type === 'input' ? 'text-blue-400' : 'text-gray-400'}`}>
                            {line.type === 'input' ? '>' : '#'}
                        </span>
                        <span className={
                            line.type === 'input' ? 'text-white' :
                                line.type === 'success' ? 'text-emerald-400' :
                                    line.type === 'system' ? 'text-purple-400 font-bold' : 'text-gray-300'
                        }>
                            {line.text}
                        </span>
                    </div>
                ))}
                {isTyping && <motion.div animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity }} className="w-2 h-5 bg-white"></motion.div>}
            </div>
            <button
                onClick={runScan}
                disabled={isTyping}
                className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
            >
                <Play size={16} /> Run System Audit
            </button>
        </div>
    );
}

function ArchitectureDemo() {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-12">
            <div className="relative flex items-center justify-center">
                {/* Core Node */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="w-32 h-32 bg-indigo-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.4)] relative z-10"
                >
                    <Cpu size={48} className="text-white" />
                </motion.div>

                {/* Satellite Nodes */}
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 10 + (i * 5),
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute"
                        style={{ width: i === 0 ? 250 : i === 1 ? 350 : 450, height: i === 0 ? 250 : i === 1 ? 350 : 450 }}
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
                            <Layers size={14} className="text-white/40" />
                        </div>
                        <div className={`absolute border border-white/5 rounded-full inset-0`}></div>
                    </motion.div>
                ))}
            </div>
            <div className="text-center">
                <p className="text-white font-black text-2xl uppercase tracking-widest italic mb-2">Omni-Scale Logic</p>
                <p className="text-gray-500 font-medium">Distributed serverless architecture for instantaneous global response.</p>
            </div>
        </div>
    );
}

function DeploymentDemo() {
    const [status, setStatus] = useState<"idle" | "building" | "success">("idle");

    const startDeploy = () => {
        setStatus("building");
        setTimeout(() => setStatus("success"), 3000);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            {status === "idle" && (
                <div className="text-center space-y-8">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                        <Zap size={32} className="text-gray-400" />
                    </div>
                    <button
                        onClick={startDeploy}
                        className="px-12 py-5 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-black uppercase tracking-widest text-sm shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)] transition-all"
                    >
                        Deploy to production
                    </button>
                </div>
            )}

            {status === "building" && (
                <div className="space-y-8 text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
                    />
                    <div className="space-y-2">
                        <p className="text-white font-bold text-xl uppercase tracking-widest">Optimizing Assets</p>
                        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3 }}
                                className="h-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                            />
                        </div>
                    </div>
                </div>
            )}

            {status === "success" && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(16,185,129,0.4)]">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-3xl font-black text-white italic">Deployed!</h3>
                        <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Live in 0.87 seconds</p>
                    </div>
                    <button
                        onClick={() => setStatus("idle")}
                        className="text-gray-500 hover:text-white font-black uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={12} /> Reset Sandbox
                    </button>
                </motion.div>
            )}
        </div>
    );
}
