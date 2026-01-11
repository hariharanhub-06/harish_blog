import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackProducts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const products = await db.select().from(snackProducts).orderBy(desc(snackProducts.createdAt));
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, vendorId, ...updates } = body;

        if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

        await db.update(snackProducts)
            .set({
                vendorId: vendorId || null,
                ...updates
            })
            .where(eq(snackProducts.id, id));

        return NextResponse.json({ success: true, message: "Product updated" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
