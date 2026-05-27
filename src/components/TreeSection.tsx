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
            {/* ── Dark cosmic sky ───────────────────────────── */}
            <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, #101828 0%, #1a3050 18%, #1e4068 35%, #193560 55%, #0e1f38 78%, #060d18 100%)",
            }} />
            {/* Purple nebula left */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 52% 65% at 15% 50%, rgba(130,40,170,0.50) 0%, rgba(130,40,170,0.15) 40%, transparent 70%)",
            }} />
            {/* Warm glow center */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 40% 35% at 35% 65%, rgba(200,100,80,0.22) 0%, transparent 65%)",
            }} />
            {/* Cyan nebula right */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 48% 55% at 87% 38%, rgba(20,150,190,0.45) 0%, rgba(20,150,190,0.12) 45%, transparent 70%)",
            }} />

            {/* ── Stars ─────────────────────────────────────── */}
            <Stars />

            {/* ── Clouds ────────────────────────────────────── */}
            <Clouds />

            {/* ── Floating air motes ────────────────────────── */}
            <AirParticles />

            {/* ── Diagonal light rays ───────────────────────── */}
            <LightRays />

            {/* ── Tree + Letters + Controls ─────────────────── */}
            <div className="relative w-full flex flex-col items-center" style={{ height: "100vh" }}>

                {/* Heading — top */}
                <div className="flex flex-col items-center pt-8 pb-1 pointer-events-none z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{
                        textShadow: "0 2px 24px rgba(251,191,36,0.55), 0 0 60px rgba(251,191,36,0.2)"
                    }}>
                        🌳 Hari&apos;s Letter Tree
                    </h2>
                    <p className="text-white/55 text-sm mt-1">Leave your words. They stay here forever.</p>
                    {letters.length > 0 && (
                        <p className="text-white/30 text-xs mt-1">🍃 {letters.length} letter{letters.length !== 1 ? "s" : ""} on this tree</p>
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
                            // Three pink shades for variety
                            const pinkShades = [
                                { face: "linear-gradient(145deg,#ffe0eb 0%,#ffb3cc 55%,#ff8fab 100%)", edge: "#c24060", fold: "#e0708a" },
                                { face: "linear-gradient(145deg,#ffd6e8 0%,#ff99bb 55%,#ff6b9d 100%)", edge: "#b03565", fold: "#d4607a" },
                                { face: "linear-gradient(145deg,#ffe8f0 0%,#ffc2d4 55%,#ff9ab8 100%)", edge: "#cc4c72", fold: "#e87898" },
                            ];
                            const s = pinkShades[i % pinkShades.length];
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
                                    {/* Hanging string */}
                                    <div className="mx-auto" style={{ width: 1.5, height: 18, background: "rgba(100,50,20,0.45)" }} />

                                    {/* 3D pink letter card */}
                                    <div
                                        style={{
                                            position: "relative",
                                            width: 44, height: 56,
                                            animationName: "cardSway",
                                            animationDuration: `${swayDur}s`,
                                            animationTimingFunction: "ease-in-out",
                                            animationIterationCount: "infinite",
                                            filter: isMatch ? "drop-shadow(0 0 7px rgba(255,80,130,0.65))" : undefined,
                                        }}
                                    >
                                        {/* Depth / thickness layer */}
                                        <div style={{
                                            position: "absolute", inset: 0,
                                            background: s.edge,
                                            borderRadius: 4,
                                            transform: "translateX(3px) translateY(3px)",
                                        }} />
                                        {/* Face */}
                                        <div style={{
                                            position: "absolute", inset: 0,
                                            background: s.face,
                                            borderRadius: 4,
                                            boxShadow: "0 5px 16px rgba(160,50,90,0.32), inset 0 1px 0 rgba(255,255,255,0.70), inset -1px -1px 0 rgba(180,60,100,0.12)",
                                            overflow: "hidden",
                                        }}>
                                            {/* Fold corner */}
                                            <div style={{ position: "absolute", top: 0, right: 0, width: 11, height: 11, background: s.fold, clipPath: "polygon(100% 0,100% 100%,0 0)", borderRadius: "0 4px 0 0" }} />
                                            {/* Writing lines */}
                                            {[...Array(3)].map((_, j) => (
                                                <div key={j} style={{ position: "absolute", left: 7, right: 7, top: 16 + j * 11, height: 1.5, background: "rgba(180,60,100,0.18)", borderRadius: 1 }} />
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
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm hover:scale-110"
                        onClick={() => setShowSearch((v) => !v)}
                        title="Search letters"
                    >
                        <Search size={18} />
                    </button>
                    <button
                        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition"
                        style={{
                            background: "linear-gradient(135deg, #1a5c3a, #2d9d6e)",
                            boxShadow: "0 4px 24px rgba(45,157,110,0.5), 0 0 0 1px rgba(255,255,255,0.1)"
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
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                            <input
                                autoFocus type="text" placeholder="Search letters..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 rounded-full text-sm text-white placeholder-white/40 outline-none"
                                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
                            />
                            {searchQuery && (
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white" onClick={() => setSearchQuery("")}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="text-center text-white/40 text-xs mt-2">
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
                @keyframes cardSway {
                    0%, 100% { transform: rotate(-3deg); }
                    50%       { transform: rotate(3deg); }
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

/* ─── Stars ─────────────────────────────────────── */
function Stars() {
    const COLORS = ["#ffffff","#a78bfa","#60a5fa","#fb923c","#f472b6","#ffffff","#ffffff","#34d399","#fbbf24"];
    const stars = Array.from({ length: 130 }, (_, i) => ({
        id: i,
        x: ((Math.sin(i * 137.508) + 1) / 2) * 100,
        y: ((Math.cos(i * 97.3) + 1) / 2) * 85,
        size: i % 12 === 0 ? 3.5 : i % 5 === 0 ? 2.5 : 1.5,
        op: ((i * 13) % 60) / 100 + 0.25,
        color: COLORS[i % COLORS.length],
        twinkle: i % 4 === 0,
        burst: i % 18 === 0,
    }));
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {stars.map((s) => (
                <div key={s.id} className="absolute rounded-full" style={{
                    left: `${s.x}%`, top: `${s.y}%`,
                    width: s.size, height: s.size,
                    background: s.color, opacity: s.op,
                    boxShadow: s.burst ? `0 0 ${s.size*6}px ${s.size*3}px ${s.color}` : s.size > 2 ? `0 0 ${s.size*3}px ${s.color}` : undefined,
                    animation: s.twinkle ? `twinkle ${2.5 + (s.id % 30) * 0.1}s ease-in-out infinite` : undefined,
                    ["--op" as string]: s.op,
                }} />
            ))}
        </div>
    );
}

/* ─── Clouds ─────────────────────────────────────── */
function Clouds() {
    const clouds = [
        { x: 2,  y: 58, w: 28, h: 8,  op: 0.18 },
        { x: 8,  y: 62, w: 18, h: 6,  op: 0.13 },
        { x: 68, y: 55, w: 30, h: 9,  op: 0.20 },
        { x: 72, y: 60, w: 20, h: 7,  op: 0.14 },
        { x: 55, y: 72, w: 16, h: 5,  op: 0.10 },
        { x: 20, y: 68, w: 12, h: 4,  op: 0.09 },
    ];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {clouds.map((c, i) => (
                <div key={i} className="absolute rounded-full" style={{
                    left: `${c.x}%`, top: `${c.y}%`,
                    width: `${c.w}%`, height: `${c.h}%`,
                    background: "radial-gradient(ellipse, rgba(220,235,255,0.9) 0%, rgba(200,220,250,0.4) 50%, transparent 100%)",
                    opacity: c.op, filter: "blur(18px)",
                }} />
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
