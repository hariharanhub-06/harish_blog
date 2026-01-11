import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fullName, mobile, upiId, email, socialLink, referrerCode } = body;

        // Validate required fields
        if (!fullName || !mobile || !upiId) {
            return NextResponse.json(
                { error: "Full name, mobile number, and UPI ID are required" },
                { status: 400 }
            );
        }

        // Validate mobile number format (10 digits)
        if (!/^\d{10}$/.test(mobile)) {
            return NextResponse.json(
                { error: "Invalid mobile number. Please enter 10 digits." },
                { status: 400 }
            );
        }

        // Check if mobile already exists
        const existing = await db.select().from(affiliates).where(eq(affiliates.mobile, mobile));
        if (existing.length > 0) {
            return NextResponse.json(
                { error: "This mobile number is already registered" },
                { status: 400 }
            );
        }

        // Find referrer if code exists
        let referrerId = null;
        if (referrerCode) {
            const referrer = await db
                .select({ id: affiliates.id })
                .from(affiliates)
                .where(eq(affiliates.couponCode, referrerCode.toUpperCase()));

            if (referrer.length > 0) {
                referrerId = referrer[0].id;
            }
        }

        // Create affiliate with pending status
        await db.insert(affiliates).values({
            fullName,
            mobile,
            upiId,
            email: email || null,
            socialLink: socialLink || null,
            referrerId: referrerId as any,
            status: "Pending",
            isActive: false,
        });

        return NextResponse.json({
            success: true,
            message: "Thank you for registering! Your affiliate code will be shared with you within 24 hours."
        });

    } catch (error) {
        console.error("Affiliate registration error:", error);
        return NextResponse.json(
            { error: "Failed to register. Please try again." },
            { status: 500 }
        );
    }
}
