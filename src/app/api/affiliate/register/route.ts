import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePassword, findBinaryPlacement } from "@/lib/affiliate-utils";

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

        // Create affiliate
        const isPaid = !!body.isPaid;
        const status = isPaid ? "Approved" : "Pending";
        const isActive = isPaid;

        // Helper to generate a unique coupon code
        const generateCouponCode = (name: string) => {
            const prefix = name.split(" ")[0].toUpperCase().slice(0, 5);
            const suffix = Math.floor(1000 + Math.random() * 9000);
            return `${prefix}${suffix}`;
        };

        const couponCode = isPaid ? generateCouponCode(fullName) : null;
        const password = isPaid ? generatePassword() : null;

        // Find placement if paid
        let parentIdToSet = null;
        let positionToSet = null;
        if (isPaid) {
            const placement = await findBinaryPlacement(referrerId);
            parentIdToSet = placement.parentId;
            positionToSet = placement.position;
        }

        const [newAffiliate] = await db.insert(affiliates).values({
            fullName,
            mobile,
            upiId,
            email: email || null,
            socialLink: socialLink || null,
            referrerId: referrerId as any,
            parentId: parentIdToSet as any,
            position: positionToSet,
            status,
            isActive,
            isPaid,
            paidAt: isPaid ? new Date() : null,
            couponCode: couponCode,
            password: password,
        }).returning();

        // If paid, give ₹20 bonus to referrer
        if (isPaid && referrerId) {
            await db.insert(affiliateTransactions).values({
                affiliateId: referrerId,
                amount: 20,
                type: 'bonus',
                description: `Referral bonus for ${fullName} joining as Paid Affiliate`,
                fromAffiliateId: newAffiliate.id,
                status: 'Completed'
            });

            // Update referrer's earnings
            const [referrer] = await db.select().from(affiliates).where(eq(affiliates.id, referrerId)).limit(1);
            if (referrer) {
                await db.update(affiliates)
                    .set({
                        totalEarnings: (referrer.totalEarnings || 0) + 20,
                        pendingBalance: (referrer.pendingBalance || 0) + 20
                    })
                    .where(eq(affiliates.id, referrerId));
            }
        }

        return NextResponse.json({
            success: true,
            message: isPaid
                ? `Welcome! Your account is active. \nCoupon Code: ${couponCode}\nLogin Password: ${password}\n\nPlease save your password for future login.`
                : "Thank you for registering! Your request is pending admin approval."
        });

    } catch (error: any) {
        console.error("Affiliate registration error:", error);
        return NextResponse.json(
            { error: `Failed to register: ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
