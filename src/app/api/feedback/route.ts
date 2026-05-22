import { db } from "@/db";
import { feedbacks } from "@/db/schema";
import { NextResponse } from "next/server";
import { sendAdminPushNotification } from "@/lib/webpush";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, role, organization, rating, content } = body;

        if (!name || !role || !organization || !rating || !content) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const parsedRating = parseInt(String(rating));
        if (!(parsedRating >= 1 && parsedRating <= 5)) {
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
        }

        const [newFeedback] = await db.insert(feedbacks).values({
            name,
            role,
            organization,
            rating: parsedRating,
            content,
            status: "New",
        }).returning();

        const stars = "⭐".repeat(Math.min(parsedRating, 5));
        sendAdminPushNotification(
            `${stars} New Feedback`,
            `${name} (${role} @ ${organization}) left ${parsedRating}/5 stars`,
            `/admin/dashboard#feedback`
        ).catch(() => {});

        return NextResponse.json(newFeedback);
    } catch (error: unknown) {
        console.error("Feedback Submission Error:", error);
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
