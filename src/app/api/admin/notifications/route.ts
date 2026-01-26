
import { db } from "@/db";
import { contactSubmissions, feedbacks } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [unreadResult] = await db
            .select({ value: count() })
            .from(contactSubmissions)
            .where(eq(contactSubmissions.status, "Fresh"));

        const [pendingFeedbackResult] = await db
            .select({ value: count() })
            .from(feedbacks)
            .where(eq(feedbacks.status, "Fresh"));

        return NextResponse.json({
            unreadMessages: unreadResult.value,
            pendingFeedbacks: pendingFeedbackResult.value
        });
    } catch (error: any) {
        console.error("Notifications API Error:", error.message);
        return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
    }
}
