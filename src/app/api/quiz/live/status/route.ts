
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSessions, quizParticipants, quizQuestions, quizLiveAnswers, quizzes } from "@/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");
    const sessionId = searchParams.get("sessionId");
    const isHost = searchParams.get("host") === "true";
    const participantId = searchParams.get("participantId");

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
                score: true,
                streak: true
            }
        });

        // Also get total participants count
        const allParticipants = await db.query.quizParticipants.findMany({
            where: eq(quizParticipants.sessionId, session.id),
            columns: { id: true }
        });

        // Get current question if active and index is valid
        let currentQuestion = null;
        let showResults = false;
        let isParticipantCorrect = false;

        if (session.status === "active" && session.currentQuestionIndex !== null && session.currentQuestionIndex >= 0) {
            const quizData = await db.query.quizzes.findFirst({
                where: eq(quizzes.id, session.quizId)
            });

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

                // Determine if results should be revealed
                const timeLimit = q.timeLimit || quizData?.timeLimit || 30;
                const startTime = session.updatedAt ? new Date(session.updatedAt).getTime() : 0;
                const now = Date.now();
                const timeExpired = startTime > 0 && (now - startTime) > (timeLimit * 1000);
                const allAnswered = allParticipants.length > 0 && answers.length >= allParticipants.length;

                showResults = allAnswered || timeExpired;

                // Check if this specific participant was correct
                if (participantId) {
                    const participantAnswers = answers.filter(a => a.participantId === participantId);
                    const correctOptionIds = q.options.filter(o => o.isCorrect).map(o => o.id);
                    isParticipantCorrect = participantAnswers.length > 0 &&
                        participantAnswers.length === correctOptionIds.length &&
                        participantAnswers.every(pa => correctOptionIds.includes(pa.optionId));
                }

                const distribution = q.options.map(opt => ({
                    optionId: opt.id,
                    count: answers.filter(a => a.optionId === opt.id).length
                }));

                currentQuestion = {
                    id: q.id,
                    questionText: q.questionText,
                    imageUrl: q.imageUrl,
                    timeLimit: timeLimit,
                    points: q.points,
                    // Reveal isCorrect only if results are out or requester is host
                    options: q.options.map(o => ({
                        id: o.id,
                        optionText: o.optionText,
                        isCorrect: (showResults || isHost) ? o.isCorrect : undefined
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
            showResults,
            isCorrect: isParticipantCorrect,
            currentQuestion
        });

    } catch (error) {
        console.error("Failed to fetch session status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
