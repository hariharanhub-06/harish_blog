import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, orderShipments, vendors } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [order] = await db
            .select()
            .from(snackOrders)
            .where(eq(snackOrders.id, id))
            .limit(1);

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Fetch associated shipments (Split Orders)
        const shipments = await db
            .select({
                id: orderShipments.id,
                vendorId: orderShipments.vendorId,
                items: orderShipments.items,
                status: orderShipments.status,
                vendorName: vendors.name,
                awbCode: orderShipments.awbCode,
                courierName: orderShipments.courierName,
                trackingUrl: orderShipments.trackingUrl,
                shiprocketOrderId: orderShipments.shiprocketOrderId,
                vendorConfirmedDimensions: orderShipments.vendorConfirmedDimensions,
                vendorConfirmedAt: orderShipments.vendorConfirmedAt,
                dimensionSource: orderShipments.dimensionSource,
                readyToShip: orderShipments.readyToShip,
            })
            .from(orderShipments)
            .leftJoin(vendors, eq(orderShipments.vendorId, vendors.id))
            .where(eq(orderShipments.orderId, order.orderId));

        return NextResponse.json({ ...order, shipments });
    } catch (error) {
        console.error("Fetch order detail error:", error);
        return NextResponse.json({ error: "Failed to fetch order detail" }, { status: 500 });
    }
}
import { processAffiliateCommissions } from "@/lib/affiliate-commissions";
import { splitOrderIntoShipments } from "@/lib/order-utils";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const [updatedOrder] = await db
            .update(snackOrders)
            .set({
                ...body,
                updatedAt: new Date()
            })
            .where(eq(snackOrders.id, id))
            .returning();

        if (!updatedOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Trigger Affiliate Commission & Split Shipping Logic if status is successful
        if (body.status === "Payment Confirmed" || body.status === "Success") {
            // 1. Process Commissions
            await processAffiliateCommissions(updatedOrder.orderId);

            // 2. Split into multi-vendor shipments
            await splitOrderIntoShipments(updatedOrder.orderId);
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Update order error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Get the order details first to get the orderId (HMS-XXX)
        const [order] = await db
            .select({ orderId: snackOrders.orderId })
            .from(snackOrders)
            .where(eq(snackOrders.id, id))
            .limit(1);

        if (order) {
            // 2. Delete associated shipments from order_shipments table
            await db
                .delete(orderShipments)
                .where(eq(orderShipments.orderId, order.orderId));
        }

        // 3. Delete the order itself
        await db
            .delete(snackOrders)
            .where(eq(snackOrders.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete order error:", error);
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}
