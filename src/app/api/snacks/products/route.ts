import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackProducts } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET all products or filter by category
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const activeOnly = searchParams.get("activeOnly") === "true";

        const query = db.select().from(snackProducts);

        const conditions = [];
        if (category && category !== "All") {
            conditions.push(eq(snackProducts.category, category));
        }
        if (activeOnly) {
            conditions.push(eq(snackProducts.isActive, true));
        }

        const products = await db
            .select()
            .from(snackProducts)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(snackProducts.createdAt));

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
        const { name, description, category, imageUrl, pricePerKg, stock, isActive } = body;

        if (!name || !category || !pricePerKg) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [product] = await db.insert(snackProducts).values({
            name,
            description,
            category,
            imageUrl,
            pricePerKg: parseInt(pricePerKg),
            stock: parseInt(stock || 0),
            isActive: isActive ?? true,
        }).returning();

        return NextResponse.json(product);
    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
