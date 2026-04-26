import { db } from "@/db";
import { adminTrustedDevices, adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const sid = cookies().get("admin_session")?.value;
        if (!sid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sid));
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Admin can list trusted devices
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
        return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const sid = cookies().get("admin_session")?.value;
        if (!sid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sid));
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { deviceName, browser, os } = await req.json();

        // Generate a cryptographically secure token
        const rawToken = crypto.randomUUID() + "-" + crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

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
            // Only time the raw token is returned! Client must store it securely.
            rawToken: rawToken 
        });

    } catch (error: any) {
        console.error("Enroll Device Error:", error);
        return NextResponse.json({ error: "Failed to enroll device" }, { status: 500 });
    }
}
