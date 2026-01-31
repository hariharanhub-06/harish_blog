import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("Starting repair migration...");
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
