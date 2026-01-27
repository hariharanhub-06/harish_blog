
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSubmissions } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const quizId = searchParams.get("quizId");

        if (!quizId) {
            return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
        }

        const leaderboard = await db.select()
            .from(quizSubmissions)
            .where(eq(quizSubmissions.quizId, quizId))
            .orderBy(desc(quizSubmissions.score), asc(quizSubmissions.attempts))
            .limit(10);

        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error("Leaderboard Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
