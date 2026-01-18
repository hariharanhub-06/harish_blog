import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, payoutRequests } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
    try {
        const payouts = await db.select({
            id: payoutRequests.id,
            affiliateId: payoutRequests.affiliateId,
            amount: payoutRequests.amount,
            status: payoutRequests.status,
            upiId: payoutRequests.upiId,
            adminNote: payoutRequests.adminNote,
            processedAt: payoutRequests.processedAt,
            createdAt: payoutRequests.createdAt,
            affiliateName: affiliates.fullName,
        })
            .from(payoutRequests)
            .leftJoin(affiliates, eq(payoutRequests.affiliateId, affiliates.id))
            .orderBy(desc(payoutRequests.createdAt));

        return NextResponse.json(payouts);
    } catch (error) {
        console.error("Fetch payouts error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { requestId, action } = await req.json();

        if (!requestId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [request] = await db.select().from(payoutRequests).where(eq(payoutRequests.id, requestId)).limit(1);
        if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

        if (request.status !== "Pending") {
            return NextResponse.json({ error: "Request already processed" }, { status: 400 });
        }

        if (action === "approve") {
            // 1. Mark request as Approved
            await db.update(payoutRequests)
                .set({ status: "Approved", processedAt: new Date() })
                .where(eq(payoutRequests.id, requestId));

            // 2. Update Affiliate paidBalance
            await db.update(affiliates)
                .set({
                    paidBalance: sql`${affiliates.paidBalance} + ${request.amount}`
                })
                .where(eq(affiliates.id, request.affiliateId));
        } else {
            // 1. Mark request as Rejected
            await db.update(payoutRequests)
                .set({ status: "Rejected", processedAt: new Date() })
                .where(eq(payoutRequests.id, requestId));

            // 2. Add amount back to availableBalance
            await db.update(affiliates)
                .set({
                    availableBalance: sql`${affiliates.availableBalance} + ${request.amount}`
                })
                .where(eq(affiliates.id, request.affiliateId));
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Payout action error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
