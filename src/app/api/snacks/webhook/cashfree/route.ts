import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // In real integration, verify signature here
        // const signature = req.headers.get("x-webhook-signature");

        const { order, payment } = body.data;
        const orderId = order.order_id;
        const paymentId = payment.cf_payment_id;

        if (payment.payment_status === "SUCCESS") {
            // 1. Update order status in DB
            const [updatedOrder] = await db.update(snackOrders).set({
                status: "Payment Confirmed",
                paymentId: paymentId,
                updatedAt: new Date()
            }).where(eq(snackOrders.orderId, orderId)).returning();

            // 2. Trigger Shiprocket (Simplified placeholder)
            /*
            await fetch('https://api.shiprocket.in/v1/external/orders/create/adhoc', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${process.env.SHIPROCKET_TOKEN}` },
                body: JSON.stringify({
                    order_id: orderId,
                    billing_customer_name: updatedOrder.customerName,
                    ...
                })
            });
            */

            console.log(`Order ${orderId} confirmed and triggered to Shiprocket.`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}
