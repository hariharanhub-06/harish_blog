"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import SessionRegistrationModal from "./SessionRegistrationModal";
import JoinSessionModal from "./JoinSessionModal";

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
    const [joiningSession, setJoiningSession] = useState<Session | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get("joinError");
        const sid = searchParams.get("sessionId");
        if (error && sid) {
            const session = sessions.find(s => s.id === sid);
            if (session) {
                setJoiningSession(session);
            }
        }
    }, [searchParams, sessions]);

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
                <div className="flex justify-between items-center mb-4 gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-red-500">Live</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
                            Upcoming <span className="text-red-600">Sessions</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-90"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-90"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Layout - Hyper Dense */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-2.5 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar scroll-smooth"
                >
                    {sessions.map((session) => (
                        <motion.div
                            key={session.id}
                            whileHover={{ y: -2 }}
                            onClick={() => setSelectedSession(session)}
                            className="flex-shrink-0 w-[160px] md:w-[190px] snap-center group cursor-pointer"
                        >
                            <div className="relative h-[210px] md:h-[230px] rounded-2xl overflow-hidden border border-white/10 group-hover:border-red-600/50 transition-all duration-300 bg-zinc-900/40">
                                {/* Poster Image */}
                                {session.posterUrl ? (
                                    <img
                                        src={session.posterUrl}
                                        alt={session.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-50 group-hover:opacity-100"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/5">
                                        <Video size={32} />
                                    </div>
                                )}

                                {/* Sharp Bottom Gradient */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent" />

                                {/* Compact Label */}
                                <div className="absolute top-2 right-2">
                                    <div className="px-1.5 py-0.5 bg-red-600/90 backdrop-blur-sm rounded-md text-[7px] font-black uppercase tracking-widest text-white shadow-lg">
                                        {session.price === 0 ? "Free" : `₹${session.price}`}
                                    </div>
                                </div>

                                {/* Content Overlay - Very Compact */}
                                <div className="absolute inset-x-0 bottom-0 p-3 space-y-1.5">
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-tighter leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">
                                        {session.title}
                                    </h3>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setJoiningSession(session);
                                            }}
                                            className="flex-1 py-1 bg-white/10 hover:bg-white/20 text-white text-[8px] font-black uppercase tracking-widest rounded-md border border-white/5 transition-all active:scale-95"
                                        >
                                            Join Room
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSession(session);
                                            }}
                                            className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white text-[8px] font-black uppercase tracking-widest rounded-md transition-all active:scale-95 shadow-lg shadow-red-600/20"
                                        >
                                            Register
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between text-[7px] font-black uppercase tracking-widest border-t border-white/5 pt-1.5">
                                        <span className="flex items-center gap-1 text-white/40">
                                            <Calendar size={6} className="text-red-500" />
                                            {format(new Date(session.startTime), 'MMM d')}
                                        </span>
                                        <span className="flex items-center gap-1 text-white/40">
                                            <Clock size={6} className="text-red-500" />
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

            {/* Join Modal */}
            <JoinSessionModal
                sessionId={joiningSession?.id || ""}
                sessionTitle={joiningSession?.title || ""}
                isOpen={!!joiningSession}
                onClose={() => setJoiningSession(null)}
            />

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
}
