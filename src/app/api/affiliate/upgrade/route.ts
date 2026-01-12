import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { affiliateId } = await req.json();

        if (!affiliateId) {
            return NextResponse.json({ error: "Affiliate ID is required" }, { status: 400 });
        }

        // 1. Fetch Affiliate
        const [affiliate] = await db
            .select()
            .from(affiliates)
            .where(eq(affiliates.id, affiliateId))
            .limit(1);

        if (!affiliate) {
            return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
        }

        if (affiliate.isPaid) {
            return NextResponse.json({ error: "Affiliate is already a paid member" }, { status: 400 });
        }

        // 2. Perform Upgrade
        await db.update(affiliates)
            .set({
                isPaid: true,
                paidAt: new Date(),
            })
            .where(eq(affiliates.id, affiliateId));

        // 3. Reward Referrer ₹20 Bonus
        if (affiliate.referrerId) {
            await db.insert(affiliateTransactions).values({
                affiliateId: affiliate.referrerId,
                amount: 20,
                type: 'bonus',
                description: `Upgrade bonus for ${affiliate.fullName} becoming Paid Affiliate`,
                fromAffiliateId: affiliate.id,
                status: 'Completed'
            });

            // Update referrer's earnings
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
            message: "Congratulations! You are now a Paid Affiliate. Your tier upgrades are now unlocked."
        });

    } catch (error) {
        console.error("Affiliate upgrade error:", error);
        return NextResponse.json({ error: "Failed to process upgrade" }, { status: 500 });
    }
}
