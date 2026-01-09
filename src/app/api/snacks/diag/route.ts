import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    const diag: any = {
        timestamp: new Date().toISOString(),
        environment_keys: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            SHIPROCKET_EMAIL: !!process.env.SHIPROCKET_EMAIL,
            SHIPROCKET_PASSWORD: !!process.env.SHIPROCKET_PASSWORD,
            TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
            TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
            TWILIO_WHATSAPP_NUMBER: !!process.env.TWILIO_WHATSAPP_NUMBER,
            ADMIN_WHATSAPP_NUMBER: !!process.env.ADMIN_WHATSAPP_NUMBER,
        }
    };

    // 1. Check DB Connection
    try {
        const result = await db.execute(sql`SELECT 1 as health`);
        diag.database_connection = { status: "OK", result: result[0] };
    } catch (e: any) {
        diag.database_connection = { status: "FAIL", message: e.message };
    }

    // 2. Check Critical Tables
    try {
        const tablesResult = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('snack_products', 'snack_orders', 'abandoned_carts', 'coupons')
        `);
        diag.tables_found = tablesResult.map((t: any) => t.table_name);

        const missing = ['snack_products', 'snack_orders', 'abandoned_carts', 'coupons'].filter(
            t => !diag.tables_found.includes(t)
        );
        diag.tables_missing = missing;
    } catch (e: any) {
        diag.tables_check = { status: "FAIL", message: e.message };
    }

    return NextResponse.json(diag, { status: diag.database_connection.status === "OK" ? 200 : 500 });
}
