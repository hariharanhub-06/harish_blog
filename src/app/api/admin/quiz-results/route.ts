
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizSubmissions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
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
export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
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
