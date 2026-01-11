import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { mobile, couponCode } = body;

        if (!mobile || !couponCode) {
            return NextResponse.json(
                { error: "Mobile number and Coupon code are required" },
                { status: 400 }
            );
        }

        // Search for affiliate with matching mobile and coupon code
        // We use sql`UPPER` to be case-insensitive for the coupon code
        const results = await db
            .select()
            .from(affiliates)
            .where(
                and(
                    eq(affiliates.mobile, mobile),
                    sql`UPPER(${affiliates.couponCode}) = UPPER(${couponCode})`,
                    eq(affiliates.status, 'Approved')
                )
            );

        if (results.length === 0) {
            return NextResponse.json(
                { error: "Invalid credentials or account not yet approved." },
                { status: 401 }
            );
        }

        const affiliate = results[0];

        // For simplicity, we return the affiliate data. 
        // In a production app, you'd set a JWT cookie here.
        return NextResponse.json({
            success: true,
            affiliate: {
                id: affiliate.id,
                fullName: affiliate.fullName,
                couponCode: affiliate.couponCode,
            }
        });

    } catch (error) {
        console.error("Affiliate login error:", error);
        return NextResponse.json(
            { error: "Login failed. Please try again." },
            { status: 500 }
        );
    }
}
