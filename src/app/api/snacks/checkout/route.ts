import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";
import { sendWhatsAppAlert } from "@/lib/whatsapp-twilio";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, customer, subtotal, shippingCost, discountAmount, couponCode, totalAmount, paymentMethod, utr } = body;

        // 0. Server-side validation
        if (!customer.name || !customer.mobile || !customer.address || !customer.pincode || !customer.city || !customer.state || !customer.country) {
            return NextResponse.json({ error: "Missing mandatory fields" }, { status: 400 });
        }

        // 1. Create a unique Order ID
        const orderId = `HMS-${Math.floor(Date.now() / 1000)}`;

        // Smart Amount Logic: Add random paise (0.01 to 0.99) to make the amount unique
        // This helps the SMS bridge identify the specific order.
        const randomPaise = Math.floor(Math.random() * 99) + 1; // 1 to 99
        // Ensure totalAmount has at most 2 decimal places
        const smartTotalAmount = Math.floor(totalAmount) + (randomPaise / 100);

        // 2. Save order to database
        const [order] = await db.insert(snackOrders).values({
            orderId,
            customerName: customer.name,
            customerMobile: customer.mobile,
            customerEmail: customer.email,
            address: customer.address,
            pincode: customer.pincode,
            city: customer.city,
            state: customer.state,
            country: customer.country,
            items: items,
            totalAmount: smartTotalAmount, // Save the unique amount
            shippingCost: shippingCost,
            couponCode: couponCode || null,
            discountAmount: discountAmount || 0,
            paymentMethod: paymentMethod || "UPI",
            paymentId: utr || "PENDING", // Placeholder for automated payments
            status: "Pending Verification",
        }).returning();

        // Trigger WhatsApp Alert to Admin (Non-blocking)
        try {
            const itemsList = items.map((item: any) => `- ${item.name} (${item.quantity}${item.unit})`).join('\n');
            const alertMessage = `🛍️ *New Order Received!* 🍿\n\n*ID:* \`${orderId}\`\n*Customer:* ${customer.name}\n*Total:* ₹${totalAmount}\n*Payment:* ${paymentMethod} (${utr})\n\n*Items:*\n${itemsList}\n\n*Address:* ${customer.address}, ${customer.city}`;
            await sendWhatsAppAlert(alertMessage);
        } catch (alertError) {
            console.error("Failed to send WhatsApp alert, but order was saved:", alertError);
        }

        return NextResponse.json({
            orderId: orderId,
            amount: smartTotalAmount, // Send back the precise amount to display
            success: true
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
    }
}
