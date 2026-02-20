import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
    try {
        const sessions = await db.select()
            .from(adminSessions)
            .orderBy(desc(adminSessions.lastActive));
        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Failed to fetch sessions", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { id, userEmail, deviceName, browser, os, ipAddress } = data;

        if (id) {
            // Update existing session
            const [updated] = await db.update(adminSessions)
                .set({
                    lastActive: new Date(),
                    ipAddress: ipAddress || null,
                })
                .where(eq(adminSessions.id, id))
                .returning();
            return NextResponse.json(updated);
        } else {
            // Create new session
            const [session] = await db.insert(adminSessions).values({
                userEmail,
                deviceName: deviceName || "Unknown Device",
                browser: browser || "Unknown Browser",
                os: os || "Unknown OS",
                ipAddress: ipAddress || null,
                lastActive: new Date(),
            }).returning();
            return NextResponse.json(session);
        }
    } catch (error) {
        console.error("Failed to track session", error);
        return NextResponse.json({ error: "Failed to track session" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const action = searchParams.get("action");

        if (action === "logout-all") {
            await db.delete(adminSessions);
            return NextResponse.json({ success: true });
        }

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.delete(adminSessions).where(eq(adminSessions.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete session", error);
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
}
