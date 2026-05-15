import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS heart_reactions (
            id TEXT PRIMARY KEY,
            action TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
}

export async function GET() {
    try {
        await ensureTable();
        const [stats] = await sql`
            SELECT
                COUNT(*) FILTER (WHERE action = 'take')::INTEGER as take_count,
                COUNT(*) FILTER (WHERE action = 'break')::INTEGER as break_count,
                COUNT(*)::INTEGER as total
            FROM heart_reactions
        `;
        return NextResponse.json({
            take: stats?.take_count || 0,
            break: stats?.break_count || 0,
            total: stats?.total || 0,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await ensureTable();
        const { action } = await req.json();
        if (!["take", "break"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
        const id = crypto.randomUUID();
        await sql`INSERT INTO heart_reactions (id, action) VALUES (${id}, ${action})`;
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
