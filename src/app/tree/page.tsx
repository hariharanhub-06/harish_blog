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

export default function TreePage() {
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
        <div
            className="relative min-h-screen overflow-hidden select-none"
            style={{
                background: "linear-gradient(180deg, #050a14 0%, #080f20 20%, #0c1630 40%, #0a1228 70%, #050810 100%)",
            }}
        >
            {/* Nebula layers */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 70% 50% at 30% 40%, rgba(88,28,135,0.18) 0%, transparent 70%)",
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 60% 40% at 75% 30%, rgba(14,116,144,0.15) 0%, transparent 70%)",
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 50% 35% at 50% 10%, rgba(147,51,234,0.1) 0%, transparent 60%)",
            }} />

            {/* Stars */}
            <Stars />

            {/* Tree SVG + Letters */}
            <div className="relative w-full h-screen">
                <TreeSVG />

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
                                opacity: searchQuery ? (isMatch ? 1 : 0.15) : 1,
                                transition: "opacity 0.3s",
                                zIndex: isMatch ? 10 : 5,
                            }}
                            onClick={() => setOpenLetter(letter)}
                        >
                            {/* String */}
                            <div
                                className="mx-auto"
                                style={{
                                    width: 1,
                                    height: 14,
                                    background: "rgba(255,255,255,0.35)",
                                }}
                            />
                            {/* Paper card */}
                            <div
                                className="relative"
                                style={{
                                    width: 44,
                                    height: 56,
                                    background: letter.color || "#fef3c7",
                                    borderRadius: 3,
                                    boxShadow: isMatch
                                        ? "0 2px 12px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,200,0.4)"
                                        : "0 2px 8px rgba(0,0,0,0.4)",
                                    animationName: "sway",
                                    animationDuration: `${swayDur}s`,
                                    animationTimingFunction: "ease-in-out",
                                    animationIterationCount: "infinite",
                                    clipPath:
                                        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
                                }}
                            >
                                {/* Fold corner */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        width: 10,
                                        height: 10,
                                        background: "rgba(0,0,0,0.15)",
                                        clipPath: "polygon(100% 0, 100% 100%, 0 0)",
                                    }}
                                />
                                {/* Lines suggesting text */}
                                <div className="absolute inset-x-2 top-4 space-y-1">
                                    {[...Array(4)].map((_, j) => (
                                        <div
                                            key={j}
                                            style={{
                                                height: 2,
                                                background: "rgba(0,0,0,0.12)",
                                                borderRadius: 1,
                                                width: j === 3 ? "60%" : "100%",
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Letter count badge */}
                {letters.length > 0 && (
                    <div
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tracking-wide"
                        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                    >
                        🍃 {letters.length} letter{letters.length !== 1 ? "s" : ""} on this tree
                    </div>
                )}

                {/* Search button */}
                <button
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 ml-16 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm"
                    onClick={() => setShowSearch((v) => !v)}
                    title="Search letters"
                >
                    <Search size={18} />
                </button>

                {/* Write button */}
                <button
                    className="fixed bottom-8 right-6 flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition"
                    style={{
                        background: "linear-gradient(135deg, #2d6a4f, #52b788)",
                        boxShadow: "0 4px 20px rgba(82,183,136,0.4)",
                    }}
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
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-80"
                    >
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                            />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search letters..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 rounded-full text-sm text-white placeholder-white/40 outline-none"
                                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                    onClick={() => setSearchQuery("")}
                                >
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

            {/* Open letter modal */}
            <AnimatePresence>
                {openLetter && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpenLetter(null)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0, rotateY: -90 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.7, opacity: 0, rotateY: 90 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative z-10 max-w-sm w-full rounded-xl shadow-2xl p-6"
                            style={{
                                background: openLetter.color || "#fef9ec",
                                minHeight: 220,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Fold corner decoration */}
                            <div
                                className="absolute top-0 right-0"
                                style={{
                                    width: 24,
                                    height: 24,
                                    background: "rgba(0,0,0,0.1)",
                                    clipPath: "polygon(100% 0, 100% 100%, 0 0)",
                                    borderRadius: "0 12px 0 0",
                                }}
                            />
                            <div className="mb-4 pb-3 border-b border-black/10">
                                <p
                                    className="text-gray-500 text-xs tracking-wide"
                                    style={{ fontFamily: "var(--font-caveat)" }}
                                >
                                    {formatMonth(openLetter.createdAt)}
                                </p>
                            </div>
                            <p
                                className="text-gray-800 leading-relaxed text-lg"
                                style={{ fontFamily: "var(--font-caveat)" }}
                            >
                                {openLetter.message}
                            </p>
                            <button
                                onClick={() => setOpenLetter(null)}
                                className="absolute top-3 left-3 text-gray-400 hover:text-gray-700 transition"
                            >
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div
                            ref={formRef}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative z-10 w-full max-w-lg rounded-t-2xl shadow-2xl p-6 pb-8"
                            style={{
                                background: "#fef9ec",
                                backgroundImage:
                                    "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
                                backgroundSize: "18px 18px",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2
                                    className="text-xl font-semibold text-gray-700"
                                    style={{ fontFamily: "var(--font-caveat)" }}
                                >
                                    Write to Hari ✉️
                                </h2>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="text-gray-400 hover:text-gray-700 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {submitted ? (
                                <div className="text-center py-8">
                                    <p className="text-4xl mb-3">🌿</p>
                                    <p
                                        className="text-gray-600 text-lg"
                                        style={{ fontFamily: "var(--font-caveat)" }}
                                    >
                                        Your letter is being reviewed.
                                        <br />
                                        It&apos;ll hang on the tree soon!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p
                                        className="text-gray-500 text-base mb-4"
                                        style={{ fontFamily: "var(--font-caveat)" }}
                                    >
                                        Dear Hari,
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={senderName}
                                        onChange={(e) => setSenderName(e.target.value)}
                                        maxLength={60}
                                        className="w-full px-4 py-2.5 mb-3 rounded-lg border border-amber-200 bg-white/70 text-gray-700 placeholder-gray-400 text-sm outline-none focus:border-amber-400 transition"
                                        style={{ fontFamily: "var(--font-caveat)", fontSize: 16 }}
                                    />
                                    <textarea
                                        placeholder="Your letter..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        maxLength={500}
                                        rows={5}
                                        className="w-full px-4 py-2.5 mb-1 rounded-lg border border-amber-200 bg-white/70 text-gray-700 placeholder-gray-400 text-sm outline-none focus:border-amber-400 transition resize-none"
                                        style={{ fontFamily: "var(--font-caveat)", fontSize: 16 }}
                                    />
                                    <p className="text-right text-xs text-gray-400 mb-4">
                                        {message.length}/500
                                    </p>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || !senderName.trim() || !message.trim()}
                                        className="w-full py-3 rounded-xl font-semibold text-white text-sm transition disabled:opacity-50"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #2d6a4f, #52b788)",
                                        }}
                                    >
                                        {submitting ? "Sending…" : "🌳 Leave your letter on the tree"}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes sway {
                    0%, 100% { transform: translate(-50%, -100%) rotate(-3deg); }
                    50% { transform: translate(-50%, -100%) rotate(3deg); }
                }
            `}</style>
        </div>
    );
}

function Stars() {
    const COLORS = ["#ffffff", "#a78bfa", "#60a5fa", "#fbbf24", "#f472b6", "#ffffff", "#ffffff", "#34d399"];
    const stars = Array.from({ length: 120 }, (_, i) => ({
        id: i,
        x: Math.sin(i * 137.5) * 50 + 50,
        y: Math.cos(i * 97.3) * 45 + 45,
        size: i % 15 === 0 ? 3 : i % 7 === 0 ? 2.5 : ((i * 7) % 3) + 1,
        opacity: ((i * 13) % 60) / 100 + 0.25,
        color: COLORS[i % COLORS.length],
        glow: i % 8 === 0,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            {stars.map((s) => (
                <div
                    key={s.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        opacity: s.opacity,
                        background: s.color,
                        boxShadow: s.glow ? `0 0 ${s.size * 4}px ${s.size * 2}px ${s.color}` : undefined,
                    }}
                />
            ))}
        </div>
    );
}

function TreeSVG() {
    return (
        <svg
            viewBox="0 0 400 640"
            className="absolute left-1/2 -translate-x-1/2 bottom-0"
            style={{ width: "min(420px, 95vw)", height: "auto" }}
            aria-hidden
        >
            <defs>
                {/* Core golden glow behind trunk */}
                <radialGradient id="coreGlow" cx="50%" cy="55%" r="45%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
                    <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.55" />
                    <stop offset="55%" stopColor="#d97706" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#92400e" stopOpacity="0" />
                </radialGradient>
                {/* Outer ambient light */}
                <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fde68a" stopOpacity="0.3" />
                    <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
                {/* Glow filter for branches */}
                <filter id="branchGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                {/* Strong glow filter for trunk center */}
                <filter id="trunkGlow" x="-50%" y="-20%" width="200%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                {/* Leaf sparkle filter */}
                <filter id="leafGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Ambient outer glow */}
            <ellipse cx="200" cy="370" rx="220" ry="260" fill="url(#ambientGlow)" />

            {/* Core golden glow at trunk-canopy junction */}
            <ellipse cx="200" cy="340" rx="160" ry="200" fill="url(#coreGlow)" />

            {/* Ground shadow */}
            <ellipse cx="200" cy="632" rx="100" ry="10" fill="#0a0e1a" opacity="0.7" />

            {/* Roots */}
            <path d="M 180 620 C 160 610, 130 608, 100 615" stroke="#1a120a" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M 178 628 C 155 622, 120 625, 90 635" stroke="#1a120a" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 190 630 C 175 628, 150 630, 130 640" stroke="#1a120a" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 220 620 C 240 610, 268 608, 298 615" stroke="#1a120a" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M 222 628 C 245 622, 278 625, 308 635" stroke="#1a120a" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 210 630 C 228 628, 252 630, 272 640" stroke="#1a120a" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 200 630 C 200 628, 200 632, 198 640" stroke="#1a120a" strokeWidth="12" fill="none" strokeLinecap="round" />

            {/* Root highlights (warm glow) */}
            <path d="M 180 620 C 160 610, 130 608, 100 615" stroke="#3d2006" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />
            <path d="M 220 620 C 240 610, 268 608, 298 615" stroke="#3d2006" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />

            {/* Trunk — dark outer */}
            <path
                d="M 178 630 C 172 560, 168 500, 170 455 C 172 415, 178 385, 182 355 C 186 325, 192 305, 196 280"
                stroke="#160e06"
                strokeWidth="38"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M 222 630 C 228 560, 232 500, 230 455 C 228 415, 222 385, 218 355 C 214 325, 208 305, 204 280"
                stroke="#160e06"
                strokeWidth="30"
                fill="none"
                strokeLinecap="round"
            />

            {/* Trunk — warm glowing center */}
            <path
                d="M 188 600 C 184 540, 182 490, 184 450 C 186 415, 190 385, 193 355 C 196 325, 198 305, 200 280"
                stroke="#7c3700"
                strokeWidth="18"
                fill="none"
                strokeLinecap="round"
                filter="url(#trunkGlow)"
                opacity="0.85"
            />
            <path
                d="M 212 600 C 216 540, 218 490, 216 450 C 214 415, 210 385, 207 355 C 204 325, 202 305, 200 280"
                stroke="#7c3700"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
                filter="url(#trunkGlow)"
                opacity="0.85"
            />
            {/* Inner bright highlight */}
            <path
                d="M 196 560 C 194 510, 193 470, 195 440 C 197 410, 199 390, 200 370"
                stroke="#fbbf24"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                opacity="0.35"
            />

            {/* Main branches */}
            <path d="M 192 420 C 165 392, 125 365, 82 338" stroke="#1e1008" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M 208 400 C 235 372, 272 348, 312 325" stroke="#1e1008" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M 195 355 C 160 318, 115 292, 72 262" stroke="#1e1008" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M 205 340 C 240 308, 285 282, 320 252" stroke="#1e1008" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M 200 280 C 195 238, 191 198, 193 162" stroke="#1e1008" strokeWidth="14" fill="none" strokeLinecap="round" />

            {/* Branch warm highlights */}
            <path d="M 192 420 C 165 392, 125 365, 82 338" stroke="#7c3700" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" filter="url(#branchGlow)" />
            <path d="M 208 400 C 235 372, 272 348, 312 325" stroke="#7c3700" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" filter="url(#branchGlow)" />
            <path d="M 195 355 C 160 318, 115 292, 72 262" stroke="#7c3700" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.4" filter="url(#branchGlow)" />
            <path d="M 205 340 C 240 308, 285 282, 320 252" stroke="#7c3700" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.4" filter="url(#branchGlow)" />
            <path d="M 200 280 C 195 238, 191 198, 193 162" stroke="#7c3700" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.4" filter="url(#branchGlow)" />

            {/* Secondary branches */}
            <path d="M 82 338 C 58 315, 36 290, 22 265" stroke="#1e1008" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M 82 338 C 72 305, 68 278, 72 250" stroke="#1e1008" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 125 365 C 108 338, 98 310, 94 280" stroke="#1e1008" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M 312 325 C 332 298, 348 272, 356 248" stroke="#1e1008" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M 272 348 C 283 315, 284 285, 274 258" stroke="#1e1008" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 72 262 C 52 235, 36 210, 28 182" stroke="#1e1008" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 72 262 C 88 235, 94 208, 89 180" stroke="#1e1008" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 320 252 C 335 225, 340 198, 330 172" stroke="#1e1008" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 193 162 C 178 130, 162 105, 152 76" stroke="#1e1008" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M 193 162 C 208 126, 224 100, 234 70" stroke="#1e1008" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 193 162 C 172 138, 152 118, 136 96" stroke="#1e1008" strokeWidth="7" fill="none" strokeLinecap="round" />

            {/* Foliage — deep teal/blue-green */}
            <circle cx="200" cy="118" r="58" fill="#0d4a3a" opacity="0.92" />
            <circle cx="158" cy="138" r="42" fill="#0f5440" opacity="0.88" />
            <circle cx="243" cy="132" r="44" fill="#0d4a3a" opacity="0.88" />
            <circle cx="200" cy="88" r="46" fill="#115c44" opacity="0.92" />
            <circle cx="83" cy="228" r="38" fill="#0d4a3a" opacity="0.82" />
            <circle cx="60" cy="208" r="30" fill="#0f5440" opacity="0.8" />
            <circle cx="102" cy="208" r="33" fill="#0d4a3a" opacity="0.78" />
            <circle cx="318" cy="218" r="38" fill="#0d4a3a" opacity="0.82" />
            <circle cx="344" cy="202" r="28" fill="#0f5440" opacity="0.78" />
            <circle cx="292" cy="208" r="32" fill="#0d4a3a" opacity="0.78" />
            <circle cx="132" cy="318" r="32" fill="#0f5440" opacity="0.75" />
            <circle cx="278" cy="302" r="32" fill="#0f5440" opacity="0.75" />
            <circle cx="154" cy="88" r="30" fill="#0d4a3a" opacity="0.84" />
            <circle cx="247" cy="84" r="30" fill="#0d4a3a" opacity="0.84" />
            <circle cx="38" cy="172" r="24" fill="#0f5440" opacity="0.76" />
            <circle cx="96" cy="165" r="24" fill="#0f5440" opacity="0.76" />
            <circle cx="326" cy="162" r="24" fill="#0f5440" opacity="0.76" />

            {/* Foliage glow highlights — teal/cyan shimmer */}
            <circle cx="185" cy="100" r="22" fill="#14b8a6" opacity="0.18" filter="url(#leafGlow)" />
            <circle cx="218" cy="108" r="18" fill="#06b6d4" opacity="0.15" filter="url(#leafGlow)" />
            <circle cx="162" cy="126" r="14" fill="#14b8a6" opacity="0.18" filter="url(#leafGlow)" />
            <circle cx="238" cy="120" r="16" fill="#06b6d4" opacity="0.15" filter="url(#leafGlow)" />
            <circle cx="80" cy="216" r="12" fill="#14b8a6" opacity="0.18" filter="url(#leafGlow)" />
            <circle cx="318" cy="208" r="12" fill="#06b6d4" opacity="0.15" filter="url(#leafGlow)" />

            {/* Firefly / sparkle dots */}
            {[
                [170, 200, "#fbbf24"], [228, 192, "#fde68a"], [145, 255, "#fbbf24"],
                [260, 242, "#fde68a"], [200, 158, "#fb923c"], [110, 300, "#fbbf24"],
                [295, 288, "#fde68a"], [62, 248, "#fbbf24"], [340, 235, "#fde68a"],
                [180, 72, "#fb923c"], [222, 68, "#fbbf24"],
            ].map(([sx, sy, sc], idx) => (
                <circle key={idx} cx={sx as number} cy={sy as number} r="3.5" fill={sc as string} opacity="0.85" filter="url(#branchGlow)" />
            ))}
        </svg>
    );
}
