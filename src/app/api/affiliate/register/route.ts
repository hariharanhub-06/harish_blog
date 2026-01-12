import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePassword, findBinaryPlacement } from "@/lib/affiliate-utils";
import Razorpay from "razorpay";

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

        const isPaid = !!body.isPaid;
        let razorpayOrderId = null;

        // If Paid Tier, Create Razorpay Order
        if (isPaid) {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID!,
                key_secret: process.env.RAZORPAY_KEY_SECRET!,
            });

            const options = {
                amount: 100 * 100, // ₹100 in paise
                currency: "INR",
                receipt: `aff_reg_${mobile}`,
                payment_capture: 1, // Auto capture
            };

            const order = await razorpay.orders.create(options);
            razorpayOrderId = order.id;
        }

        // Create affiliate
        // If PAID -> Status "Pending Payment", Active False. Password/Code generated AFTER payment.
        // If FREE -> Status "Pending", Active False (Admin Approval).

        const status = isPaid ? "Pending Payment" : "Pending";
        const isActive = false;

        // Helper to generate a unique coupon code (Generated early for free users, later for paid)
        const generateCouponCode = (name: string) => {
            const prefix = name.split(" ")[0].toUpperCase().slice(0, 5);
            const suffix = Math.floor(1000 + Math.random() * 9000);
            return `${prefix}${suffix}`;
        };

        // If FREE, generate code now. If PAID, generate AFTER payment.
        const couponCode = !isPaid ? generateCouponCode(fullName) : null;
        const password = !isPaid ? generatePassword() : null; // Free users get password (but inactive)

        // Find placement if paid (Actually, placement should happen AFTER payment for Paid users to avoid holes in tree)
        // For now, we will assign placement AFTER payment success in verify API.

        const [newAffiliate] = await db.insert(affiliates).values({
            fullName,
            mobile,
            upiId,
            email: email || null,
            socialLink: socialLink || null,
            referrerId: referrerId as any,
            parentId: null, // Assigned after approval/payment
            position: null,
            status,
            isActive,
            isPaid,
            paidAt: null, // Set after payment
            couponCode: couponCode,
            password: password,
        }).returning();

        if (isPaid) {
            return NextResponse.json({
                success: true,
                requirePayment: true,
                razorpayOrderId: razorpayOrderId,
                amount: 100,
                affiliateId: newAffiliate.id,
                key: process.env.RAZORPAY_KEY_ID,
                message: "Please complete payment to activate account."
            });
        }

        return NextResponse.json({
            success: true,
            requirePayment: false,
            message: "Thank you for registering! Your request is pending admin approval."
        });

    } catch (error: any) {
        console.error("Affiliate registration error:", error);
        return NextResponse.json(
            { error: `Failed to register: ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
