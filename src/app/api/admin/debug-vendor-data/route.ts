import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, orderShipments, snackOrders, snackProducts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const allVendors = await db.select({ id: vendors.id, name: vendors.name, email: vendors.email }).from(vendors);

        const products = await db.select({ id: snackProducts.id, name: snackProducts.name, vendorId: snackProducts.vendorId }).from(snackProducts);

        const orderId = "HMS-1768135322";
        const shipments = await db.select({
            id: orderShipments.id,
            orderId: orderShipments.orderId,
            vendorId: orderShipments.vendorId,
            status: orderShipments.status
        }).from(orderShipments).where(eq(orderShipments.orderId, orderId));

        return NextResponse.json({
            vendors: allVendors,
            products: products,
            shipments: shipments
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
