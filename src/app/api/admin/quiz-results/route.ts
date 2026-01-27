
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSubmissions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const quizId = searchParams.get("quizId");

        if (!quizId) {
            return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
        }

        const submissions = await db.query.quizSubmissions.findMany({
            where: eq(quizSubmissions.quizId, quizId),
            orderBy: [desc(quizSubmissions.score), desc(quizSubmissions.completedAt)],
        });

        return NextResponse.json(submissions);

    } catch (error) {
        console.error("Failed to fetch quiz results:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
