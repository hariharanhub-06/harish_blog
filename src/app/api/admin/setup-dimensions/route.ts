import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        // Add dimension columns to snack_products
        await db.execute(sql`
            ALTER TABLE snack_products 
            ADD COLUMN IF NOT EXISTS length DOUBLE PRECISION DEFAULT 1,
            ADD COLUMN IF NOT EXISTS width DOUBLE PRECISION DEFAULT 1,
            ADD COLUMN IF NOT EXISTS height DOUBLE PRECISION DEFAULT 1,
            ADD COLUMN IF NOT EXISTS weight DOUBLE PRECISION DEFAULT 0.5
        `);

        return NextResponse.json({ success: true, message: "Product dimensions columns added successfully" });
    } catch (error: any) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
