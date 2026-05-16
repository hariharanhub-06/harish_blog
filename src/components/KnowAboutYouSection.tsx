"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Smile, Share2, Download, X, Link } from "lucide-react";
import dynamic from "next/dynamic";

const SmileModal = dynamic(() => import("./SmileModal"), { ssr: false });

interface VisitorData {
    visitorId: string;
    visitorNumber: number;
    country: string;
    countryCode: string;
    flag: string;
    isNewVisitor: boolean;
    visitCount: number;
    avgTimeSeconds: number;
}

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

interface Props {
    smileTask?: SmileTask | null;
}

function generateVisitorPoster(data: VisitorData, origin: string): string {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;

    // Background gradient — celebration gold/dark
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, "#0f0c29");
    grad.addColorStop(0.5, "#302b63");
    grad.addColorStop(1, "#24243e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative glow circles
    const drawGlow = (x: number, y: number, r: number, color: string, alpha: number) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = alpha;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    };
    drawGlow(180, 400, 350, "#f59e0b", 0.18);
    drawGlow(900, 1500, 300, "#a855f7", 0.18);
    drawGlow(540, 960, 450, "#ec4899", 0.06);

    // Confetti dots
    const confettiColors = ["#fbbf24", "#f472b6", "#34d399", "#60a5fa", "#a78bfa", "#fb923c"];
    for (let i = 0; i < 80; i++) {
        ctx.globalAlpha = 0.35 + Math.random() * 0.4;
        ctx.fillStyle = confettiColors[i % confettiColors.length];
        const x = Math.random() * 1080;
        const y = Math.random() * 1920;
        const size = 8 + Math.random() * 18;
        if (i % 3 === 0) {
            ctx.fillRect(x, y, size, size * 0.5);
        } else {
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // Party emoji row
    ctx.font = "120px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎉", 540, 380);

    // "I AM VISITOR" label
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 58px 'Arial', sans-serif";
    ctx.letterSpacing = "8px";
    ctx.fillText("I AM VISITOR", 540, 530);

    // Big visitor number
    const numGrad = ctx.createLinearGradient(0, 560, 0, 750);
    numGrad.addColorStop(0, "#fbbf24");
    numGrad.addColorStop(1, "#f472b6");
    ctx.fillStyle = numGrad;
    ctx.font = "black 240px 'Arial', sans-serif";
    ctx.fillText(`#${data.visitorNumber.toLocaleString()}`, 540, 760);

    // Country flag + name
    ctx.font = "100px 'Arial', sans-serif";
    ctx.fillText(data.flag, 540, 890);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "bold 52px 'Arial', sans-serif";
    ctx.fillText(`from ${data.country}`, 540, 980);

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 1060);
    ctx.lineTo(940, 1060);
    ctx.stroke();

    // "of Hari Haran Hub" label
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "500 50px 'Arial', sans-serif";
    ctx.fillText("of Hari Haran Hub", 540, 1150);

    // New visitor badge
    if (data.isNewVisitor) {
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 42px 'Arial', sans-serif";
        ctx.fillText("✨ First time visitor!", 540, 1240);
    }

    // Bottom divider
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(140, 1560);
    ctx.lineTo(940, 1560);
    ctx.stroke();

    // CTA
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "500 46px 'Arial', sans-serif";
    ctx.fillText("Check your visitor number 👇", 540, 1640);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "400 36px 'Arial', sans-serif";
    ctx.fillText(origin, 540, 1710);

    return canvas.toDataURL("image/png");
}

