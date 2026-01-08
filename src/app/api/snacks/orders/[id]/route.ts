import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
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

        return NextResponse.json(order);
    } catch (error) {
        console.error("Fetch order detail error:", error);
        return NextResponse.json({ error: "Failed to fetch order detail" }, { status: 500 });
    }
}
