import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partnerships } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// PATCH - Update partnership
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const [updated] = await db
            .update(partnerships)
            .set({
                ...body,
                updatedAt: new Date(),
            })
            .where(eq(partnerships.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "Partnership not found" }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update partnership error:", error);
        return NextResponse.json({ error: "Failed to update partnership" }, { status: 500 });
    }
}

// DELETE - Delete partnership
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.delete(partnerships).where(eq(partnerships.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete partnership error:", error);
        return NextResponse.json({ error: "Failed to delete partnership" }, { status: 500 });
    }
}
