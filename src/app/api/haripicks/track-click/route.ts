import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliateProducts } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST: Track when user clicks on affiliate link
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        // Increment clicks count
        const product = await db
            .select()
            .from(affiliateProducts)
            .where(eq(affiliateProducts.id, productId))
            .limit(1);

        if (product.length === 0) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        await db
            .update(affiliateProducts)
            .set({
                clicksCount: (product[0].clicksCount || 0) + 1,
                updatedAt: new Date(),
            })
            .where(eq(affiliateProducts.id, productId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to track click:", error);
        return NextResponse.json(
            { error: "Failed to track click" },
            { status: 500 }
        );
    }
}
