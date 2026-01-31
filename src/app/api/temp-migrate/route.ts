import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_video_url TEXT`);
        return NextResponse.json({ success: true, message: "Migration completed" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
