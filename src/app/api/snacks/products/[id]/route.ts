import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackProducts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await req.json();
        const { id } = await params;

        console.log("PATCH /api/snacks/products/[id]:", { id, body });

        // Filter out system-managed fields that shouldn't be updated
        const { id: bodyId, createdAt, updatedAt: bodyUpdatedAt, ...updateData } = body;

        const [updated] = await db
            .update(snackProducts)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(snackProducts.id, id))
            .returning();

        console.log("Product updated successfully:", updated);
        revalidateTag('snack-products');
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update product error:", error);
        return NextResponse.json({
            error: "Failed to update product",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.delete(snackProducts).where(eq(snackProducts.id, id));
        revalidateTag('snack-products');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete product error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
