import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { validateAdminSession } from "@/lib/adminAuth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;

    try {
        const visitors = await sql`
            SELECT
                id, visitor_number, country, country_code,
                first_visit, last_visit, total_time_seconds, visit_count
            FROM visitor_sessions
            ORDER BY visitor_number DESC
            LIMIT 100
        `;

        const [{ total }] = await sql`SELECT COUNT(*)::INTEGER as total FROM visitor_sessions`;
        const [{ avg_secs }] = await sql`
            SELECT COALESCE(AVG(total_time_seconds), 0)::INTEGER as avg_secs
            FROM visitor_sessions WHERE total_time_seconds > 10
        `;
        const [{ today }] = await sql`
            SELECT COUNT(*)::INTEGER as today FROM visitor_sessions
            WHERE first_visit >= NOW() - INTERVAL '24 hours'
        `;

        return NextResponse.json({
            visitors,
            stats: {
                total: total || 0,
                today: today || 0,
                avgTimeSeconds: avg_secs || 0,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
