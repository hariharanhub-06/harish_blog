import { db } from "@/db";
import { sessionRegistrations, liveSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
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
        redirect("/?error=session_not_found");
    }

    // 2. Check Registration (simplified for now, ideally needs auth or a secure link)
    if (!email) {
        // In a real app, we'd use NextAuth or a unique token. 
        // For now, we'll check if the email provided in query exists and is confirmed.
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <h1 className="text-3xl font-bold">Access Denied</h1>
                    <p className="text-gray-400">Please enter the email you used to register for this session.</p>
                    <form className="space-y-4">
                        <input
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            className="w-full px-4 py-3 bg-gray-800 border-none rounded-xl focus:ring-2 ring-primary"
                            required
                        />
                        <button className="w-full py-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all">
                            Join Session
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const registration = await db.query.sessionRegistrations.findFirst({
        where: and(
            eq(sessionRegistrations.sessionId, sessionId),
            eq(sessionRegistrations.userEmail, email || ""),
            eq(sessionRegistrations.status, "confirmed")
        )
    });

    if (!registration) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-red-500/20">
                        <ShieldCheck className="text-red-500" size={32} />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black uppercase tracking-tight">Access Denied</h1>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Registration Not Found</p>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl text-red-500 text-xs font-bold leading-relaxed">
                        The email <span className="underline decoration-red-500/30 text-white">${email}</span> is not registered or payment is pending for this session.
                    </div>

                    <div className="space-y-4 pt-4">
                        <p className="text-gray-500 font-black text-[9px] uppercase tracking-[0.3em]">Try another email</p>
                        <form className="space-y-4">
                            <input
                                name="email"
                                type="email"
                                placeholder="Registered Email Address"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm outline-none focus:border-red-500/50 transition-all text-center"
                                required
                            />
                            <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 transition-all shadow-xl shadow-white/5">
                                Re-verify & Join
                            </button>
                        </form>
                    </div>

                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] pt-8">
                        Note: Check your confirmation email for the registered address.
                    </p>
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
