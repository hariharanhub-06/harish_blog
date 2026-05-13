import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
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
            const result = await db.update(adminSessions)
                .set({
                    lastActive: new Date(),
                    ipAddress: ipAddress || null,
                })
                .where(eq(adminSessions.id, id))
                .returning();

            if (result.length > 0) {
                return NextResponse.json(result[0]);
            }

            // session not found — fall through to create a new one
        }

        // Create new session
        if (!userEmail) {
            console.error("[API/ADMIN/SESSIONS] userEmail is required for new sessions");
            return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
        }

        const newId = crypto.randomUUID();

        const result = await db.insert(adminSessions).values({
            id: newId,
            userEmail,
            deviceName: deviceName || "Unknown Device",
            browser: browser || "Unknown Browser",
            os: os || "Unknown OS",
            ipAddress: ipAddress || null,
            lastActive: new Date(),
        }).returning();

        if (result.length === 0) {
            throw new Error("Failed to create session - no record returned");
        }

        return NextResponse.json(result[0]);
    } catch (error: any) {
        console.error("[API/ADMIN/SESSIONS] Failed to track session:", error);
        return NextResponse.json({
            error: "Failed to track session",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
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
