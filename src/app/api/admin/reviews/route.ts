import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackReviews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const reviews = await db
            .select()
            .from(snackReviews)
            .orderBy(desc(snackReviews.createdAt));

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Admin fetch reviews error:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [updated] = await db
            .update(snackReviews)
            .set({ status })
            .where(eq(snackReviews.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Moderate review error:", error);
        return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 });
    }
}
