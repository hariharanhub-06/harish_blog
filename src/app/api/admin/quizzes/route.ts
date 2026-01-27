
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizzes, quizQuestions, quizOptions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
    try {
        const allQuizzes = await db.query.quizzes.findMany({
            with: {
                questions: {
                    with: {
                        options: true
                    }
                }
            },
            orderBy: [desc(quizzes.createdAt)]
        });
        return NextResponse.json(allQuizzes);
    } catch (error) {
        console.error("Quiz Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, category, coverImage, isPublished, timeLimit, questions } = body;

        const [newQuiz] = await db.insert(quizzes).values({
            title,
            description,
            category,
            coverImage,
            isPublished,
            timeLimit
        }).returning();

        if (questions && questions.length > 0) {
            for (const q of questions) {
                const [newQuestion] = await db.insert(quizQuestions).values({
                    quizId: newQuiz.id,
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

        return NextResponse.json(newQuiz);
    } catch (error) {
        console.error("Quiz Create Error:", error);
        return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
    }
}
