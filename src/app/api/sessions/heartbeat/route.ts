import { db } from "@/db";
import { sessionRegistrations } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { registrationId, activeSessionId } = await req.json();

        if (!registrationId || !activeSessionId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const registration = await db.query.sessionRegistrations.findFirst({
            where: eq(sessionRegistrations.id, registrationId),
            columns: { activeSessionId: true }
        });

        if (!registration) {
            return NextResponse.json({ valid: false, reason: "not_found" });
        }

        // Validate if the client's session ID matches the database
        const isValid = registration.activeSessionId === activeSessionId;

        if (isValid) {
            // Update lastActiveAt to keep the session alive
            await db.update(sessionRegistrations)
                .set({ lastActiveAt: new Date() })
                .where(eq(sessionRegistrations.id, registrationId));
        }

        return NextResponse.json({ valid: isValid });
    } catch (error) {
        console.error("Session heartbeat failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
