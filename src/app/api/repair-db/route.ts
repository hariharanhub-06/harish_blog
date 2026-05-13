import { db } from "@/db";
import { sql, eq } from "drizzle-orm";
import { adminSessions } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const sid = req.headers.get("X-Session-Id");
    if (!sid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sid));
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const queries = [
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_video_url TEXT`,
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_image_url TEXT`,
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS headline TEXT`,
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT`,
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS audio_url TEXT`
        ];

        for (const q of queries) {
            await db.execute(sql.raw(q));
        }

        return NextResponse.json({
            success: true,
            message: "Database repair completed. Missing columns verified."
        });
    } catch (error: any) {
        console.error("Repair failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
