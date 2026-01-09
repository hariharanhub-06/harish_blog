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

    // 2. Check Critical Tables
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
    } catch (e: any) {
        diag.tables_check = { status: "FAIL", message: e.message };
    }

    // 3. Check Shiprocket Pickup Locations
    try {
        const { getShiprocketToken } = await import("@/lib/shiprocket");
        const token = await getShiprocketToken();

        // Try the standard endpoint (no trailing slash)
        let srRes = await fetch("https://apiv2.shiprocket.in/v1/external/settings/get/pickup", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Fallback for some API versions
        if (!srRes.ok) {
            srRes = await fetch("https://apiv2.shiprocket.in/v1/external/pickup/locations", {
                headers: { "Authorization": `Bearer ${token}` }
            });
        }

        if (srRes.ok) {
            const srData = await srRes.json();
            // The structure is usually { data: { shipping_address: [...] } } or { data: [...] }
            const addresses = srData.data?.shipping_address || srData.data || [];
            diag.shiprocket_pickup_locations = Array.isArray(addresses)
                ? addresses.map((a: any) => a.pickup_location || a.nickname || JSON.stringify(a))
                : [JSON.stringify(srData)];
        } else {
            diag.shiprocket_pickup_locations = {
                status: "FAIL",
                statusText: srRes.statusText,
                url: srRes.url
            };
        }
    } catch (e: any) {
        diag.shiprocket_pickup_locations = { status: "ERROR", message: e.message };
    }

    return NextResponse.json(diag, { status: diag.database_connection.status === "OK" ? 200 : 500 });
}
