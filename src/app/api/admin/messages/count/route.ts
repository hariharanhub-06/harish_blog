import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const [result] = await db
            .select({ value: count() })
            .from(contactSubmissions)
            .where(eq(contactSubmissions.status, "New"));

        return NextResponse.json({ count: result.value });
    } catch (error) {
        console.error("GET /api/admin/messages/count error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
