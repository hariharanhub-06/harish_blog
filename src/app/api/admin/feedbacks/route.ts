
import { db } from "@/db";
import { feedbacks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const allFeedbacks = await db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt));
        return NextResponse.json(allFeedbacks);
    } catch (error: any) {
        console.error("Admin Feedback Fetch Error:", error.message);
        return NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, status, name, role, organization, rating, content } = body;

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await db.update(feedbacks)
            .set({ status, name, role, organization, rating: parseInt(String(rating)), content })
            .where(eq(feedbacks.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Admin Feedback Update Error:", error.message);
        return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await db.delete(feedbacks).where(eq(feedbacks.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Admin Feedback Delete Error:", error.message);
        return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
    }
}
