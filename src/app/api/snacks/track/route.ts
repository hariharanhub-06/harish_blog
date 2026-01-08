import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // Fetch order but select specific fields implies returning the whole object and filtering in code 
        // or using .select() with specific fields if Drizzle supports it easily in this version.
        // For now, I'll fetch and sanitize.
        const [order] = await db
            .select()
            .from(snackOrders)
            .where(ilike(snackOrders.orderId, orderId)); // Case insensitive match

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Return only safe public info
        const safeOrder = {
            orderId: order.orderId,
            status: order.status,
            createdAt: order.createdAt,
            items: order.items, // Customers want to see what they ordered
            shipmentId: order.shipmentId, // For reference
            totalAmount: order.totalAmount,
            cancelReason: order.cancelReason
        };

        return NextResponse.json(safeOrder);
    } catch (error) {
        console.error("Track order error:", error);
        return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
    }
}
