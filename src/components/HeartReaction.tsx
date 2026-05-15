"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type HeartState = "idle" | "took" | "broke";

const CONFETTI_COLORS = [
    "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff",
    "#ff6bff", "#ff9f43", "#ff4757", "#1e90ff",
    "#ff6348", "#ffa502", "#2ed573", "#eccc68",
];

interface Particle {
    id: number;
    color: string;
    x: number;
    delay: number;
    size: number;
    rotateDir: number;
    drift: number;
}

function ConfettiParticle({ color, x, delay, size, rotateDir, drift }: Omit<Particle, "id">) {
    return (
        <motion.div
            className="absolute rounded-sm pointer-events-none"
            style={{ backgroundColor: color, width: size, height: size, left: `${x}%`, top: "40%" }}
            initial={{ y: 0, opacity: 1, rotate: 0, x: 0 }}
            animate={{
                y: [-30, -200 - Math.random() * 150, 200],
                x: [0, drift * 60, drift * 120],
                opacity: [1, 1, 0],
                rotate: [0, rotateDir * 360],
            }}
            transition={{ duration: 1.8 + Math.random() * 0.8, delay, ease: "easeOut" }}
        />
    );
}

function GlitterParticle({ x, delay }: { x: number; delay: number }) {
    const size = 3 + Math.random() * 4;
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                background: `radial-gradient(circle, #fff 0%, #ffd700 60%, transparent 100%)`,
                width: size,
                height: size,
                left: `${x}%`,
                top: `${30 + Math.random() * 40}%`,
                boxShadow: `0 0 ${size * 2}px #ffd700`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.5, 1, 0], y: [0, -60 - Math.random() * 80] }}
            transition={{ duration: 1 + Math.random(), delay: delay + 0.3, ease: "easeOut" }}
        />
    );
}

