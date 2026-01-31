import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("Starting repair migration...");
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_video_url TEXT`);
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_image_url TEXT`);
        return NextResponse.json({
            success: true,
            message: "Database repair completed. Missing columns added."
        });
    } catch (error: any) {
        console.error("Repair failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
