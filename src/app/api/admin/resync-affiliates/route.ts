import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateTransactions, snackOrders } from "@/db/schema";
import { eq, sql, and, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        console.log("--- STARTING FULL AFFILIATE STATS RESYNC ---");

        // 1. Prune orphaned transactions (linked to non-existent orders)
        // This ensures balances don't persist after order deletion
        await db.execute(sql`
            DELETE FROM ${affiliateTransactions}
            WHERE order_id NOT IN (SELECT order_id FROM ${snackOrders})
            AND order_id IS NOT NULL
        `);

        // 2. Fetch all affiliates
        const allAffiliates = await db.select().from(affiliates);

        for (const aff of allAffiliates) {
            console.log(`Processing resync for: ${aff.fullName} (${aff.id})`);

            // A. Recalculate Transaction-based Earnings
            const [txStats] = await db
                .select({
                    totalEarnings: sql<number>`COALESCE(SUM(${affiliateTransactions.amount}), 0)`,
                    directEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${affiliateTransactions.type} = 'direct' THEN ${affiliateTransactions.amount} ELSE 0 END), 0)`,
                    l1Earnings: sql<number>`COALESCE(SUM(CASE WHEN ${affiliateTransactions.type} = 'level1' THEN ${affiliateTransactions.amount} ELSE 0 END), 0)`,
                    l2Earnings: sql<number>`COALESCE(SUM(CASE WHEN ${affiliateTransactions.type} = 'level2' THEN ${affiliateTransactions.amount} ELSE 0 END), 0)`,
                    l3Earnings: sql<number>`COALESCE(SUM(CASE WHEN ${affiliateTransactions.type} = 'level3' THEN ${affiliateTransactions.amount} ELSE 0 END), 0)`,
                })
                .from(affiliateTransactions)
                .where(eq(affiliateTransactions.affiliateId, aff.id));

            // B. Recalculate Order-based Stats (Total Orders and Sales)
            let orderCount = 0;
            let salesVolume = 0;

            if (aff.couponCode) {
                const results = await db
                    .select({
                        count: sql<number>`COUNT(*)`,
                        sum: sql<number>`SUM(${snackOrders.totalAmount})`
                    })
                    .from(snackOrders)
                    .where(and(
                        sql`UPPER(${snackOrders.couponCode}) = UPPER(${aff.couponCode})`,
                        inArray(snackOrders.status, ["Payment Confirmed", "Success", "Shipping", "Delivered"])
                    ));

                orderCount = Number(results[0]?.count || 0);
                salesVolume = Number(results[0]?.sum || 0);
            }

            // C. Update the Affiliate record
            await db.update(affiliates)
                .set({
                    totalEarnings: txStats.totalEarnings,
                    directEarnings: txStats.directEarnings,
                    level1Earnings: txStats.l1Earnings,
                    level2Earnings: txStats.l2Earnings,
                    level3Earnings: txStats.l3Earnings,
                    totalOrders: orderCount,
                    totalSalesAmount: salesVolume,
                    pendingBalance: txStats.totalEarnings, // Reset pending to total current earnings
                })
                .where(eq(affiliates.id, aff.id));
        }

        return NextResponse.json({
            success: true,
            message: "All affiliate statistics have been resynced and orphans pruned.",
            processedCount: allAffiliates.length
        });

    } catch (error: any) {
        console.error("Resync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
