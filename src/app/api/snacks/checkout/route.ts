import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, snackProducts, abandonedCarts } from "@/db/schema";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";
import { sendWhatsAppAlert } from "@/lib/whatsapp-twilio";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, customer, subtotal, shippingCost, discountAmount, couponCode, totalAmount, paymentMethod, utr, abandonedCartId } = body;

        // 0. Server-side validation
        if (!customer) {
            console.error("Checkout failed: Missing customer object", body);
            return NextResponse.json({ error: "Missing customer information" }, { status: 400 });
        }

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

        // 2.1 Mark abandoned cart as recovered if ID provided
        if (abandonedCartId) {
            try {
                await db.update(abandonedCarts)
                    .set({ isRecovered: true, updatedAt: new Date() })
                    .where(eq(abandonedCarts.id, abandonedCartId));
            } catch (recoveryErr) {
                console.error("Failed to mark cart as recovered:", recoveryErr);
                // Don't fail the checkout if cart recovery marking fails
            }
        }

        // 2.5 Deduct stock and check for low stock
        for (const item of items) {
            const [p] = await db.select({ stock: snackProducts.stock, name: snackProducts.name })
                .from(snackProducts)
                .where(eq(snackProducts.id, item.id));

            if (p) {
                const newStock = Math.max(0, (p.stock || 0) - item.quantity);
                await db.update(snackProducts).set({ stock: newStock }).where(eq(snackProducts.id, item.id));

                if (newStock < 5) { // Low stock threshold
                    const stockAlert = `⚠️ *Low Stock Alert!* 🍿\n\n*Product:* ${p.name}\n*Remaining:* ${newStock} ${item.unit}\n\nPlease restock soon!`;
                    await sendWhatsAppAlert(stockAlert);
                }
            }
        }


        // 3. Automated WhatsApp Invoice / Notification
        if (paymentMethod !== "Razorpay") {
            try {
                const itemsList = items.map((item: any) => `- ${item.name} (${item.quantity}${item.unit})`).join('\n');
                const adminMessage = `🛍️ *New Order!* \`${orderId}\`\n\n*Customer:* ${customer.name}\n*Mobile:* ${customer.mobile}\n*Total:* ₹${totalAmount}\n\n*Items:*\n${itemsList}`;
                await sendWhatsAppAlert(adminMessage);

                // Send invoice-like message to Customer
                const customerMessage = `Hi ${customer.name}! 👋\n\nThank you for your order at *HM Snacks*! 🍿\n\n*Order ID:* \`${orderId}\`\n*Total:* ₹${smartTotalAmount}\n*Status:* ${paymentMethod === 'UPI' ? 'Payment Pending Verification' : 'Confirmed'}\n\nWe will notify you once shipped! 🚀\n\n_Track here:_ https://harishblog.fyi/business/hm-snacks/track?id=${orderId}`;
                await sendWhatsAppAlert(customerMessage, customer.mobile);
            } catch (err) {
                console.error("WhatsApp notification failed:", err);
            }
        }

        return NextResponse.json({
            orderId: orderId,
            amount: smartTotalAmount, // Send back the precise amount to display
            success: true
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({
            error: "Failed to place order",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
