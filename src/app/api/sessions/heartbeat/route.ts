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
            columns: {
                activeSessionId: true,
                lastActiveAt: true
            }
        });

        if (!registration) {
            return NextResponse.json({ valid: false, reason: "not_found" });
        }

        // Validate if the client's session ID matches the database
        const isValid = registration.activeSessionId === activeSessionId;

        if (isValid) {
            // OPTIMIZATION: Only write to DB if last update was > 2 mins ago
            // This drastically reduces Neon DB Data Transfer and Compute usage
            const lastUpdate = registration.lastActiveAt ? new Date(registration.lastActiveAt).getTime() : 0;
            const now = Date.now();

            if (now - lastUpdate > 120000) { // 2 minutes
                await db.update(sessionRegistrations)
                    .set({ lastActiveAt: new Date() })
                    .where(eq(sessionRegistrations.id, registrationId));
            }
        }

        return NextResponse.json({ valid: isValid });
    } catch (error) {
        console.error("Session heartbeat failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
