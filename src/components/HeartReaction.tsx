"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Phase = null | "choosing" | "took" | "broke";

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
            style={{ backgroundColor: color, width: size, height: size, left: `${x}%`, top: "50%" }}
            initial={{ y: 0, opacity: 1, rotate: 0, x: 0 }}
            animate={{
                y: [-20, -220 - Math.random() * 180, 300],
                x: [0, drift * 80, drift * 160],
                opacity: [1, 1, 0],
                rotate: [0, rotateDir * 400],
            }}
            transition={{ duration: 2 + Math.random() * 0.6, delay, ease: "easeOut" }}
        />
    );
}

function GlitterDot({ x, delay }: { x: number; delay: number }) {
    const s = 3 + Math.random() * 5;
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: s, height: s, left: `${x}%`, top: `${25 + Math.random() * 50}%`,
                background: "radial-gradient(circle, #fff 0%, #ffd700 70%, transparent 100%)",
                boxShadow: `0 0 ${s * 2}px #ffd700`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.8, 0], y: [0, -80 - Math.random() * 80] }}
            transition={{ duration: 1.2 + Math.random() * 0.6, delay: delay + 0.2, ease: "easeOut" }}
        />
    );
}

function BrokenHeartSVG({ animate: doAnimate }: { animate: boolean }) {
    return (
        <svg viewBox="0 0 100 90" className="w-full h-full" fill="none">
            <motion.path
                d="M50 80 C50 80 10 55 5 30 C2 15 12 5 25 5 C35 5 44 12 50 20"
                fill="#e74c3c"
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={doAnimate ? { x: -18, y: 12, rotate: -15 } : {}}
                transition={{ duration: 0.55, ease: "easeOut" }}
            />
            <motion.path
                d="M50 80 C50 80 90 55 95 30 C98 15 88 5 75 5 C65 5 56 12 50 20"
                fill="#c0392b"
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={doAnimate ? { x: 18, y: 12, rotate: 15 } : {}}
                transition={{ duration: 0.55, ease: "easeOut" }}
            />
            <motion.path
                d="M50 20 L44 42 L53 52 L46 68 L50 80"
                stroke="#0a0a0a" strokeWidth="2.5" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={doAnimate ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.08 }}
            />
        </svg>
    );
}

