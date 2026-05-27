"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, PenLine } from "lucide-react";

interface Letter {
    id: string;
    message: string;
    posX: number | null;
    posY: number | null;
    color: string | null;
    createdAt: string;
}

const SWAY_DURATIONS = [3.5, 4.1, 4.8, 5.3, 5.9, 6.2, 3.8, 4.5, 5.1, 6.0];

function formatMonth(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function TreeSection() {
    const [letters, setLetters] = useState<Letter[]>([]);
    const [openLetter, setOpenLetter] = useState<Letter | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [senderName, setSenderName] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ref, setRef] = useState<string | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get("ref");
        if (refParam) setRef(refParam);
        fetch("/api/tree")
            .then((r) => r.json())
            .then((d) => setLetters(d.letters || []));
    }, []);

    const handleSubmit = async () => {
        if (!senderName.trim() || !message.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/tree", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senderName, message, ref }),
            });
            if (res.ok) {
                setSubmitted(true);
                setSenderName("");
                setMessage("");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const filteredLetters = useCallback(() => {
        if (!searchQuery.trim()) return letters;
        return letters.filter((l) =>
            l.message.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [letters, searchQuery])();

    const matchingIds = new Set(filteredLetters.map((l) => l.id));

    return (
        <section
            id="tree"
            className="relative w-full overflow-hidden select-none"
            style={{ minHeight: "100vh" }}
        >
            {/* ── Warm atmospheric sky ──────────────────────── */}
            <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, #f3eaff 0%, #f8e4f5 18%, #fdeae6 40%, #fff4ec 65%, #fdf0e6 85%, #f8ece2 100%)",
            }} />
            {/* Central warm amber glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 65% 60% at 50% 50%, rgba(255,200,100,0.40) 0%, rgba(255,150,80,0.20) 35%, transparent 68%)",
            }} />
            {/* Rose nebula left */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 50% 55% at 18% 45%, rgba(220,100,160,0.18) 0%, transparent 62%)",
            }} />
            {/* Lavender nebula right */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 50% 55% at 82% 40%, rgba(150,80,220,0.15) 0%, transparent 62%)",
            }} />

            {/* ── Mist clouds ───────────────────────────────── */}
            <WarmClouds />

            {/* ── Floating air motes ────────────────────────── */}
            <AirParticles />

            {/* ── Diagonal light rays ───────────────────────── */}
            <LightRays />

            {/* ── Tree + Letters + Controls ─────────────────── */}
            <div className="relative w-full flex flex-col items-center" style={{ height: "100vh" }}>

                {/* Heading — top */}
                <div className="flex flex-col items-center pt-8 pb-1 pointer-events-none z-10">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{
                        color: "#5b2d82",
                        textShadow: "0 2px 20px rgba(200,100,160,0.32), 0 0 50px rgba(255,160,60,0.16)"
                    }}>
                        🌳 Hari&apos;s Letter Tree
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "rgba(80,40,70,0.60)" }}>
                        Leave your words. They stay here forever.
                    </p>
                    {letters.length > 0 && (
                        <p className="text-xs mt-1" style={{ color: "rgba(80,40,70,0.38)" }}>
                            🍃 {letters.length} letter{letters.length !== 1 ? "s" : ""} on this tree
                        </p>
                    )}
                </div>

                {/* Tree — fills remaining space, anchored to bottom */}
                <div className="flex-1 flex items-end justify-center w-full overflow-hidden">
                    <div
                        className="relative flex-shrink-0"
                        style={{ width: "min(560px, 88vw)" }}
                    >
                        {/* Warm glow halo */}
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                left: "18%", right: "18%",
                                top: "36%", bottom: "4%",
                                background: "radial-gradient(ellipse at 50% 30%, rgba(255,220,80,0.70) 0%, rgba(255,160,60,0.42) 22%, rgba(255,100,30,0.16) 52%, transparent 75%)",
                                filter: "blur(30px)",
                                zIndex: 0,
                                animation: "glowPulse 4s ease-in-out infinite",
                            }}
                        />

                        {/* The magical tree PNG */}
                        <img
                            src="/magical-tree.png"
                            alt="Magical letter tree"
                            className="relative w-full h-auto select-none"
                            style={{
                                zIndex: 1,
                                filter: "drop-shadow(0 12px 50px rgba(255,160,60,0.40)) drop-shadow(0 0 90px rgba(200,100,40,0.20))",
                            }}
                            draggable={false}
                        />

                        {/* Letters on branches */}
                        {letters.map((letter, i) => {
                            if (letter.posX == null || letter.posY == null) return null;
                            const swayDur = SWAY_DURATIONS[i % SWAY_DURATIONS.length];
                            const isMatch = searchQuery ? matchingIds.has(letter.id) : true;
                            return (
                                <div
                                    key={letter.id}
                                    className="absolute cursor-pointer"
                                    style={{
                                        left: `${letter.posX}%`,
                                        top: `${letter.posY}%`,
                                        transform: "translate(-50%, -100%)",
                                        opacity: searchQuery ? (isMatch ? 1 : 0.12) : 1,
                                        transition: "opacity 0.3s",
                                        zIndex: isMatch ? 10 : 5,
                                    }}
                                    onClick={() => setOpenLetter(letter)}
                                >
                                    <div className="mx-auto" style={{ width: 1, height: 18, background: "rgba(100,50,20,0.50)" }} />
                                    <div
                                        className="relative"
                                        style={{
                                            width: 46, height: 58,
                                            background: letter.color || "#fef3c7",
                                            borderRadius: 3,
                                            boxShadow: isMatch
                                                ? "0 4px 18px rgba(0,0,0,0.20), 0 0 0 2px rgba(200,100,160,0.45)"
                                                : "0 2px 8px rgba(0,0,0,0.12)",
                                            animationName: "treeSway",
                                            animationDuration: `${swayDur}s`,
                                            animationTimingFunction: "ease-in-out",
                                            animationIterationCount: "infinite",
                                            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
                                        }}
                                    >
                                        <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, background: "rgba(0,0,0,0.10)", clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
                                        <div className="absolute inset-x-2 top-4 space-y-1.5">
                                            {[...Array(4)].map((_, j) => (
                                                <div key={j} style={{ height: 2, background: "rgba(0,0,0,0.12)", borderRadius: 1, width: j === 3 ? "55%" : "100%" }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Buttons — bottom row */}
                <div className="flex items-center gap-3 pb-6 z-20">
                    <button
                        className="p-2.5 rounded-full transition hover:scale-110"
                        style={{ background: "rgba(100,40,80,0.12)", color: "#7c3069" }}
                        onClick={() => setShowSearch((v) => !v)}
                        title="Search letters"
                    >
                        <Search size={18} />
                    </button>
                    <button
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed, #c026d3)",
                            boxShadow: "0 4px 24px rgba(124,58,237,0.42), 0 0 0 1px rgba(255,255,255,0.12)"
                        }}
                        onClick={() => { setShowForm(true); setSubmitted(false); }}
                    >
                        <PenLine size={16} />
                        Write a Letter
                    </button>
                </div>
            </div>

            {/* Search panel */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-80"
                    >
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(80,40,70,0.55)" }} />
                            <input
                                autoFocus type="text" placeholder="Search letters..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 rounded-full text-sm outline-none"
                                style={{
                                    background: "rgba(255,255,255,0.80)",
                                    backdropFilter: "blur(12px)",
                                    color: "#4a2060",
                                    boxShadow: "0 2px 20px rgba(180,100,160,0.20)",
                                }}
                            />
                            {searchQuery && (
                                <button className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(80,40,70,0.50)" }} onClick={() => setSearchQuery("")}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="text-center text-xs mt-2" style={{ color: "rgba(80,40,70,0.45)" }}>
                                {filteredLetters.length} match{filteredLetters.length !== 1 ? "es" : ""}
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Letter modal */}
            <AnimatePresence>
                {openLetter && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-6"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setOpenLetter(null)}
                    >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0, rotateY: -90 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.7, opacity: 0, rotateY: 90 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative z-10 max-w-sm w-full rounded-xl shadow-2xl p-6"
                            style={{ background: openLetter.color || "#fef9ec", minHeight: 220 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0" style={{ width: 24, height: 24, background: "rgba(0,0,0,0.08)", clipPath: "polygon(100% 0, 100% 100%, 0 0)", borderRadius: "0 12px 0 0" }} />
                            <div className="mb-4 pb-3 border-b border-black/10">
                                <p className="text-gray-500 text-xs tracking-wide" style={{ fontFamily: "var(--font-caveat)" }}>{formatMonth(openLetter.createdAt)}</p>
                            </div>
                            <p className="text-gray-800 leading-relaxed text-lg" style={{ fontFamily: "var(--font-caveat)" }}>{openLetter.message}</p>
                            <button onClick={() => setOpenLetter(null)} className="absolute top-3 left-3 text-gray-400 hover:text-gray-700 transition">
                                <X size={16} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Write form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-end justify-center"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}
                    >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div
                            ref={formRef}
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative z-10 w-full max-w-lg rounded-t-2xl shadow-2xl p-6 pb-8"
                            style={{ background: "#fef9ec", backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-semibold text-gray-700" style={{ fontFamily: "var(--font-caveat)" }}>Write to Hari ✉️</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 transition"><X size={20} /></button>
                            </div>
                            {submitted ? (
                                <div className="text-center py-8">
                                    <p className="text-4xl mb-3">🌿</p>
                                    <p className="text-gray-600 text-lg" style={{ fontFamily: "var(--font-caveat)" }}>
                                        Your letter is being reviewed.<br />It&apos;ll hang on the tree soon!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-500 mb-4" style={{ fontFamily: "var(--font-caveat)", fontSize: 20 }}>Dear Hari,</p>
                                    <input
                                        type="text" placeholder="Your name"
                                        value={senderName} onChange={(e) => setSenderName(e.target.value)}
                                        className="w-full mb-3 px-4 py-2.5 rounded-lg border border-gray-200 bg-white/70 text-gray-700 text-sm outline-none focus:border-purple-300"
                                        maxLength={60}
                                    />
                                    <textarea
                                        placeholder="Your letter..."
                                        value={message} onChange={(e) => setMessage(e.target.value)}
                                        className="w-full mb-4 px-4 py-2.5 rounded-lg border border-gray-200 bg-white/70 text-gray-700 text-sm outline-none focus:border-purple-300 resize-none"
                                        rows={4} maxLength={500}
                                        style={{ fontFamily: "var(--font-caveat)", fontSize: 17 }}
                                    />
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-400">{message.length}/500</p>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting || !senderName.trim() || !message.trim()}
                                            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition disabled:opacity-50"
                                            style={{ background: "linear-gradient(135deg, #7c3aed, #c026d3)" }}
                                        >
                                            {submitting ? "Sending…" : "🌿 Send to tree"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes treeSway {
                    0%, 100% { transform: translate(-50%, -100%) rotate(-3deg); }
                    50%       { transform: translate(-50%, -100%) rotate(3deg); }
                }
                @keyframes airFloat {
                    0%   { transform: translate(0px, 0px) scale(1); opacity: 0; }
                    15%  { opacity: 0.88; }
                    85%  { opacity: 0.55; }
                    100% { transform: translate(var(--air-dx, 32px), -95px) scale(0.2); opacity: 0; }
                }
                @keyframes lightRaySway {
                    0%, 100% { opacity: 0.06; }
                    50%       { opacity: 0.20; }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.80; transform: scale(1.00); }
                    50%       { opacity: 1.00; transform: scale(1.06); }
                }
            `}</style>
        </section>
    );
}

/* ─── Warm misty clouds ─────────────────────────── */
function WarmClouds() {
    const clouds = [
        { x: 0,  y: 55, w: 26, h: 7,   op: 0.22 },
        { x: 8,  y: 60, w: 15, h: 5,   op: 0.15 },
        { x: 68, y: 52, w: 28, h: 8,   op: 0.20 },
        { x: 75, y: 58, w: 18, h: 5.5, op: 0.14 },
        { x: 48, y: 70, w: 14, h: 4,   op: 0.11 },
        { x: 22, y: 66, w: 10, h: 3.5, op: 0.09 },
    ];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {clouds.map((c, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: `${c.x}%`, top: `${c.y}%`,
                        width: `${c.w}%`, height: `${c.h}%`,
                        background: "radial-gradient(ellipse, rgba(245,225,240,0.95) 0%, rgba(255,235,220,0.55) 50%, transparent 100%)",
                        opacity: c.op,
                        filter: "blur(18px)",
                    }}
                />
            ))}
        </div>
    );
}

/* ─── Floating air motes / pollen ───────────────── */
function AirParticles() {
    const COLORS = [
        "rgba(255,200,120,0.90)",
        "rgba(220,140,200,0.85)",
        "rgba(200,160,240,0.80)",
        "rgba(255,180,100,0.80)",
        "rgba(240,180,120,0.75)",
        "rgba(255,220,180,0.70)",
    ];
    const particles = Array.from({ length: 44 }, (_, i) => ({
        id: i,
        x: 8 + ((i * 113) % 84),
        y: 10 + ((i * 79) % 74),
        size: i % 7 === 0 ? 4.5 : i % 4 === 0 ? 3 : 2,
        color: COLORS[i % COLORS.length],
        duration: 5 + (i % 8),
        delay: -(i * 0.38),
        dx: ((i * 43) % 80) - 40,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        ["--air-dx" as string]: `${p.dx}px`,
                        animation: `airFloat ${p.duration}s ${p.delay}s ease-in-out infinite`,
                        boxShadow: p.size >= 3.5 ? `0 0 ${p.size * 3}px ${p.color}` : undefined,
                    }}
                />
            ))}
        </div>
    );
}

/* ─── Diagonal light rays / wind streaks ────────── */
function LightRays() {
    const rays = [
        { left: "16%", top: "4%",  h: "58%", angle: "-24deg", delay: "0s",    dur: "6.0s" },
        { left: "40%", top: "0%",  h: "62%", angle: "6deg",   delay: "2.0s",  dur: "7.5s" },
        { left: "58%", top: "2%",  h: "54%", angle: "26deg",  delay: "1.2s",  dur: "5.8s" },
        { left: "76%", top: "7%",  h: "50%", angle: "40deg",  delay: "3.4s",  dur: "8.2s" },
    ];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {rays.map((r, i) => (
                <div
                    key={i}
                    className="absolute"
                    style={{
                        left: r.left, top: r.top,
                        width: 70, height: r.h,
                        background: "linear-gradient(180deg, transparent 0%, rgba(255,200,100,0.22) 28%, rgba(255,170,80,0.14) 62%, transparent 100%)",
                        transform: `rotate(${r.angle})`,
                        transformOrigin: "top center",
                        filter: "blur(14px)",
                        animation: `lightRaySway ${r.dur} ${r.delay} ease-in-out infinite`,
                    }}
                />
            ))}
        </div>
    );
}
