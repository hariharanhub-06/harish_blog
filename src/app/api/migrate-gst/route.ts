import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        await db.execute(sql`ALTER TABLE "snack_products" ADD COLUMN IF NOT EXISTS "gst_percent" double precision DEFAULT 5;`);
        return NextResponse.json({ success: true, message: "Migration applied: gst_percent added" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