export default function HeartReaction({ onVoted }: { onVoted?: (action: "take" | "break") => void }) {
    const [voted, setVoted] = useState(false);
    const [phase, setPhase] = useState<Phase>(null);
    const [confetti, setConfetti] = useState<Particle[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingAction = useRef<"take" | "break" | null>(null);
    const onVotedRef = useRef(onVoted);

    useEffect(() => { onVotedRef.current = onVoted; }, [onVoted]);

    useEffect(() => {
        if (localStorage.getItem("heart_vote")) setVoted(true);
    }, []);

    useEffect(() => {
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    const dismiss = () => {
        setPhase(null);
        if (pendingAction.current) {
            onVotedRef.current?.(pendingAction.current);
            pendingAction.current = null;
        }
    };

    const handleAction = async (action: "take" | "break") => {
        if (voted) return;

        pendingAction.current = action;

        if (action === "take") {
            const particles: Particle[] = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                x: Math.random() * 100,
                delay: Math.random() * 0.65,
                size: 5 + Math.floor(Math.random() * 9),
                rotateDir: Math.random() > 0.5 ? 1 : -1,
                drift: (Math.random() - 0.5) * 2.5,
            }));
            setConfetti(particles);
            setPhase("took");
        } else {
            setPhase("broke");
        }

        setVoted(true);
        localStorage.setItem("heart_vote", action);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(dismiss, 4500);

        try {
            await fetch("/api/heart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
        } catch { }
    };

    return (
        <>
            {/* ── Inline trigger ── */}
            <div className="flex items-center justify-center mt-2 mb-6">
                {!voted ? (
                    <motion.button
                        onClick={() => setPhase("choosing")}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-2.5 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:border-orange-500/30 hover:bg-white/[0.07] transition-all"
                    >
                        <motion.span
                            className="text-xl select-none"
                            animate={{
                                scale: [1, 1.18, 1, 1.1, 1],
                                filter: ["drop-shadow(0 0 4px #ff6b6b44)", "drop-shadow(0 0 14px #ff6b6b88)", "drop-shadow(0 0 4px #ff6b6b44)"],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.9 }}
                        >
                            ❤️
                        </motion.span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            React to unlock feedback →
                        </span>
                    </motion.button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-xl select-none">
                            {localStorage.getItem("heart_vote") === "take" ? "❤️" : "💔"}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                            {localStorage.getItem("heart_vote") === "take" ? "Thank you! ✨" : "Fair enough 💙"}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Full-screen overlay ── */}
            <AnimatePresence>
                {phase && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 backdrop-blur-xl"
                        onClick={() => {
                            if (phase === "took" || phase === "broke") {
                                if (timerRef.current) clearTimeout(timerRef.current);
                                dismiss();
                            }
                        }}
                    >
                        {/* Particle layer */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {phase === "took" && confetti.map(p => (
                                <ConfettiParticle key={p.id} {...p} />
                            ))}
                            {phase === "took" && confetti.slice(0, 35).map(p => (
                                <GlitterDot key={`g-${p.id}`} x={p.x} delay={p.delay + 0.15} />
                            ))}
                        </div>

                        {/* Card */}
                        <motion.div
                            key={phase}
                            initial={{ scale: 0.75, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 280, damping: 24 }}
                            className="relative flex flex-col items-center text-center px-8 py-10 max-w-xs w-full mx-4"
                            onClick={e => e.stopPropagation()}
                        >
                            {phase === "choosing" ? (
                                <>
                                    {/* X to cancel without voting */}
                                    <button
                                        onClick={() => setPhase(null)}
                                        className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
                                    >
                                        <X size={14} />
                                    </button>

                                    <motion.span
                                        className="text-8xl md:text-9xl select-none mb-6"
                                        animate={{
                                            scale: [1, 1.15, 1, 1.08, 1],
                                            filter: ["drop-shadow(0 0 10px #ff6b6b44)", "drop-shadow(0 0 40px #ff6b6b88)", "drop-shadow(0 0 10px #ff6b6b44)"],
                                        }}
                                        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.7 }}
                                    >
                                        ❤️
                                    </motion.span>

                                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-2">
                                        What do you think?
                                    </h3>
                                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-8">
                                        React to unlock the feedback form
                                    </p>

                                    <div className="flex gap-3 w-full">
                                        <motion.button
                                            onClick={() => handleAction("take")}
                                            whileHover={{ scale: 1.07 }}
                                            whileTap={{ scale: 0.93 }}
                                            className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5"
                                        >
                                            ❤️ Take It
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleAction("break")}
                                            whileHover={{ scale: 1.07 }}
                                            whileTap={{ scale: 0.93 }}
                                            className="flex-1 px-5 py-3 bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:border-white/20 hover:text-white/80 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            💔 Break It
                                        </motion.button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Heart graphic */}
                                    <div className="mb-6 w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
                                        {phase === "took" ? (
                                            <motion.span
                                                className="text-8xl md:text-9xl select-none"
                                                animate={{
                                                    scale: [1, 1.5, 1.25, 1.35, 1.2],
                                                    filter: ["drop-shadow(0 0 10px #ff6b6b88)", "drop-shadow(0 0 50px #ff6b6b)", "drop-shadow(0 0 25px #ff6b6baa)"],
                                                }}
                                                transition={{ duration: 0.65, ease: "easeOut" }}
                                            >
                                                ❤️
                                            </motion.span>
                                        ) : (
                                            <motion.div
                                                className="w-full h-full"
                                                initial={{ scale: 1, rotate: 0 }}
                                                animate={{ scale: [1, 0.88, 0.94], rotate: [0, -7, 7, -4, 0] }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <BrokenHeartSVG animate={true} />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        {phase === "took" ? (
                                            <>
                                                <motion.h3
                                                    className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-3"
                                                    animate={{ y: [0, -5, 0, -3, 0] }}
                                                    transition={{ repeat: 2, duration: 0.45, delay: 0.5 }}
                                                >
                                                    You Made My Day! ✨
                                                </motion.h3>
                                                <p className="text-orange-400 text-sm font-bold leading-relaxed">
                                                    This means everything. Now share your thoughts! 🙏
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-3">
                                                    Ouch! That stung 💙
                                                </h3>
                                                <p className="text-blue-400 text-sm font-bold leading-relaxed">
                                                    But you&apos;re still here — tell me what to improve! 😉
                                                </p>
                                            </>
                                        )}
                                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                                            Tap anywhere to continue
                                        </p>
                                    </motion.div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
