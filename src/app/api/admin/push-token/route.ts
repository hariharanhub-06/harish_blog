import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminPushTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { token, deviceType } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        // Save or update the token
        await db.insert(adminPushTokens)
            .values({
                token,
                deviceType: deviceType || "web",
                lastUsedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: adminPushTokens.token,
                set: {
                    lastUsedAt: new Date(),
                    deviceType: deviceType || "web",
                },
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving push token:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { token } = await req.json();
        if (!token) return NextResponse.json({ error: "Token is required" }, { status: 400 });

        await db.delete(adminPushTokens).where(eq(adminPushTokens.token, token));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting push token:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
