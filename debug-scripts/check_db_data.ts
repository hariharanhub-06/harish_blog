import { db } from "./src/db";
import { snackOrders, orderShipments } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function checkData() {
    console.log("Checking Order ORD-TEST-5266...");
    const orders = await db.select().from(snackOrders).where(eq(snackOrders.orderId, "ORD-TEST-5266"));
    console.log("Orders found:", orders.length);
    if (orders.length > 0) {
        console.log("Order ID:", orders[0].id);
        console.log("Status:", orders[0].status);
        console.log("Coupon Code:", orders[0].couponCode);
    }

    console.log("\nChecking Shipments for ORD-TEST-5266...");
    const shipments = await db.select().from(orderShipments).where(eq(orderShipments.orderId, "ORD-TEST-5266"));
    console.log("Shipments found:", shipments.length);
    shipments.forEach((s, i) => {
        console.log(`Shipment ${i + 1}: ID=${s.id}, VendorID=${s.vendorId}, Status=${s.status}, SR_ID=${s.shiprocketOrderId}`);
    });

    process.exit(0);
}

checkData().catch(err => {
    console.error(err);
    process.exit(1);
});
