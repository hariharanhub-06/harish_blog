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
            await fetch("/api/tree", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senderName, message, ref }),
            });
            setSubmitted(true);
            setSenderName("");
            setMessage("");
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
            {/* ── Sky background ────────────────────────────── */}
            <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, #101828 0%, #1a3050 18%, #1e4068 35%, #193560 55%, #0e1f38 78%, #060d18 100%)",
            }} />
            {/* Purple nebula left */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 52% 65% at 15% 50%, rgba(130,40,170,0.50) 0%, rgba(130,40,170,0.15) 40%, transparent 70%)",
            }} />
            {/* Pink / warm cloud center-left */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 40% 35% at 35% 65%, rgba(200,100,80,0.22) 0%, transparent 65%)",
            }} />
            {/* Cyan nebula right */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 48% 55% at 87% 38%, rgba(20,150,190,0.45) 0%, rgba(20,150,190,0.12) 45%, transparent 70%)",
            }} />
            {/* Blue lightning glow right-center */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 28% 45% at 72% 55%, rgba(80,160,220,0.30) 0%, transparent 60%)",
            }} />

            {/* ── Stars ────────────────────────────────────── */}
            <Stars />

            {/* ── Clouds ───────────────────────────────────── */}
            <Clouds />

            {/* ── Tree + Letters ───────────────────────────── */}
            <div className="relative w-full" style={{ minHeight: "100vh" }}>
                <MagicalTreeSVG />

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
                            <div className="mx-auto" style={{ width: 1, height: 16, background: "rgba(255,255,255,0.45)" }} />
                            <div
                                className="relative"
                                style={{
                                    width: 46, height: 58,
                                    background: letter.color || "#fef3c7",
                                    borderRadius: 3,
                                    boxShadow: isMatch
                                        ? "0 3px 16px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,200,0.5)"
                                        : "0 2px 8px rgba(0,0,0,0.5)",
                                    animationName: "treeSway",
                                    animationDuration: `${swayDur}s`,
                                    animationTimingFunction: "ease-in-out",
                                    animationIterationCount: "infinite",
                                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
                                }}
                            >
                                <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, background: "rgba(0,0,0,0.14)", clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
                                <div className="absolute inset-x-2 top-4 space-y-1.5">
                                    {[...Array(4)].map((_, j) => (
                                        <div key={j} style={{ height: 2, background: "rgba(0,0,0,0.11)", borderRadius: 1, width: j === 3 ? "55%" : "100%" }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Section heading */}
                <div className="absolute top-8 left-0 right-0 flex flex-col items-center pointer-events-none z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ textShadow: "0 2px 24px rgba(251,191,36,0.55), 0 0 60px rgba(251,191,36,0.2)" }}>
                        🌳 Hari&apos;s Letter Tree
                    </h2>
                    <p className="text-white/55 text-sm mt-1">Leave your words. They stay here forever.</p>
                    {letters.length > 0 && (
                        <p className="text-white/30 text-xs mt-1.5">🍃 {letters.length} letter{letters.length !== 1 ? "s" : ""} on this tree</p>
                    )}
                </div>

                {/* Search button */}
                <button
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 translate-x-12 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm z-20"
                    onClick={() => setShowSearch((v) => !v)}
                    title="Search letters"
                >
                    <Search size={18} />
                </button>

                {/* Write button */}
                <button
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition z-20"
                    style={{ background: "linear-gradient(135deg, #1a5c3a, #2d9d6e)", boxShadow: "0 4px 24px rgba(45,157,110,0.5), 0 0 0 1px rgba(255,255,255,0.1)" }}
                    onClick={() => { setShowForm(true); setSubmitted(false); }}
                >
                    <PenLine size={16} />
                    Write a Letter
                </button>
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
                        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0, rotateY: -90 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.7, opacity: 0, rotateY: 90 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative z-10 max-w-sm w-full rounded-xl shadow-2xl p-6"
                            style={{ background: openLetter.color || "#fef9ec", minHeight: 220 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0" style={{ width: 24, height: 24, background: "rgba(0,0,0,0.1)", clipPath: "polygon(100% 0, 100% 100%, 0 0)", borderRadius: "0 12px 0 0" }} />
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
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
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
                                        className="w-full mb-3 px-4 py-2.5 rounded-lg border border-gray-200 bg-white/70 text-gray-700 text-sm outline-none focus:border-amber-300"
                                        maxLength={60}
                                    />
                                    <textarea
                                        placeholder="Your letter..."
                                        value={message} onChange={(e) => setMessage(e.target.value)}
                                        className="w-full mb-4 px-4 py-2.5 rounded-lg border border-gray-200 bg-white/70 text-gray-700 text-sm outline-none focus:border-amber-300 resize-none"
                                        rows={4} maxLength={500}
                                        style={{ fontFamily: "var(--font-caveat)", fontSize: 17 }}
                                    />
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-400">{message.length}/500</p>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting || !senderName.trim() || !message.trim()}
                                            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition disabled:opacity-50"
                                            style={{ background: "linear-gradient(135deg, #1a5c3a, #2d9d6e)" }}
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
                @keyframes twinkle {
                    0%, 100% { opacity: var(--op, 0.6); }
                    50%       { opacity: calc(var(--op, 0.6) * 0.35); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-6px); }
                }
            `}</style>
        </section>
    );
}

/* ──────────────────────────────────────────────────
   Stars — colored, some glowing
────────────────────────────────────────────────── */
function Stars() {
    const COLORS = ["#ffffff", "#a78bfa", "#60a5fa", "#fb923c", "#f472b6", "#ffffff", "#ffffff", "#34d399", "#fbbf24"];
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
                <div
                    key={s.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        background: s.color,
                        opacity: s.op,
                        boxShadow: s.burst
                            ? `0 0 ${s.size * 6}px ${s.size * 3}px ${s.color}`
                            : s.size > 2
                            ? `0 0 ${s.size * 3}px ${s.color}`
                            : undefined,
                        animation: s.twinkle ? `twinkle ${2.5 + (s.id % 30) * 0.1}s ease-in-out infinite` : undefined,
                        ["--op" as string]: s.op,
                    }}
                />
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Clouds — soft blurred shapes like the reference
────────────────────────────────────────────────── */
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
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        width: `${c.w}%`,
                        height: `${c.h}%`,
                        background: "radial-gradient(ellipse, rgba(220,235,255,0.9) 0%, rgba(200,220,250,0.4) 50%, transparent 100%)",
                        opacity: c.op,
                        filter: "blur(18px)",
                    }}
                />
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Magical Tree SVG — matches reference image style
────────────────────────────────────────────────── */
function MagicalTreeSVG() {
    return (
        <svg
            viewBox="0 0 500 720"
            className="absolute left-1/2 -translate-x-1/2 bottom-0"
            style={{ width: "min(500px, 100vw)", height: "auto", overflow: "visible" }}
            aria-hidden
        >
            <defs>
                {/* Intense golden core glow */}
                <radialGradient id="tCoreGlow" cx="50%" cy="56%" r="38%">
                    <stop offset="0%"   stopColor="#fffde7" stopOpacity="1" />
                    <stop offset="8%"   stopColor="#fde68a" stopOpacity="0.95" />
                    <stop offset="22%"  stopColor="#fbbf24" stopOpacity="0.80" />
                    <stop offset="45%"  stopColor="#f59e0b" stopOpacity="0.45" />
                    <stop offset="70%"  stopColor="#d97706" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#92400e" stopOpacity="0" />
                </radialGradient>
                {/* Wide ambient light */}
                <radialGradient id="tAmbient" cx="50%" cy="52%" r="55%">
                    <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
                {/* Trunk gradient — dark blue-gray, slightly lit center */}
                <linearGradient id="tTrunk" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#0d1119" />
                    <stop offset="30%"  stopColor="#1a1f2e" />
                    <stop offset="50%"  stopColor="#242838" />
                    <stop offset="70%"  stopColor="#1a1f2e" />
                    <stop offset="100%" stopColor="#0d1119" />
                </linearGradient>
                {/* Root gradient */}
                <linearGradient id="tRoot" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stopColor="#161b28" />
                    <stop offset="100%" stopColor="#0a0d14" />
                </linearGradient>
                {/* Foliage blur */}
                <filter id="tFoliageBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" />
                </filter>
                {/* Light foliage blur */}
                <filter id="tFoliageBlurSm" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="3" />
                </filter>
                {/* Branch glow */}
                <filter id="tBranchGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Sparkle glow */}
                <filter id="tSparkle" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* ── Ambient outer light ─────────────────────── */}
            <ellipse cx="250" cy="390" rx="260" ry="310" fill="url(#tAmbient)" />

            {/* ── Core golden glow ────────────────────────── */}
            <ellipse cx="250" cy="370" rx="200" ry="240" fill="url(#tCoreGlow)" />

            {/* ── Ground ──────────────────────────────────── */}
            <ellipse cx="250" cy="714" rx="130" ry="12" fill="#060810" opacity="0.8" />

            {/* ── Root system ─────────────────────────────── */}
            {/* Far left roots */}
            <path d="M 222 700 C 190 695 150 690 100 698" stroke="url(#tRoot)" strokeWidth="22" fill="none" strokeLinecap="round" />
            <path d="M 215 708 C 178 706 135 708 88 720" stroke="url(#tRoot)" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M 225 712 C 200 714 168 716 140 720" stroke="url(#tRoot)" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 218 698 C 175 688 130 682 70 690" stroke="url(#tRoot)" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M 210 704 C 160 700 110 706 55 715" stroke="url(#tRoot)" strokeWidth="10" fill="none" strokeLinecap="round" />
            {/* Sub-roots left */}
            <path d="M 150 690 C 130 682 105 678 80 682" stroke="#0f1320" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 100 698 C 80 698 58 702 40 712" stroke="#0f1320" strokeWidth="7" fill="none" strokeLinecap="round" />
            {/* Far right roots */}
            <path d="M 278 700 C 310 695 350 690 400 698" stroke="url(#tRoot)" strokeWidth="22" fill="none" strokeLinecap="round" />
            <path d="M 285 708 C 322 706 365 708 412 720" stroke="url(#tRoot)" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M 275 712 C 300 714 332 716 360 720" stroke="url(#tRoot)" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 282 698 C 325 688 370 682 430 690" stroke="url(#tRoot)" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M 290 704 C 340 700 390 706 445 715" stroke="url(#tRoot)" strokeWidth="10" fill="none" strokeLinecap="round" />
            {/* Sub-roots right */}
            <path d="M 350 690 C 370 682 395 678 420 682" stroke="#0f1320" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 400 698 C 420 698 442 702 460 712" stroke="#0f1320" strokeWidth="7" fill="none" strokeLinecap="round" />
            {/* Center root */}
            <path d="M 245 712 C 240 716 238 720 236 724" stroke="#0f1320" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M 255 712 C 260 716 262 720 264 724" stroke="#0f1320" strokeWidth="12" fill="none" strokeLinecap="round" />

            {/* Root warm highlights */}
            <path d="M 222 700 C 190 695 150 690 100 698" stroke="#3a2008" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" />
            <path d="M 278 700 C 310 695 350 690 400 698" stroke="#3a2008" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" />

            {/* ── Trunk ───────────────────────────────────── */}
            {/* Outer dark body */}
            <path d="M 215 710 C 208 650 204 590 205 540 C 206 490 210 455 212 420 C 214 385 218 360 220 335 C 222 310 228 292 232 275 C 236 258 242 245 250 235"
                stroke="#0d1119" strokeWidth="58" fill="none" strokeLinecap="round" />
            <path d="M 285 710 C 292 650 296 590 295 540 C 294 490 290 455 288 420 C 286 385 282 360 280 335 C 278 310 272 292 268 275 C 264 258 258 245 250 235"
                stroke="#0d1119" strokeWidth="48" fill="none" strokeLinecap="round" />

            {/* Main trunk fill — dark blue-gray */}
            <path d="M 222 710 C 215 650 212 590 213 540 C 214 490 218 455 220 420 C 222 385 226 360 228 335 C 230 310 236 290 240 272 C 244 254 248 243 250 235"
                stroke="#1a1f2e" strokeWidth="44" fill="none" strokeLinecap="round" />
            <path d="M 278 710 C 285 650 288 590 287 540 C 286 490 282 455 280 420 C 278 385 274 360 272 335 C 270 310 264 290 260 272 C 256 254 252 243 250 235"
                stroke="#1a1f2e" strokeWidth="36" fill="none" strokeLinecap="round" />

            {/* Bark grain stripes — dark on dark, subtle texture */}
            {[
                "M 234 700 C 231 640 229 580 230 530 C 231 480 234 445 236 410 C 238 375 241 352 243 328",
                "M 244 702 C 242 642 240 582 241 532 C 242 482 245 447 247 412 C 249 377 252 354 254 330",
                "M 255 702 C 256 642 258 582 257 532 C 256 482 254 447 253 412 C 252 377 250 354 249 330",
                "M 265 700 C 268 640 270 580 269 530 C 268 480 265 445 263 410 C 261 375 258 352 256 328",
            ].map((d, i) => (
                <path key={i} d={d} stroke="#131720" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
            ))}

            {/* Warm glow center of trunk */}
            <path d="M 248 680 C 247 620 246 565 247 515 C 248 468 249 432 250 400 C 251 368 251 345 250 320 C 249 295 249 278 250 260"
                stroke="#8b4513" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.6" filter="url(#tBranchGlow)" />
            {/* Inner bright center line */}
            <path d="M 250 650 C 250 595 250 545 250 495 C 250 445 250 405 250 370"
                stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.22" />

            {/* ── Main branches ───────────────────────────── */}
            {/* Left main */}
            <path d="M 238 440 C 210 408 172 378 130 350" stroke="#0f1320" strokeWidth="26" fill="none" strokeLinecap="round" />
            <path d="M 238 440 C 210 408 172 378 130 350" stroke="#1a1f2e" strokeWidth="18" fill="none" strokeLinecap="round" />
            {/* Right main */}
            <path d="M 262 420 C 292 390 330 362 370 338" stroke="#0f1320" strokeWidth="26" fill="none" strokeLinecap="round" />
            <path d="M 262 420 C 292 390 330 362 370 338" stroke="#1a1f2e" strokeWidth="18" fill="none" strokeLinecap="round" />
            {/* Left upper */}
            <path d="M 242 360 C 205 322 162 292 115 264" stroke="#0f1320" strokeWidth="20" fill="none" strokeLinecap="round" />
            <path d="M 242 360 C 205 322 162 292 115 264" stroke="#1a1f2e" strokeWidth="14" fill="none" strokeLinecap="round" />
            {/* Right upper */}
            <path d="M 258 345 C 295 310 340 280 378 254" stroke="#0f1320" strokeWidth="20" fill="none" strokeLinecap="round" />
            <path d="M 258 345 C 295 310 340 280 378 254" stroke="#1a1f2e" strokeWidth="14" fill="none" strokeLinecap="round" />
            {/* Center up */}
            <path d="M 250 285 C 246 245 242 205 244 168" stroke="#0f1320" strokeWidth="20" fill="none" strokeLinecap="round" />
            <path d="M 250 285 C 246 245 242 205 244 168" stroke="#1a1f2e" strokeWidth="14" fill="none" strokeLinecap="round" />

            {/* Secondary branches */}
            <path d="M 130 350 C 105 325 78 300 52 278" stroke="#141824" strokeWidth="13" fill="none" strokeLinecap="round" />
            <path d="M 130 350 C 118 320 112 292 114 265" stroke="#141824" strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M 172 378 C 155 348 144 318 140 288" stroke="#141824" strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M 370 338 C 392 310 410 282 420 255" stroke="#141824" strokeWidth="13" fill="none" strokeLinecap="round" />
            <path d="M 330 362 C 340 330 342 298 334 270" stroke="#141824" strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M 115 264 C 92 238 72 212 58 185" stroke="#141824" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 115 264 C 128 237 133 210 126 183" stroke="#141824" strokeWidth="9"  fill="none" strokeLinecap="round" />
            <path d="M 378 254 C 396 228 406 200 398 174" stroke="#141824" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 244 168 C 230 136 215 108 206 78"  stroke="#141824" strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M 244 168 C 258 132 270 104 276 74"  stroke="#141824" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 244 168 C 225 142 205 120 188 96"  stroke="#141824" strokeWidth="8"  fill="none" strokeLinecap="round" />
            {/* Tertiary */}
            <path d="M 52 278 C 32 255 18 232 10 208" stroke="#141824" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 58 185 C 42 162 30 140 24 118" stroke="#141824" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M 420 255 C 438 228 448 200 444 174" stroke="#141824" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 398 174 C 408 148 412 122 406 98" stroke="#141824" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M 206 78 C 196 56 186 38 180 18" stroke="#141824" strokeWidth="6"  fill="none" strokeLinecap="round" />
            <path d="M 276 74 C 284 50 288 30 282 10" stroke="#141824" strokeWidth="6"  fill="none" strokeLinecap="round" />

            {/* Branch warm glow overlays */}
            {[
                { d: "M 238 440 C 210 408 172 378 130 350", w: 8 },
                { d: "M 262 420 C 292 390 330 362 370 338", w: 8 },
                { d: "M 242 360 C 205 322 162 292 115 264", w: 6 },
                { d: "M 258 345 C 295 310 340 280 378 254", w: 6 },
                { d: "M 250 285 C 246 245 242 205 244 168", w: 6 },
            ].map((b, i) => (
                <path key={i} d={b.d} stroke="#8b4513" strokeWidth={b.w} fill="none" strokeLinecap="round"
                    opacity="0.45" filter="url(#tBranchGlow)" />
            ))}

            {/* ── Foliage — large blurred base ────────────── */}
            {/* Deep foliage base clusters (very blurred) */}
            {[
                [250, 130, 120], [200, 155, 90],  [300, 148, 95],
                [250,  95, 100], [160, 195, 75],  [340, 188, 78],
                [250, 200, 70],  [115, 240, 68],  [385, 230, 70],
                [175, 290, 62],  [325, 282, 62],  [250, 250, 85],
                [140, 340, 58],  [360, 332, 58],
            ].map(([cx, cy, r], i) => (
                <circle key={`fb-${i}`} cx={cx} cy={cy} r={r} fill="#0d3d2e" opacity={0.88} filter="url(#tFoliageBlur)" />
            ))}

            {/* Mid foliage layer */}
            {[
                [250, 125, 100], [198, 150, 72], [302, 144, 75],
                [250,  88,  88], [155, 188, 58], [346, 182, 60],
                [110, 232, 55],  [390, 225, 58],
            ].map(([cx, cy, r], i) => (
                <circle key={`fm-${i}`} cx={cx} cy={cy} r={r} fill="#124a38" opacity={0.80} filter="url(#tFoliageBlurSm)" />
            ))}

            {/* Top highlight foliage */}
            {[
                [250, 118, 78], [204, 144, 52], [296, 138, 55],
                [250,  82, 68], [152, 182, 42], [348, 176, 44],
            ].map(([cx, cy, r], i) => (
                <circle key={`fh-${i}`} cx={cx} cy={cy} r={r} fill="#1a5c42" opacity={0.70} />
            ))}

            {/* Teal-cyan shimmers on foliage surface */}
            {[
                [232, 106, 28], [268, 112, 24], [195, 140, 20],
                [304, 134, 22], [250, 78,  26], [148, 178, 18], [352, 172, 18],
            ].map(([cx, cy, r], i) => (
                <circle key={`fs-${i}`} cx={cx} cy={cy} r={r} fill="#14b8a6" opacity={0.16} filter="url(#tFoliageBlurSm)" />
            ))}

            {/* ── Firefly / sparkle dots ───────────────────── */}
            {[
                [215, 215, "#fbbf24"], [285, 205, "#fde68a"], [165, 262, "#fbbf24"],
                [338, 255, "#fb923c"], [250, 185, "#fde68a"], [135, 308, "#fbbf24"],
                [368, 298, "#fb923c"], [78,  252, "#fbbf24"], [424, 244, "#fde68a"],
                [198, 100, "#fb923c"], [302, 96,  "#fbbf24"], [250, 55,  "#fde68a"],
                [172, 168, "#fbbf24"], [328, 162, "#fb923c"], [250, 140, "#fde68a"],
                [92,  210, "#fbbf24"], [408, 202, "#fb923c"],
            ].map(([sx, sy, sc], i) => (
                <g key={`sp-${i}`}>
                    <circle cx={sx as number} cy={sy as number} r="6" fill={sc as string} opacity="0.3" filter="url(#tSparkle)" />
                    <circle cx={sx as number} cy={sy as number} r="2.8" fill={sc as string} opacity="0.9" />
                </g>
            ))}
        </svg>
    );
}
