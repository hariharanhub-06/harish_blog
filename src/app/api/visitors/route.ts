import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { sendAdminPushNotification } from "@/lib/webpush";

const sql = neon(process.env.DATABASE_URL!);

const COUNTRY_NAMES: Record<string, string> = {
    IN: "India", US: "United States", GB: "United Kingdom",
    CA: "Canada", AU: "Australia", DE: "Germany", FR: "France",
    JP: "Japan", CN: "China", BR: "Brazil", SG: "Singapore",
    AE: "UAE", SA: "Saudi Arabia", MY: "Malaysia", PK: "Pakistan",
    LK: "Sri Lanka", BD: "Bangladesh", NP: "Nepal", TH: "Thailand",
    ID: "Indonesia", PH: "Philippines", NZ: "New Zealand", ZA: "South Africa",
    NG: "Nigeria", KE: "Kenya", EG: "Egypt", MX: "Mexico", AR: "Argentina",
    IT: "Italy", ES: "Spain", NL: "Netherlands", SE: "Sweden", NO: "Norway",
    KR: "South Korea", TW: "Taiwan", HK: "Hong Kong", RU: "Russia", UA: "Ukraine",
};

function countryCodeToEmoji(code: string): string {
    if (!code || code.length !== 2) return "🌍";
    return code.toUpperCase().split("").map(c =>
        String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    ).join("");
}

async function ensureTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS visitor_sessions (
            id TEXT PRIMARY KEY,
            visitor_number INTEGER NOT NULL,
            ip_hash TEXT,
            country TEXT,
            country_code TEXT,
            first_visit TIMESTAMPTZ DEFAULT NOW(),
            last_visit TIMESTAMPTZ DEFAULT NOW(),
            total_time_seconds INTEGER DEFAULT 0,
            visit_count INTEGER DEFAULT 1
        )
    `;
}

export async function GET() {
    try {
        await ensureTable();
        const [{ count }] = await sql`SELECT COUNT(*)::INTEGER as count FROM visitor_sessions`;
        const [{ avg_seconds }] = await sql`
            SELECT COALESCE(AVG(total_time_seconds), 0)::INTEGER as avg_seconds
            FROM visitor_sessions
            WHERE total_time_seconds > 10
        `;
        return NextResponse.json({
            totalVisitors: count || 0,
            avgTimeSeconds: avg_seconds || 0,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await ensureTable();
        const body = await req.json();
        const { action, visitorId, seconds } = body;

        // Ping: update time spent
        if (action === "ping" && visitorId && seconds > 0) {
            await sql`
                UPDATE visitor_sessions
                SET total_time_seconds = total_time_seconds + ${seconds}, last_visit = NOW()
                WHERE id = ${visitorId}
            `;
            return NextResponse.json({ ok: true });
        }

        // Register: create or find visitor session
        if (action === "register") {
            const forwarded = req.headers.get("x-forwarded-for");
            const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
            const countryCode = req.headers.get("x-vercel-ip-country") || "IN";
            const country = COUNTRY_NAMES[countryCode] || countryCode;
            const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

            // Check if returning visitor by stored session ID
            if (visitorId) {
                const [existing] = await sql`
                    SELECT id, visitor_number, visit_count, total_time_seconds, last_visit
                    FROM visitor_sessions WHERE id = ${visitorId}
                `;
                if (existing) {
                    // Only increment visit_count if last visit was more than 30 minutes ago
                    // (prevents every page reload from counting as a new visit)
                    const lastVisit = new Date(existing.last_visit);
                    const minutesSinceLast = (Date.now() - lastVisit.getTime()) / 60000;
                    const isNewSession = minutesSinceLast > 30;

                    await sql`
                        UPDATE visitor_sessions
                        SET
                            visit_count = CASE WHEN ${isNewSession} THEN visit_count + 1 ELSE visit_count END,
                            last_visit = NOW(),
                            country_code = ${countryCode},
                            country = ${country}
                        WHERE id = ${visitorId}
                    `;
                    const [{ avg_seconds }] = await sql`
                        SELECT COALESCE(AVG(total_time_seconds), 0)::INTEGER as avg_seconds
                        FROM visitor_sessions WHERE total_time_seconds > 10
                    `;
                    return NextResponse.json({
                        visitorId: existing.id,
                        visitorNumber: existing.visitor_number,
                        country,
                        countryCode,
                        flag: countryCodeToEmoji(countryCode),
                        isNewVisitor: false,
                        visitCount: isNewSession ? existing.visit_count + 1 : existing.visit_count,
                        totalTimeSeconds: existing.total_time_seconds || 0,
                        avgTimeSeconds: avg_seconds || 0,
                    });
                }
            }

            // New visitor — assign next sequential number atomically
            const newId = crypto.randomUUID();
            const [{ new_num }] = await sql`
                SELECT COALESCE(MAX(visitor_number), 0) + 1 as new_num FROM visitor_sessions
            `;
            await sql`
                INSERT INTO visitor_sessions
                    (id, visitor_number, ip_hash, country, country_code, first_visit, last_visit, total_time_seconds, visit_count)
                VALUES
                    (${newId}, ${new_num}, ${ipHash}, ${country}, ${countryCode}, NOW(), NOW(), 0, 1)
            `;
            const [{ avg_seconds }] = await sql`
                SELECT COALESCE(AVG(total_time_seconds), 0)::INTEGER as avg_seconds
                FROM visitor_sessions WHERE total_time_seconds > 10
            `;
            sendAdminPushNotification(
                `🌍 New Visitor #${new_num}`,
                `First-time visitor from ${country} ${countryCodeToEmoji(countryCode)}`,
                `/admin/dashboard#analytics`
            ).catch(() => {});

            return NextResponse.json({
                visitorId: newId,
                visitorNumber: new_num,
                country,
                countryCode,
                flag: countryCodeToEmoji(countryCode),
                isNewVisitor: true,
                visitCount: 1,
                totalTimeSeconds: 0,
                avgTimeSeconds: avg_seconds || 0,
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
