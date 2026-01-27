
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSessions } from "@/db/schema";
import { eq } from "drizzle-orm"; // Only used if checking for duplicates, but PIN generation loop handles it

export async function POST(req: Request) {
    try {
        const { quizId } = await req.json();

        if (!quizId) {
            return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
        }

        // Generate a unique 6-digit PIN
        let pin = "";
        let isUnique = false;

        // Simple retry logic for uniqueness
        for (let i = 0; i < 5; i++) {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
            const existing = await db.query.quizSessions.findFirst({
                where: eq(quizSessions.pin, pin)
            });
            if (!existing) {
                isUnique = true;
                break;
            }
        }

        if (!isUnique) {
            return NextResponse.json({ error: "Failed to generate unique PIN" }, { status: 500 });
        }

        // Create the session
        const [session] = await db.insert(quizSessions).values({
            quizId,
            pin,
            status: "waiting",
            currentQuestionIndex: -1
        }).returning();

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            pin: session.pin
        });

    } catch (error) {
        console.error("Failed to create live session:", error);
        if (error instanceof Error) {
            console.error(error.message);
            console.error(error.stack);
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
