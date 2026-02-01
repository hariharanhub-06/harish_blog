import { db } from "@/db";
import { sessionRegistrations, liveSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import LiveRoomClient from "@/components/live/LiveRoomClient";

interface Props {
    params: {
        sessionId: string;
    };
    searchParams: {
        email?: string;
    };
}

export default async function LiveSessionPage({ params, searchParams }: Props) {
    const { sessionId } = params;
    const { email } = searchParams;

    // 1. Fetch Session
    const session = await db.query.liveSessions.findFirst({
        where: eq(liveSessions.id, sessionId)
    });

    if (!session) {
        redirect("/sessions?error=not_found");
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
            eq(sessionRegistrations.userEmail, email),
            eq(sessionRegistrations.status, "confirmed")
        )
    });

    if (!registration) {
        redirect(`/sessions?error=not_registered&sessionId=${sessionId}`);
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
