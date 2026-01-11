import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendorPayouts, vendors } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const vendorId = decoded.id;

        const { amount, method, upiId, notes } = await req.json();

        // 2. Validate Amount
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // 3. Check Balance
        const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId)).limit(1);
        if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

        if ((vendor.pendingBalance || 0) < amount) {
            return NextResponse.json({ error: "Insufficient pending balance" }, { status: 400 });
        }

        // 4. Create Payout Request 
        // Note: For now we create a 'Pending' entry in vendorPayouts or a separate requests table if it existed.
        // Based on schema, vendorPayouts seems to be for COMPLETED transactions mostly, but we can use it with status 'Pending'.

        await db.insert(vendorPayouts).values({
            vendorId,
            amount,
            method: method || "UPI",
            status: "Pending", // Admin needs to approve
            notes: `Request via Portal. UPI: ${upiId}. Notes: ${notes}`,
        });

        // Optional: Deduct from pending immediately? Or wait for approval?
        // Usually, we deduct when approved OR hold it. 
        // For simplicity, let's NOT deduct yet, just create the request. Admin will deduct when marking as Paid.

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Payout request error:", error);
        return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }
}
