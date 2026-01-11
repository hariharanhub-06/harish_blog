import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { snackOrders, snackProducts, orderShipments } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
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

            // Fetch full order details for the alert & split shipping
            const order = await db.query.snackOrders.findFirst({
                where: eq(snackOrders.orderId, db_order_id),
            });

            if (order) {
                // --- SPLIT SHIPPING LOGIC START ---
                try {
                    const orderItems = (order.items as any[]) || [];
                    const productIds = orderItems.map((i) => i.id);

                    if (productIds.length > 0) {
                        const products = await db
                            .select({ id: snackProducts.id, vendorId: snackProducts.vendorId })
                            .from(snackProducts)
                            .where(inArray(snackProducts.id, productIds));

                        const vendorMap = new Map();
                        products.forEach((p) => vendorMap.set(p.id, p.vendorId));

                        const shipments = new Map<string, any[]>(); // vendorId -> items
                        const noVendorItems: any[] = [];

                        orderItems.forEach((item) => {
                            const vId = vendorMap.get(item.id);
                            if (vId) {
                                if (!shipments.has(vId)) shipments.set(vId, []);
                                shipments.get(vId)?.push(item);
                            } else {
                                noVendorItems.push(item);
                            }
                        });

                        const shipmentPromises = [];

                        // Create shipments for vendor items
                        for (const [vendorId, items] of shipments.entries()) {
                            shipmentPromises.push(
                                db.insert(orderShipments).values({
                                    orderId: db_order_id,
                                    vendorId: vendorId,
                                    items: items,
                                    status: "Pending",
                                })
                            );
                        }

                        // Create shipment for own fulfillment (no vendor)
                        if (noVendorItems.length > 0) {
                            shipmentPromises.push(
                                db.insert(orderShipments).values({
                                    orderId: db_order_id,
                                    vendorId: null, // Internal
                                    items: noVendorItems,
                                    status: "Pending",
                                })
                            );
                        }

                        await Promise.all(shipmentPromises);
                    }
                } catch (splitError) {
                    console.error("Split Shipping Error for Order:", db_order_id, splitError);
                    // Don't block the main flow, just log it
                }
                // --- SPLIT SHIPPING LOGIC END ---

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
