
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { validateAdminSession } from "@/lib/adminAuth";

const PORTAL_KEYS = ["startup", "ddriver"] as const;

async function ensureTable(sql: ReturnType<typeof neon>) {
    await sql(`
        CREATE TABLE IF NOT EXISTS platform_hub_portal_toggles (
            page_key   TEXT PRIMARY KEY,
            is_enabled BOOLEAN DEFAULT TRUE,
            updated_at TIMESTAMP DEFAULT NOW()
        );
    `);
}

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const sql = neon(process.env.DATABASE_URL!);
        await ensureTable(sql);

        const rows = await sql(`SELECT page_key, is_enabled FROM platform_hub_portal_toggles`);

        // Default every known portal to enabled, then overlay stored values.
        const toggles: Record<string, boolean> = {};
        for (const key of PORTAL_KEYS) toggles[key] = true;
        for (const row of rows) toggles[row.page_key] = !!row.is_enabled;

        return NextResponse.json({ toggles });
    } catch (error) {
        console.error("Portal Toggles GET error:", error);
        return NextResponse.json({ error: "Failed to fetch toggles" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const body = await req.json();
        const { pageKey, isEnabled } = body;

        if (!PORTAL_KEYS.includes(pageKey)) {
            return NextResponse.json({ error: "Invalid pageKey" }, { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL!);
        await ensureTable(sql);

        await sql(`
            INSERT INTO platform_hub_portal_toggles (page_key, is_enabled)
            VALUES ($1, $2)
            ON CONFLICT (page_key) DO UPDATE SET
                is_enabled = EXCLUDED.is_enabled,
                updated_at = NOW();
        `, [pageKey, !!isEnabled]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Portal Toggles POST error:", error);
        return NextResponse.json({ error: "Failed to save toggle" }, { status: 500 });
    }
}
