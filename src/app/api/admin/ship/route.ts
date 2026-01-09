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
        const itemsRaw = order.items;
        if (!Array.isArray(itemsRaw)) {
            return NextResponse.json({ error: "Order items data is invalid or missing" }, { status: 400 });
        }

        const orderDate = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] + ' 10:00' : new Date().toISOString().split('T')[0] + ' 10:00';

        const orderItems = (itemsRaw as any[]).map(item => ({
            name: item.name || "Product",
            sku: String(item.id || item.name || Math.random()),
            units: Number(item.quantity) || 1,
            selling_price: Number(item.price) || 0,
            discount: 0,
            tax: 0,
            hsn: 4412 // Dummy HSN
        }));

        const payload = {
            order_id: order.orderId,
            order_date: orderDate,
            pickup_location: "Primary",
            billing_customer_name: (order.customerName || "Customer").split(" ")[0],
            billing_last_name: (order.customerName || "Customer").split(" ")[1] || "",
            billing_address: order.address || "Address",
            billing_city: order.city || "City",
            billing_pincode: order.pincode || "000000",
            billing_state: order.state || "State",
            billing_country: order.country || "India",
            billing_email: order.customerEmail || "customer@example.com",
            billing_phone: order.customerMobile || "0000000000",
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: "Prepaid",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: Number(order.totalAmount) || 0,
            length: Number(order.totalAmount) > 2000 ? 25 : Number(order.totalAmount) > 1000 ? 20 : 15,
            breadth: Number(order.totalAmount) > 2000 ? 25 : Number(order.totalAmount) > 1000 ? 20 : 15,
            height: Number(order.totalAmount) > 2000 ? 20 : Number(order.totalAmount) > 1000 ? 15 : 10,
            weight: (order.items as any[]).reduce((acc, item) => acc + (Number(item.quantity) || 0.1), 0) || 0.5
        };

        // 3. Create Order in Shiprocket
        let srOrderId, shipmentId;
        try {
            const shipResponse = await createShiprocketOrder(payload);
            srOrderId = shipResponse.order_id;
            shipmentId = shipResponse.shipment_id;
        } catch (e: any) {
            console.error("Shiprocket Create Order API Failed:", e);
            return NextResponse.json({
                error: `Shiprocket Error: ${e.message}`,
                details: "Check if 'Primary' pickup location is configured in Shiprocket."
            }, { status: 400 }); // Return 400 with details instead of 500
        }

        // 4. Generate AWB
        let awb = null;
        try {
            const awbResponse = await generateAWB(shipmentId);
            awb = awbResponse.response?.data?.awb_code || null;
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
                status: "Shipping",
                updatedAt: new Date()
            })
            .where(eq(snackOrders.id, orderId));

        return NextResponse.json({ success: true, shiprocketOrderId: srOrderId, awb });

    } catch (error: any) {
        console.error("Shipping Route Error:", error);
        return NextResponse.json({ error: `Shipping Error: ${error.message}` }, { status: 500 });
    }
}
