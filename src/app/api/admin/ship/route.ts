import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createShiprocketOrder, generateAWB } from "@/lib/shiprocket";

export async function POST(req: NextRequest) {
    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // 1. Fetch Order Details
        const order = await db.query.snackOrders.findFirst({
            where: eq(snackOrders.id, orderId),
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.shiprocketOrderId) {
            return NextResponse.json({ error: "Order already shipped via Shiprocket" }, { status: 400 });
        }

        // 2. Prepare Shiprocket Payload
        // Note: Length, Breadth, Height, Weight are placeholders or need to be approximated based on items
        // For now, we default to a standard small box size: 10x10x10 cm, 0.5kg
        const orderDate = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] + ' 10:00' : new Date().toISOString().split('T')[0] + ' 10:00';

        const orderItems = (order.items as any[]).map(item => ({
            name: item.name,
            sku: item.id || item.name,
            units: item.quantity,
            selling_price: item.price,
            discount: 0,
            tax: 0,
            hsn: 4412 // Dummy HSN
        }));

        const payload = {
            order_id: order.orderId,
            order_date: orderDate,
            pickup_location: "Primary", // Must match a configured pickup location in Shiprocket
            billing_customer_name: order.customerName.split(" ")[0],
            billing_last_name: order.customerName.split(" ")[1] || "",
            billing_address: order.address,
            billing_city: order.city,
            billing_pincode: order.pincode,
            billing_state: order.state,
            billing_country: order.country,
            billing_email: order.customerEmail,
            billing_phone: order.customerMobile,
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: "Prepaid",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: order.totalAmount,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };

        // 3. Create Order in Shiprocket
        const shipResponse = await createShiprocketOrder(payload);
        const srOrderId = shipResponse.order_id;
        const shipmentId = shipResponse.shipment_id;

        // 4. Generate AWB
        let awb = null;
        try {
            const awbResponse = await generateAWB(shipmentId);
            awb = awbResponse.response.data.awb_code;
        } catch (e) {
            console.error("AWB Generation warning:", e);
        }

        // 5. Update Database
        await db.update(snackOrders)
            .set({
                shiprocketOrderId: String(srOrderId),
                shipmentId: String(shipmentId),
                awbCode: awb,
                courierName: "Shiprocket",
                status: "Shipping"
            })
            .where(eq(snackOrders.id, orderId));

        return NextResponse.json({ success: true, shiprocketOrderId: srOrderId, awb });

    } catch (error: any) {
        console.error("Shipping Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
