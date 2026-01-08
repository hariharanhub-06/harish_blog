import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET all coupons
export async function GET() {
    try {
        const data = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
        return NextResponse.json(data);
    } catch (error) {
        console.error("GET /api/admin/coupons error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// POST create/update coupon
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, code, discountValue, discountType, isActive } = body;

        if (!code || !discountValue || !discountType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (id) {
            // Update
            const [updated] = await db
                .update(coupons)
                .set({ code, discountValue: parseInt(discountValue), discountType, isActive })
                .where(eq(coupons.id, id))
                .returning();
            return NextResponse.json(updated);
        } else {
            // Create
            const [created] = await db
                .insert(coupons)
                .values({
                    code: code.toUpperCase(),
                    discountValue: parseInt(discountValue),
                    discountType,
                    isActive: isActive ?? true
                })
                .returning();
            return NextResponse.json(created);
        }
    } catch (error) {
        console.error("POST /api/admin/coupons error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// DELETE coupon
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (id) {
            await db.delete(coupons).where(eq(coupons.id, id));
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    } catch (error) {
        console.error("DELETE /api/admin/coupons error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
