
import { db } from "./src/db";
import { snackOrders, orderShipments } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const orderId = `ORD-TEST-${Math.floor(Math.random() * 10000)}`;
    const affiliateId = "3a3eb4be-25cb-40ce-8040-fb82a5725218";

    // 1. Create Order
    const items = [
        {
            id: "ef72c061-7c42-40a8-9cb1-bfa07de50a38", // INIPPU SEVVU
            name: "INIPPU SEVVU",
            quantity: 2,
            unit: "pkt",
            price: 100
        },
        {
            id: "199d174d-c286-410d-8eeb-492d88ca0c9e", // KAARA SEVVU
            name: "KAARA SEVVU",
            quantity: 1,
            unit: "pkt",
            price: 150
        }
    ];

    console.log(`Creating Order: ${orderId}`);

    await db.insert(snackOrders).values({
        orderId: orderId,
        customerName: "Test Multi-Location User",
        customerEmail: "test@example.com",
        customerMobile: "9876543210",
        address: "123 Test Street",
        city: "Test City",
        state: "Tamil Nadu",
        pincode: "600001",
        totalAmount: 350,
        items: items,
        status: "Payment Confirmed",
        affiliateId: affiliateId,
        paymentMethod: "Razorpay",
        createdAt: new Date()
    });

    const newOrder = await db.query.snackOrders.findFirst({
        where: eq(snackOrders.orderId, orderId)
    });

    if (!newOrder) {
        console.error("Failed to create order");
        return;
    }

    // 2. Create Shipments (Manual Split)
    // Shipment 1: Kannama Food
    await db.insert(orderShipments).values({
        orderId: newOrder.id,
        vendorId: "d7e99e8d-6c05-45df-ab1d-7055bb87ff39",
        items: [items[0]],
        status: "Pending",
        createdAt: new Date()
    });

    // Shipment 2: HM Snacks
    await db.insert(orderShipments).values({
        orderId: newOrder.id,
        vendorId: "1d29f24b-8da0-4215-9d3f-aa2a9e739ff2",
        items: [items[1]],
        status: "Pending",
        createdAt: new Date()
    });

    console.log("Success: Order and Split Shipments created!");
    console.log(`Order Internal ID: ${newOrder.id}`);
    console.log(`Order Display ID: ${orderId}`);
}

main().catch(console.error).finally(() => process.exit());
