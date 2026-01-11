import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderShipments, vendors } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        // 1. Fetch current shipment
        const [shipment] = await db.select().from(orderShipments).where(eq(orderShipments.id, id)).limit(1);
        if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });

        const oldStatus = shipment.status;

        // 2. Update status
        const [updatedShipment] = await db.update(orderShipments)
            .set({ status })
            .where(eq(orderShipments.id, id))
            .returning();

        // 3. If transitioning to Delivered, update Vendor Earnings
        if (status === "Delivered" && oldStatus !== "Delivered") {
            // Calculate total items value in this shipment
            const items = updatedShipment.items as any[];
            const shipmentValue = items.reduce((acc, item) => acc + (Number(item.price) * (Number(item.quantity) || 1)), 0);

            if (updatedShipment.vendorId) {
                await db.update(vendors)
                    .set({
                        totalEarnings: sql`${vendors.totalEarnings} + ${shipmentValue}`,
                        pendingBalance: sql`${vendors.pendingBalance} + ${shipmentValue}`,
                    })
                    .where(eq(vendors.id, updatedShipment.vendorId));
            }
        }

        return NextResponse.json(updatedShipment);
    } catch (error) {
        console.error("Update shipment error:", error);
        return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 });
    }
}
