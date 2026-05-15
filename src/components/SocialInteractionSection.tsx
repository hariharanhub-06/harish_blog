"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Share2, ArrowRight, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { toast } from "react-hot-toast";

interface SocialInteractionSectionProps {
    poll?: {
        id: string;
        question: string;
        options: { text: string }[];
        backgroundUrl?: string;
        backgroundType?: "image" | "video";
    };
    question?: {
        id: string;
        prompt: string;
        backgroundUrl?: string;
        backgroundType?: "image" | "video";
    };
    profile: {
        socialSectionTitle?: string;
        socialSectionSubtitle?: string;
        socialSectionMediaUrl?: string;
        socialSectionMediaType?: string;
    };
}

export default function SocialInteractionSection({ poll, question, profile }: SocialInteractionSectionProps) {
    const [voted, setVoted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [answer, setAnswer] = useState("");
    const [stats, setStats] = useState({ total: 0, platform: "Instagram" });

    // Detect which one to show (Poll takes priority or we can rotate)
    const interactionId = poll?.id || question?.id;
    const type = poll ? "poll" : "question";

    useEffect(() => {
        // Check if already voted in this session
        const hasVoted = localStorage.getItem(`voted_${interactionId}`);
        if (hasVoted) setVoted(true);

        // Mock stats for vibrancy
        setStats({
            total: Math.floor(Math.random() * 500) + 100,
            platform: ["Instagram", "Facebook", "LinkedIn"][Math.floor(Math.random() * 3)]
        });
    }, [interactionId]);

    const handleVote = async (optionIndex: number) => {
        if (voted || submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/social/interact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "poll",
                    id: poll!.id,
                    optionIndex,
                    platform: "website"
                })
            });

            if (res.ok) {
                setVoted(true);
                localStorage.setItem(`voted_${poll!.id}`, "true");
                toast.success("Vote recorded!");
            } else {
                const data = await res.json();
                if (data.error === "Already voted") {
                    setVoted(true);
                    localStorage.setItem(`voted_${poll!.id}`, "true");
                }
            }
        } catch (error) {
            toast.error("Cloud sync failed. Try again!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswerSubmit = async () => {
        if (!answer.trim() || submitted || submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/social/interact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "question",
                    id: question!.id,
                    answerText: answer,
                    userName: "Guest",
                    platform: "website"
                })
            });

            if (res.ok) {
                setVoted(true);
                localStorage.setItem(`voted_${question!.id}`, "true");
                toast.success("Answer shared!");
            }
        } catch (error) {
            toast.error("Failed to share answer");
        } finally {
            setSubmitting(false);
        }
    };

    const submitted = voted;
    const mediaUrl = poll?.backgroundUrl || question?.backgroundUrl || profile.socialSectionMediaUrl;
    const mediaType = poll?.backgroundType || question?.backgroundType || profile.socialSectionMediaType || "image";

    return (
        <section className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden py-20 px-6">
            {/* Ambient Background Media */}
            <div className="absolute inset-0 z-0">
                {mediaType === "video" ? (
                    <video
                        autoPlay loop muted playsInline
                        className="w-full h-full object-cover opacity-40 scale-105 blur-[2px]"
                    >
                        <source src={mediaUrl || ""} type="video/mp4" />
                    </video>
                ) : (
                    <div
                        className="w-full h-full bg-cover bg-center opacity-30 scale-110 blur-[4px]"
                        style={{ backgroundImage: `url(${mediaUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop'})` }}
                    />
                )}
                {/* Neon Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e] via-transparent to-[#0e0e0e]" />
                <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
            </div>

            <div className="container relative z-10 max-w-5xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Branding & Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                <TrendingUp size={14} /> Trending Social Space
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9]">
                                {profile.socialSectionTitle || "JOIN THE"}<br />
                                <span className="text-primary not-italic">{profile.socialSectionSubtitle || "CONVERSATION"}</span>
                            </h2>
                        </div>

                        <div className="flex gap-6">
                            <div className="space-y-1">
                                <div className="text-3xl font-black text-white flex items-center gap-2">
                                    <Users size={24} className="text-primary" /> {stats.total}+
                                </div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Global Participants</p>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="space-y-1">
                                <div className="text-3xl font-black text-white flex items-center gap-2">
                                    <Share2 size={24} className="text-pink-500" /> {stats.platform}
                                </div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Hottest Platform</p>
                            </div>
                        </div>

                        <p className="text-gray-400 font-bold text-lg leading-relaxed max-w-md">
                            I'm building this hub to stay connected with you across all platforms.
                            Your voice drives the next project.
                        </p>
                    </motion.div>

                    {/* Right: Interaction Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="relative"
                    >
                        {/* Glow effect */}
                        <div className="absolute -inset-4 bg-primary/20 blur-[60px] rounded-full -z-10 animate-pulse" />

                        <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">

                            <AnimatePresence mode="wait">
                                {!submitted ? (
                                    <motion.div
                                        key="question"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                                {type === 'poll' ? <Share2 size={24} /> : <MessageSquare size={24} />}
                                            </div>
                                            <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter">
                                                {poll?.question || question?.prompt || "Social Interaction"}
                                            </h3>
                                        </div>

                                        {type === 'poll' ? (
                                            <div className="space-y-4">
                                                {poll?.options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleVote(i)}
                                                        disabled={submitting}
                                                        className="w-full group relative h-16 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 rounded-2xl transition-all duration-300 flex items-center px-6"
                                                    >
                                                        <span className="text-lg font-black text-white group-hover:text-primary transition-colors">{opt.text}</span>
                                                        <ArrowRight className="ml-auto text-white/20 group-hover:text-primary group-hover:translate-x-2 transition-all" size={20} />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <textarea
                                                    value={answer}
                                                    onChange={e => setAnswer(e.target.value)}
                                                    placeholder="Type your answer here..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-lg font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/20 outline-none min-h-[150px] transition-all"
                                                />
                                                <button
                                                    onClick={handleAnswerSubmit}
                                                    disabled={submitting || !answer.trim()}
                                                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                >
                                                    {submitting ? "Sharing..." : "Send Response"} <ArrowRight size={18} />
                                                </button>
                                            </div>
                                        )}

                                        <p className="text-center text-[10px] font-black uppercase tracking-widest text-white/30">
                                            {submitting ? "Propagating through network..." : "Click to interact instantly"}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="h-[400px] flex flex-col items-center justify-center text-center space-y-6"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                                            <CheckCircle2 size={40} className="animate-in zoom-in duration-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Thank You!</h3>
                                            <p className="text-gray-400 font-bold mt-2">Your response was successfully added to the hub.</p>
                                        </div>
                                        <button
                                            onClick={() => setVoted(false)}
                                            className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:underline transition-all"
                                        >
                                            Change your vote?
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
