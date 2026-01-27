
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { sessionId, action, currentQuestionIndex } = await req.json();

        if (!sessionId || !action) {
            return NextResponse.json({ error: "Session ID and Action are required" }, { status: 400 });
        }

        let updates: any = {};

        if (action === "start") {
            updates = { status: "active", currentQuestionIndex: 0 };
        } else if (action === "next" || action === "skip") {
            updates = { currentQuestionIndex: (typeof currentQuestionIndex === 'number' ? currentQuestionIndex + 1 : 0) };
        } else if (action === "end") {
            updates = { status: "finished" };
        } else if (action === "update_index") {
            updates = { currentQuestionIndex };
        }

        updates.updatedAt = new Date();

        await db.update(quizSessions)
            .set(updates)
            .where(eq(quizSessions.id, sessionId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
