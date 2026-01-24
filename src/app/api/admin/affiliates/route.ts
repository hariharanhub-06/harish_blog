import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, snackOrders, affiliateTransactions, payoutRequests } from "@/db/schema";
import { eq, desc, sql, count, or, and, inArray } from "drizzle-orm";
import { generatePassword, findBinaryPlacement, generateCouponCode } from "@/lib/affiliate-utils";
import { getAffiliateTier } from "@/lib/affiliate-tiers";
import { sendAffiliateCredentialsEmail } from "@/lib/mail";


// GET - Fetch all affiliates with stats
export async function GET() {
    try {
        const allAffiliates = await db
            .select({
                id: affiliates.id,
                fullName: affiliates.fullName,
                mobile: affiliates.mobile,
                password: affiliates.password,
                upiId: affiliates.upiId,
                email: affiliates.email,
                socialLink: affiliates.socialLink,
                couponCode: affiliates.couponCode,
                referrerId: affiliates.referrerId,
                parentId: affiliates.parentId,
                position: affiliates.position,
                status: affiliates.status,
                isActive: affiliates.isActive,
                totalOrders: affiliates.totalOrders,
                totalSalesAmount: affiliates.totalSalesAmount,
                totalEarnings: affiliates.totalEarnings,
                directEarnings: affiliates.directEarnings,
                level1Earnings: affiliates.level1Earnings,
                level2Earnings: affiliates.level2Earnings,
                level3Earnings: affiliates.level3Earnings,
                pendingBalance: affiliates.pendingBalance,
                availableBalance: affiliates.availableBalance,
                paidBalance: affiliates.paidBalance,
                currentTier: affiliates.currentTier,
                createdAt: affiliates.createdAt,
                approvedAt: affiliates.approvedAt,
            })
            .from(affiliates)
            .orderBy(desc(affiliates.createdAt));

        return NextResponse.json(allAffiliates);
    } catch (error) {
        console.error("Fetch affiliates error:", error);
        return NextResponse.json({ error: "Failed to fetch affiliates" }, { status: 500 });
    }
}

