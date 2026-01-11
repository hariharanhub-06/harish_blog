import { db } from "@/db";
import { affiliates, affiliateTransactions, snackOrders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Processes MLM commissions for a given order.
 * Should be called when an order is successful/confirmed.
 */
import { affiliateConfig, snackProducts } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { getAffiliateTier } from "./affiliate-tiers";

export async function processAffiliateCommissions(orderId: string) {
    try {
        // 1. Fetch order details
        const [order] = await db.select().from(snackOrders).where(eq(snackOrders.orderId, orderId)).limit(1);
        if (!order || !order.couponCode) return { success: false, message: "No coupon code for order" };

        // Check if already processed
        const [existing] = await db
            .select()
            .from(affiliateTransactions)
            .where(eq(affiliateTransactions.orderId, orderId))
            .limit(1);

        if (existing) return { success: false, message: "Commissions already processed for this order" };

        // 2. Fetch Split Config
        const [config] = await db.select().from(affiliateConfig).where(eq(affiliateConfig.id, 1)).limit(1);
        const splits = config || { directSplit: 30, level1Split: 10, level2Split: 5, level3Split: 5 };

        // 3. Calculate Total Profit Pool from Items
        const items = order.items as any[];
        if (!items || items.length === 0) return { success: false, message: "No items in order" };

        const productIds = items.map(i => i.productId || i.id).filter(Boolean);
        const products = await db.select().from(snackProducts).where(inArray(snackProducts.id, productIds));
        const productMap = new Map(products.map(p => [p.id, p]));
        let totalOrderProfitPool = 0;

        for (const item of items) {
            const product = productMap.get(item.productId || item.id);
            if (!product) continue;

            const sellingPrice = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;

            // REVENUE-BASED COMMISSION: Pool is a percentage of the total sales amount
            const poolPercent = Number(product.affiliatePoolPercent || 60);
            const itemPool = (sellingPrice * quantity) * (poolPercent / 100);

            totalOrderProfitPool += itemPool;
        }

        if (totalOrderProfitPool <= 0) return { success: false, message: "No pool available for commissions" };

        // 4. Find the direct affiliate
        const [directAffiliate] = await db
            .select()
            .from(affiliates)
            .where(sql`UPPER(${affiliates.couponCode}) = UPPER(${order.couponCode}) AND ${affiliates.status} = 'Approved'`)
            .limit(1);

        if (!directAffiliate) return { success: false, message: "No matching approved affiliate found" };

        // 5. Get Tiered Commission Rate
        const tier = getAffiliateTier(directAffiliate.totalOrders || 0);
        const directSplitRate = tier.rate; // This is the % of the pool

        // 6. Update Direct Affiliate Stats (Orders & Sales)
        await db.update(affiliates)
            .set({
                totalOrders: sql`${affiliates.totalOrders} + 1`,
                totalSalesAmount: sql`${affiliates.totalSalesAmount} + ${Number(order.totalAmount)}`,
            })
            .where(eq(affiliates.id, directAffiliate.id));

        // 7. Distribute commissions based on pool and splits
        // Direct
        const directCommission = (totalOrderProfitPool * directSplitRate / 100);
        await distributeCommission(directAffiliate.id, directCommission, 'direct', orderId, directAffiliate.id);

        // Level 1
        if (directAffiliate.parentId) {
            const [l1Affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, directAffiliate.parentId)).limit(1);
            if (l1Affiliate) {
                const l1Commission = (totalOrderProfitPool * (splits.level1Split ?? 20) / 100);
                await distributeCommission(l1Affiliate.id, l1Commission, 'level1', orderId, directAffiliate.id);

                // Level 2
                if (l1Affiliate.parentId) {
                    const [l2Affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, l1Affiliate.parentId)).limit(1);
                    if (l2Affiliate) {
                        const l2Commission = (totalOrderProfitPool * (splits.level2Split ?? 18) / 100);
                        await distributeCommission(l2Affiliate.id, l2Commission, 'level2', orderId, directAffiliate.id);

                        // Level 3
                        if (l2Affiliate.parentId) {
                            const [l3Affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, l2Affiliate.parentId)).limit(1);
                            if (l3Affiliate) {
                                const l3Commission = (totalOrderProfitPool * (splits.level3Split ?? 12) / 100);
                                await distributeCommission(l3Affiliate.id, l3Commission, 'level3', orderId, directAffiliate.id);
                            }
                        }
                    }
                }
            }
        }

        return { success: true, pool: totalOrderProfitPool };
    } catch (error) {
        console.error("Commission processing error:", error);
        return { success: false, error };
    }
}

/**
 * Distributes commission to a specific affiliate and updates their balance.
 */
async function distributeCommission(
    affiliateId: string,
    amount: number,
    type: string,
    orderId: string,
    fromAffiliateId: string
) {
    // 1. Record Transaction
    await db.insert(affiliateTransactions).values({
        affiliateId,
        orderId,
        amount,
        type,
        fromAffiliateId,
        description: `Commission from order ${orderId} (${type})`,
        status: 'Completed'
    });

    // 2. Update Affiliate Stats
    const earningsField =
        type === 'direct' ? 'directEarnings' :
            type === 'level1' ? 'level1Earnings' :
                type === 'level2' ? 'level2Earnings' : 'level3Earnings';

    await db.update(affiliates)
        .set({
            totalEarnings: sql`${affiliates.totalEarnings} + ${amount}`,
            [earningsField]: sql`${affiliates[earningsField as keyof typeof affiliates]} + ${amount}`,
            pendingBalance: sql`${affiliates.pendingBalance} + ${amount}`,
        })
        .where(eq(affiliates.id, affiliateId));
}
