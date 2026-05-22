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
            // Update existing session — verify the ID exists in DB (no header needed; the ID itself is the credential)
            const [existing] = await db.select().from(adminSessions).where(eq(adminSessions.id, id));
            if (!existing) {
                // Session not found — fall through to create a new one
            } else {
                const result = await db.update(adminSessions)
                    .set({ lastActive: new Date(), ipAddress: ipAddress || null })
                    .where(eq(adminSessions.id, id))
                    .returning();
                return NextResponse.json(result[0]);
            }
        }

        // Create new session — only allow the configured admin email
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!userEmail) {
            console.error("[API/ADMIN/SESSIONS] userEmail is required for new sessions");
            return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
        }
        if (adminEmail && userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    } catch (error: unknown) {
        console.error("[API/ADMIN/SESSIONS] Failed to track session:", error);
        return NextResponse.json({ error: "Failed to track session" }, { status: 500 });
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
