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

        // Try common endpoints
        const endpoints = [
            "https://apiv2.shiprocket.in/v1/external/settings/get/pickup",
            "https://apiv2.shiprocket.in/v1/external/settings/get/all_pickup_locations",
            "https://apiv2.shiprocket.in/v1/external/pickup/locations"
        ];

        let results: any[] = [];

        for (const url of endpoints) {
            const srRes = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const srData = await srRes.json().catch(() => ({ msg: "Could not parse JSON" }));
            results.push({
                url,
                status: srRes.status,
                data: srData
            });
        }

        diag.shiprocket_diagnostics = results;

        // Extract names from any successful response
        const successful = results.find(r => r.status === 200);
        if (successful) {
            const addresses = successful.data.data?.shipping_address || successful.data.data || [];
            diag.shiprocket_pickup_locations = Array.isArray(addresses)
                ? addresses.map((a: any) => a.pickup_location || a.nickname || JSON.stringify(a))
                : [JSON.stringify(successful.data)];
        } else {
            diag.shiprocket_pickup_locations = { status: "FAIL", results };
        }
    } catch (e: any) {
        diag.shiprocket_pickup_locations = { status: "ERROR", message: e.message };
    }

    return NextResponse.json(diag, { status: diag.database_connection.status === "OK" ? 200 : 500 });
}
