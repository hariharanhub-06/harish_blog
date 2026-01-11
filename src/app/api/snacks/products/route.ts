import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackProducts } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

import { unstable_cache, revalidateTag } from "next/cache";

// Cached data fetcher
const getCachedProducts = unstable_cache(
    async (activeOnly: boolean) => {
        const conditions = [];
        if (activeOnly) {
            conditions.push(eq(snackProducts.isActive, true));
        }

        return await db
            .select({
                id: snackProducts.id,
                name: snackProducts.name,
                category: snackProducts.category,
                imageUrl: snackProducts.imageUrl,
                pricePerKg: snackProducts.pricePerKg,
                offerPricePerKg: snackProducts.offerPricePerKg,
                pricePerPiece: snackProducts.pricePerPiece,
                offerPricePerPiece: snackProducts.offerPricePerPiece,
                stock: snackProducts.stock,
                isActive: snackProducts.isActive,
                createdAt: snackProducts.createdAt,
                updatedAt: snackProducts.updatedAt,
            })
            .from(snackProducts)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(snackProducts.createdAt));
    },
    ['snack-products-list'],
    { tags: ['snack-products'], revalidate: 3600 } // Cache for 1 hour
);

// GET all products or filter by category
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const activeOnly = searchParams.get("activeOnly") === "true";

        let products = await getCachedProducts(activeOnly);

        // Filter in memory to avoid cache fragmentation by category
        if (category && category !== "All") {
            products = products.filter(p => p.category === category);
        }

        return NextResponse.json(products);
    } catch (error) {
        console.error("Fetch products error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

// POST new product
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, description, category, imageUrl, pricePerKg, offerPricePerKg, pricePerPiece, offerPricePerPiece, stock, isActive } = body;

        if (!name || !category || (!pricePerKg && !pricePerPiece)) {
            return NextResponse.json({ error: "Missing required fields (Name, Category, and at least one price)" }, { status: 400 });
        }

        const [product] = await db.insert(snackProducts).values({
            name,
            description,
            category,
            imageUrl,
            pricePerKg: pricePerKg ? parseFloat(pricePerKg) : null,
            offerPricePerKg: offerPricePerKg ? parseFloat(offerPricePerKg) : null,
            pricePerPiece: pricePerPiece ? parseInt(pricePerPiece) : null,
            offerPricePerPiece: offerPricePerPiece ? parseInt(offerPricePerPiece) : null,
            stock: parseFloat(stock || 0),
            isActive: isActive ?? true,
        }).returning();

        revalidateTag('snack-products', { expire: 0 });
        return NextResponse.json(product);
    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json({
            error: "Failed to create product",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
