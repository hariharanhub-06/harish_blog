"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, RefreshCw, Sparkles, Link } from "lucide-react";

// ── Default lines bundled in client (admin can override via DB) ──────────────
const DEFAULT_LINES = [
    "Error 404: Bad mood not found after reading this. 😄",
    "Warning: May cause uncontrollable smiling. Side effects include joy.",
    "You just leveled up: +100 happiness, +50 charm. 🎮",
    "Achievement unlocked: You made someone's day today. ✨",
    "Your vibe just walked in. Everyone noticed. 🌟",
    "Plot twist: You were the treasure all along. 💎",
    "Someone, somewhere, is smiling because you exist. 💫",
    "You carry sunshine in your pocket and don't even know it. ☀️",
    "You're someone's favorite notification. 🔔",
    "Scientifically proven: This message increases happiness by 100%.",
    "Breaking news: You are genuinely, magnificently enough. 📰",
    "You're not behind. You're exactly where you need to be. 🗺️",
    "Your laugh is the kind that makes strangers smile. 😊",
    "Fun fact: The world is slightly better because you're in it.",
    "Whoever sent you this has excellent taste in humans.",
    "Rare sighting: A genuinely good human. That's you. 🦋",
    "Your story isn't over. The best chapter is being written now. 📖",
    "You make ordinary moments feel cinematic. 🎬",
    "Some people brighten a room by entering. You're one of them. 💡",
    "You've been selected for a surprise upgrade: happiness. ⬆️",
    "Life called. It said you're one of the good ones. 📞",
    "Somewhere right now, someone is grateful you exist. 🙏",
    "Your energy is contagious — in the absolute best way. ⚡",
    "You didn't find this. This found you. The universe is weird like that. 🌌",
    "In another life, I'd still choose to make you smile. 💌",
    "Plot twist: You needed exactly this, exactly now. 🎭",
    "You probably saved someone's day just by being you. 🦸",
    "Side effect of reading this: Uncontrollable smiling. Consult no one.",
    "You're the main character. Don't let anyone convince you otherwise. 🎬",
    "Someone thought of you and smiled. True story. No notes.",
    "Your presence is a gift that most people don't know how to unwrap yet. 🎁",
    "The version of you reading this? Still impressive. Still growing. 🌱",
];

const DEFAULT_RARE_LINES = [
    "Ultra rare ✨ You've been carrying too much lately. Put some of it down. You don't have to hold everything.",
    "Legend status unlocked 👑 Not everyone gets here. Most people scroll past. You didn't. That says something.",
    "This is the rare one 🌙 You're the kind of person stories are written about. Someone's already writing yours.",
];

// ── Fisher-Yates shuffle ─────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ── Canvas text wrapping helper ──────────────────────────────────────────────
function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    for (const word of words) {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > maxWidth && line !== "") {
            ctx.fillText(line.trim(), x, currentY);
            line = word + " ";
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, currentY);
}

// ── Types ────────────────────────────────────────────────────────────────────
interface SmileTask {
    id: string;
    title: string;
    status: string;
    link: string;
    lines: string[];
    rareLines?: string[];
    rareChance?: number;
    posterBgGradient?: string;
    shareText?: string;
}

type Step = "ready" | "countdown" | "reveal" | "sharing";

interface Props {
    task: SmileTask;
    onClose: () => void;
    autoStart?: boolean;
}

// ── Track helper ─────────────────────────────────────────────────────────────
async function track(taskId: string, event: string) {
    try {
        await fetch("/api/smile/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId, event }),
        });
    } catch {}
}

