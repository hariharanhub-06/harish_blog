import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, orderShipments, affiliateTransactions, affiliates } from "@/db/schema";
import { eq, inArray, and, sql } from "drizzle-orm";
import { splitOrderIntoShipments } from "@/lib/order-utils";
import { processAffiliateCommissions } from "@/lib/affiliate-commissions";

export async function GET(req: NextRequest) {
    try {
        const results = [];

        // 1. Find all "Payment Confirmed" or "Success" orders
        const confirmedOrders = await db
            .select({ orderId: snackOrders.orderId, id: snackOrders.id })
            .from(snackOrders)
            .where(sql`${snackOrders.status} IN ('Payment Confirmed', 'Success')`);

        for (const order of confirmedOrders) {
            const status = {
                orderId: order.orderId,
                shipmentsCreated: false,
                commissionsProcessed: false,
                errors: [] as string[]
            };

            // Fix Shipments
            try {
                const res = await splitOrderIntoShipments(order.orderId);
                if (res.success && res.count && res.count > 0) {
                    status.shipmentsCreated = true;
                }
            } catch (err: any) {
                status.errors.push(`Shipment fix failed: ${err.message}`);
            }

            // Fix Commissions
            try {
                // Check if already has transactions
                const [existing] = await db
                    .select()
                    .from(affiliateTransactions)
                    .where(eq(affiliateTransactions.orderId, order.orderId))
                    .limit(1);

                if (!existing) {
                    const res = await processAffiliateCommissions(order.orderId);
                    if (res.success) {
                        status.commissionsProcessed = true;
                    } else if (res.message) {
                        status.errors.push(`Commission info: ${res.message}`);
                    }
                }
            } catch (err: any) {
                status.errors.push(`Commission fix failed: ${err.message}`);
            }

            results.push(status);
        }

        // 3. Optional: Sync all affiliate cumulative stats (Optional but good for full health)
        const allAffiliates = await db.select({ id: affiliates.id }).from(affiliates);
        for (const aff of allAffiliates) {
            // Recalculate total sales and orders from snack_orders using their coupon code
            // This is a slow operation but okay for a maintenance script
            const [affData] = await db.select({ couponCode: affiliates.couponCode }).from(affiliates).where(eq(affiliates.id, aff.id));
            if (affData && affData.couponCode) {
                const orders = await db.select({ totalAmount: snackOrders.totalAmount })
                    .from(snackOrders)
                    .where(and(
                        sql`UPPER(${snackOrders.couponCode}) = UPPER(${affData.couponCode})`,
                        sql`${snackOrders.status} IN ('Payment Confirmed', 'Success', 'Shipping', 'Delivered')`
                    ));

                const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
                const totalCount = orders.length;

                await db.update(affiliates)
                    .set({
                        totalSalesAmount: totalSales,
                        totalOrders: totalCount
                    })
                    .where(eq(affiliates.id, aff.id));
            }
        }

        return NextResponse.json({
            success: true,
            processedCount: confirmedOrders.length,
            results,
            statsSynced: allAffiliates.length
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
