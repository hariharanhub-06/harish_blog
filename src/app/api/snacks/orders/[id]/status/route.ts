import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Correct Next.js 15 param type
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    try {
        const order = await db.query.snackOrders.findFirst({
            where: eq(snackOrders.orderId, id),
            columns: {
                status: true,
                paymentMethod: true
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({
            status: order.status,
            confirmed: order.status === "Payment Confirmed"
        });

    } catch (error) {
        console.error("Order status check error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
