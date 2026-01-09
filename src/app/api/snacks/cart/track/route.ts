import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { abandonedCarts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, customerName, customerMobile, items, lastStep } = body;

        if (id) {
            // Update existing abandoned cart entry
            const [updatedCart] = await db
                .update(abandonedCarts)
                .set({
                    customerName: customerName || null,
                    customerMobile: customerMobile || null,
                    items,
                    lastStep,
                    updatedAt: new Date(),
                })
                .where(eq(abandonedCarts.id, id))
                .returning();
            return NextResponse.json(updatedCart);
        } else {
            // Create new abandoned cart entry
            const [newCart] = await db
                .insert(abandonedCarts)
                .values({
                    customerName: customerName || null,
                    customerMobile: customerMobile || null,
                    items,
                    lastStep,
                })
                .returning();
            return NextResponse.json(newCart);
        }
    } catch (error) {
        console.error("Cart tracking error:", error);
        return NextResponse.json({
            error: "Failed to track cart",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const carts = await db
            .select()
            .from(abandonedCarts)
            .where(eq(abandonedCarts.isRecovered, false))
            .orderBy(abandonedCarts.createdAt);
        return NextResponse.json(carts);
    } catch (error) {
        console.error("Fetch abandoned carts error:", error);
        return NextResponse.json({
            error: "Failed to fetch carts",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
