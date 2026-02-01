import { db } from "@/db";
import { sessionRegistrations, liveSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ShieldCheck, X, Calendar, Clock, Users } from "lucide-react";
import LiveRoomClient from "@/components/live/LiveRoomClient";
import WaitingRoom from "@/components/live/WaitingRoom";

interface Props {
    params: Promise<{
        sessionId: string;
    }>;
    searchParams: Promise<{
        token?: string;
    }>;
}

export default async function LiveSessionPage({ params, searchParams }: Props) {
    const { sessionId } = await params;
    const { token } = await searchParams;

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

    // 2. Access Protection via Token
    const registration = token ? await db.query.sessionRegistrations.findFirst({
        where: and(
            eq(sessionRegistrations.sessionId, sessionId),
            eq(sessionRegistrations.joinToken, token),
            eq(sessionRegistrations.status, "confirmed")
        )
    }) : null;

    if (!registration) {
        redirect(`/?joinError=unauthorized&sessionId=${sessionId}`);
    }

    // 3. Check if session has started (only admin can join before status is 'active')
    const isAdmin = registration.userEmail === process.env.ADMIN_EMAIL; // You'll need to set this

    if (!isAdmin && session.status !== 'active') {
        return <WaitingRoom sessionId={sessionId} />;
    }


    // 4. Duplicate prevention is now handled by client-side heartbeat (Last Login Wins)

    // 5. Concurrent Session Protection
    // Create a new session ID for this window/device
    const currentActiveId = crypto.randomUUID();

    // Update the registration with the new active session ID
    await db.update(sessionRegistrations)
        .set({
            activeSessionId: currentActiveId,
            lastActiveAt: new Date()
        })
        .where(eq(sessionRegistrations.id, registration.id));


    return (
        <div className="min-h-screen bg-black overflow-hidden">
            <LiveRoomClient
                session={session}
                user={{
                    id: registration.id,
                    name: registration.userName,
                    email: registration.userEmail,
                    activeSessionId: currentActiveId
                }}
            />
        </div>
    );
}
