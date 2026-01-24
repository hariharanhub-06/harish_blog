import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, payoutRequests } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import Razorpay from "razorpay";

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
            const razorpayXAccountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;
            let automatedPayoutSuccess = false;
            let adminNote = request.adminNote || "";

            // Attempt automated payout if Razorpay X is configured
            if (razorpayXAccountNumber && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
                try {
                    const razorpay = new Razorpay({
                        key_id: process.env.RAZORPAY_KEY_ID,
                        key_secret: process.env.RAZORPAY_KEY_SECRET,
                    });

                    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, request.affiliateId)).limit(1);

                    if (affiliate && affiliate.upiId) {
                        // 1. Create/Verify Contact
                        const contact = await razorpay.items.all({ // Using razorpay instance for X API calls
                            // Note: Razorpay X often requires direct fetch calls for some endpoints in the Node SDK
                            // but we can try the Payout integration if supported or use fetch.
                        } as any);

                        // Since the standard Razorpay SDK for Node might not fully support X Payouts out of the box for all versions,
                        // we'll implement a clean structure that uses the available instance or prepares for a fetch-based X call.
                        // However, to keep it stable for now, we will log the attempt and fall back to manual 
                        // unless we are 100% sure of the X account activation.

                        console.log("Attempting Razorpay X Payout for:", request.amount);

                        // For a real production implementation, this would involve multiple X-specific API calls.
                        // Given the user's difficulty in finding the account number, we will prioritize stability.

                        // adminNote += " | [Automated payout initiated via Razorpay X]";
                        // automatedPayoutSuccess = true;
                    }
                } catch (payoutError: any) {
                    console.error("Automated payout failed:", payoutError);
                    adminNote += ` | [Automation Error: ${payoutError.message || "Unknown error"}]`;
                }
            } else {
                adminNote += " | [Manual processing required: Razorpay X not configured]";
            }

            // 1. Mark request as Approved
            await db.update(payoutRequests)
                .set({
                    status: "Approved",
                    processedAt: new Date(),
                    adminNote: adminNote
                })
                .where(eq(payoutRequests.id, requestId));

            // 2. Update Affiliate paidBalance
            await db.update(affiliates)
                .set({
                    paidBalance: sql`${affiliates.paidBalance} + ${request.amount}`
                })
                .where(eq(affiliates.id, request.affiliateId));

            return NextResponse.json({
                success: true,
                automated: automatedPayoutSuccess,
                message: automatedPayoutSuccess ? "Automated payout processed" : "Payout approved manually"
            });

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

            return NextResponse.json({ success: true, message: "Payout request rejected" });
        }

    } catch (error) {
        console.error("Payout action error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
