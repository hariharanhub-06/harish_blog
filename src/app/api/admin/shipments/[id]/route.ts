import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderShipments, vendors, snackProducts, snackOrders } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { confirmAffiliateCommissions } from "@/lib/affiliate-commissions";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        // 1. Fetch current shipment
        const [shipment] = await db.select().from(orderShipments).where(eq(orderShipments.id, id)).limit(1);
        if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });

        const oldStatus = shipment.status;

        // 2. Update status
        const [updatedShipment] = await db.update(orderShipments)
            .set({ status })
            .where(eq(orderShipments.id, id))
            .returning();

        // 3. Handle Vendor Earnings Logic
        if (updatedShipment.vendorId) {
            const items = updatedShipment.items as any[];
            // Fetch product costs
            const productIds = items.map(i => i.productId || i.id).filter(Boolean);
            let productMap = new Map();

            if (productIds.length > 0) {
                const products = await db.select().from(snackProducts).where(inArray(snackProducts.id, productIds));
                productMap = new Map(products.map(p => [p.id, p]));
            }

            // Calculate Value: Product Cost + 30% of Packaging Cost
            const shipmentValue = items.reduce((acc, item) => {
                const product = productMap.get(item.productId || item.id);
                if (!product) return acc;

                const cost = Number(product.productCost || 0);
                const packaging = Number(product.packagingCost || 0);
                const quantity = Number(item.quantity) || 1;

                // Formula: (Cost + (Packaging * 0.3)) * Qty
                // OR: (Cost * Qty) + (Packaging * 0.3 * Qty) ?? 
                // Creating a per-unit cost:
                const perUnitEarnings = cost + (packaging * 0.30);

                return acc + (perUnitEarnings * quantity);
            }, 0);

            // A. Delivered: Credit Earnings
            if (status === "Delivered" && oldStatus !== "Delivered") {
                await db.update(vendors)
                    .set({
                        totalEarnings: sql`${vendors.totalEarnings} + ${shipmentValue}`,
                        pendingBalance: sql`${vendors.pendingBalance} + ${shipmentValue}`,
                    })
                    .where(eq(vendors.id, updatedShipment.vendorId));
            }

            // B. Revert: If it WAS Delivered, and now it's NOT (e.g. Cancelled, Returned, or Status Change mistake)
            if (oldStatus === "Delivered" && status !== "Delivered") {
                await db.update(vendors)
                    .set({
                        totalEarnings: sql`${vendors.totalEarnings} - ${shipmentValue}`,
                        pendingBalance: sql`${vendors.pendingBalance} - ${shipmentValue}`,
                    })
                    .where(eq(vendors.id, updatedShipment.vendorId));
            }
            // C. Update Order status if all shipments for this order are Delivered
            if (updatedShipment.orderId) {
                const allShipments = await db.select().from(orderShipments).where(eq(orderShipments.orderId, updatedShipment.orderId));
                const allDelivered = allShipments.every(s => s.status === "Delivered");

                if (allDelivered) {
                    await db.update(snackOrders)
                        .set({ status: "Delivered", updatedAt: new Date() })
                        .where(eq(snackOrders.orderId, updatedShipment.orderId));

                    // Trigger Affiliate Commission Confirmation
                    await confirmAffiliateCommissions(updatedShipment.orderId);
                }
            }
        }

        return NextResponse.json(updatedShipment);
    } catch (error) {
        console.error("Update shipment error:", error);
        return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 });
    }
}
