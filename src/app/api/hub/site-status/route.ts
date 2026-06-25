
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Public, unauthenticated read endpoint. The real StartUP / D-Driver sites poll
// this from their server (root layout) to decide whether to show a 403 page.
// On ANY error we return everything enabled so consumers fail OPEN.

export const dynamic = "force-dynamic";

const SITE_KEYS = ["startup", "ddriver"] as const;

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "no-store",
    };
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
    // Default every site to enabled; overlay stored values below.
    const status: Record<string, boolean> = {};
    for (const key of SITE_KEYS) status[key] = true;

    try {
        const sql = neon(process.env.DATABASE_URL!);
        await sql(`
            CREATE TABLE IF NOT EXISTS platform_hub_portal_toggles (
                page_key   TEXT PRIMARY KEY,
                is_enabled BOOLEAN DEFAULT TRUE,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        const rows = await sql(`SELECT page_key, is_enabled FROM platform_hub_portal_toggles`);
        for (const row of rows) {
            if (row.page_key in status) status[row.page_key] = !!row.is_enabled;
        }
    } catch (error) {
        console.error("Site Status GET error (failing open):", error);
        // Keep all-enabled defaults so a hub/DB outage never blocks the real sites.
    }

    return NextResponse.json(status, { headers: corsHeaders() });
}
