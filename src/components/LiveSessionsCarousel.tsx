"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Video, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
            const scrollTo = direction === "left" ? scrollLeft - clientWidth / 3 : scrollLeft + clientWidth / 3;
            scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <section id="sessions" className="py-6 md:py-10 bg-[#0e0e0e] border-y border-white/5 overflow-hidden">
            <div className="container mx-auto px-6">
                {/* Header Section - Extremely Compact */}
                <div className="flex justify-between items-center mb-6 gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500">Live</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                            Upcoming <span className="text-red-600">Sessions</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-90"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-90"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Layout - Hyper Dense */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
                >
                    {sessions.map((session) => (
                        <motion.div
                            key={session.id}
                            whileHover={{ y: -3 }}
                            onClick={() => setSelectedSession(session)}
                            className="flex-shrink-0 w-[180px] md:w-[210px] snap-center group cursor-pointer"
                        >
                            <div className="relative h-[240px] md:h-[260px] rounded-2xl overflow-hidden border border-white/10 group-hover:border-red-600/50 transition-all duration-300 bg-zinc-900/40">
                                {/* Poster Image */}
                                {session.posterUrl ? (
                                    <img
                                        src={session.posterUrl}
                                        alt={session.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-50 group-hover:opacity-100"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/5">
                                        <Video size={40} />
                                    </div>
                                )}

                                {/* Sharp Bottom Gradient */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent" />

                                {/* Compact Label */}
                                <div className="absolute top-3 right-3">
                                    <div className="px-2 py-0.5 bg-red-600/90 backdrop-blur-sm rounded-md text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
                                        {session.price === 0 ? "Free" : `₹${session.price}`}
                                    </div>
                                </div>

                                {/* Content Overlay - Very Compact */}
                                <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
                                    <h3 className="text-sm font-black text-white uppercase tracking-tighter leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">
                                        {session.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest border-t border-white/5 pt-2">
                                        <span className="flex items-center gap-1 text-white/40">
                                            <Calendar size={8} className="text-red-500" />
                                            {format(new Date(session.startTime), 'MMM d')}
                                        </span>
                                        <span className="flex items-center gap-1 text-white/40">
                                            <Clock size={8} className="text-red-500" />
                                            {format(new Date(session.startTime), 'h:mm a')}
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
