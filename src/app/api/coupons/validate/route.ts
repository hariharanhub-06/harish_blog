import { db } from "@/db";
import { affiliates, coupons } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code")?.toUpperCase() || "";

        if (!code) {
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        // 1. Check Standard Coupons
        const [coupon] = await db
            .select()
            .from(coupons)
            .where(and(eq(coupons.code, code), eq(coupons.isActive, true)));

        if (coupon) {
            return NextResponse.json({
                valid: true,
                code: coupon.code,
                discountValue: coupon.discountValue,
                discountType: coupon.discountType,
                type: 'standard'
            });
        }

        // 2. Check Affiliate Coupons
        const [affiliate] = await db
            .select()
            .from(affiliates)
            .where(and(sql`UPPER(${affiliates.couponCode}) = ${code}`, eq(affiliates.status, 'Approved')));

        if (affiliate) {
            return NextResponse.json({
                valid: true,
                code: affiliate.couponCode,
                discountValue: 0, // Dynamic per product
                discountType: 'percentage',
                type: 'affiliate'
            });
        }

        return NextResponse.json({ valid: false, message: "Invalid or expired coupon code" }, { status: 404 });

        return NextResponse.json({
            valid: true,
            discountValue: coupon.discountValue,
            discountType: coupon.discountType,
        });
    } catch (error) {
        console.error("GET /api/coupons/validate error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
