import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliateProducts } from "@/db/schema";
import { eq, desc, and, ilike, or } from "drizzle-orm";

// GET: Fetch all affiliate products with optional filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const platform = searchParams.get("platform");
        const category = searchParams.get("category");
        const featured = searchParams.get("featured");
        const search = searchParams.get("search");

        let query = db.select().from(affiliateProducts);
        const conditions = [];

        // Only show active products on public-facing requests
        conditions.push(eq(affiliateProducts.isActive, true));

        if (platform && platform !== "all") {
            conditions.push(eq(affiliateProducts.platform, platform));
        }

        if (category && category !== "all") {
            conditions.push(eq(affiliateProducts.category, category));
        }

        if (featured === "true") {
            conditions.push(eq(affiliateProducts.isFeatured, true));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(affiliateProducts.title, `%${search}%`),
                    ilike(affiliateProducts.description, `%${search}%`)
                )
            );
        }

        const products = await query
            .where(and(...conditions))
            .orderBy(desc(affiliateProducts.isFeatured), desc(affiliateProducts.createdAt));

        return NextResponse.json(products);
    } catch (error) {
        console.error("Failed to fetch affiliate products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

// POST: Create new affiliate product (Admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Calculate discount percent if both prices are provided
        let discountPercent = body.discountPercent;
        if (!discountPercent && body.originalPrice && body.discountedPrice) {
            discountPercent = Math.round(
                ((body.originalPrice - body.discountedPrice) / body.originalPrice) * 100
            );
        }

        const newProduct = await db
            .insert(affiliateProducts)
            .values({
                title: body.title,
                description: body.description || null,
                originalPrice: body.originalPrice || null,
                discountedPrice: body.discountedPrice || null,
                discountPercent: discountPercent || null,
                affiliateUrl: body.affiliateUrl,
                imageUrl: body.imageUrl || null,
                platform: body.platform || "other",
                category: body.category || null,
                rating: body.rating || null,
                isFeatured: body.isFeatured || false,
                isActive: body.isActive !== undefined ? body.isActive : true,
            })
            .returning();

        return NextResponse.json(newProduct[0], { status: 201 });
    } catch (error) {
        console.error("Failed to create affiliate product:", error);
        return NextResponse.json(
            { error: "Failed to create product", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
