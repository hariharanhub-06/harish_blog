import { db } from "@/db";
import { contactSubmissions, snackOrders, coupons, snackReviews } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const getCount = async (table: any, condition: any) => {
            try {
                const res = await db.select({ count: count() }).from(table).where(condition);
                return res[0].count;
            } catch (e) {
                console.error(`Error fetching count for table:`, e);
                return 0;
            }
        };

        const [unreadMessages, pendingOrders, activeCoupons, pendingReviews] = await Promise.all([
            getCount(contactSubmissions, eq(contactSubmissions.status, "Fresh")),
            getCount(snackOrders, eq(snackOrders.status, "Pending Verification")),
            getCount(coupons, eq(coupons.isActive, true)),
            getCount(snackReviews, eq(snackReviews.status, "Pending"))
        ]);

        return NextResponse.json({
            unreadMessages,
            pendingOrders,
            activeCoupons,
            pendingReviews
        });
    } catch (error) {
        console.error("GET /api/admin/notifications overall error:", error);
        return NextResponse.json({
            unreadMessages: 0,
            pendingOrders: 0,
            activeCoupons: 0,
            pendingReviews: 0,
            error: "Degraded mode: Some data counts might be unavailable."
        }, { status: 200 }); // Return 200 even in error to prevent dashboard crash
    }
}
