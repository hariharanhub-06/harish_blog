
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizzes, quizQuestions, quizOptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.id, id),
            with: {
                questions: {
                    with: {
                        options: true
                    }
                }
            }
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("Quiz Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, description, category, coverImage, isPublished, timeLimit, questions } = body;

        // Update Quiz metadata
        await db.update(quizzes).set({
            title,
            description,
            category,
            coverImage,
            isPublished,
            timeLimit,
            updatedAt: new Date()
        }).where(eq(quizzes.id, id));

        // If questions are provided, handle synchronization
        if (questions) {
            // Delete existing questions and options to re-insert (simplest sync logic)
            const existingQuestions = await db.select({ id: quizQuestions.id }).from(quizQuestions).where(eq(quizQuestions.quizId, id));

            for (const q of existingQuestions) {
                await db.delete(quizOptions).where(eq(quizOptions.questionId, q.id));
            }
            await db.delete(quizQuestions).where(eq(quizQuestions.quizId, id));

            // Re-insert
            for (const q of questions) {
                const [newQuestion] = await db.insert(quizQuestions).values({
                    quizId: id,
                    questionText: q.questionText,
                    imageUrl: q.imageUrl,
                    timeLimit: q.timeLimit,
                    points: q.points,
                    displayOrder: q.displayOrder
                }).returning();

                if (q.options && q.options.length > 0) {
                    await db.insert(quizOptions).values(
                        q.options.map((opt: any) => ({
                            questionId: newQuestion.id,
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect
                        }))
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Quiz Update Error:", error);
        return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // Delete cascading items manually if DB doesn't have cascades
        const existingQuestions = await db.select({ id: quizQuestions.id }).from(quizQuestions).where(eq(quizQuestions.quizId, id));

        for (const q of existingQuestions) {
            await db.delete(quizOptions).where(eq(quizOptions.questionId, q.id));
        }
        await db.delete(quizQuestions).where(eq(quizQuestions.quizId, id));
        await db.delete(quizzes).where(eq(quizzes.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Quiz Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
    }
}
