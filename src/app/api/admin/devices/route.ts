import { db } from "@/db";
import { adminTrustedDevices, adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

// Helper: get session by ID from the X-Session-Id header
async function getSessionFromRequest(req: Request) {
    const sessionId = req.headers.get("X-Session-Id");
    if (!sessionId) return null;
    try {
        const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sessionId));
        return session || null;
    } catch (err) {
        console.error("[GET_SESSION] DB Error:", err);
        return null;
    }
}

export async function GET(req: Request) {
    try {
        const session = await getSessionFromRequest(req);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const devices = await db.select({
            id: adminTrustedDevices.id,
            deviceName: adminTrustedDevices.deviceName,
            browser: adminTrustedDevices.browser,
            os: adminTrustedDevices.os,
            lastUsedAt: adminTrustedDevices.lastUsedAt,
            createdAt: adminTrustedDevices.createdAt,
        }).from(adminTrustedDevices)
            .where(eq(adminTrustedDevices.userEmail, session.userEmail));

        return NextResponse.json(devices);
    } catch (error: any) {
        console.error("Fetch Devices Error:", error);
        return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const sessionId = req.headers.get("X-Session-Id");
        console.log("[DEVICE_ENROLL] Attempting for Session ID:", sessionId);

        const session = await getSessionFromRequest(req);
        if (!session) {
            console.warn("[DEVICE_ENROLL] No valid session found for ID:", sessionId);
            return NextResponse.json({ error: "Unauthorized - Valid session required" }, { status: 401 });
        }

        const { deviceName, browser, os } = await req.json();

        const rawToken = crypto.randomUUID() + "-" + crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        console.log("[DEVICE_ENROLL] Storing device for user:", session.userEmail);

        const [newDevice] = await db.insert(adminTrustedDevices).values({
            userEmail: session.userEmail,
            deviceName: deviceName || "Trusted Device",
            deviceTokenHash: tokenHash,
            browser: browser || "",
            os: os || ""
        }).returning();

        return NextResponse.json({
            success: true,
            id: newDevice.id,
            rawToken: rawToken
        });
    } catch (error: any) {
        console.error("Enroll Device Error:", error);
        // Provide more context if it's a known DB error
        if (error.message?.includes('relation "admin_trusted_devices" does not exist')) {
            return NextResponse.json({ error: "Database table missing. Please run migrations." }, { status: 500 });
        }
        return NextResponse.json({ error: "Failed to enroll device: " + error.message }, { status: 500 });
    }
}
