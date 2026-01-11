import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { snackProducts, snackOrders, orderShipments, vendors } from "@/db/schema";
import { createShiprocketOrder, generateAWB } from "@/lib/shiprocket";

export async function POST(req: NextRequest) {
    try {
        const { orderId, shipmentId, length, breadth, height, weight } = await req.json();

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

        let itemsToShip = order.items as any[];
        let pickupLocation = "Home";
        let isSplitShipment = false;

        // 2. logic for Split Shipment
        if (shipmentId) {
            const [shipment] = await db
                .select()
                .from(orderShipments)
                .where(eq(orderShipments.id, shipmentId));

            if (!shipment) {
                return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
            }

            if (shipment.shiprocketOrderId) {
                return NextResponse.json({ error: "Shipment already shipped" }, { status: 400 });
            }

            itemsToShip = shipment.items as any[];
            isSplitShipment = true;

            if (shipment.vendorId) {
                const [vendor] = await db
                    .select()
                    .from(vendors)
                    .where(eq(vendors.id, shipment.vendorId));

                if (vendor && vendor.pickupLocationId) {
                    pickupLocation = vendor.pickupLocationId;
                }
            }
        } else {
            // Legacy / Full Order Check
            if (order.shiprocketOrderId) {
                return NextResponse.json({ error: "Order already shipped via Shiprocket" }, { status: 400 });
            }
        }

        if (!Array.isArray(itemsToShip)) {
            return NextResponse.json({ error: "Items data is invalid" }, { status: 400 });
        }

        const orderDate = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] + ' 10:00' : new Date().toISOString().split('T')[0] + ' 10:00';

        const orderItems = itemsToShip.map(item => {
            const isPcs = (item.unit === "Pcs" || item.unit === "Piece");
            const units = isPcs ? Math.max(1, Math.floor(Number(item.quantity) || 1)) : 1;
            const selling_price = isPcs
                ? (Number(item.price) || 0)
                : (Number(item.price || item.pricePerKg) || 0) * (Number(item.quantity) || 1);

            return {
                name: item.name || "Product",
                sku: String(item.id || item.name || Math.random()),
                units: units,
                selling_price: Math.round(selling_price * 100) / 100,
                discount: 0,
                tax: 0,
                hsn: 4412 // Dummy HSN
            };
        });

        const cleanPhone = (order.customerMobile || "").replace(/\D/g, "");
        const sanitizedPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

        let sanitizedAddress = order.address || "Address missing";
        if (sanitizedAddress.length < 10) {
            sanitizedAddress = `${sanitizedAddress}, ${order.city || ""}, ${order.state || ""}`.slice(0, 100);
        }

        const calculatedSubTotal = orderItems.reduce((acc, item) => acc + (item.selling_price * item.units), 0);

        // 2.5 Fetch Predefined Dimensions from Products
        const itemIds = itemsToShip.map(item => item.id).filter(Boolean);
        let predefinedWeight = 0;
        let predefinedL = 0;
        let predefinedW = 0;
        let predefinedH = 0;
        let allTiers: any[] = [];

        if (itemIds.length > 0) {
            const productsData = await db
                .select()
                .from(snackProducts)
                .where(inArray(snackProducts.id, itemIds));

            productsData.forEach(p => {
                const item = itemsToShip.find(it => it.id === p.id);
                const qty = Number(item?.quantity) || 1;
                predefinedWeight += (p.weight || 0.5) * qty;

                // Collect tiers if they exist
                if (p.dimensionTiers && Array.isArray(p.dimensionTiers)) {
                    allTiers = [...allTiers, ...p.dimensionTiers];
                }

                predefinedL = Math.max(predefinedL, p.length || 15);
                predefinedW = Math.max(predefinedW, p.width || 15);
                predefinedH += (p.height || 1) * qty;
            });
        }

        const totalWeight = weight ? Number(weight) : (predefinedWeight || itemsToShip.reduce((acc, item) => acc + (Number(item.quantity) || 0.1), 0));

        // Use Tiered Dimensions if available
        if (allTiers.length > 0) {
            // Deduplicate and sort tiers (favoring larger dimensions for same weight if conflicting)
            const sortedTiers = allTiers.sort((a, b) => a.weight - b.weight || (b.l * b.w * b.h) - (a.l * a.w * a.h));
            const bestTier = sortedTiers.find(t => t.weight >= totalWeight) || sortedTiers[sortedTiers.length - 1];

            if (bestTier) {
                console.log("Using Tiered Dimensions:", bestTier);
                predefinedL = bestTier.l;
                predefinedW = bestTier.w;
                predefinedH = bestTier.h;
            }
        }

        const uniqueOrderSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        // Use shipmentId if split, else orderId
        const referenceId = isSplitShipment ? `${order.orderId}-S-${shipmentId.slice(0, 4)}` : order.orderId;
        const shiprocketUniqueOrderId = `${referenceId}-${uniqueOrderSuffix}`;

        const payload = {
            order_id: shiprocketUniqueOrderId,
            order_date: orderDate,
            pickup_location: pickupLocation,
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
            shipping_charges: 0, // Assume free shipping for split or handled at order level
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: calculatedSubTotal,
            length: Number(length) || predefinedL || 15,
            breadth: Number(breadth) || predefinedW || 15,
            height: Number(height) || predefinedH || 10,
            weight: totalWeight
        };

        // 3. Create Order in Shiprocket
        let srOrderId, srShipmentId;
        try {
            const shipResponse = await createShiprocketOrder(payload);
            srOrderId = shipResponse.order_id;
            srShipmentId = shipResponse.shipment_id;
        } catch (e: any) {
            console.error("Shiprocket Create Order API Failed:", e);
            return NextResponse.json({
                error: `Shiprocket Error: ${e.message}`,
                details: "Check if pickup location is configured in Shiprocket."
            }, { status: 400 });
        }

        // 4. Generate AWB
        let awb = null;
        try {
            const awbResponse = await generateAWB(srShipmentId);
            awb = awbResponse.response?.data?.awb_code || null;
        } catch (e) {
            console.error("AWB Generation warning:", e);
        }

        // 5. Update Database
        if (isSplitShipment && shipmentId) {
            await db.update(orderShipments)
                .set({
                    shiprocketOrderId: String(srOrderId),
                    awbCode: awb,
                    courierName: "Shiprocket",
                    status: "Shipping",
                })
                .where(eq(orderShipments.id, shipmentId));

            // Check if all shipments are shipped to update main order status
            // (Simplified: Just mark main order as Shipping if at least one is shipped?)
            // Or leave main order status as "Payment Confirmed" but show individual statuses.
            // Let's set main order to "Shipping" so user knows something happened.
            await db.update(snackOrders).set({ status: "Shipping" }).where(eq(snackOrders.id, orderId));

        } else {
            await db.update(snackOrders)
                .set({
                    shiprocketOrderId: String(srOrderId),
                    shipmentId: String(srShipmentId),
                    awbCode: awb,
                    courierName: "Shiprocket",
                    status: "Shipping",
                    updatedAt: new Date()
                })
                .where(eq(snackOrders.id, orderId));
        }

        return NextResponse.json({ success: true, shiprocketOrderId: srOrderId, awb });

    } catch (error: any) {
        console.error("Shipping Route Error:", error);
        return NextResponse.json({ error: `Shipping Error: ${error.message}` }, { status: 500 });
    }
}
