
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizzes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const publishedQuizzes = await db.select()
            .from(quizzes)
            .where(eq(quizzes.isPublished, true))
            .orderBy(desc(quizzes.createdAt));

        return NextResponse.json(publishedQuizzes);
    } catch (error) {
        console.error("Public Quiz Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
    }
}
