import { db } from "@/db";
import { contactSubmissions, snackOrders, coupons } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [unreadMessages, pendingOrders, activeCoupons] = await Promise.all([
            db.select({ count: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, "Fresh")),
            db.select({ count: count() }).from(snackOrders).where(eq(snackOrders.status, "Pending Verification")),
            db.select({ count: count() }).from(coupons).where(eq(coupons.isActive, true))
        ]);

        return NextResponse.json({
            unreadMessages: unreadMessages[0].count,
            pendingOrders: pendingOrders[0].count,
            activeCoupons: activeCoupons[0].count
        });
    } catch (error) {
        console.error("GET /api/admin/notifications error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
