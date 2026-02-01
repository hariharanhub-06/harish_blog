import { db } from "@/db";
import { sessionRegistrations, liveSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ShieldCheck, X, Calendar, Clock } from "lucide-react";
import LiveRoomClient from "@/components/live/LiveRoomClient";

interface Props {
    params: Promise<{
        sessionId: string;
    }>;
    searchParams: Promise<{
        email?: string;
    }>;
}

export default async function LiveSessionPage({ params, searchParams }: Props) {
    const { sessionId } = await params;
    const { email } = await searchParams;

    // 1. Fetch Session
    const session = await db.query.liveSessions.findFirst({
        where: eq(liveSessions.id, sessionId)
    });

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6 overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px]" />
                <div className="max-w-md w-full text-center space-y-6 relative z-10">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
                        <X className="text-red-500" size={32} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black uppercase tracking-tight">Session Not Found</h1>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">Invalid or Expired Link</p>
                    </div>
                    <p className="text-gray-400 text-xs font-medium leading-relaxed">
                        The live session you're looking for doesn't exist or hasn't started yet.
                    </p>
                    <div className="pt-4">
                        <a href="/" className="inline-block px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-100 transition-all">
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Access Protection
    const registration = email ? await db.query.sessionRegistrations.findFirst({
        where: and(
            eq(sessionRegistrations.sessionId, sessionId),
            eq(sessionRegistrations.userEmail, email),
            eq(sessionRegistrations.status, "confirmed")
        )
    }) : null;

    if (!registration) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6 overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />

                <div className="max-w-md w-full text-center space-y-8 relative z-10 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/10 shadow-2xl backdrop-blur-xl">
                        <ShieldCheck className="text-red-500" size={40} strokeWidth={1.5} />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-black uppercase tracking-tight leading-none text-white">Access Denied</h1>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em]">Secure Session Entry</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="text-red-500" size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Session</p>
                                <p className="text-[10px] font-bold text-white uppercase">{session.title}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                <Calendar className="text-amber-500" size={14} />
                            </div>
                            <div className="text-left">
                                <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Starts At</p>
                                <p className="text-[10px] font-bold text-white">{new Date(session.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            </div>
                        </div>
                    </div>

                    {email && (
                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[32px] text-red-500 text-xs font-bold leading-relaxed backdrop-blur-md">
                            The email <span className="text-white underline decoration-red-500/30 font-black">${email}</span> is not registered for this session.
                        </div>
                    )}

                    <div className="space-y-6 pt-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest leading-relaxed">
                                Note: Only those who have registered can join this live webinar. <br />
                                Please use your registered email address below.
                            </p>
                        </div>

                        <form className="space-y-4 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Registered Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    defaultValue={email || ""}
                                    className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[24px] font-bold text-sm outline-none focus:border-red-500/50 focus:bg-white/10 transition-all text-center tracking-wide"
                                    required
                                />
                            </div>
                            <button className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-[24px] active:scale-95 transition-all shadow-2xl shadow-white/10 hover:bg-gray-100">
                                Verify Access & Join
                            </button>
                        </form>
                    </div>

                    <div className="pt-8 flex flex-col items-center gap-4">
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                            Lost your confirmation email?
                        </p>
                        <a href="/" className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/20 pb-1 hover:border-white transition-all">
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-black overflow-hidden">
            <LiveRoomClient
                session={session}
                user={{
                    id: registration.id,
                    name: registration.userName,
                    email: registration.userEmail
                }}
            />
        </div>
    );
}