// POST - Approve/Reject affiliate
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, action } = body;

        if (!id || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (action === "approve") {
            // Get current affiliate details (especially referrerId)
            const [current] = await db.select().from(affiliates).where(eq(affiliates.id, id));
            if (!current) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });

            // 1. Generate unique coupon code
            let couponCode = generateCouponCode();
            let exists = await db.select().from(affiliates).where(eq(affiliates.couponCode, couponCode));
            while (exists.length > 0) {
                couponCode = generateCouponCode();
                exists = await db.select().from(affiliates).where(eq(affiliates.couponCode, couponCode));
            }

            // 2. Generate random password
            const password = generatePassword();

            // 3. Binary Placement Logic
            const { parentId, position } = await findBinaryPlacement(current.referrerId);

            // 4. Update affiliate (Safety check: parentId cannot be current id)
            if (parentId === id) {
                console.error(`Attempted to set self-reference for affiliate ${id}. Forcing parent to NULL.`);
            }

            const [updated] = await db
                .update(affiliates)
                .set({
                    status: "Approved",
                    isActive: true,
                    isPaid: false, // Admin approval means skip payment
                    couponCode: couponCode,
                    password: password,
                    parentId: parentId === id ? null : parentId,
                    position: position,
                    approvedAt: new Date(),
                })
                .where(eq(affiliates.id, id))
                .returning();

            // Send Automated Email with Credentials
            if (updated.email) {
                try {
                    await sendAffiliateCredentialsEmail(
                        updated.email,
                        updated.fullName,
                        couponCode,
                        password
                    );
                } catch (emailError) {
                    console.error("Failed to send credentials email:", emailError);
                    // We don't fail the approval if email fails, but log it
                }
            }

            return NextResponse.json({
                success: true,
                affiliate: updated,
                message: "Affiliate approved with password and placement. Credentials email sent."
            });

        } else if (action === "reject") {
            await db
                .update(affiliates)
                .set({ status: "Rejected", isActive: false })
                .where(eq(affiliates.id, id));

            return NextResponse.json({
                success: true,
                message: "Affiliate rejected"
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Approve/Reject affiliate error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}

// PUT - Sync Affiliate Stats (Recalculate from orders and transactions)
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) return NextResponse.json({ error: "Missing affiliate ID" }, { status: 400 });

        const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id)).limit(1);
        if (!affiliate) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });

        // 1. Recalculate Order Stats (Orders using this coupon)
        const [orderStats] = await db
            .select({
                totalOrders: count(),
                totalSalesAmount: sql<number>`COALESCE(SUM(${snackOrders.totalAmount}), 0)`,
            })
            .from(snackOrders)
            .where(
                sql`UPPER(TRIM(${snackOrders.couponCode})) = UPPER(TRIM(${affiliate.couponCode})) 
                AND ${snackOrders.status} != 'Cancel'`
            );

        const orderCount = Number(orderStats.totalOrders) || 0;
        const salesAmount = Number(orderStats.totalSalesAmount) || 0;

        // 2. Recalculate Earnings from Transactions
        const earningsStats = await db
            .select({
                type: affiliateTransactions.type,
                amount: sql<number>`COALESCE(SUM(${affiliateTransactions.amount}), 0)`,
            })
            .from(affiliateTransactions)
            .where(eq(affiliateTransactions.affiliateId, id))
            .groupBy(affiliateTransactions.type);

        let direct = 0, l1 = 0, l2 = 0, l3 = 0;
        earningsStats.forEach(s => {
            if (s.type === 'direct') direct = s.amount;
            else if (s.type === 'level1') l1 = s.amount;
            else if (s.type === 'level2') l2 = s.amount;
            else if (s.type === 'level3') l3 = s.amount;
        });

        const totalEarnings = direct + l1 + l2 + l3;

        // 3. Update Tier
        // For paid affiliates, use ordersSincePaid for tier calculation
        // But for admin display, we might want to show total? No, show effective tier base.
        const tierBasis = !!affiliate.isPaid ? (affiliate.ordersSincePaid || 0) : orderCount;
        const tierObj = getAffiliateTier(tierBasis, !!affiliate.isPaid);
        const tier = tierObj.name;

        // 4. Final Update
        await db
            .update(affiliates)
            .set({
                totalOrders: orderCount,
                totalSalesAmount: salesAmount,
                totalEarnings: totalEarnings,
                directEarnings: direct,
                level1Earnings: l1,
                level2Earnings: l2,
                level3Earnings: l3,
                currentTier: tier,
            })
            .where(eq(affiliates.id, id));

        // 4. Smart Balance Recalculation
        // Get all transactions
        const allTxs = await db.select({
            amount: affiliateTransactions.amount,
            orderId: affiliateTransactions.orderId
        }).from(affiliateTransactions).where(eq(affiliateTransactions.affiliateId, id));

        // Get unique order IDs
        const orderIds = allTxs.map(t => t.orderId).filter((oid): oid is string => !!oid);
        const uniqueOrderIds = [...new Set(orderIds)];

        let deliveredOrderIds: string[] = [];
        if (uniqueOrderIds.length > 0) {
            const deliveredOrders = await db.select({ orderId: snackOrders.orderId })
                .from(snackOrders)
                .where(and(
                    inArray(snackOrders.orderId, uniqueOrderIds),
                    eq(snackOrders.status, "Delivered")
                ));
            deliveredOrderIds = deliveredOrders.map(o => o.orderId);
        }

        let calculatedAvailableTotal = 0;
        let calculatedPendingTotal = 0;

        for (const tx of allTxs) {
            if (tx.orderId && deliveredOrderIds.includes(tx.orderId)) {
                calculatedAvailableTotal += Number(tx.amount);
            } else {
                calculatedPendingTotal += Number(tx.amount);
            }
        }

        // Subtract already paid balance from available
        const finalAvailable = Math.max(0, calculatedAvailableTotal - Number(affiliate.paidBalance || 0));

        await db.update(affiliates)
            .set({
                availableBalance: finalAvailable,
                pendingBalance: calculatedPendingTotal
            })
            .where(eq(affiliates.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Sync affiliate error:", error);
        return NextResponse.json({ error: "Failed to sync stats" }, { status: 500 });
    }
}

// PATCH - Update Affiliate Profile
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, fullName, mobile, upiId, email, socialLink, password, currentTier } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await db
            .update(affiliates)
            .set({
                fullName,
                mobile,
                upiId,
                email,
                socialLink,
                password,
                currentTier
            })
            .where(eq(affiliates.id, id));

        return NextResponse.json({ success: true, message: "Profile updated" });
    } catch (error) {
        console.error("Update affiliate error:", error);
        return NextResponse.json({ error: "Failed to update affiliate" }, { status: 500 });
    }
}

// DELETE - Remove affiliate with Roll-up logic
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing affiliate ID" }, { status: 400 });
        }

        // 1. Fetch affiliate to get their parentId
        const [affiliate] = await db.select({
            id: affiliates.id,
            parentId: affiliates.parentId
        }).from(affiliates).where(eq(affiliates.id, id)).limit(1);
        if (!affiliate) {
            return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
        }

        const oldParentId = affiliate.parentId;

        // 2. Cleanup related data to avoid FK errors
        // Delete transactions where they are the recipient or the source
        await db.delete(affiliateTransactions).where(
            or(
                eq(affiliateTransactions.affiliateId, id),
                eq(affiliateTransactions.fromAffiliateId, id)
            )
        );

        // Delete payout requests
        await db.delete(payoutRequests).where(eq(payoutRequests.affiliateId, id));

        // Update direct referrals to have no referrer
        await db.update(affiliates).set({ referrerId: null }).where(eq(affiliates.referrerId, id));

        // 3. Roll-up children: Move direct binary children to the deleted person's parent
        await db
            .update(affiliates)
            .set({ parentId: oldParentId })
            .where(eq(affiliates.parentId, id));

        // 4. Delete the record
        await db.delete(affiliates).where(eq(affiliates.id, id));

        return NextResponse.json({
            success: true,
            message: "Affiliate deleted and tree rolled up successfully."
        });

    } catch (error: any) {
        console.error("Delete affiliate error:", error);
        return NextResponse.json({
            error: "Failed to delete affiliate",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
