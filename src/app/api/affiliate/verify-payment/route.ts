import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { generatePassword, findBinaryPlacement, generateCouponCode } from "@/lib/affiliate-utils";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, affiliateId } = body;

        console.log("Verifying Payment for:", affiliateId);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !affiliateId) {
            return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
        }

        // Verify Signature
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);

        if (!affiliate) {
            return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
        }

        // If already paid, just return success
        if (affiliate.isPaid && affiliate.isActive) {
            return NextResponse.json({ success: true, message: "Already active" });
        }

        // Generate Credentials
        // Use existing codes if they exist (rare upgrade case), else generate.
        const couponCode = affiliate.couponCode || generateCouponCode(affiliate.fullName);
        const password = affiliate.password || generatePassword();

        // Binary Placement
        // If already has parent (upgrade case with non-paid parent?), keep it? 
        // User asked for upgrade, usually non-paid don't have binary placement.
        let parentId = affiliate.parentId;
        let position = affiliate.position;

        if (!parentId) {
            const placement = await findBinaryPlacement(affiliate.referrerId);
            parentId = placement.parentId as any;
            position = placement.position;
        }

        // Update Affiliate
        // Reset ordersSincePaid to 0 (Start from count 1 logic)
        await db.update(affiliates)
            .set({
                status: "Approved",
                isActive: true,
                isPaid: true,
                paidAt: new Date(),
                ordersSincePaid: 0,
                couponCode: couponCode,
                password: password,
                parentId: parentId,
                position: position,
            })
            .where(eq(affiliates.id, affiliateId));

        // Referrer Bonus
        if (affiliate.referrerId) {
            console.log("Processing Referrer Bonus for:", affiliate.referrerId);

            // Check if bonus already given? (Maybe check transactions). 
            // Assuming upgrade = new bonus.

            await db.insert(affiliateTransactions).values({
                affiliateId: affiliate.referrerId,
                amount: 20,
                type: 'bonus',
                description: `Referral bonus for ${affiliate.fullName} (Paid Upgrade)`,
                fromAffiliateId: affiliate.id,
                status: 'Completed'
            });

            // update referrer earnings
            const [referrer] = await db.select().from(affiliates).where(eq(affiliates.id, affiliate.referrerId)).limit(1);
            if (referrer) {
                await db.update(affiliates)
                    .set({
                        totalEarnings: (referrer.totalEarnings || 0) + 20,
                        pendingBalance: (referrer.pendingBalance || 0) + 20
                    })
                    .where(eq(affiliates.id, affiliate.referrerId));
            }
        }

        return NextResponse.json({
            success: true,
            couponCode,
            password,
            message: "Payment Verified! Account Upgraded."
        });

    } catch (error: any) {
        console.error("Payment Verification Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
