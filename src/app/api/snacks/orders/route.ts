import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, snackProducts } from "@/db/schema";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

// GET all orders with filters
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const fromDate = searchParams.get("fromDate");
        const toDate = searchParams.get("toDate");

        const conditions = [];

        if (status && status !== "All") {
            conditions.push(eq(snackOrders.status, status));
        }

        if (search) {
            conditions.push(or(
                ilike(snackOrders.customerName, `%${search}%`),
                ilike(snackOrders.customerMobile, `%${search}%`),
                ilike(snackOrders.customerEmail, `%${search}%`),
                ilike(snackOrders.orderId, `%${search}%`),
                ilike(snackOrders.paymentId, `%${search}%`),
                ilike(snackOrders.shipmentId, `%${search}%`)
            ));
        }

        if (fromDate && toDate) {
            conditions.push(sql`DATE(${snackOrders.createdAt}) BETWEEN ${fromDate} AND ${toDate}`);
        }

        const orders = await db
            .select()
            .from(snackOrders)
            .where(conditions.length > 0 ? and(...conditions as any) : undefined)
            .orderBy(desc(snackOrders.createdAt));

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Fetch orders error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
