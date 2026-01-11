import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, affiliates, snackProducts, affiliateConfig, affiliateTransactions } from "@/db/schema";
import { eq, inArray, sql, desc } from "drizzle-orm";
import { getAffiliateTier } from "@/lib/affiliate-tiers";
import { processAffiliateCommissions } from "@/lib/affiliate-commissions";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const fix = searchParams.get("fix") === 'true';

    if (!orderId) return NextResponse.json({ error: "Missing orderId" });

    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    try {
        log(`Analyzing Order: ${orderId}`);

        let order;
        if (orderId === 'latest') {
            [order] = await db.select().from(snackOrders).orderBy(desc(snackOrders.createdAt)).limit(1);
        } else {
            [order] = await db.select().from(snackOrders).where(eq(snackOrders.orderId, orderId)).limit(1);
        }
        if (!order) return NextResponse.json({ error: "Order not found", logs });

        log(`Order found. Status: ${order.status}, Total: ${order.totalAmount}`);
        log(`Coupon Code: ${order.couponCode || "NONE"}`);

        if (!order.couponCode) {
            return NextResponse.json({ result: "FAILURE", reason: "No coupon code", logs });
        }

        // 2. Check Affiliate
        const [affiliate] = await db.select().from(affiliates)
            .where(sql`UPPER(${affiliates.couponCode}) = UPPER(${order.couponCode})`)
            .limit(1);

        if (!affiliate) {
            return NextResponse.json({ result: "FAILURE", reason: `No affiliate found for coupon ${order.couponCode}`, logs });
        }
        log(`Affiliate Found: ${affiliate.fullName} (${affiliate.id}) - Status: ${affiliate.status}`);

        if (affiliate.status !== 'Approved') {
            return NextResponse.json({ result: "FAILURE", reason: "Affiliate not approved", logs });
        }

        // 3. Check existing transactions
        const existingTx = await db.select().from(affiliateTransactions).where(eq(affiliateTransactions.orderId, order.orderId));
        log(`Existing Transactions for ${order.orderId}: ${existingTx.length}`);
        if (existingTx.length > 0) {
            const fs = require('fs');
            const response = {
                result: "ALREADY_PROCESSED",
                transactions: existingTx,
                affiliateStats: {
                    totalEarnings: affiliate.totalEarnings,
                    pendingBalance: affiliate.pendingBalance,
                    totalOrders: affiliate.totalOrders
                },
                logs
            };
            fs.writeFileSync('debug_fix_result.txt', JSON.stringify(response, null, 2));
            return NextResponse.json(response);
        }

        // 4. Calculate Profit Pool
        const items = order.items as any[];
        log(`Items count: ${items.length}`);

        const productIds = items.map(i => i.productId || i.id).filter(Boolean);
        const products = await db.select().from(snackProducts).where(inArray(snackProducts.id, productIds));
        const productMap = new Map(products.map(p => [p.id, p]));

        let totalOrderProfitPool = 0;
        const itemAnalysis = [];

        for (const item of items) {
            const product = productMap.get(item.productId || item.id);
            if (!product) {
                itemAnalysis.push({ name: item.name, error: "Product not found in DB" });
                continue;
            }

            const sellingPrice = Number(item.price) || 0;
            const cost = Number(product.productCost || 0) + Number(product.packagingCost || 0) + Number(product.otherCharges || 0);
            const quantity = Number(item.quantity) || 1;
            const itemProfit = (sellingPrice * quantity) - (cost * quantity);
            const poolPercent = Number(product.affiliatePoolPercent || 60);
            const itemPool = itemProfit > 0 ? (itemProfit * poolPercent / 100) : 0;

            totalOrderProfitPool += itemPool;
            itemAnalysis.push({
                name: item.name,
                sellingPrice,
                cost,
                quantity,
                profit: itemProfit,
                poolPercent,
                poolContributed: itemPool
            });
        }

        log(`Total Profit Pool: ${totalOrderProfitPool}`);

        if (totalOrderProfitPool <= 0) {
            return NextResponse.json({ result: "FAILURE", reason: "Zero Profit Pool", itemAnalysis, logs });
        }

        if (fix) {
            log("Applying Fix: Processing Commissions...");
            const result = await processAffiliateCommissions(order.orderId);
            const fs = require('fs');
            fs.writeFileSync('debug_fix_result.txt', JSON.stringify({ result, logs }, null, 2));
            return NextResponse.json({ result: "FIX_ATTEMPTED", details: result, logs });
        }

        // 5. Splits
        const tier = getAffiliateTier(affiliate.totalOrders || 0);
        log(`Direct Affiliate Tier: ${tier.name}, Rate: ${tier.rate}%`);

        const directCommission = (totalOrderProfitPool * tier.rate / 100);
        log(`Calculated Direct Commission: ${directCommission}`);

        return NextResponse.json({
            result: "SUCCESS_SIMULATION",
            affiliate: affiliate.fullName,
            affiliateStats: {
                totalEarnings: affiliate.totalEarnings,
                pendingBalance: affiliate.pendingBalance,
                totalOrders: affiliate.totalOrders
            },
            pool: totalOrderProfitPool,
            directCommission,
            itemAnalysis,
            logs
        });

    } catch (error) {
        return NextResponse.json({ error: String(error), logs });
    }
}
