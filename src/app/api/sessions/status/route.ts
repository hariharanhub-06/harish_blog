import { db } from "@/db";
import { liveSessions } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { sessionId, status } = await req.json();

        if (!sessionId || !status) {
            return NextResponse.json({ error: "Session ID and status are required" }, { status: 400 });
        }

        if (!['scheduled', 'active', 'completed'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await db.update(liveSessions)
            .set({ status, updatedAt: new Date() })
            .where(eq(liveSessions.id, sessionId));

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error("Failed to update session status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
