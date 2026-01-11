import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackProducts } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
    try {
        const productIds = [
            "ef72c061-7c42-40a8-9cb1-bfa07de50a38", // INIPPU SEVVU
            "199d174d-c286-410d-8eeb-492d88ca0c9e"  // KAARA SEVVU
        ];

        await db.update(snackProducts)
            .set({
                productCost: 50,
                packagingCost: 10,
                otherCharges: 5,
                affiliatePoolPercent: 60
            })
            .where(inArray(snackProducts.id, productIds));

        return NextResponse.json({ success: true, message: "Product costs fixed for test items" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
