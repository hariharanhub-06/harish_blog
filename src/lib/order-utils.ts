import { db } from "@/db";
import { snackOrders, snackProducts, orderShipments } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * Splits an order into multiple shipments based on the vendor of each product.
 * If shipments already exist for the order, it skips creation to avoid duplicates.
 */
export async function splitOrderIntoShipments(orderId: string) {
    try {
        console.log(`[SplitShipping] Processing order: ${orderId}`);

        // 1. Check if shipments already exist
        const existingShipments = await db
            .select()
            .from(orderShipments)
            .where(eq(orderShipments.orderId, orderId));

        if (existingShipments.length > 0) {
            console.log(`[SplitShipping] Shipments already exist for ${orderId}. Skipping.`);
            return { success: true, message: "Shipments already exist" };
        }

        // 2. Fetch order details
        const order = await db.query.snackOrders.findFirst({
            where: eq(snackOrders.orderId, orderId),
        });

        if (!order) {
            console.error(`[SplitShipping] Order ${orderId} not found`);
            return { success: false, error: "Order not found" };
        }

        const orderItems = (order.items as any[]) || [];
        // Map items to get product IDs (supporting both 'id' and 'productId' keys for compatibility)
        const productIds = orderItems.map((i) => i.productId || i.id).filter(Boolean);

        if (productIds.length === 0) {
            console.log(`[SplitShipping] No products found in order ${orderId}`);
            return { success: true, message: "No items to split" };
        }

        // 3. Fetch product vendor info
        const products = await db
            .select({ id: snackProducts.id, vendorId: snackProducts.vendorId })
            .from(snackProducts)
            .where(inArray(snackProducts.id, productIds));

        const vendorMap = new Map();
        products.forEach((p) => vendorMap.set(p.id, p.vendorId));

        // 4. Group items by Vendor
        const shipments = new Map<string, any[]>(); // vendorId -> items
        const noVendorItems: any[] = [];

        orderItems.forEach((item) => {
            const vId = vendorMap.get(item.productId || item.id);
            if (vId) {
                if (!shipments.has(vId)) shipments.set(vId, []);
                shipments.get(vId)?.push(item);
            } else {
                noVendorItems.push(item);
            }
        });

        // 5. Create Shipments in DB
        const shipmentPromises = [];

        // Vendor-specific shipments
        for (const [vendorId, items] of shipments.entries()) {
            shipmentPromises.push(
                db.insert(orderShipments).values({
                    orderId: orderId,
                    vendorId: vendorId,
                    items: items,
                    status: "Pending",
                })
            );
        }

        // Internal/Admin fulfillment shipment
        if (noVendorItems.length > 0) {
            shipmentPromises.push(
                db.insert(orderShipments).values({
                    orderId: orderId,
                    vendorId: null,
                    items: noVendorItems,
                    status: "Pending",
                })
            );
        }

        await Promise.all(shipmentPromises);
        console.log(`[SplitShipping] Successfully created ${shipmentPromises.length} shipments for ${orderId}`);

        return { success: true, count: shipmentPromises.length };
    } catch (error) {
        console.error(`[SplitShipping] Error splitting order ${orderId}:`, error);
        return { success: false, error };
    }
}
