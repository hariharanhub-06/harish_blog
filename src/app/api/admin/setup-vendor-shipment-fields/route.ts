import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        // Add vendor confirmation columns to order_shipments table
        await db.execute(sql`
            ALTER TABLE order_shipments
            ADD COLUMN IF NOT EXISTS vendor_confirmed_dimensions JSONB,
            ADD COLUMN IF NOT EXISTS vendor_confirmed_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS dimension_source TEXT DEFAULT 'auto',
            ADD COLUMN IF NOT EXISTS ready_to_ship BOOLEAN DEFAULT false;
        `);

        return NextResponse.json({
            success: true,
            message: "Vendor shipment columns added successfully"
        });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({
            error: "Migration failed",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
