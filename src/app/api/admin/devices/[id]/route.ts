import { db } from "@/db";
import { adminTrustedDevices, adminSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const sid = cookies().get("admin_session")?.value;
        if (!sid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sid));
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const deviceId = params.id;

        // Ensure the device belongs to the logged in user before deleting
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
