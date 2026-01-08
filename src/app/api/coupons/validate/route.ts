import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        const [coupon] = await db
            .select()
            .from(coupons)
            .where(
                and(
                    eq(coupons.code, code.toUpperCase()),
                    eq(coupons.isActive, true)
                )
            );

        if (!coupon) {
            return NextResponse.json({ valid: false, message: "Invalid or expired coupon code" }, { status: 404 });
        }

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
