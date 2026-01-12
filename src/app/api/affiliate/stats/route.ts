import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, snackOrders, affiliateConfig } from "@/db/schema";
import { eq, sql, count, and } from "drizzle-orm";
import { getAffiliateTier } from "@/lib/affiliate-tiers";

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
        const tier = getAffiliateTier(
            !!affiliate.isPaid ? (affiliate.ordersSincePaid || 0) : (affiliate.totalOrders || 0),
            !!affiliate.isPaid
        );

        // Fetch latest stats directly from the database (now updated by admin or order sync)
        return NextResponse.json({
            fullName: affiliate.fullName,
            couponCode: affiliate.couponCode,
            status: affiliate.status,
            isPaid: affiliate.isPaid,
            paidAt: affiliate.paidAt,
            totalOrders: affiliate.totalOrders,
            totalSalesAmount: affiliate.totalSalesAmount,
            totalEarnings: affiliate.totalEarnings,
            directEarnings: affiliate.directEarnings,
            level1Earnings: affiliate.level1Earnings,
            level2Earnings: affiliate.level2Earnings,
            level3Earnings: affiliate.level3Earnings,
            pendingBalance: affiliate.pendingBalance,
            paidBalance: affiliate.paidBalance,
            currentTier: tier.name,
            commissionRate: tier.rate,
            upiId: affiliate.upiId,
            parentId: affiliate.parentId,
            referrerId: affiliate.referrerId,
            position: affiliate.position,
            // Fetch recent orders for this affiliate
            recentOrders: await db
                .select({
                    orderId: snackOrders.orderId,
                    createdAt: snackOrders.createdAt,
                    status: snackOrders.status,
                    totalAmount: snackOrders.totalAmount,
                    customerName: snackOrders.customerName
                })
                .from(snackOrders)
                .where(sql`UPPER(${snackOrders.couponCode}) = UPPER(${affiliate.couponCode})`)
                .orderBy(sql`${snackOrders.createdAt} DESC`)
                .limit(20),
            // Downline tree (simplified to level 2 for now)
            downline: await getDownlineTree(affiliate.id, 0, new Set([affiliate.id]))
        });

    } catch (error) {
        console.error("Fetch affiliate stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}

// Helper to get binary downline tree
async function getDownlineTree(id: string, depth = 0, visited = new Set<string>()) {
    if (depth > 2) return null; // Limit depth for initial load

    const children = await db
        .select({
            id: affiliates.id,
            fullName: affiliates.fullName,
            position: affiliates.position,
            totalSalesAmount: affiliates.totalSalesAmount,
            totalEarnings: affiliates.totalEarnings,
            status: affiliates.status
        })
        .from(affiliates)
        .where(eq(affiliates.parentId, id));

    const tree: any = { left: null, right: null };
    for (const child of children) {
        // Prevent cycles
        if (visited.has(child.id)) {
            console.warn(`Cycle detected at affiliate: ${child.id}`);
            continue;
        }

        const newVisited = new Set(visited);
        newVisited.add(child.id);

        if (child.position === 'left') {
            tree.left = { ...child, children: await getDownlineTree(child.id, depth + 1, newVisited) };
        } else if (child.position === 'right') {
            tree.right = { ...child, children: await getDownlineTree(child.id, depth + 1, newVisited) };
        }
    }
    return tree;
}
