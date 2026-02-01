"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { IndianRupee, Video, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <section id="sessions" className="py-12 md:py-16 bg-[#0e0e0e] border-y border-white/5">
            <div className="container mx-auto px-6">
                {/* Header Section - Compact */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Live & Interactive</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
                            Upcoming <span className="text-red-600">Sessions</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-90"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-90"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Layout - Aiming for 5 in a row feel */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar scroll-smooth"
                >
                    {sessions.map((session) => (
                        <motion.div
                            key={session.id}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedSession(session)}
                            className="flex-shrink-0 w-[240px] md:w-[260px] snap-center group cursor-pointer"
                        >
                            <div className="relative h-[320px] rounded-3xl overflow-hidden border border-white/10 group-hover:border-red-600/50 transition-all duration-300 shadow-xl bg-zinc-900/50">
                                {/* Poster Image */}
                                {session.posterUrl ? (
                                    <img
                                        src={session.posterUrl}
                                        alt={session.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-100"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/5">
                                        <Video size={48} />
                                    </div>
                                )}

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                                {/* Price / Labels */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                    <div className="px-3 py-1 bg-red-600/90 backdrop-blur-sm rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                                        {session.price === 0 ? "Free" : `₹${session.price}`}
                                    </div>
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-5 space-y-3">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">
                                            {session.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={10} className="text-red-500" />
                                                {format(new Date(session.startTime), 'MMM d')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} className="text-red-500" />
                                                {format(new Date(session.startTime), 'h:mm a')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Text */}
                                    <div className="pt-2 border-t border-white/10 text-center">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Click to Register
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Registration Modal */}
            {selectedSession && (
                <SessionRegistrationModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                />
            )}

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
}
