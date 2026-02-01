"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, IndianRupee, Video, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SessionRegistrationModal from "@/components/SessionRegistrationModal";

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

export default function LiveSessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            // Fetch only published sessions
            const res = await fetch("/api/sessions/admin?published=true");
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-poppins text-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-primary bg-primary/5 px-4 py-2 rounded-full">
                        Live Learning
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                        Upcoming <span className="text-primary decoration-4 underline decoration-primary/20 underline-offset-4">Live Sessions</span>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg">
                        Join interactive live sessions, masterclasses, and workshops directly from industry experts.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        <div className="relative z-10">
                            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Sessions Scheduled</h3>
                            <p className="text-gray-500">Check back later for new upcoming sessions!</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="group bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1 duration-300 flex flex-col"
                            >
                                {/* Poster Image */}
                                <div className="h-48 w-full relative bg-gray-100 overflow-hidden">
                                    {session.posterUrl ? (
                                        <img
                                            src={session.posterUrl}
                                            alt={session.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                            <Video size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        LIVE
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-4">
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                            <Calendar size={14} className="text-primary" />
                                            {format(new Date(session.startTime), 'MMM d, yyyy')}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                            <Clock size={14} className="text-primary" />
                                            {format(new Date(session.startTime), 'h:mm a')}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-primary transition-colors">
                                        {session.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                                        {session.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Entry Fee</span>
                                            <div className="flex items-center gap-1 text-2xl font-black text-gray-900">
                                                {session.price === 0 ? (
                                                    <span className="text-emerald-500">Free</span>
                                                ) : (
                                                    <>
                                                        <IndianRupee size={20} className="text-gray-400 mt-1" />
                                                        {session.price}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedSession(session)}
                                            className="px-6 py-3 bg-black text-white rounded-xl font-bold text-sm shadow-lg hover:bg-primary hover:shadow-primary/30 transition-all flex items-center gap-2 group/btn"
                                        >
                                            Register
                                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {selectedSession && (
                <SessionRegistrationModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                />
            )}
        </div>
    );
}
