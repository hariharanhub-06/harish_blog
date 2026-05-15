import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { validateAdminSession } from "@/lib/adminAuth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;

    try {
        const [stats] = await sql`
            SELECT
                COUNT(*) FILTER (WHERE action = 'take')::INTEGER as take_count,
                COUNT(*) FILTER (WHERE action = 'break')::INTEGER as break_count,
                COUNT(*)::INTEGER as total
            FROM heart_reactions
        `;
        const recent = await sql`
            SELECT action, created_at FROM heart_reactions
            ORDER BY created_at DESC LIMIT 20
        `;
        return NextResponse.json({
            take: stats?.take_count || 0,
            break: stats?.break_count || 0,
            total: stats?.total || 0,
            recent,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
