"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, Clock, Users } from "lucide-react";

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
    if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins} min${mins !== 1 ? "s" : ""}`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const RECOMMENDATIONS = [
    { label: "Training", href: "#training" },
    { label: "Projects", href: "#portfolio" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
];

export default function VisitorBadge() {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [data, setData] = useState<VisitorData | null>(null);
    const [timeSpent, setTimeSpent] = useState(0);
    const startTimeRef = useRef<number>(Date.now());
    const visitorIdRef = useRef<string | null>(null);
    const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const displayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastPingedRef = useRef<number>(0);

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
                setTimeout(() => setVisible(true), 1500);
            } catch { }
        };

        register();

        displayTimerRef.current = setInterval(() => {
            setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);

        pingTimerRef.current = setInterval(async () => {
            if (!visitorIdRef.current) return;
            const now = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const delta = now - lastPingedRef.current;
            lastPingedRef.current = now;
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
            if (visitorIdRef.current) {
                const total = Math.floor((Date.now() - startTimeRef.current) / 1000);
                const remaining = total - lastPingedRef.current;
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

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="fixed top-4 right-3 sm:top-5 sm:right-5 z-50 w-[min(300px,calc(100vw-1.5rem))]"
                >
                    <div className="relative bg-[#141414]/96 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                        {/* Top colour line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

                        {/* ── Compact header (always visible) ── */}
                        <div className="flex items-center gap-2.5 px-4 py-3">
                            {/* Flag */}
                            <motion.span
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ repeat: 2, duration: 0.45, delay: 0.6 }}
                                className="text-xl leading-none shrink-0"
                            >
                                {data.flag}
                            </motion.span>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 block leading-none mb-0.5">
                                    {data.isNewVisitor ? "Hello There!" : "Welcome Back!"}
                                </span>
                                <p className="text-white font-black text-[13px] leading-tight truncate">
                                    {data.isNewVisitor
                                        ? <>You&apos;re visitor <span className="text-orange-400">#{data.visitorNumber.toLocaleString()}</span> from {data.country}</>
                                        : <>Visit <span className="text-orange-400">#{data.visitCount}</span> from {data.country}</>
                                    }
                                </p>
                            </div>

                            {/* Expand toggle */}
                            <button
                                onClick={() => setExpanded(v => !v)}
                                className="shrink-0 w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all"
                            >
                                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>

                            {/* Dismiss */}
                            <button
                                onClick={() => setDismissed(true)}
                                className="shrink-0 w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/70 transition-all"
                            >
                                <X size={11} />
                            </button>
                        </div>

                        {/* ── Expandable detail panel ── */}
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/[0.06]">
                                        {/* Mini stats */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white/[0.04] rounded-xl p-2.5 flex items-center gap-2 border border-white/[0.05]">
                                                <Clock size={11} className="text-orange-500 shrink-0" />
                                                <div>
                                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">This visit</div>
                                                    <div className="text-[11px] font-black text-white">{formatTime(timeSpent)}</div>
                                                </div>
                                            </div>
                                            <div className="bg-white/[0.04] rounded-xl p-2.5 flex items-center gap-2 border border-white/[0.05]">
                                                <Users size={11} className="text-blue-400 shrink-0" />
                                                <div>
                                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Avg time</div>
                                                    <div className="text-[11px] font-black text-white">
                                                        {data.avgTimeSeconds > 0 ? formatTime(data.avgTimeSeconds) : "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick nav */}
                                        <div>
                                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-700 mb-1.5">
                                                Recommended ↓
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {RECOMMENDATIONS.map(r => (
                                                    <a
                                                        key={r.href}
                                                        href={r.href}
                                                        onClick={() => setDismissed(true)}
                                                        className="text-[9px] font-black text-gray-400 bg-white/[0.04] hover:bg-orange-500/10 hover:text-orange-400 border border-white/[0.06] hover:border-orange-500/20 rounded-lg px-2 py-1 transition-all uppercase tracking-widest"
                                                    >
                                                        {r.label}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
