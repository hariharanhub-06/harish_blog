import { db } from "@/db";
import { visitorAnalytics } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { page, visitorId, referrer } = await req.json();
        const userAgent = req.headers.get("user-agent");

        await db.insert(visitorAnalytics).values({
            page,
            visitorId,
            referrer,
            userAgent
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        const whereClause = start && end
            ? sql`DATE(${visitorAnalytics.timestamp}) >= ${start} AND DATE(${visitorAnalytics.timestamp}) <= ${end}`
            : sql`TRUE`;

        const stats = await db.select({
            date: sql<string>`DATE(${visitorAnalytics.timestamp})`,
            views: sql<number>`count(*)::int`,
            visitors: sql<number>`count(distinct ${visitorAnalytics.visitorId})::int`
        })
            .from(visitorAnalytics)
            .where(whereClause)
            .groupBy(sql`DATE(${visitorAnalytics.timestamp})`)
            .orderBy(desc(sql`DATE(${visitorAnalytics.timestamp})`))
            .limit(90);

        // Fetch Top Pages
        const topPages = await db.select({
            page: visitorAnalytics.page,
            count: sql<number>`count(*)::int`
        })
            .from(visitorAnalytics)
            .where(whereClause)
            .groupBy(visitorAnalytics.page)
            .orderBy(desc(sql`count(*)`))
            .limit(5);

        // Fetch Top Referrers
        const topReferrers = await db.select({
            referrer: visitorAnalytics.referrer,
            count: sql<number>`count(*)::int`
        })
            .from(visitorAnalytics)
            .where(whereClause)
            .groupBy(visitorAnalytics.referrer)
            .orderBy(desc(sql`count(*)`))
            .limit(5);

        return NextResponse.json({ stats, topPages, topReferrers });
    } catch (error) {
        console.error("Analytics fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
