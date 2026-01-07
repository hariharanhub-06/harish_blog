import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { id } = await params;

        const [updated] = await db
            .update(snackOrders)
            .set({
                ...body,
                updatedAt: new Date(),
            })
            .where(eq(snackOrders.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update order error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
