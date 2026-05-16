"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Copy, Check, Smile } from "lucide-react";

interface VisitorData {
    visitorNumber: number;
    country: string;
    flag: string;
    isNewVisitor: boolean;
}

interface SmileTask {
    id: string;
    title: string;
    status: string;
    link: string;
}

interface Props {
    smileTask?: SmileTask | null;
}

export default function KnowAboutYouSection({ smileTask }: Props) {
    const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);

        const storedId = localStorage.getItem("visitor_id") || undefined;
        fetch("/api/visitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "register", visitorId: storedId }),
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data) setVisitorData(data);
            })
            .catch(() => {});
    }, []);

    const copyLink = (url: string, key: string) => {
        navigator.clipboard.writeText(url).catch(() => {});
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const isLiveTask = smileTask && smileTask.status === "live";
    const visitorUrl = `${origin}/#know-about-you`;
    const smileUrl = isLiveTask ? `${origin}${smileTask.link}` : "";

    return (
        <section id="know-about-you" className="container mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col items-center mb-6 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">
                    Just For You
                </span>
                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
                    Know About You
                </h2>
            </div>

            <div
                className={`grid gap-4 max-w-2xl mx-auto ${
                    isLiveTask ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 max-w-sm"
                }`}
            >
                {/* Visitor Card */}
                {visitorData ? (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-white/20 transition-colors"
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
                            <a
                                href={visitorUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                            >
                                <ExternalLink size={11} />
                                Share
                            </a>
                            <button
                                onClick={() => copyLink(visitorUrl, "visitor")}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                            >
                                {copied === "visitor" ? (
                                    <Check size={11} className="text-green-400" />
                                ) : (
                                    <Copy size={11} />
                                )}
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
                            <a
                                href={smileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-rose-300 transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20"
                            >
                                <ExternalLink size={11} />
                                Open
                            </a>
                            <button
                                onClick={() => copyLink(smileUrl, "smile")}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                            >
                                {copied === "smile" ? (
                                    <Check size={11} className="text-green-400" />
                                ) : (
                                    <Copy size={11} />
                                )}
                                {copied === "smile" ? "Copied!" : "Copy Link"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
