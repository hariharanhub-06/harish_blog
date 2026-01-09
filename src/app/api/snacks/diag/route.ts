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
        const rows = (result as any).rows || result;
        diag.database_connection = { status: "OK", result: (rows as any)[0] };
    } catch (e: any) {
        diag.database_connection = { status: "FAIL", message: e.message };
    }

    // 2. Check Critical Tables and Columns
    try {
        const tablesResult = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('snack_products', 'snack_orders', 'abandoned_carts', 'coupons')
        `);
        const rows = (tablesResult as any).rows || tablesResult;
        diag.tables_found = (rows as any).map((t: any) => t.table_name);

        const expected = ['snack_products', 'snack_orders', 'abandoned_carts', 'coupons'];
        diag.tables_missing = expected.filter(t => !diag.tables_found.includes(t));

        // Column checks for snack_orders
        if (diag.tables_found.includes('snack_orders')) {
            const cols = await db.execute(sql`
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'snack_orders' 
                AND column_name IN ('cancel_reason', 'coupon_code', 'discount_amount')
            `);
            const colRows = (cols as any).rows || cols;
            diag.snack_orders_columns = (colRows as any).map((c: any) => c.column_name);
        }

        // Type check for snack_products.stock
        if (diag.tables_found.includes('snack_products')) {
            const stockCheck = await db.execute(sql`
                SELECT data_type FROM information_schema.columns 
                WHERE table_name = 'snack_products' AND column_name = 'stock'
            `);
            const stockRows = (stockCheck as any).rows || stockCheck;
            diag.snack_products_stock_type = (stockRows as any)[0]?.data_type;
        }
    } catch (e: any) {
        diag.tables_check = { status: "FAIL", message: e.message };
    }

    return NextResponse.json(diag, { status: diag.database_connection.status === "OK" ? 200 : 500 });
}
