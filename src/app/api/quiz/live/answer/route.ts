
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSessions, quizParticipants, quizQuestions, quizOptions, quizLiveAnswers } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { sessionId, participantId, answerIds, timeLeft } = await req.json(); // answerIds: string[]

        if (!sessionId || !participantId) {
            return NextResponse.json({ error: "Session and Participant ID required" }, { status: 400 });
        }

        // Get session
        const session = await db.query.quizSessions.findFirst({
            where: eq(quizSessions.id, sessionId)
        });

        if (!session || session.status !== "active") {
            return NextResponse.json({ error: "Session not active" }, { status: 400 });
        }

        // Get participant
        const participant = await db.query.quizParticipants.findFirst({
            where: eq(quizParticipants.id, participantId)
        });

        if (!participant) {
            return NextResponse.json({ error: "Participant not found" }, { status: 404 });
        }

        // Check if already answered
        if (participant.lastAnsweredQuestionIndex === session.currentQuestionIndex) {
            return NextResponse.json({ error: "Already answered this question" }, { status: 400 });
        }

        // Get current question
        // We assume questions are ordered by displayOrder
        const questions = await db.query.quizQuestions.findMany({
            where: eq(quizQuestions.quizId, session.quizId),
            orderBy: [asc(quizQuestions.displayOrder)],
            with: {
                options: true
            }
        });

        const currentQuestion = questions[session.currentQuestionIndex || 0];

        if (!currentQuestion) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Validate Answer
        const correctOptions = currentQuestion.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.id);

        const isCorrect = correctOptions.length > 0 &&
            answerIds.length === correctOptions.length &&
            answerIds.every((id: string) => correctOptions.includes(id));

        let pointsAwarded = 0;
        let newStreak = participant.streak || 0;

        if (isCorrect) {
            // Base points — use ?? so that 0 points stays 0, not 1000
            pointsAwarded = currentQuestion.points ?? 1000;

            // Speed bonus calculated server-side from when the question was last advanced
            if (currentQuestion.timeLimit && session.updatedAt) {
                const elapsedMs = Date.now() - new Date(session.updatedAt).getTime();
                const timeLimitMs = currentQuestion.timeLimit * 1000;
                const percentage = Math.max(0, Math.min(1, 1 - elapsedMs / timeLimitMs));
                pointsAwarded += Math.floor(pointsAwarded * percentage * 0.5); // Up to 50% bonus
            }

            newStreak += 1;
            // Streak bonus
            pointsAwarded += newStreak * 100;
        } else {
            newStreak = 0;
        }

        // Update participant
        await db.update(quizParticipants).set({
            score: (participant.score || 0) + pointsAwarded,
            streak: newStreak,
            lastAnsweredQuestionIndex: session.currentQuestionIndex,
            lastActive: new Date()
        }).where(eq(quizParticipants.id, participantId));

        // Record the actual picks for distribution stats
        if (answerIds && answerIds.length > 0) {
            await db.insert(quizLiveAnswers).values(
                answerIds.map((optId: string) => ({
                    sessionId,
                    questionId: currentQuestion.id,
                    participantId,
                    optionId: optId
                }))
            );
        }

        return NextResponse.json({
            success: true,
            isCorrect,
            pointsAwarded,
            newScore: (participant.score || 0) + pointsAwarded,
            streak: newStreak
        });

    } catch (error) {
        console.error("Failed to submit answer:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
