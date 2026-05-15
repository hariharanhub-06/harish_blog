"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Users, TrendingUp } from "lucide-react";

interface VisitorData {
    visitorId: string;
    visitorNumber: number;
    country: string;
    countryCode: string;
    flag: string;
    isNewVisitor: boolean;
    visitCount: number;
    totalTimeSeconds: number;
    avgTimeSeconds: number;
}

function formatTime(seconds: number): string {
    if (!seconds || seconds < 5) return "< 1 min";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins} min${mins > 1 ? "s" : ""}`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
}

const RECOMMENDATIONS = [
    { label: "My Training Sessions", href: "#training" },
    { label: "Featured Projects", href: "#portfolio" },
    { label: "My Experience", href: "#about" },
    { label: "Get In Touch", href: "#contact" },
];

export default function VisitorBadge() {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [data, setData] = useState<VisitorData | null>(null);
    const [timeSpent, setTimeSpent] = useState(0);
    const startTimeRef = useRef<number>(Date.now());
    const visitorIdRef = useRef<string | null>(null);
    const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const displayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastPingedSecondsRef = useRef<number>(0);

    useEffect(() => {
        const storedId = localStorage.getItem("visitor_id") || undefined;

        const register = async () => {
            try {
                const res = await fetch("/api/visitors", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "register", visitorId: storedId }),
                });
                if (!res.ok) return;
                const info: VisitorData = await res.json();
                visitorIdRef.current = info.visitorId;
                localStorage.setItem("visitor_id", info.visitorId);
                setData(info);
                setTimeout(() => setVisible(true), 1800);
            } catch { }
        };

        register();

        // Update displayed time every second
        displayTimerRef.current = setInterval(() => {
            setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);

        // Ping server every 60s with elapsed seconds since last ping
        pingTimerRef.current = setInterval(async () => {
            if (!visitorIdRef.current) return;
            const currentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const delta = currentSeconds - lastPingedSecondsRef.current;
            lastPingedSecondsRef.current = currentSeconds;
            try {
                await fetch("/api/visitors", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "ping", visitorId: visitorIdRef.current, seconds: delta }),
                });
            } catch { }
        }, 60000);

        return () => {
            if (displayTimerRef.current) clearInterval(displayTimerRef.current);
            if (pingTimerRef.current) clearInterval(pingTimerRef.current);
            // Final beacon on page leave
            if (visitorIdRef.current) {
                const totalSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                const remaining = totalSeconds - lastPingedSecondsRef.current;
                if (remaining > 3) {
                    navigator.sendBeacon(
                        "/api/visitors",
                        new Blob(
                            [JSON.stringify({ action: "ping", visitorId: visitorIdRef.current, seconds: remaining })],
                            { type: "application/json" }
                        )
                    );
                }
            }
        };
    }, []);

    if (!data || dismissed) return null;

    const isReturning = !data.isNewVisitor;
    const prevTime = data.totalTimeSeconds;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                    className="fixed bottom-6 right-4 md:right-6 z-50 w-[300px] md:w-[340px]"
                >
                    <div className="relative bg-[#141414]/95 backdrop-blur-2xl border border-white/10 rounded-[1.75rem] shadow-2xl shadow-black/60 overflow-hidden">
                        {/* Top glow accent */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

                        {/* Dismiss */}
                        <button
                            onClick={() => setDismissed(true)}
                            className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                        >
                            <X size={12} />
                        </button>

                        <div className="p-5 pb-4">
                            {/* Header row */}
                            <div className="flex items-start gap-3 mb-4">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: 2, duration: 0.5, delay: 0.5 }}
                                    className="text-3xl leading-none shrink-0"
                                >
                                    {data.flag}
                                </motion.div>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 block mb-1">
                                        {isReturning ? "Welcome Back!" : "Hello There!"}
                                    </span>
                                    <p className="text-white font-black text-sm leading-snug">
                                        {isReturning ? (
                                            <>Visit <span className="text-orange-500">#{data.visitCount}</span> from {data.country}</>
                                        ) : (
                                            <>You&apos;re visitor <span className="text-orange-500">#{data.visitorNumber.toLocaleString()}</span> from {data.country}</>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-white/[0.04] rounded-xl p-2.5 flex flex-col items-center text-center border border-white/5">
                                    <Clock size={12} className="text-orange-500 mb-1" />
                                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Now</div>
                                    <div className="text-[11px] font-black text-white">{formatTime(timeSpent)}</div>
                                </div>
                                {isReturning && prevTime > 0 ? (
                                    <div className="bg-white/[0.04] rounded-xl p-2.5 flex flex-col items-center text-center border border-white/5">
                                        <TrendingUp size={12} className="text-purple-400 mb-1" />
                                        <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Total</div>
                                        <div className="text-[11px] font-black text-white">{formatTime(prevTime)}</div>
                                    </div>
                                ) : (
                                    <div className="bg-white/[0.04] rounded-xl p-2.5 flex flex-col items-center text-center border border-white/5">
                                        <TrendingUp size={12} className="text-purple-400 mb-1" />
                                        <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Rank</div>
                                        <div className="text-[11px] font-black text-white">#{data.visitorNumber.toLocaleString()}</div>
                                    </div>
                                )}
                                <div className="bg-white/[0.04] rounded-xl p-2.5 flex flex-col items-center text-center border border-white/5">
                                    <Users size={12} className="text-blue-400 mb-1" />
                                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Avg</div>
                                    <div className="text-[11px] font-black text-white">
                                        {data.avgTimeSeconds > 0 ? formatTime(data.avgTimeSeconds) : "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="border-t border-white/5 pt-3">
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">
                                    Recommended for you ↓
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {RECOMMENDATIONS.map(r => (
                                        <a
                                            key={r.href}
                                            href={r.href}
                                            onClick={() => setDismissed(true)}
                                            className="text-[10px] font-black text-gray-400 bg-white/5 hover:bg-orange-500/10 hover:text-orange-400 border border-white/5 hover:border-orange-500/20 rounded-lg px-2.5 py-1 transition-all uppercase tracking-widest"
                                        >
                                            {r.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
