import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackProducts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { id } = await params;

        const [updated] = await db
            .update(snackProducts)
            .set({
                ...body,
                updatedAt: new Date(),
            })
            .where(eq(snackProducts.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update product error:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        await db.delete(snackProducts).where(eq(snackProducts.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete product error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
