import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [result] = await db
            .select({ value: count() })
            .from(contactSubmissions)
            .where(eq(contactSubmissions.status, "Fresh"));

        return NextResponse.json({
            unreadMessages: result.value,
            totalMessages: 0 // Placeholder for future use
        });
    } catch (error) {
        console.error("GET /api/admin/notifications error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
