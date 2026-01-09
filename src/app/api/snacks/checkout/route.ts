import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";
import { sendPushNotification } from "@/lib/push-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, customer, subtotal, shippingCost, discountAmount, couponCode, totalAmount, paymentMethod, utr } = body;

        // 0. Server-side validation
        if (!customer.name || !customer.mobile || !customer.address || !customer.pincode || !customer.city || !customer.state || !customer.country || !utr) {
            return NextResponse.json({ error: "Missing mandatory fields" }, { status: 400 });
        }

        // 1. Create a unique Order ID
        const orderId = `HMS-${Math.floor(Date.now() / 1000)}`;

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
            totalAmount: totalAmount,
            shippingCost: shippingCost,
            couponCode: couponCode || null,
            discountAmount: discountAmount || 0,
            paymentMethod: paymentMethod || "UPI",
            paymentId: utr, // Store UTR here for manual verification
            status: "Pending Verification",
        }).returning();

        // Trigger Push Notification to Admin
        const pushTitle = `New Order: ${orderId}`;
        const pushBody = `From ${customer.name} - Total: ₹${totalAmount}`;
        await sendPushNotification(pushTitle, pushBody, "/admin/dashboard#snacks-orders");

        return NextResponse.json({
            orderId: orderId,
            success: true
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
    }
}
