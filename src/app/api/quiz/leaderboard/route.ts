
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSubmissions } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const quizId = searchParams.get("quizId");

        const leaderboard = await db.select()
            .from(quizSubmissions)
            .where(quizId && quizId !== "all" ? eq(quizSubmissions.quizId, quizId) : undefined)
            .orderBy(desc(quizSubmissions.score), asc(quizSubmissions.attempts))
            .limit(50);

        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error("Leaderboard Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await db.delete(quizSubmissions).where(eq(quizSubmissions.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Quiz Result Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete result" }, { status: 500 });
    }
}
