import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, payoutRequests } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
    try {
        const payouts = await db.execute(sql`
            SELECT p.*, a.full_name as "affiliateName"
            FROM payout_requests p
            JOIN affiliates a ON p.affiliate_id = a.id
            ORDER BY p.created_at DESC
        `);

        return NextResponse.json(payouts.rows);
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
            // Note: We already deducted from pendingBalance when request was created.
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

            // 2. Add amount back to pendingBalance
            await db.update(affiliates)
                .set({
                    pendingBalance: sql`${affiliates.pendingBalance} + ${request.amount}`
                })
                .where(eq(affiliates.id, request.affiliateId));
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Payout action error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
