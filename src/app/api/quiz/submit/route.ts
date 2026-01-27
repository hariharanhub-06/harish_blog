
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSubmissions, quizzes } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { quizId, userName, score, correctAnswers, totalQuestions, timeTaken } = body;

        // Check for existing submission for same user and quiz
        const existing = await db.query.quizSubmissions.findFirst({
            where: and(
                eq(quizSubmissions.quizId, quizId),
                eq(quizSubmissions.userName, userName)
            )
        });

        if (existing) {
            // Update highest score and increment attempts
            await db.update(quizSubmissions).set({
                score: Math.max(existing.score || 0, score),
                correctAnswers: Math.max(existing.correctAnswers || 0, correctAnswers),
                attempts: (existing.attempts || 0) + 1,
                timeTaken: timeTaken || existing.timeTaken,
                completedAt: new Date()
            }).where(eq(quizSubmissions.id, existing.id));
        } else {
            // Create new submission
            await db.insert(quizSubmissions).values({
                quizId,
                userName,
                score,
                correctAnswers,
                totalQuestions,
                attempts: 1,
                timeTaken,
                completedAt: new Date()
            });
        }

        // Increment play count for quiz
        await db.update(quizzes).set({
            playCount: sql`${quizzes.playCount} + 1`
        }).where(eq(quizzes.id, quizId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Quiz Submit Error:", error);
        return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
    }
}
