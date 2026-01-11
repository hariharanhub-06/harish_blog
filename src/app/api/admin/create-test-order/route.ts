
import { NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, orderShipments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
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

        // Insert order and return the result to get the internal ID
        const insertedOrders = await db.insert(snackOrders).values({
            orderId: orderId,
            customerName: "Test Multi-Location User",
            customerEmail: "test@example.com",
            customerMobile: "9876543210",
            address: "123 Test Street",
            city: "Test City",
            state: "Tamil Nadu",
            pincode: "600001",
            country: "India",
            totalAmount: 350,
            items: items,
            status: "Payment Confirmed",
            couponCode: "HMS63294",
            paymentMethod: "Razorpay",
            createdAt: new Date()
        }).returning();

        const newOrder = insertedOrders[0];

        if (!newOrder) {
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        // 2. Create Shipments (Manual Split)
        // Shipment 1: Kannama Food
        await db.insert(orderShipments).values({
            orderId: orderId, // Use the readable ID
            vendorId: "d7e99e8d-6c05-45df-ab1d-7055bb87ff39",
            items: [items[0]],
            status: "Pending",
            createdAt: new Date()
        });

        // Shipment 2: HM Snacks
        await db.insert(orderShipments).values({
            orderId: orderId, // Use the readable ID
            vendorId: "1d29f24b-8da0-4215-9d3f-aa2a9e739ff2",
            items: [items[1]],
            status: "Pending",
            createdAt: new Date()
        });

        return NextResponse.json({
            success: true,
            displayOrderId: orderId,
            internalOrderId: newOrder.id
        });

    } catch (e: any) {
        console.error("Test Order Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
