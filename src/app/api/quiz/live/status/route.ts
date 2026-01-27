
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSessions, quizParticipants, quizQuestions, quizLiveAnswers } from "@/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");
    const sessionId = searchParams.get("sessionId");

    if (!pin && !sessionId) {
        return NextResponse.json({ error: "PIN or Session ID required" }, { status: 400 });
    }

    try {
        let session;
        if (sessionId) {
            session = await db.query.quizSessions.findFirst({
                where: eq(quizSessions.id, sessionId)
            });
        } else {
            session = await db.query.quizSessions.findFirst({
                where: eq(quizSessions.pin, pin!)
            });
        }

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Fetch leaderboard (top 5) for real-time updates
        const leaderboard = await db.query.quizParticipants.findMany({
            where: eq(quizParticipants.sessionId, session.id),
            orderBy: [desc(quizParticipants.score)],
            limit: 5,
            columns: {
                name: true,
                score: true
            }
        });

        // Also get total participants count
        const allParticipants = await db.query.quizParticipants.findMany({
            where: eq(quizParticipants.sessionId, session.id),
            columns: { id: true }
        });

        // Get current question if active and index is valid
        let currentQuestion = null;
        if (session.status === "active" && session.currentQuestionIndex !== null && session.currentQuestionIndex >= 0) {
            const questions = await db.query.quizQuestions.findMany({
                where: eq(quizQuestions.quizId, session.quizId),
                orderBy: [asc(quizQuestions.displayOrder)],
                with: {
                    options: true
                }
            });

            // Safety check for index
            if (session.currentQuestionIndex < questions.length) {
                const q = questions[session.currentQuestionIndex];

                // Get answer distribution
                const answers = await db.query.quizLiveAnswers.findMany({
                    where: and(
                        eq(quizLiveAnswers.sessionId, session.id),
                        eq(quizLiveAnswers.questionId, q.id)
                    )
                });

                const distribution = q.options.map(opt => ({
                    optionId: opt.id,
                    count: answers.filter(a => a.optionId === opt.id).length
                }));

                currentQuestion = {
                    id: q.id,
                    questionText: q.questionText,
                    imageUrl: q.imageUrl,
                    timeLimit: q.timeLimit,
                    points: q.points,
                    // Show correct for host (when pin is not provided in search params)
                    options: q.options.map(o => ({
                        id: o.id,
                        optionText: o.optionText,
                        isCorrect: !pin ? o.isCorrect : undefined
                    })),
                    distribution,
                    totalAnswers: answers.length
                };
            }
        }

        return NextResponse.json({
            status: session.status,
            currentQuestionIndex: session.currentQuestionIndex,
            leaderboard,
            totalParticipants: allParticipants.length,
            currentQuestion
        });

    } catch (error) {
        console.error("Failed to fetch session status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
