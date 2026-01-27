
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSessions, quizParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { pin, name } = await req.json();

        if (!pin || !name) {
            return NextResponse.json({ error: "PIN and Name are required" }, { status: 400 });
        }

        // Find the session
        const session = await db.query.quizSessions.findFirst({
            where: eq(quizSessions.pin, pin)
        });

        if (!session) {
            return NextResponse.json({ error: "Invalid PIN" }, { status: 404 });
        }

        if (session.status === "finished") {
            return NextResponse.json({ error: "This quiz has already finished" }, { status: 400 });
        }

        // Check if user already exists in this session (reconnection logic)
        let participant = await db.query.quizParticipants.findFirst({
            where: and(
                eq(quizParticipants.sessionId, session.id),
                eq(quizParticipants.name, name)
            )
        });

        if (!participant) {
            // Register new participant
            [participant] = await db.insert(quizParticipants).values({
                sessionId: session.id,
                name,
                score: 0,
                streak: 0
            }).returning();
        } else {
            // Update last active
            await db.update(quizParticipants)
                .set({ lastActive: new Date() })
                .where(eq(quizParticipants.id, participant.id));
        }

        return NextResponse.json({
            success: true,
            participantId: participant.id,
            sessionId: session.id,
            status: session.status,
            currentQuestionIndex: session.currentQuestionIndex
        });

    } catch (error) {
        console.error("Failed to join session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
