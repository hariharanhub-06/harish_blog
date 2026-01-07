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

export async function GET() {
    try {
        // Aggregate page views by day for the last 30 days
        const stats = await db.select({
            date: sql<string>`DATE(${visitorAnalytics.timestamp})`,
            views: sql<number>`count(*)::int`,
            visitors: sql<number>`count(distinct ${visitorAnalytics.visitorId})::int`
        })
            .from(visitorAnalytics)
            .groupBy(sql`DATE(${visitorAnalytics.timestamp})`)
            .orderBy(desc(sql`DATE(${visitorAnalytics.timestamp})`))
            .limit(30);

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Analytics fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
