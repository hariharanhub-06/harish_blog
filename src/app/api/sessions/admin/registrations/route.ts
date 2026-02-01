import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessionRegistrations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        const data = await db.select()
            .from(sessionRegistrations)
            .where(eq(sessionRegistrations.sessionId, sessionId))
            .orderBy(desc(sessionRegistrations.registeredAt));

        return NextResponse.json(data);
    } catch (error) {
        console.error("Fetch registrations failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
        }

        await db.delete(sessionRegistrations).where(eq(sessionRegistrations.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete registration failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
