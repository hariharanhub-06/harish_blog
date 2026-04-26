import { db } from "@/db";
import { adminTrustedDevices, adminSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const sessionId = req.headers.get("X-Session-Id");
        if (!sessionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sessionId));
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const deviceId = params.id;

        await db.delete(adminTrustedDevices)
            .where(and(
                eq(adminTrustedDevices.id, deviceId),
                eq(adminTrustedDevices.userEmail, session.userEmail)
            ));

        return NextResponse.json({ success: true, message: "Device revoked successfully" });
    } catch (error: any) {
        console.error("Revoke Device Error:", error);
        return NextResponse.json({ error: "Failed to revoke device" }, { status: 500 });
    }
}
