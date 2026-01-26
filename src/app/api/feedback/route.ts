
import { db } from "@/db";
import { feedbacks } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, role, organization, rating, content, isAdmin } = body;

        if (!name || !role || !organization || !rating || !content) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const [newFeedback] = await db.insert(feedbacks).values({
            name,
            role,
            organization,
            rating: parseInt(String(rating)),
            content,
            status: isAdmin ? "Approved" : "Fresh", // Admin submissions are auto-approved
        }).returning();

        return NextResponse.json(newFeedback);
    } catch (error: any) {
        console.error("Feedback Submission Error:", error.message);
        return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Only return approved feedbacks for the public page
        const approvedFeedbacks = await db.query.feedbacks.findMany({
            where: (f, { eq }) => eq(f.status, "Approved"),
            orderBy: (f, { desc }) => [desc(f.createdAt)]
        });

        return NextResponse.json(approvedFeedbacks);
    } catch (error: any) {
        console.error("Feedback Fetch Error:", error.message);
        return NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 });
    }
}
