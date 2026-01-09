import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendWhatsAppAlert } from "@/lib/whatsapp-twilio";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = body;

        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature === razorpay_signature) {
            // Payment Success
            await db.update(snackOrders)
                .set({
                    status: "Payment Confirmed",
                    paymentMethod: "Razorpay",
                    paymentId: razorpay_payment_id,
                })
                .where(eq(snackOrders.orderId, db_order_id));

            // Fetch full order details for the alert
            const order = await db.query.snackOrders.findFirst({
                where: eq(snackOrders.orderId, db_order_id),
            });

            if (order) {
                try {
                    const itemsList = (order.items as any[]).map((item: any) => `- ${item.name} (${item.quantity}${item.unit})`).join('\n');
                    const adminMessage = `🛍️ *Razorpay Order Confirmed!* \n\n*ID:* \`${db_order_id}\`\n*Customer:* ${order.customerName}\n*Total:* ₹${order.totalAmount}\n\n*Items:*\n${itemsList}`;
                    await sendWhatsAppAlert(adminMessage);

                    // Send invoice to Customer
                    const customerMessage = `Hi ${order.customerName}! 👋\n\nYour payment for order *#${db_order_id}* has been confirmed! 🍿\n\n*Total:* ₹${order.totalAmount}\n*Items:*\n${itemsList}\n\nWe are preparing your snacks for shipment! 🚀`;
                    await sendWhatsAppAlert(customerMessage, order.customerMobile);
                } catch (e) {
                    console.error("WhatsApp Alert Error", e);
                }
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: "Invalid Signature" }, { status: 400 });
        }
    } catch (error) {
        console.error("Razorpay Verify Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
