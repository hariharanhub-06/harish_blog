import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, orderShipments, vendors, affiliateTransactions, affiliates, snackProducts } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { processAffiliateCommissions } from "@/lib/affiliate-commissions";
import { splitOrderIntoShipments } from "@/lib/order-utils";
import { confirmAffiliateCommissions } from "@/lib/affiliate-commissions";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [order] = await db
            .select()
            .from(snackOrders)
            .where(eq(snackOrders.id, id))
            .limit(1);

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. Fetch associated shipments safely
        let shipments: any[] = [];
        try {
            shipments = await db
                .select({
                    id: orderShipments.id,
                    vendorId: orderShipments.vendorId,
                    items: orderShipments.items,
                    status: orderShipments.status,
                    vendorName: vendors.name,
                    awbCode: orderShipments.awbCode,
                    courierName: orderShipments.courierName,
                    trackingUrl: orderShipments.trackingUrl,
                    shiprocketOrderId: orderShipments.shiprocketOrderId,
                    vendorConfirmedDimensions: orderShipments.vendorConfirmedDimensions,
                    vendorConfirmedAt: orderShipments.vendorConfirmedAt,
                    dimensionSource: orderShipments.dimensionSource,
                    readyToShip: orderShipments.readyToShip,
                })
                .from(orderShipments)
                .leftJoin(vendors, eq(orderShipments.vendorId, vendors.id))
                .where(eq(orderShipments.orderId, order.orderId));
        } catch (shipErr: any) {
            console.error("Failed to fetch shipments for order:", shipErr);
            // Non-blocking fallback: empty shipments but return the order
        }

        return NextResponse.json({ ...order, shipments });
    } catch (error: any) {
        console.error("Fetch order detail error:", error);
        return NextResponse.json({
            error: "Failed to fetch order detail",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Fetch old order for status transition checks
        const [oldOrder] = await db
            .select()
            .from(snackOrders)
            .where(eq(snackOrders.id, id))
            .limit(1);

        if (!oldOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const [updatedOrder] = await db
            .update(snackOrders)
            .set({
                ...body,
                updatedAt: new Date()
            })
            .where(eq(snackOrders.id, id))
            .returning();

        // 1. Process Affiliate commission if order is paid/confirmed
        const paidStatuses = ["Payment Confirmed", "Success", "Delivered", "Shipping", "Parcel Prepared"];
        if (body.status && paidStatuses.includes(body.status)) {
            await processAffiliateCommissions(updatedOrder.orderId);
        }

        // 2. Clear commission for payout only if Delivered
        if (body.status === "Delivered" && oldOrder.status !== "Delivered") {
            await confirmAffiliateCommissions(updatedOrder.orderId);
        }

        // 3. Move commission BACK to pending if transitioned AWAY from Delivered
        if (oldOrder.status === "Delivered" && body.status !== "Delivered" && body.status !== "Cancel") {
            // New logic: Move from available back to pending
            const transactions = await db.select().from(affiliateTransactions).where(eq(affiliateTransactions.orderId, updatedOrder.orderId));
            for (const tx of transactions) {
                await db.update(affiliates)
                    .set({
                        availableBalance: sql`${affiliates.availableBalance} - ${tx.amount}`,
                        pendingBalance: sql`${affiliates.pendingBalance} + ${tx.amount}`,
                    })
                    .where(eq(affiliates.id, tx.affiliateId));
            }
        }

        // 4. Split into multi-vendor shipments
        if (body.status && paidStatuses.includes(body.status)) {
            await splitOrderIntoShipments(updatedOrder.orderId);
        }

        // Cascade status updates to shipments
        if (body.status) {
            const statusesToCascade = ["Delivered", "Shipping", "Cancel", "Payment Confirmed", "Parcel Prepared"];
            if (statusesToCascade.includes(body.status)) {
                const shipmentStatus = body.status;

                // Get all shipments for this order
                const shipments = await db.select()
                    .from(orderShipments)
                    .where(eq(orderShipments.orderId, updatedOrder.orderId));

                // Update each shipment and trigger vendor earnings if delivered
                for (const shipment of shipments) {
                    const oldShipmentStatus = shipment.status;

                    // Update shipment status
                    await db.update(orderShipments)
                        .set({ status: shipmentStatus })
                        .where(eq(orderShipments.id, shipment.id));

                    // Handle vendor earnings (strictly on Delivered)
                    if (shipment.vendorId) {
                        const items = shipment.items as any[];
                        const productIds = items.map(i => i.productId || i.id).filter(Boolean);
                        let shipmentValue = 0;

                        if (productIds.length > 0) {
                            const products = await db.select().from(snackProducts).where(inArray(snackProducts.id, productIds));
                            const productMap = new Map(products.map(p => [p.id, p]));

                            shipmentValue = items.reduce((acc, item) => {
                                const product = productMap.get(item.productId || item.id);
                                if (!product) return acc;
                                const cost = Number(product.productCost || 0);
                                const packaging = Number(product.packagingCost || 0);
                                const quantity = Number(item.quantity) || 1;
                                return acc + ((cost + (packaging * 0.30)) * quantity);
                            }, 0);
                        }

                        // Credit earnings if transitioning to Delivered
                        if (shipmentStatus === "Delivered" && oldShipmentStatus !== "Delivered" && shipmentValue > 0) {
                            await db.update(vendors)
                                .set({
                                    totalEarnings: sql`${vendors.totalEarnings} + ${shipmentValue}`,
                                    pendingBalance: sql`${vendors.pendingBalance} + ${shipmentValue}`,
                                })
                                .where(eq(vendors.id, shipment.vendorId));
                        }

                        // Revert earnings if transitioning away from Delivered
                        if (oldShipmentStatus === "Delivered" && shipmentStatus !== "Delivered" && shipmentValue > 0) {
                            await db.update(vendors)
                                .set({
                                    totalEarnings: sql`${vendors.totalEarnings} - ${shipmentValue}`,
                                    pendingBalance: sql`${vendors.pendingBalance} - ${shipmentValue}`,
                                })
                                .where(eq(vendors.id, shipment.vendorId));
                        }
                    }
                }
            }

            // --- Affiliate Earnings Rollback ---
            // If the order was Delivered but is now something else, or if it's Cancelled and has commissions
            const shouldRollbackAffiliate =
                (oldOrder.status === "Delivered" && body.status !== "Delivered") ||
                (body.status === "Cancel");

            if (shouldRollbackAffiliate && updatedOrder.couponCode) {
                const [affiliate] = await db.select()
                    .from(affiliates)
                    .where(sql`UPPER(${affiliates.couponCode}) = UPPER(${updatedOrder.couponCode})`)
                    .limit(1);

                if (affiliate) {
                    // Check if there are transactions to reverse
                    const transactionsToDelete = await db.select()
                        .from(affiliateTransactions)
                        .where(eq(affiliateTransactions.orderId, updatedOrder.orderId));

                    if (transactionsToDelete.length > 0) {
                        console.log(`[Affiliate Rollback] Reversing ${transactionsToDelete.length} transactions for order ${updatedOrder.orderId}`);

                        // Subtract order count and sales volume from direct affiliate (only if it was confirmed)
                        await db.update(affiliates)
                            .set({
                                totalOrders: sql`${affiliates.totalOrders} - 1`,
                                totalSalesAmount: sql`${affiliates.totalSalesAmount} - ${Number(updatedOrder.totalAmount || 0)}`,
                            })
                            .where(eq(affiliates.id, affiliate.id));

                        // Subtract earnings from each participant in the commission chain
                        for (const tx of transactionsToDelete) {
                            const field = tx.type === 'direct' ? 'directEarnings' :
                                tx.type === 'level1' ? 'level1Earnings' :
                                    tx.type === 'level2' ? 'level2Earnings' : 'level3Earnings';

                            const balanceField = oldOrder.status === "Delivered" ? 'availableBalance' : 'pendingBalance';

                            await db.update(affiliates)
                                .set({
                                    totalEarnings: sql`${affiliates.totalEarnings} - ${tx.amount}`,
                                    [field]: sql`${affiliates[field as keyof typeof affiliates]} - ${tx.amount}`,
                                    [balanceField]: sql`${affiliates[balanceField as keyof typeof affiliates]} - ${tx.amount}`,
                                })
                                .where(eq(affiliates.id, tx.affiliateId));
                        }

                        // Delete the transactions
                        await db.delete(affiliateTransactions)
                            .where(eq(affiliateTransactions.orderId, updatedOrder.orderId));
                    }
                }
            }
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Update order error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Get the order details first to get the orderId (HMS-XXX)
        const [order] = await db
            .select({
                orderId: snackOrders.orderId,
                couponCode: snackOrders.couponCode,
                totalAmount: snackOrders.totalAmount,
                status: snackOrders.status
            })
            .from(snackOrders)
            .where(eq(snackOrders.id, id))
            .limit(1);

        if (order) {
            // 2. Roll back Affiliate Stats if the order had a coupon
            if (order.couponCode) {
                const [affiliate] = await db
                    .select({
                        id: affiliates.id,
                        fullName: affiliates.fullName,
                        couponCode: affiliates.couponCode
                    })
                    .from(affiliates)
                    .where(sql`UPPER(${affiliates.couponCode}) = UPPER(${order.couponCode})`)
                    .limit(1);

                if (affiliate) {
                    console.log(`[Rollback] Found direct affiliate: ${affiliate.fullName} for order ${order.orderId}`);

                    const transactionsToDelete = await db
                        .select()
                        .from(affiliateTransactions)
                        .where(eq(affiliateTransactions.orderId, order.orderId));

                    console.log(`[Rollback] Found ${transactionsToDelete.length} transactions to reverse for order ${order.orderId}`);

                    // Subtract order count and sales volume from direct affiliate
                    await db.update(affiliates)
                        .set({
                            totalOrders: sql`${affiliates.totalOrders} - 1`,
                            totalSalesAmount: sql`${affiliates.totalSalesAmount} - ${Number(order.totalAmount || 0)}`,
                        })
                        .where(eq(affiliates.id, affiliate.id));

                    // Subtract earnings from each participant in the commission chain
                    for (const tx of transactionsToDelete) {
                        const field = tx.type === 'direct' ? 'directEarnings' :
                            tx.type === 'level1' ? 'level1Earnings' :
                                tx.type === 'level2' ? 'level2Earnings' : 'level3Earnings';

                        console.log(`[Rollback] Reversing ${tx.amount} (${tx.type}) for affiliate ID: ${tx.affiliateId}`);

                        await db.update(affiliates)
                            .set({
                                totalEarnings: sql`${affiliates.totalEarnings} - ${tx.amount}`,
                                [field]: sql`${affiliates[field as keyof typeof affiliates]} - ${tx.amount}`,
                                [order.status === "Delivered" ? 'availableBalance' : 'pendingBalance']: sql`${affiliates[order.status === "Delivered" ? 'availableBalance' : 'pendingBalance'] || 0} - ${tx.amount}`,
                            })
                            .where(eq(affiliates.id, tx.affiliateId));
                    }
                } else {
                    console.log(`[Rollback] No affiliate found with coupon: ${order.couponCode}`);
                }
            }

            // 3. Revert Vendor Earnings for Delivered Shipments
            const shipments = await db.select({
                id: orderShipments.id,
                status: orderShipments.status,
                vendorId: orderShipments.vendorId,
                items: orderShipments.items
            }).from(orderShipments).where(eq(orderShipments.orderId, order.orderId));

            for (const shipment of shipments) {
                if (shipment.status === "Delivered" && shipment.vendorId) {
                    const items = shipment.items as any[];
                    const productIds = items.map(i => i.productId || i.id).filter(Boolean);

                    if (productIds.length > 0) {
                        const products = await db.select().from(snackProducts).where(inArray(snackProducts.id, productIds));
                        const productMap = new Map(products.map(p => [p.id, p]));

                        const shipmentValue = items.reduce((acc, item) => {
                            const product = productMap.get(item.productId || item.id);
                            if (!product) return acc;

                            const cost = Number(product.productCost || 0);
                            const packaging = Number(product.packagingCost || 0);
                            const quantity = Number(item.quantity) || 1;

                            const perUnitEarnings = cost + (packaging * 0.30);
                            return acc + (perUnitEarnings * quantity);
                        }, 0);

                        console.log(`[Rollback] Reversing Vendor Earning: ${shipmentValue} for Vendor ${shipment.vendorId}`);

                        await db.update(vendors)
                            .set({
                                totalEarnings: sql`${vendors.totalEarnings} - ${shipmentValue}`,
                                pendingBalance: sql`${vendors.pendingBalance} - ${shipmentValue}`,
                            })
                            .where(eq(vendors.id, shipment.vendorId));
                    }
                }
            }

            // 4. Delete associated shipments (Using orderId like 'HMS-XXX')
            await db
                .delete(orderShipments)
                .where(eq(orderShipments.orderId, order.orderId));

            // 5. Delete associated affiliate transactions (Using orderId like 'HMS-XXX')
            await db
                .delete(affiliateTransactions)
                .where(eq(affiliateTransactions.orderId, order.orderId));

            console.log(`[Cleanup] Deleted shipments and transactions for ${order.orderId}`);
        }

        // 5. Delete the order itself
        await db
            .delete(snackOrders)
            .where(eq(snackOrders.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete order error:", error);
        return NextResponse.json({
            error: "Failed to delete order",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
