import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orderShipments, snackOrders } from "@/db/schema";
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

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const vendorId = decoded.id;

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

        return NextResponse.json({ shipments });

    } catch (err) {
        return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
}
