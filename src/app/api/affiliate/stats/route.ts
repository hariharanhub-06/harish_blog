import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, snackOrders } from "@/db/schema";
import { eq, sql, count, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing affiliate ID" }, { status: 400 });
        }

        // Get affiliate data
        const results = await db
            .select()
            .from(affiliates)
            .where(eq(affiliates.id, id));

        if (results.length === 0) {
            return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
        }

        const affiliate = results[0];

        // Fetch latest stats directly from orders to ensure accuracy
        const [orderStats] = await db
            .select({
                orderCount: count(),
                revenue: sql<number>`COALESCE(SUM(${snackOrders.totalAmount}), 0)`,
            })
            .from(snackOrders)
            .where(
                and(
                    sql`UPPER(TRIM(${snackOrders.couponCode})) = UPPER(TRIM(${affiliate.couponCode}))`,
                    sql`${snackOrders.status} != 'Cancel'`
                )
            );

        const currentCount = Number(orderStats.orderCount) || 0;
        const currentRevenue = Number(orderStats.revenue) || 0;

        // Commission Logic (same as admin)
        const calculateRate = (count: number) => {
            if (count >= 200) return 0.20;
            if (count >= 180) return 0.18;
            if (count >= 150) return 0.15;
            if (count >= 100) return 0.12;
            if (count >= 51) return 0.10;
            if (count >= 21) return 0.08;
            return 0.06;
        };

        const rate = calculateRate(currentCount);
        const commission = currentRevenue * rate;

        return NextResponse.json({
            fullName: affiliate.fullName,
            couponCode: affiliate.couponCode,
            status: affiliate.status,
            totalOrders: currentCount,
            totalRevenue: currentRevenue,
            totalCommission: commission,
            currentTier: affiliate.currentTier,
            commissionRate: rate * 100,
            upiId: affiliate.upiId
        });

    } catch (error) {
        console.error("Fetch affiliate stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
