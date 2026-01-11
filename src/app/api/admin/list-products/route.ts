import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackProducts } from "@/db/schema";
import { eq, isNotNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const products = await db.select().from(snackProducts).where(isNotNull(snackProducts.vendorId)).limit(50);
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
