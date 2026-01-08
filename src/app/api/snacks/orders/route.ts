import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackOrders, snackProducts } from "@/db/schema";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";

// GET all orders with filters and pagination
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const fromDate = searchParams.get("fromDate");
        const toDate = searchParams.get("toDate");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");
        const lean = searchParams.get("lean") === "true";

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

        const where = conditions.length > 0 ? and(...conditions as any) : undefined;

        // Get total count for pagination
        const [{ total }] = await db
            .select({ total: count() })
            .from(snackOrders)
            .where(where);

        // Selection - exclude items if lean is true to save bandwidth
        const selection = lean ? {
            id: snackOrders.id,
            orderId: snackOrders.orderId,
            customerName: snackOrders.customerName,
            customerMobile: snackOrders.customerMobile,
            status: snackOrders.status,
            totalAmount: snackOrders.totalAmount,
            createdAt: snackOrders.createdAt,
            paymentMethod: snackOrders.paymentMethod,
            paymentId: snackOrders.paymentId,
        } : undefined;

        const query = db
            .select(selection as any)
            .from(snackOrders)
            .where(where)
            .orderBy(desc(snackOrders.createdAt))
            .limit(limit)
            .offset(offset);

        const orders = await query;

        return NextResponse.json({
            orders,
            pagination: {
                total,
                limit,
                offset
            }
        });
    } catch (error) {
        console.error("Fetch orders error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
