import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendWhatsAppAlert } from "@/lib/whatsapp-twilio";

const SALT_KEY = process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

export async function POST(req: NextRequest) {
    try {
        // PhonePe sends the response as a base64 encoded JSON string in the body
        // It might come as form-data or raw JSON depending on configuration, usually raw JSON with 'response' field
        const body = await req.json();

        // Check X-VERIFY header for security
        const xVerify = req.headers.get("x-verify");
        if (!xVerify) {
            return NextResponse.json({ error: "Missing X-VERIFY header" }, { status: 400 });
        }

        const base64Response = body.response;

        // Verify Checksum: sha256(base64Response + saltKey) + ### + saltIndex
        const stringToHash = base64Response + SALT_KEY;
        const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
        const calculatedChecksum = sha256 + "###" + SALT_INDEX;

        if (calculatedChecksum !== xVerify) {
            console.error("Checksum mismatch", { expected: calculatedChecksum, received: xVerify });
            return NextResponse.json({ error: "Invalid Checksum" }, { status: 400 });
        }

        // Decode Payload
        const decodedResponse = JSON.parse(Buffer.from(base64Response, "base64").toString("utf-8"));

        if (decodedResponse.success && decodedResponse.code === "PAYMENT_SUCCESS") {
            const orderId = decodedResponse.data.merchantTransactionId;
            const transactionId = decodedResponse.data.transactionId;
            const amount = decodedResponse.data.amount / 100; // Convert back to rupees

            // Update Order Status in DB
            const [updatedOrder] = await db.update(snackOrders)
                .set({
                    status: "Payment Confirmed",
                    paymentId: transactionId,
                    paymentMethod: "PhonePe"
                })
                .where(eq(snackOrders.orderId, orderId))
                .returning();

            if (updatedOrder) {
                // Send WhatsApp Confirmation
                try {
                    const message = `✅ *Payment Received!* 💳\n\nOrder: \`${orderId}\`\nAmount: ₹${amount}\nTransaction ID: ${transactionId}\n\nWe will ship your snacks soon! 🍿🚚`;
                    // Send to Admin
                    await sendWhatsAppAlert(message);
                    // ideally send to Customer too if we have their number in a different function
                } catch (err) {
                    console.error("WhatsApp Alert Error:", err);
                }
            }

            return NextResponse.json({ success: true });
        } else {
            // Handle Payment Failure
            return NextResponse.json({ success: true }); // Acknowledge webhook even on failure
        }

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