export default function KnowAboutYouSection({ smileTask }: Props) {
    const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [origin, setOrigin] = useState("");
    const [posterUrl, setPosterUrl] = useState<string | null>(null);
    const [showPoster, setShowPoster] = useState(false);
    const [smileOpen, setSmileOpen] = useState(false);
    const [posterCopied, setPosterCopied] = useState(false);

    useEffect(() => {
        setOrigin(window.location.origin);
        const storedId = localStorage.getItem("visitor_id") || undefined;
        fetch("/api/visitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "register", visitorId: storedId }),
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => { if (data) setVisitorData(data); })
            .catch(() => {});
    }, []);

    const copyLink = (url: string, key: string) => {
        navigator.clipboard.writeText(url).catch(() => {});
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleVisitorShare = async () => {
        if (!visitorData) return;
        const url = generateVisitorPoster(visitorData, origin);
        setPosterUrl(url);
        setShowPoster(true);

        if (navigator.share) {
            try {
                const blob = await (await fetch(url)).blob();
                const file = new File([blob], "visitor.png", { type: "image/png" });
                await navigator.share({
                    title: `I am Visitor #${visitorData.visitorNumber} of Hari Haran Hub!`,
                    text: `I'm visitor #${visitorData.visitorNumber} of Hari Haran Hub ${visitorData.flag} Check yours at ${origin}`,
                    files: [file],
                });
                return;
            } catch {}
        }
    };

    const downloadPoster = () => {
        if (!posterUrl) return;
        const a = document.createElement("a");
        a.href = posterUrl;
        a.download = "my-visitor-number.png";
        a.click();
    };

    const smileUrl = smileTask ? `${origin}${smileTask.link}` : "";
    const isLiveTask = smileTask && smileTask.status === "live";

    return (
        <>
            <section id="know-about-you" className="container mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col items-center mb-6 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">
                        Just For You
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
                        Know About You
                    </h2>
                </div>

                <div className={`grid gap-4 max-w-2xl mx-auto ${isLiveTask ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 max-w-sm"}`}>

                    {/* Visitor Card */}
                    {visitorData ? (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-amber-500/30 transition-colors"
                        >
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">
                                    🎉 You are visitor
                                </p>
                                <h3 className="text-4xl font-black text-white tracking-tighter">
                                    #{visitorData.visitorNumber.toLocaleString()}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 font-semibold">
                                    {visitorData.flag} {visitorData.country}
                                </p>
                                {visitorData.isNewVisitor && (
                                    <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                                        First time here!
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <button
                                    onClick={handleVisitorShare}
                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/20"
                                >
                                    <Share2 size={11} />
                                    Share
                                </button>
                                <button
                                    onClick={() => copyLink(`${origin}/#know-about-you`, "visitor")}
                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                                >
                                    {copied === "visitor" ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                                    {copied === "visitor" ? "Copied!" : "Copy Link"}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-white/10 animate-pulse">
                            <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
                            <div className="h-10 bg-white/10 rounded w-2/3" />
                            <div className="h-3 bg-white/10 rounded w-1/3 mt-1" />
                        </div>
                    )}

                    {/* Smile Task Card */}
                    {isLiveTask && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-rose-500/30 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                        Live Now
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Smile size={20} className="text-rose-400 shrink-0 mt-0.5" />
                                    <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                                        {smileTask.title}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <button
                                    onClick={() => setSmileOpen(true)}
                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-rose-300 transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20"
                                >
                                    <Smile size={11} />
                                    Open
                                </button>
                                <button
                                    onClick={() => copyLink(smileUrl, "smile")}
                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                                >
                                    {copied === "smile" ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                                    {copied === "smile" ? "Copied!" : "Copy Link"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Visitor Celebration Poster Overlay */}
            <AnimatePresence>
                {showPoster && posterUrl && (
                    <motion.div
                        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setShowPoster(false)}
                        />
                        <motion.div
                            className="relative w-full sm:max-w-md bg-[#0f0f1a] sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl"
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 80, opacity: 0 }}
                            transition={{ type: "spring", damping: 26, stiffness: 300 }}
                        >
                            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500" />
                            <button
                                onClick={() => setShowPoster(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all z-10"
                            >
                                <X size={16} />
                            </button>

                            <div className="px-6 py-8 flex flex-col items-center gap-5">
                                <div className="text-center">
                                    <h3 className="text-white font-black text-lg mb-1">Your celebration poster! 🎉</h3>
                                    <p className="text-white/40 text-xs">Save it and share to your story</p>
                                </div>

                                <div className="w-32 h-[228px] rounded-xl overflow-hidden border border-white/10 shadow-xl flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={posterUrl} alt="Visitor celebration poster" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex items-center gap-2 w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                                    <Link size={14} className="text-white/40 flex-shrink-0" />
                                    <span className="text-white/60 text-xs truncate flex-1">{origin}/#know-about-you</span>
                                    <button
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(`${origin}/#know-about-you`).catch(() => {});
                                            setPosterCopied(true);
                                            setTimeout(() => setPosterCopied(false), 2000);
                                        }}
                                        className={`text-xs font-black uppercase tracking-wider flex-shrink-0 transition-colors ${posterCopied ? "text-emerald-400" : "text-amber-400 hover:text-amber-300"}`}
                                    >
                                        {posterCopied ? "Copied!" : "Copy"}
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
                                        onClick={handleVisitorShare}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-amber-500/25"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Share2 size={15} /> Share
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Smile Modal Overlay */}
            <AnimatePresence>
                {smileOpen && smileTask && (
                    <SmileModal task={smileTask} onClose={() => setSmileOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
}
