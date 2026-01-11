import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorPayouts, orderShipments } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

// GET - Fetch all vendors with settlement stats or payout history
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const vendorId = searchParams.get("vendorId");

        if (vendorId) {
            // Fetch payout history for this vendor
            const history = await db
                .select()
                .from(vendorPayouts)
                .where(eq(vendorPayouts.vendorId, vendorId))
                .orderBy(desc(vendorPayouts.createdAt));
            return NextResponse.json(history);
        }

        const allVendors = await db
            .select({
                id: vendors.id,
                name: vendors.name,
                email: vendors.email,
                totalEarnings: vendors.totalEarnings,
                paidAmount: vendors.paidAmount,
                pendingBalance: vendors.pendingBalance,
                bankDetails: vendors.bankDetails,
                phone: vendors.phone,
            })
            .from(vendors);

        return NextResponse.json(allVendors);
    } catch (error) {
        console.error("Fetch vendor settlements error:", error);
        return NextResponse.json({ error: "Failed to fetch vendor settlements" }, { status: 500 });
    }
}

// POST - Record a payout
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { vendorId, amount, paymentId, method, notes } = body;

        if (!vendorId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Double check vendor exists
        const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId)).limit(1);
        if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

        // 2. Record Transaction
        const [payout] = await db.insert(vendorPayouts).values({
            vendorId,
            amount: Number(amount),
            paymentId,
            method: method || "UPI",
            notes,
            status: "Completed",
            createdAt: new Date()
        }).returning();

        // 3. Update Vendor Balance
        await db.update(vendors)
            .set({
                paidAmount: sql`${vendors.paidAmount} + ${Number(amount)}`,
                pendingBalance: sql`${vendors.pendingBalance} - ${Number(amount)}`,
            })
            .where(eq(vendors.id, vendorId));

        return NextResponse.json({ success: true, payout });
    } catch (error) {
        console.error("Create payout error:", error);
        return NextResponse.json({ error: "Failed to record payout" }, { status: 500 });
    }
}
