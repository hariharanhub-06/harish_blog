import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { or, eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [result] = await db
            .select({ value: count() })
            .from(snackOrders)
            .where(
                or(
                    eq(snackOrders.status, "Pending"),
                    eq(snackOrders.status, "Processing")
                )
            );

        return NextResponse.json({ count: result.value });
    } catch (error) {
        console.error("GET /api/admin/snacks/orders/count error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
