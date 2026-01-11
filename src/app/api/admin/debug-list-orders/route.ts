import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const orders = await db.select().from(snackOrders).orderBy(desc(snackOrders.createdAt)).limit(5);
    return NextResponse.json({
        orders: orders.map(o => ({
            id: o.orderId,
            status: o.status,
            coupon: o.couponCode,
            total: o.totalAmount,
            createdAt: o.createdAt
        }))
    });
}
