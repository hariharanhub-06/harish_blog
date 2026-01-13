import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, payoutRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { affiliateId, amount, upiId } = body;

        if (!affiliateId || !amount || !upiId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Verify affiliate and balance
        const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);

        if (!affiliate) {
            return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
        }

        if (Number(affiliate.availableBalance) < Number(amount)) {
            return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }

        if (Number(amount) < 500) {
            return NextResponse.json({ error: "Minimum payout is ₹500" }, { status: 400 });
        }

        // 2. Check for existing pending payout
        const [existingPending] = await db
            .select()
            .from(payoutRequests)
            .where(and(eq(payoutRequests.affiliateId, affiliateId), eq(payoutRequests.status, "Pending")))
            .limit(1);

        if (existingPending) {
            return NextResponse.json({ error: "You already have a pending payout request" }, { status: 400 });
        }

        // 3. Create request
        await db.insert(payoutRequests).values({
            affiliateId,
            amount: Number(amount),
            upiId,
            status: "Pending"
        });

        // 4. Update available balance (lock it)
        await db.update(affiliates)
            .set({
                availableBalance: sql`${affiliates.availableBalance} - ${Number(amount)}`
            })
            .where(eq(affiliates.id, affiliateId));

        return NextResponse.json({ success: true, message: "Payout request submitted successfully" });

    } catch (error) {
        console.error("Payout request error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { sql } from "drizzle-orm";
