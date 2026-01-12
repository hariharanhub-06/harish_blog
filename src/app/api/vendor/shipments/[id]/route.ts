import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderShipments, snackOrders, vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createShiprocketOrder, generateAWB, generateLabel, schedulePickup } from "@/lib/shiprocket";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { dimensions, readyToShip, pickupDate, pickupTime } = await req.json();

        // 1. Get current shipment data along with order and vendor info
        const [shipment] = await db
            .select({
                shipment: orderShipments,
                order: snackOrders,
                vendor: vendors
            })
            .from(orderShipments)
            .leftJoin(snackOrders, eq(orderShipments.orderId, snackOrders.orderId))
            .leftJoin(vendors, eq(orderShipments.vendorId, vendors.id))
            .where(eq(orderShipments.id, id))
            .limit(1);

        if (!shipment) {
            return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
        }

        const { shipment: shipmentData, order: orderData, vendor: vendorData } = shipment;

        // 2. Update DB with vendor-confirmed dimensions and schedule
        await db.update(orderShipments)
            .set({
                vendorConfirmedDimensions: dimensions,
                vendorConfirmedAt: new Date(),
                dimensionSource: "vendor",
                readyToShip: readyToShip || false,
                pickupDate: pickupDate,
                pickupTime: pickupTime
            })
            .where(eq(orderShipments.id, id));

        // 3. If readyToShip is true, proceed with Shiprocket automation
        if (readyToShip && orderData) {
            let srOrderId = shipmentData.shiprocketOrderId;
            let awb = shipmentData.awbCode;
            let labelUrl = shipmentData.labelUrl;

            // Step A: Create Shiprocket Order if it doesn't exist
            if (!srOrderId) {
                const orderItems = (shipmentData.items as any[]).map(item => {
                    const isPcs = (item.unit === "Pcs" || item.unit === "Piece");
                    const units = isPcs ? Math.max(1, Math.floor(Number(item.quantity) || 1)) : 1;
                    const selling_price = isPcs
                        ? (Number(item.price) || 0)
                        : (Number(item.price) || 0) * (Number(item.quantity) || 1);

                    return {
                        name: item.name || "Product",
                        sku: String(item.id || item.name || Math.random()),
                        units: units,
                        selling_price: Math.round(selling_price * 100) / 100,
                        discount: 0,
                        tax: 0,
                    };
                });

                const cleanPhone = (orderData.customerMobile || "").replace(/\D/g, "");
                const sanitizedPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
                const referenceId = `${orderData.orderId}-S-${id.slice(0, 4)}`;
                const shiprocketUniqueOrderId = `${referenceId}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

                const payload = {
                    order_id: shiprocketUniqueOrderId,
                    order_date: new Date().toISOString().split('T')[0] + ' 10:00',
                    pickup_location: vendorData?.pickupLocationId || "Home",
                    billing_customer_name: (orderData.customerName || "Customer").split(" ")[0],
                    billing_last_name: (orderData.customerName || "Customer").split(" ")[1] || "Surname",
                    billing_address: orderData.address || "Address missing",
                    billing_city: orderData.city || "City",
                    billing_pincode: orderData.pincode || "000000",
                    billing_state: orderData.state || "State",
                    billing_country: orderData.country || "India",
                    billing_email: orderData.customerEmail || "customer@example.com",
                    billing_phone: sanitizedPhone,
                    shipping_is_billing: true,
                    order_items: orderItems,
                    payment_method: "Prepaid",
                    sub_total: orderItems.reduce((acc, item) => acc + (item.selling_price * item.units), 0),
                    length: dimensions.l || 15,
                    breadth: dimensions.w || 15,
                    height: dimensions.h || 10,
                    weight: dimensions.weight || 0.5
                };

                const shipResponse = await createShiprocketOrder(payload);
                srOrderId = String(shipResponse.order_id);
                const srShipmentId = shipResponse.shipment_id;

                // Step B: Generate AWB
                try {
                    const awbResponse = await generateAWB(srShipmentId);
                    awb = awbResponse.response?.data?.awb_code || null;
                } catch (e) {
                    console.error("AWB Generation failed:", e);
                }

                // Step C: Generate Label
                try {
                    const labelResponse = await generateLabel(srShipmentId);
                    labelUrl = labelResponse.label_url || null;
                } catch (e) {
                    console.error("Label Generation failed:", e);
                }

                // Step D: Schedule Pickup
                try {
                    await schedulePickup(srShipmentId);
                } catch (e) {
                    console.error("Pickup scheduling failed:", e);
                }

                // Update Shipment in DB with SR details
                await db.update(orderShipments)
                    .set({
                        shiprocketOrderId: srOrderId,
                        awbCode: awb,
                        labelUrl: labelUrl,
                        courierName: "Shiprocket",
                        status: "Shipping",
                    })
                    .where(eq(orderShipments.id, id));

                // Also update main order status if needed
                await db.update(snackOrders).set({ status: "Shipping" }).where(eq(snackOrders.orderId, orderData.orderId));
            }
        }

        return NextResponse.json({ success: true, message: "Shipment updated and processed successfully" });
    } catch (error) {
        console.error("Update vendor shipment error:", error);
        return NextResponse.json({
            error: "Failed to update shipment",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