export default function SmileModal({ task, onClose, autoStart = false }: Props) {
    const [step, setStep] = useState<Step>("ready");
    const [count, setCount] = useState(3);
    const [currentLine, setCurrentLine] = useState("");
    const [isRare, setIsRare] = useState(false);
    const [copied, setCopied] = useState(false);
    const [posterUrl, setPosterUrl] = useState<string | null>(null);
    const shuffledRef = useRef<string[]>([]);
    const usedIndexRef = useRef<number>(-1);

    // Build shuffled deck on mount
    useEffect(() => {
        const lines = task.lines?.length ? task.lines : DEFAULT_LINES;
        shuffledRef.current = shuffle(lines);
        const last = localStorage.getItem("smile_last_line");
        if (last && shuffledRef.current[0] === last && shuffledRef.current.length > 1) {
            [shuffledRef.current[0], shuffledRef.current[1]] = [shuffledRef.current[1], shuffledRef.current[0]];
        }
        track(task.id, "open");
    }, [task.id, task.lines]);

    // Auto-start on /smile page
    useEffect(() => {
        if (autoStart) startCountdown();
    }, []); // eslint-disable-line

    const pickLine = useCallback(() => {
        const rareChance = task.rareChance ?? 10;
        const rareLines = task.rareLines?.length ? task.rareLines : DEFAULT_RARE_LINES;

        if (Math.random() * 100 < rareChance && rareLines.length > 0) {
            const rare = rareLines[Math.floor(Math.random() * rareLines.length)];
            setCurrentLine(rare);
            setIsRare(true);
            localStorage.setItem("smile_last_line", rare);
            track(task.id, "rare");
        } else {
            usedIndexRef.current = (usedIndexRef.current + 1) % shuffledRef.current.length;
            const line = shuffledRef.current[usedIndexRef.current];
            setCurrentLine(line);
            setIsRare(false);
            localStorage.setItem("smile_last_line", line);
            track(task.id, "reveal");
        }
    }, [task]);

    function startCountdown() {
        setStep("countdown");
        setCount(3);
        let c = 3;
        const interval = setInterval(() => {
            c -= 1;
            setCount(c);
            if (c <= 0) {
                clearInterval(interval);
                pickLine();
                setStep("reveal");
            }
        }, 900);
    }

    function tryAnother() {
        setPosterUrl(null);
        track(task.id, "retry");
        setStep("countdown");
        setCount(3);
        let c = 3;
        const interval = setInterval(() => {
            c -= 1;
            setCount(c);
            if (c <= 0) {
                clearInterval(interval);
                pickLine();
                setStep("reveal");
            }
        }, 900);
    }

    // ── Poster generation ────────────────────────────────────────────────────
    function generatePoster(): string {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d")!;

        // Background gradient
        const [c1, c2] = (task.posterBgGradient || "#1a1a2e,#16213e").split(",");
        const grad = ctx.createLinearGradient(0, 0, 0, 1920);
        grad.addColorStop(0, c1.trim());
        grad.addColorStop(1, c2.trim());
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Subtle decorative circles
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(200, 300, 320, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(900, 1600, 280, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        // Top header
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = "500 50px 'Arial', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Someone sent you this 😊", 540, 260);

        // Divider line
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(120, 300); ctx.lineTo(960, 300); ctx.stroke();

        // Rare badge
        if (isRare) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 44px 'Arial', sans-serif";
            ctx.fillText("👀 Rare Smile Unlocked ✨", 540, 380);
        }

        // Main smile line
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold 72px 'Arial', sans-serif`;
        ctx.textAlign = "center";
        const lineY = isRare ? 620 : 860;
        wrapText(ctx, `"${currentLine}"`, 540, lineY, 880, 96);

        // Bottom divider
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath(); ctx.moveTo(120, 1550); ctx.lineTo(960, 1550); ctx.stroke();

        // CTA
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "500 46px 'Arial', sans-serif";
        ctx.fillText("Tap to get yours 👇", 540, 1620);

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "400 38px 'Arial', sans-serif";
        const shareUrl = `${window.location.origin}${task.link || "/smile"}`;
        ctx.fillText(shareUrl, 540, 1700);

        return canvas.toDataURL("image/png");
    }

    async function handleShare() {
        const dataUrl = generatePoster();
        setPosterUrl(dataUrl);
        setStep("sharing");

        const shareUrl = `${window.location.origin}${task.link || "/smile"}`;
        const shareMsg = `${task.shareText || "This made me smile 😄 Try yours →"} ${shareUrl}`;

        // Always copy link to clipboard
        try { await navigator.clipboard.writeText(shareUrl); setCopied(true); } catch {}

        if (navigator.share) {
            try {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], "smile.png", { type: "image/png" });
                await navigator.share({ title: task.title, text: shareMsg, files: [file] });
                track(task.id, "share_web");
                return;
            } catch {}
        }
        track(task.id, "share_download");
    }

    function downloadPoster() {
        const url = posterUrl || generatePoster();
        const a = document.createElement("a");
        a.href = url;
        a.download = "smile.png";
        a.click();
        track(task.id, "share_download");
    }

    const shareUrl = typeof window !== "undefined"
        ? `${window.location.origin}${task.link || "/smile"}`
        : "";

    return (
        <motion.div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />

            {/* Modal card */}
            <motion.div
                className="relative w-full sm:max-w-md bg-[#0f0f1a] sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl"
                initial={{ y: 80, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: "spring", damping: 26, stiffness: 300 }}
            >
                {/* Gradient top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600" />

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all z-10"
                >
                    <X size={16} />
                </button>

                <div className="px-6 py-8 min-h-[340px] flex flex-col items-center justify-center text-center">
                    <AnimatePresence mode="wait">

                        {/* ── READY ─────────────────────────────────────────── */}
                        {step === "ready" && (
                            <motion.div
                                key="ready"
                                className="flex flex-col items-center gap-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="text-5xl">😊</div>
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2">Ready?</h2>
                                    <p className="text-white/50 text-sm">A smile is incoming for you</p>
                                </div>
                                <motion.button
                                    onClick={startCountdown}
                                    className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-500/30"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    Let's go →
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ── COUNTDOWN ─────────────────────────────────────── */}
                        {step === "countdown" && (
                            <motion.div
                                key="countdown"
                                className="flex flex-col items-center gap-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <AnimatePresence mode="popLayout">
                                    <motion.span
                                        key={`n-${count}`}
                                        className="text-8xl font-black bg-gradient-to-br from-rose-400 to-pink-600 bg-clip-text text-transparent select-none block"
                                        initial={{ scale: 1.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.4, opacity: 0 }}
                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                    >
                                        {count}
                                    </motion.span>
                                </AnimatePresence>
                                <p className="text-white/40 text-xs uppercase tracking-widest">smile incoming</p>
                            </motion.div>
                        )}

                        {/* ── REVEAL ────────────────────────────────────────── */}
                        {step === "reveal" && (
                            <motion.div
                                key="reveal"
                                className="flex flex-col items-center gap-6 w-full"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {isRare && (
                                    <motion.div
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-full"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <Sparkles size={14} className="text-amber-400" />
                                        <span className="text-amber-400 text-xs font-black uppercase tracking-widest">
                                            Rare Smile Unlocked
                                        </span>
                                        <Sparkles size={14} className="text-amber-400" />
                                    </motion.div>
                                )}

                                <div className={`relative px-5 py-6 rounded-2xl text-center w-full ${isRare
                                    ? "bg-gradient-to-br from-amber-950/40 to-orange-950/40 border border-amber-500/20"
                                    : "bg-white/5 border border-white/10"}`}>
                                    <p className={`text-lg font-bold leading-relaxed ${isRare ? "text-amber-100" : "text-white"}`}>
                                        "{currentLine}"
                                    </p>
                                </div>

                                <p className="text-white/40 text-xs">💌 Share it — make someone else smile</p>

                                <div className="flex gap-3 w-full">
                                    <motion.button
                                        onClick={tryAnother}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/70 text-sm font-bold transition-all"
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <RefreshCw size={15} /> Try Another
                                    </motion.button>
                                    <motion.button
                                        onClick={handleShare}
                                        className="flex-[1.6] flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-black rounded-2xl shadow-lg shadow-rose-500/25"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Share2 size={15} /> Share this Smile 💌
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── SHARING ───────────────────────────────────────── */}
                        {step === "sharing" && (
                            <motion.div
                                key="sharing"
                                className="flex flex-col items-center gap-5 w-full"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="text-3xl">🎉</div>
                                <div>
                                    <h3 className="text-white font-black text-lg mb-1">Your poster is ready!</h3>
                                    <p className="text-white/40 text-xs">Save it and post to your story</p>
                                </div>

                                {posterUrl && (
                                    <div className="w-32 h-[228px] rounded-xl overflow-hidden border border-white/10 shadow-xl flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={posterUrl} alt="Smile poster" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {/* Link copy row */}
                                <div className="flex items-center gap-2 w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                                    <Link size={14} className="text-white/40 flex-shrink-0" />
                                    <span className="text-white/60 text-xs truncate flex-1">{shareUrl}</span>
                                    <button
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(shareUrl);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className={`text-xs font-black uppercase tracking-wider flex-shrink-0 transition-colors ${copied ? "text-emerald-400" : "text-pink-400 hover:text-pink-300"}`}
                                    >
                                        {copied ? "Copied!" : "Copy"}
                                    </button>
                                </div>

                                <div className="flex gap-3 w-full">
                                    <motion.button
                                        onClick={downloadPoster}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/70 text-sm font-bold transition-all"
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Download size={15} /> Save Poster
                                    </motion.button>
                                    <motion.button
                                        onClick={tryAnother}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-black rounded-2xl"
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <RefreshCw size={15} /> Try Another
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
