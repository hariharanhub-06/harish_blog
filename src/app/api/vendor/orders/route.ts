import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderShipments, snackOrders, vendors } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function GET(req: NextRequest) {
    // 1. Auth Check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const vendorId = decoded.id;
        console.log(`[VendorOrders] Fetching for vendorId: ${vendorId}`);

        // 2. Fetch Shipments
        const shipments = await db.select({
            id: orderShipments.id,
            status: orderShipments.status,
            items: orderShipments.items,
            createdAt: orderShipments.createdAt,
            awbCode: orderShipments.awbCode,
            courierName: orderShipments.courierName,
            shiprocketOrderId: orderShipments.shiprocketOrderId,
            // Join Data
            displayOrderId: snackOrders.orderId,
            customerName: snackOrders.customerName,
            city: snackOrders.city,
            state: snackOrders.state,
            paymentStatus: snackOrders.status,
        })
            .from(orderShipments)
            .leftJoin(snackOrders, eq(orderShipments.orderId, snackOrders.orderId))
            .where(eq(orderShipments.vendorId, vendorId))
            .orderBy(desc(orderShipments.createdAt));

        // 3. Fetch Vendor Stats
        const [vendorStats] = await db.select({
            totalEarnings: vendors.totalEarnings,
            paidAmount: vendors.paidAmount,
            pendingBalance: vendors.pendingBalance
        })
            .from(vendors)
            .where(eq(vendors.id, vendorId))
            .limit(1);

        console.log(`[VendorOrders] Found ${shipments.length} shipments`);
        return NextResponse.json({
            shipments,
            stats: vendorStats || { totalEarnings: 0, paidAmount: 0, pendingBalance: 0 }
        });

    } catch (err) {
        return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
}
