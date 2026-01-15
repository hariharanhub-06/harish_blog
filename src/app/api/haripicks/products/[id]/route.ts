import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliateProducts } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH: Update affiliate product (Admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await params;

        // Calculate discount percent if both prices are provided
        let discountPercent = body.discountPercent;
        if (!discountPercent && body.originalPrice && body.discountedPrice) {
            discountPercent = Math.round(
                ((body.originalPrice - body.discountedPrice) / body.originalPrice) * 100
            );
        }

        // Strictly allow only schema columns to prevent "column does not exist" errors
        const updateData: any = {};
        const allowedFields = [
            "title", "description", "originalPrice", "discountedPrice", "discountPercent",
            "affiliateUrl", "imageUrl", "platform", "category", "rating",
            "isFeatured", "isActive", "viewsCount", "clicksCount"
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        updateData.discountPercent = discountPercent || body.discountPercent || null;
        updateData.updatedAt = new Date();

        const updatedProduct = await db
            .update(affiliateProducts)
            .set(updateData)
            .where(eq(affiliateProducts.id, id))
            .returning();

        if (updatedProduct.length === 0) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedProduct[0]);
    } catch (error) {
        console.error("Failed to update affiliate product:", error);
        return NextResponse.json(
            { error: "Failed to update product", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// DELETE: Delete affiliate product (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const deletedProduct = await db
            .delete(affiliateProducts)
            .where(eq(affiliateProducts.id, id))
            .returning();

        if (deletedProduct.length === 0) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Failed to delete affiliate product:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
