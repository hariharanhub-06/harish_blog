"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee, Video, ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import SessionRegistrationModal from "./SessionRegistrationModal";

interface Session {
    id: string;
    title: string;
    description: string;
    price: number;
    startTime: string;
    duration: number;
    posterUrl: string;
    status: string;
}

interface LiveSessionsCarouselProps {
    sessions: Session[];
}

export default function LiveSessionsCarousel({ sessions }: LiveSessionsCarouselProps) {
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (sessions.length === 0) return null;

    return (
        <section className="relative py-20 px-6 overflow-hidden bg-black/40 backdrop-blur-sm border-y border-white/5">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 rounded-full border border-red-500/20">
                            <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.8)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Live & Interactive</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                            Upcoming <span className="text-red-600 italic">Sessions</span>
                        </h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] max-w-md opacity-60">
                            Master new skills with real-time industry expertise
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => scrollContainerRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
                            >
                                <ArrowRight size={20} className="rotate-180" />
                            </button>
                            <button
                                onClick={() => scrollContainerRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Scroll Area */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory no-scrollbar"
                >
                    {sessions.map((session, i) => (
                        <div
                            key={session.id}
                            className="flex-shrink-0 w-[85vw] md:w-[420px] snap-center group"
                        >
                            <div className="relative h-[280px] rounded-[2.5rem] overflow-hidden border border-white/10 group-hover:border-red-600/40 transition-all duration-500 shadow-2xl">
                                {/* Poster Image */}
                                {session.posterUrl ? (
                                    <img
                                        src={session.posterUrl}
                                        alt={session.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white/5">
                                        <Video size={64} />
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                                {/* Floating Labels */}
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                                        {format(new Date(session.startTime), 'MMM d')}
                                    </div>
                                    <div className="px-4 py-1.5 bg-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-[0_4px_12px_rgba(220,38,38,0.4)]">
                                        Live
                                    </div>
                                </div>

                                {/* Bottom Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter line-clamp-1 group-hover:text-red-500 transition-colors">
                                            {session.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/50">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} className="text-red-600" />
                                                {format(new Date(session.startTime), 'h:mm a')}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <IndianRupee size={12} className="text-red-600" />
                                                {session.price === 0 ? "Free" : session.price}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedSession(session)}
                                        className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 hover:text-white transition-all transform group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100 duration-500"
                                    >
                                        Reserve Spot
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* View All Card (Extra Creativity) */}
                    <div className="flex-shrink-0 w-[200px] flex items-center justify-center">
                        <button
                            onClick={() => window.location.href = '/sessions'}
                            className="group flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300">
                                <ArrowRight size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white">View All</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Registration Modal Overlay */}
            {selectedSession && (
                <SessionRegistrationModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                />
            )}

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
