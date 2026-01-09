import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendWhatsAppAlert } from "@/lib/whatsapp-twilio";

// Helper to extract amount from SMS text
function extractAmount(text: string): number | null {
    // Regex looking for "Rs.", "INR", "₹" followed by digits and optional decimals
    // Examples: "credited with Rs.500.12", "Rs 500.12 received", "INR 500.00"
    const regex = /(?:Rs\.?|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i;
    const match = text.match(regex);
    if (match && match[1]) {
        return parseFloat(match[1].replace(/,/g, ''));
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { from, message } = body; // Adjust based on the specific SMS forwarding app's payload

        if (!message) {
            return NextResponse.json({ error: "No message body found" }, { status: 400 });
        }

        console.log("Received SMS Webhook:", { from, message });

        const amount = extractAmount(message);

        if (!amount) {
            console.log("Could not extract amount from SMS");
            return NextResponse.json({ ignored: true, reason: "No amount found" });
        }

        console.log("Extracted Amount:", amount);

        // Find a PENDING order with this EXACT amount
        // We use a small epsilon for float comparison just in case, though usually exact match works for currency if stored right.
        // Drizzle/Postgres 'doublePrecision' might have slight issues, so we can check range or cast.
        // For simplicity, let's try direct match first, or a very tight range.

        const orders = await db.select()
            .from(snackOrders)
            .where(
                and(
                    eq(snackOrders.status, "Pending Verification"),
                    // We assume the amount in DB is stored with the specific decimal
                    // Checking if totalAmount is 'close enough' to the extracted amount
                    sql`ABS(${snackOrders.totalAmount} - ${amount}) < 0.01`
                )
            );

        if (orders.length === 0) {
            console.log("No matching pending order found for amount:", amount);
            return NextResponse.json({ ignored: true, reason: "No matching order identifying this amount" });
        }

        const order = orders[0]; // Match found!

        // Update Order Status
        await db.update(snackOrders)
            .set({
                status: "Payment Confirmed",
                paymentMethod: "UPI (Auto-SMS)",
                paymentId: "SMS-" + Date.now(), // Generate a pseudo ID since we don't have the bank's UTR easily yet
            })
            .where(eq(snackOrders.orderId, order.orderId));

        // Trigger WhatsApp Alert
        try {
            const successMsg = `✅ *Payment Confirmed!* 💳\n\nOrder: \`${order.orderId}\`\nAmount: ₹${amount}\n\nAutomated via SMS Bridge. 🚀`;
            await sendWhatsAppAlert(successMsg);
        } catch (err) {
            console.error("WhatsApp Alert Error:", err);
        }

        return NextResponse.json({ success: true, orderId: order.orderId });

    } catch (error) {
        console.error("SMS Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "SMS Webhook Active" });
}
