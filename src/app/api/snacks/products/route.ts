import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackProducts } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

import { unstable_cache, revalidateTag } from "next/cache";

// GET all products or filter by category
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const activeOnly = searchParams.get("activeOnly") === "true";

        const conditions = [];
        if (activeOnly) {
            conditions.push(eq(snackProducts.isActive, true));
        }

        let products = await db
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
                productCost: snackProducts.productCost,
                packagingCost: snackProducts.packagingCost,
                otherCharges: snackProducts.otherCharges,
                affiliateDiscountPercent: snackProducts.affiliateDiscountPercent,
                affiliatePoolPercent: snackProducts.affiliatePoolPercent,
                length: snackProducts.length,
                width: snackProducts.width,
                height: snackProducts.height,
                weight: snackProducts.weight,
                vendorId: snackProducts.vendorId,
                dimensionTiers: snackProducts.dimensionTiers,
                gstPercent: snackProducts.gstPercent, // Added GST field
            })
            .from(snackProducts)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(snackProducts.createdAt));

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
        const {
            name, description, category, imageUrl,
            pricePerKg, offerPricePerKg, pricePerPiece, offerPricePerPiece,
            stock, isActive,
            productCost, packagingCost, otherCharges, affiliateDiscountPercent, affiliatePoolPercent,
            length, width, height, weight, vendorId, dimensionTiers, gstPercent
        } = body;

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
            productCost: parseFloat(productCost || 0),
            packagingCost: parseFloat(packagingCost || 0),
            otherCharges: parseFloat(otherCharges || 0),
            affiliateDiscountPercent: parseFloat(affiliateDiscountPercent || 0),
            affiliatePoolPercent: parseFloat(affiliatePoolPercent || 60),
            gstPercent: parseFloat(gstPercent || 5), // Default to 5%
            length: parseFloat(length || 1),
            width: parseFloat(width || 1),
            height: parseFloat(height || 1),
            weight: parseFloat(weight || 0.5),
            vendorId: vendorId || null,
            dimensionTiers: dimensionTiers || null,
        }).returning();

        revalidateTag('snack-products');
        return NextResponse.json(product);
    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json({
            error: "Failed to create product",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
