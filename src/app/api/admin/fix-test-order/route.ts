import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, orderShipments, affiliates, snackProducts } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { processAffiliateCommissions } from "@/lib/affiliate-commissions";
import fs from 'fs';

export async function GET() {
    try {
        const orderId = "ORD-TEST-5266";

        // 1. Fetch data
        const [order] = await db.select().from(snackOrders).where(eq(snackOrders.orderId, orderId)).limit(1);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        const [affiliate] = await db.select().from(affiliates).where(sql`UPPER(${affiliates.couponCode}) = 'HMS63294'`).limit(1);
        if (!affiliate) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });

        // 2. Fix Item Structure (ensure productId exists for commission logic)
        const updatedItems = (order.items as any[]).map(item => ({
            ...item,
            productId: item.productId || item.id
        }));

        await db.update(snackOrders).set({ items: updatedItems }).where(eq(snackOrders.id, order.id));

        // 3. Process Commission
        const commissionResult = await processAffiliateCommissions(orderId);

        // 4. Sync Stats
        const [orderStats] = await db
            .select({
                totalOrders: sql`count(*)`,
                totalSalesAmount: sql<number>`COALESCE(SUM(${snackOrders.totalAmount}), 0)`,
            })
            .from(snackOrders)
            .where(
                sql`UPPER(TRIM(${snackOrders.couponCode})) = UPPER(TRIM(${affiliate.couponCode})) 
                AND ${snackOrders.status} != 'Cancel'`
            );

        await db.update(affiliates)
            .set({
                totalOrders: Number(orderStats.totalOrders),
                totalSalesAmount: Number(orderStats.totalSalesAmount),
            })
            .where(eq(affiliates.id, affiliate.id));

        // 5. Final Debug check
        const shipments = await db.select().from(orderShipments).where(eq(orderShipments.orderId, orderId));
        const debugData = {
            orderId,
            itemsFixed: true,
            commissionResult,
            stats: orderStats,
            shipmentCount: shipments.length
        };
        fs.writeFileSync('debug_fix_final.json', JSON.stringify(debugData, null, 2));

        return NextResponse.json({ success: true, debugData });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
