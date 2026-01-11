import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const affiliateId = searchParams.get("id");

    if (!affiliateId) {
        return NextResponse.json({ error: "Missing affiliate ID" }, { status: 400 });
    }

    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId));

    if (!affiliate) {
        return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    return NextResponse.json({
        name: affiliate.fullName,
        totalOrders: affiliate.totalOrders,
        totalSalesAmount: affiliate.totalSalesAmount,
        totalEarnings: affiliate.totalEarnings,
        directEarnings: affiliate.directEarnings,
        level1Earnings: affiliate.level1Earnings,
        level2Earnings: affiliate.level2Earnings,
        level3Earnings: affiliate.level3Earnings,
        pendingBalance: affiliate.pendingBalance,
        paidBalance: affiliate.paidBalance
    });
}
