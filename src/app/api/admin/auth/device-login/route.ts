import { db } from "@/db";
import { adminTrustedDevices, adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const { deviceToken } = await request.json();
        
        if (!deviceToken) {
            return NextResponse.json({ error: "No device token provided" }, { status: 400 });
        }

        // Token from client is a raw UUID, we stored its hashed version
        const tokenHash = crypto.createHash('sha256').update(deviceToken).digest('hex');

        // Check if a trusted device exists with this token hash
        const [device] = await db.select().from(adminTrustedDevices).where(eq(adminTrustedDevices.deviceTokenHash, tokenHash));

        if (!device) {
            return NextResponse.json({ error: "Invalid or revoked device token" }, { status: 401 });
        }

        // Update last used at
        await db.update(adminTrustedDevices)
            .set({ lastUsedAt: new Date() })
            .where(eq(adminTrustedDevices.id, device.id));

        // Create a new admin session for this device
        const [newSession] = await db.insert(adminSessions).values({
            userEmail: device.userEmail,
            deviceName: device.deviceName,
            browser: device.browser || "Unknown browser",
            os: device.os || "Unknown OS",
            ipAddress: "Device Login",
            isCurrent: true,
        }).returning({
            id: adminSessions.id,
            userEmail: adminSessions.userEmail,
            deviceName: adminSessions.deviceName,
        });

        if (!newSession) {
            return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
        }

        // Set session cookie securely
        const response = NextResponse.json({
            success: true, 
            message: "Passwordless login successful",
            sessionId: newSession.id,
            role: "admin",
            user: { email: newSession.userEmail }
        });
        
        response.cookies.set("admin_session", newSession.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;

    } catch (error: any) {
        console.error("Device Login Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
