import { db } from "./src/db";
import { snackOrders, orderShipments } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function verifyIDs() {
    const orders = await db.select().from(snackOrders).where(eq(snackOrders.orderId, "ORD-TEST-5266"));
    console.log("Order found:", orders.map(o => ({ internalId: o.id, readableId: o.orderId })));

    const shipments = await db.select().from(orderShipments).where(eq(orderShipments.orderId, "ORD-TEST-5266"));
    console.log("Shipments found with readableId ORD-TEST-5266:", shipments.length);

    const shipmentsByInternal = await db.select().from(orderShipments).where(eq(orderShipments.orderId, orders[0]?.id));
    console.log("Shipments found with internalId (UUID):", shipmentsByInternal.length);

    process.exit(0);
}

verifyIDs();
