import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, snackOrders } from "@/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";

// Helper function to generate unique coupon code
function generateCouponCode(): string {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
    return `HMS${randomNum}`;
}

// Helper function to calculate tier based on order count
function calculateTier(orderCount: number) {
    if (orderCount >= 200) return { tier: "Elite", rate: 0.20 };
    if (orderCount >= 180) return { tier: "Pro", rate: 0.18 };
    if (orderCount >= 150) return { tier: "Platinum", rate: 0.15 };
    if (orderCount >= 100) return { tier: "Golden", rate: 0.12 };
    if (orderCount >= 51) return { tier: "Silver", rate: 0.10 };
    if (orderCount >= 21) return { tier: "Starter", rate: 0.08 };
    return { tier: "Newbie", rate: 0.06 };
}

// Helper to generate a random password
function generatePassword(): string {
    return Math.random().toString(36).slice(-8); // 8 characters
}

// Binary placement logic: Find the first available position in the tree under a specific affiliate
async function findBinaryPlacement(referrerId: string | null): Promise<{ parentId: string | null, position: 'left' | 'right' | null }> {
    if (!referrerId) {
        // If no referrer, check if there's any affiliate in the system
        const countRes = await db.select({ count: count() }).from(affiliates);
        if (Number(countRes[0].count) === 0) return { parentId: null, position: null }; // First affiliate is root

        // If not first, find the very first root (one with no parent)
        const roots = await db.select({ id: affiliates.id }).from(affiliates).where(sql`parent_id IS NULL`);
        if (roots.length > 0) referrerId = roots[0].id;
        else return { parentId: null, position: null };
    }

    // BFS to find the first available slot
    let queue = [referrerId];
    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const children = await db
            .select({ id: affiliates.id, position: affiliates.position })
            .from(affiliates)
            .where(eq(affiliates.parentId, currentId));

        const hasLeft = children.find(c => c.position === 'left');
        const hasRight = children.find(c => c.position === 'right');

        if (!hasLeft) return { parentId: currentId, position: 'left' };
        if (!hasRight) return { parentId: currentId, position: 'right' };

        // Both children exist, add them to queue to check their children
        queue.push(hasLeft.id, hasRight.id);
    }

    return { parentId: null, position: null };
}

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

            // 4. Update affiliate
            const [updated] = await db
                .update(affiliates)
                .set({
                    status: "Approved",
                    isActive: true,
                    couponCode: couponCode,
                    password: password,
                    parentId: parentId,
                    position: position,
                    approvedAt: new Date(),
                })
                .where(eq(affiliates.id, id))
                .returning();

            return NextResponse.json({
                success: true,
                affiliate: updated,
                message: "Affiliate approved with password and placement"
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

// PUT - Update affiliate stats (called periodically or on order placement)
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing affiliate ID" }, { status: 400 });
        }

        // Get affiliate
        const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));

        if (!affiliate || !affiliate.couponCode) {
            return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
        }

        // Calculate total orders using this coupon code
        const [orderStats] = await db
            .select({
                totalOrders: count(),
                totalRevenue: sql<number>`COALESCE(SUM(${snackOrders.totalAmount}), 0)`,
            })
            .from(snackOrders)
            .where(
                sql`UPPER(TRIM(${snackOrders.couponCode})) = UPPER(TRIM(${affiliate.couponCode})) 
                AND ${snackOrders.status} != 'Cancel'`
            );

        const orderCount = Number(orderStats.totalOrders) || 0;
        const revenue = Number(orderStats.totalRevenue) || 0;

        // Calculate tier and commission
        const { tier, rate } = calculateTier(orderCount);
        const commission = revenue * rate;

        // Update affiliate
        await db
            .update(affiliates)
            .set({
                totalOrders: orderCount,
                totalSalesAmount: revenue,
                totalEarnings: commission,
                currentTier: tier,
            })
            .where(eq(affiliates.id, id));

        return NextResponse.json({
            success: true,
            stats: {
                totalOrders: orderCount,
                totalRevenue: revenue,
                totalEarnings: commission,
                currentTier: tier,
                commissionRate: rate * 100,
            }
        });

    } catch (error) {
        console.error("Update affiliate stats error:", error);
        return NextResponse.json({ error: "Failed to update stats" }, { status: 500 });
    }
}

// DELETE - Remove affiliate
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing affiliate ID" }, { status: 400 });
        }

        await db.delete(affiliates).where(eq(affiliates.id, id));

        return NextResponse.json({ success: true, message: "Affiliate deleted" });

    } catch (error) {
        console.error("Delete affiliate error:", error);
        return NextResponse.json({ error: "Failed to delete affiliate" }, { status: 500 });
    }
}
