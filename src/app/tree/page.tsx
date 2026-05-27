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
                background: "radial-gradient(ellipse at 50% 0%, #0d2137 0%, #0a1628 60%)",
            }}
        >
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
    const stars = Array.from({ length: 90 }, (_, i) => ({
        id: i,
        x: Math.sin(i * 137.5) * 50 + 50,
        y: Math.cos(i * 97.3) * 40 + 40,
        size: ((i * 7) % 3) + 1,
        opacity: ((i * 13) % 60) / 100 + 0.2,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            {stars.map((s) => (
                <div
                    key={s.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        opacity: s.opacity,
                    }}
                />
            ))}
        </div>
    );
}

function TreeSVG() {
    return (
        <svg
            viewBox="0 0 400 600"
            className="absolute left-1/2 -translate-x-1/2 bottom-0"
            style={{ width: "min(400px, 90vw)", height: "auto" }}
            aria-hidden
        >
            {/* Ground / roots */}
            <ellipse cx="200" cy="590" rx="80" ry="12" fill="#0d1f0e" opacity="0.6" />

            {/* Trunk */}
            <path
                d="M 185 590 C 183 520, 180 480, 182 440 C 184 400, 188 370, 190 340 C 192 310, 195 290, 200 270"
                stroke="#1c3a1e"
                strokeWidth="28"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M 215 590 C 217 520, 220 480, 218 440 C 216 400, 212 370, 210 340 C 208 310, 205 290, 200 270"
                stroke="#1c3a1e"
                strokeWidth="22"
                fill="none"
                strokeLinecap="round"
            />

            {/* Main branches */}
            {/* Left main */}
            <path d="M 195 400 C 170 370, 130 340, 90 310" stroke="#1c4532" strokeWidth="16" fill="none" strokeLinecap="round" />
            {/* Right main */}
            <path d="M 205 380 C 230 355, 265 330, 300 305" stroke="#1c4532" strokeWidth="16" fill="none" strokeLinecap="round" />
            {/* Left upper */}
            <path d="M 197 330 C 165 295, 120 270, 80 240" stroke="#1c4532" strokeWidth="12" fill="none" strokeLinecap="round" />
            {/* Right upper */}
            <path d="M 203 320 C 235 290, 280 265, 310 235" stroke="#1c4532" strokeWidth="12" fill="none" strokeLinecap="round" />
            {/* Center up */}
            <path d="M 200 270 C 195 230, 192 190, 195 155" stroke="#1c4532" strokeWidth="12" fill="none" strokeLinecap="round" />

            {/* Secondary branches */}
            <path d="M 90 310 C 65 290, 40 270, 25 250" stroke="#1c4532" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 90 310 C 80 280, 75 255, 78 230" stroke="#1c4532" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 130 340 C 115 315, 105 290, 100 260" stroke="#1c4532" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 300 305 C 320 280, 335 255, 345 230" stroke="#1c4532" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 265 330 C 275 300, 275 270, 265 245" stroke="#1c4532" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 80 240 C 60 215, 45 195, 38 170" stroke="#1c4532" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 80 240 C 95 215, 100 190, 95 165" stroke="#1c4532" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M 310 235 C 325 210, 330 185, 320 160" stroke="#1c4532" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 195 155 C 180 125, 165 100, 155 72" stroke="#1c4532" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 195 155 C 210 120, 225 95, 235 65" stroke="#1c4532" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 195 155 C 175 130, 155 115, 140 95" stroke="#1c4532" strokeWidth="6" fill="none" strokeLinecap="round" />

            {/* Foliage clusters */}
            <circle cx="200" cy="120" r="55" fill="#1a5c2a" opacity="0.85" />
            <circle cx="160" cy="140" r="38" fill="#1e6b31" opacity="0.8" />
            <circle cx="240" cy="135" r="40" fill="#1a5c2a" opacity="0.8" />
            <circle cx="200" cy="90" r="42" fill="#236b2e" opacity="0.85" />
            <circle cx="85" cy="220" r="35" fill="#1a5c2a" opacity="0.75" />
            <circle cx="65" cy="200" r="28" fill="#1e6b31" opacity="0.75" />
            <circle cx="100" cy="200" r="30" fill="#1a5c2a" opacity="0.7" />
            <circle cx="315" cy="210" r="35" fill="#1a5c2a" opacity="0.75" />
            <circle cx="340" cy="195" r="26" fill="#1e6b31" opacity="0.72" />
            <circle cx="290" cy="200" r="30" fill="#1a5c2a" opacity="0.7" />
            <circle cx="130" cy="310" r="30" fill="#1e6b31" opacity="0.7" />
            <circle cx="275" cy="295" r="30" fill="#1e6b31" opacity="0.7" />
            <circle cx="155" cy="90" r="28" fill="#1a5c2a" opacity="0.78" />
            <circle cx="245" cy="85" r="28" fill="#1a5c2a" opacity="0.78" />
            <circle cx="40" cy="165" r="22" fill="#1e6b31" opacity="0.7" />
            <circle cx="98" cy="158" r="22" fill="#1e6b31" opacity="0.7" />
            <circle cx="322" cy="155" r="22" fill="#1e6b31" opacity="0.7" />

            {/* Highlight glints */}
            <circle cx="180" cy="100" r="18" fill="#236b2e" opacity="0.5" />
            <circle cx="220" cy="108" r="14" fill="#2d8a3e" opacity="0.3" />
        </svg>
    );
}