function HeartBreakSVG() {
    return (
        <svg viewBox="0 0 100 90" className="w-full h-full" fill="none">
            {/* Left half */}
            <motion.path
                d="M50 80 C50 80 10 55 5 30 C2 15 12 5 25 5 C35 5 44 12 50 20"
                fill="#e74c3c"
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={{ x: -15, y: 10, rotate: -12 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Right half */}
            <motion.path
                d="M50 80 C50 80 90 55 95 30 C98 15 88 5 75 5 C65 5 56 12 50 20"
                fill="#c0392b"
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={{ x: 15, y: 10, rotate: 12 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Crack line */}
            <motion.path
                d="M50 20 L45 40 L52 50 L46 65 L50 80"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            />
        </svg>
    );
}

export default function HeartReaction() {
    const [heartState, setHeartState] = useState<HeartState>("idle");
    const [confetti, setConfetti] = useState<Particle[]>([]);
    const [stats, setStats] = useState({ take: 0, break: 0, total: 0 });
    const [voted, setVoted] = useState(false);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("heart_vote");
        if (stored === "take" || stored === "broke") {
            setVoted(true);
            setHeartState(stored as HeartState);
            setShowResult(true);
        }
        fetch("/api/heart")
            .then(r => r.json())
            .then(d => setStats(d))
            .catch(() => { });
    }, []);

    const handleAction = async (action: "take" | "break") => {
        if (voted) return;

        if (action === "take") {
            // Generate confetti + glitter particles
            const particles: Particle[] = Array.from({ length: 90 }, (_, i) => ({
                id: i,
                color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                x: Math.random() * 100,
                delay: Math.random() * 0.7,
                size: 5 + Math.floor(Math.random() * 8),
                rotateDir: Math.random() > 0.5 ? 1 : -1,
                drift: (Math.random() - 0.5) * 2,
            }));
            setConfetti(particles);
            setHeartState("took");
        } else {
            setHeartState("broke");
        }

        setVoted(true);
        localStorage.setItem("heart_vote", action === "take" ? "took" : "broke");
        setStats(prev => ({
            ...prev,
            [action]: (prev[action as keyof typeof prev] as number) + 1,
            total: prev.total + 1,
        }));

        setTimeout(() => setShowResult(true), action === "take" ? 600 : 500);

        try {
            await fetch("/api/heart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
        } catch { }
    };

    const takePercent = stats.total > 0 ? Math.round((stats.take / stats.total) * 100) : 0;

    return (
        <section className="container mx-auto px-6 py-10 md:py-14">
            <div className="max-w-xl mx-auto flex flex-col items-center text-center">

                {/* Label */}
                <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-[9px] font-black uppercase tracking-[0.35em] text-orange-500 mb-4"
                >
                    Your Reaction
                </motion.span>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-3"
                >
                    Take It Or <span className="text-orange-600">Break It?</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 text-sm font-medium mb-10 max-w-xs"
                >
                    Does Hariharan&apos;s work inspire you? Show how you feel.
                </motion.p>

                {/* Heart + interaction zone */}
                <div className="relative w-full flex flex-col items-center gap-7">

                    {/* Confetti particles layer */}
                    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 20 }}>
                        <AnimatePresence>
                            {heartState === "took" && confetti.map(p => (
                                <ConfettiParticle key={p.id} {...p} />
                            ))}
                            {heartState === "took" && confetti.slice(0, 30).map(p => (
                                <GlitterParticle key={`g-${p.id}`} x={p.x} delay={p.delay + 0.2} />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Heart */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {heartState === "idle" && (
                                <motion.div
                                    key="idle-heart"
                                    className="text-8xl md:text-9xl select-none"
                                    animate={{
                                        scale: [1, 1.12, 1, 1.08, 1],
                                        filter: [
                                            "drop-shadow(0 0 8px #ff6b6b55)",
                                            "drop-shadow(0 0 20px #ff6b6b99)",
                                            "drop-shadow(0 0 8px #ff6b6b55)",
                                        ],
                                    }}
                                    transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8 }}
                                >
                                    ❤️
                                </motion.div>
                            )}
                            {heartState === "took" && (
                                <motion.div
                                    key="took-heart"
                                    className="text-8xl md:text-9xl select-none"
                                    initial={{ scale: 1 }}
                                    animate={{
                                        scale: [1, 1.5, 1.2, 1.3, 1.15],
                                        filter: [
                                            "drop-shadow(0 0 10px #ff6b6b88)",
                                            "drop-shadow(0 0 40px #ff6b6b)",
                                            "drop-shadow(0 0 20px #ff6b6b88)",
                                        ],
                                    }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    ❤️
                                </motion.div>
                            )}
                            {heartState === "broke" && (
                                <motion.div
                                    key="broke-heart"
                                    className="w-28 h-28 md:w-36 md:h-36"
                                    initial={{ scale: 1, rotate: 0 }}
                                    animate={{ scale: [1, 0.85, 0.9], rotate: [0, -6, 6, -3, 0] }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <HeartBreakSVG />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Buttons / Result */}
                    <AnimatePresence mode="wait">
                        {!voted ? (
                            <motion.div
                                key="buttons"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex flex-col sm:flex-row gap-3"
                            >
                                <motion.button
                                    onClick={() => handleAction("take")}
                                    whileHover={{ scale: 1.06, y: -2 }}
                                    whileTap={{ scale: 0.94 }}
                                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center gap-2.5 min-w-[140px]"
                                >
                                    ❤️ Take It
                                </motion.button>
                                <motion.button
                                    onClick={() => handleAction("break")}
                                    whileHover={{ scale: 1.06, y: -2 }}
                                    whileTap={{ scale: 0.94 }}
                                    className="px-8 py-4 bg-white/5 border border-white/10 text-white/70 font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl hover:border-white/20 hover:text-white flex items-center justify-center gap-2.5 min-w-[140px] transition-all"
                                >
                                    💔 Break It
                                </motion.button>
                            </motion.div>
                        ) : showResult ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.88, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="max-w-sm px-2"
                            >
                                {heartState === "took" ? (
                                    <div className="text-center space-y-3">
                                        <motion.div
                                            animate={{ y: [0, -5, 0, -3, 0] }}
                                            transition={{ repeat: 2, duration: 0.5, delay: 0.2 }}
                                            className="text-2xl font-black text-white"
                                        >
                                            You Made My Day! ✨
                                        </motion.div>
                                        <p className="text-orange-400/90 text-sm font-bold leading-relaxed">
                                            You joined <span className="text-orange-400 font-black">{stats.take.toLocaleString()}</span> people who believe in this work. That truly means everything — thank you! 🙏
                                        </p>
                                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                            Your support keeps me going 🚀
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-3">
                                        <div className="text-2xl font-black text-white">Ouch! That stung... 💙</div>
                                        <p className="text-blue-400/90 text-sm font-bold leading-relaxed">
                                            But hey — you&apos;re still here. Every critic is just a fan who hasn&apos;t found their reason yet. Give it time. 😉
                                        </p>
                                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                            Check back soon — you might change your mind
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>

                {/* Stats bar */}
                {stats.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 w-full max-w-xs"
                    >
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-600 mb-2">
                            <span>❤️ {stats.take} Took it</span>
                            <span>{stats.total} total</span>
                            <span>💔 {stats.break} Broke it</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${takePercent}%` }}
                                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                            />
                        </div>
                        <div className="text-center mt-2 text-[9px] text-gray-700 font-black uppercase tracking-widest">
                            {takePercent}% love this work
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
