
import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, snackProducts, affiliates } from "@/db/schema";

export async function GET() {
    const allVendors = await db.select().from(vendors);
    const allProducts = await db.select().from(snackProducts);
    const allAffiliates = await db.select().from(affiliates);

    return NextResponse.json({
        vendors: allVendors,
        products: allProducts,
        affiliates: allAffiliates
    });
}
