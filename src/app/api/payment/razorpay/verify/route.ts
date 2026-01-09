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

            try {
                const message = `✅ *Payment Received!* (Razorpay)\n\nOrder: \`${db_order_id}\`\nPayment ID: ${razorpay_payment_id}\n\nAutomated Verification Successful. 🚀`;
                await sendWhatsAppAlert(message);
            } catch (e) {
                console.error("WhatsApp Alert Error", e);
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
