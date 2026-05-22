import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function validateAdminSession(req: Request): Promise<NextResponse | null> {
    const sid = req.headers.get("X-Session-Id");
    if (!sid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sid));
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.lastActive && Date.now() - new Date(session.lastActive).getTime() > SESSION_TTL_MS) {
        await db.delete(adminSessions).where(eq(adminSessions.id, sid));
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    return null;
}
