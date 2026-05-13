import { db } from "@/db";
import { adminPushTokens } from "@/db/schema";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const sid = req.headers.get("X-Session-Id");
        if (!sid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sid));
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { subscription } = await req.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
        }

        const serializedToken = JSON.stringify(subscription);

        // Check if token already exists
        const [existing] = await db.select().from(adminPushTokens).where(eq(adminPushTokens.token, serializedToken));

        if (!existing) {
            await db.insert(adminPushTokens).values({
                token: serializedToken,
                deviceType: session.deviceName || "Unknown",
            });
        }

        return NextResponse.json({ success: true, message: "Push notification subscription saved." });
    } catch (error: any) {
        console.error("Push Subscribe Error:", error);
        return NextResponse.json({ error: "Failed to persist subscription" }, { status: 500 });
    }
}
