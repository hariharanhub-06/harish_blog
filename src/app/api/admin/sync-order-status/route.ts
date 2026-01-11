import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, orderShipments, vendors, snackProducts } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
        }

        // Get the order
        const [order] = await db.select().from(snackOrders).where(eq(snackOrders.orderId, orderId)).limit(1);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const targetStatus = order.status;
        const logs: string[] = [];
        logs.push(`Order ${orderId} current status: ${targetStatus}`);

        // Get all shipments
        const shipments = await db.select()
            .from(orderShipments)
            .where(eq(orderShipments.orderId, orderId));

        logs.push(`Found ${shipments.length} shipment(s)`);

        // Update each shipment
        for (const shipment of shipments) {
            const oldStatus = shipment.status;
            logs.push(`Shipment ${shipment.id}: ${oldStatus} -> ${targetStatus}`);

            // Update shipment status
            await db.update(orderShipments)
                .set({ status: targetStatus })
                .where(eq(orderShipments.id, shipment.id));

            // Handle vendor earnings if transitioning to Delivered
            if (shipment.vendorId && targetStatus === "Delivered" && oldStatus !== "Delivered") {
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

                    if (shipmentValue > 0) {
                        await db.update(vendors)
                            .set({
                                totalEarnings: sql`${vendors.totalEarnings} + ${shipmentValue}`,
                                pendingBalance: sql`${vendors.pendingBalance} + ${shipmentValue}`,
                            })
                            .where(eq(vendors.id, shipment.vendorId));

                        logs.push(`Credited ₹${shipmentValue} to vendor ${shipment.vendorId}`);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, logs });

    } catch (error) {
        console.error("Sync order status error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
