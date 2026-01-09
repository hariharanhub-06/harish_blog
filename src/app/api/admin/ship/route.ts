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

        const orderItems = (itemsRaw as any[]).map(item => {
            const isPcs = (item.unit === "Pcs" || item.unit === "Piece");
            const units = isPcs ? Math.max(1, Math.floor(Number(item.quantity) || 1)) : 1;

            // If it's Kg, we treat as 1 unit of that total weight/price line
            // If it's Pcs, selling_price is price per piece, and units is quantity.
            const selling_price = isPcs
                ? (Number(item.price) || 0)
                : (Number(item.price || item.pricePerKg) || 0) * (Number(item.quantity) || 1);

            return {
                name: item.name || "Product",
                sku: String(item.id || item.name || Math.random()),
                units: units,
                selling_price: Math.round(selling_price * 100) / 100, // Keep 2 decimals
                discount: 0,
                tax: 0,
                hsn: 4412 // Dummy HSN
            };
        });

        // Sanitize Phone Number: must be exactly 10 digits
        const cleanPhone = (order.customerMobile || "").replace(/\D/g, "");
        const sanitizedPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

        // Ensure Address is at least 10 chars for Shiprocket
        let sanitizedAddress = order.address || "Address missing";
        if (sanitizedAddress.length < 10) {
            sanitizedAddress = `${sanitizedAddress}, ${order.city || ""}, ${order.state || ""}`.slice(0, 100);
        }

        // Calculate sub-total and total weight from items
        const calculatedSubTotal = orderItems.reduce((acc, item) => acc + (item.selling_price * item.units), 0);
        const totalWeight = (order.items as any[]).reduce((acc, item) => acc + (Number(item.quantity) || 0.1), 0);

        const payload = {
            order_id: order.orderId,
            order_date: orderDate,
            pickup_location: "Home",
            billing_customer_name: (order.customerName || "Customer").split(" ")[0],
            billing_last_name: (order.customerName || "Customer").split(" ")[1] || "Surname",
            billing_address: sanitizedAddress,
            billing_city: order.city || "City",
            billing_pincode: order.pincode || "000000",
            billing_state: order.state || "State",
            billing_country: order.country || "India",
            billing_email: order.customerEmail || "customer@example.com",
            billing_phone: sanitizedPhone,
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: "Prepaid",
            shipping_charges: Number(order.shippingCost) || 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: Number(order.discountAmount) || 0,
            sub_total: calculatedSubTotal,
            length: Number(calculatedSubTotal) > 2000 ? 25 : Number(calculatedSubTotal) > 1000 ? 20 : 15,
            breadth: Number(calculatedSubTotal) > 1000 ? 20 : 15,
            height: Number(calculatedSubTotal) > 1000 ? 15 : 10,
            weight: totalWeight > 0 ? totalWeight : 0.5 // Use calculated weight or fallback
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
