import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderShipments, vendors } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { dimensions, readyToShip } = await req.json();

        // Get current shipment data
        const [shipment] = await db.select().from(orderShipments).where(eq(orderShipments.id, id)).limit(1);
        if (!shipment) {
            return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
        }

        // Update shipment with vendor-confirmed dimensions
        await db.update(orderShipments)
            .set({
                vendorConfirmedDimensions: dimensions,
                vendorConfirmedAt: new Date(),
                dimensionSource: "vendor",
                readyToShip: readyToShip || false
            })
            .where(eq(orderShipments.id, id));

        return NextResponse.json({ success: true, message: "Shipment updated successfully" });
    } catch (error) {
        console.error("Update vendor shipment error:", error);
        return NextResponse.json({
            error: "Failed to update shipment",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
