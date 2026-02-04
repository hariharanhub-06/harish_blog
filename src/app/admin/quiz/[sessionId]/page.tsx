import { db } from "@/db";
import { quizSessions, quizzes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import LiveQuizHost from "@/components/admin/LiveQuizHost";

interface Props {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function AdminQuizHostPage({ params }: Props) {
    const { sessionId } = await params;

    // Fetch Quiz Session
    const session = await db.query.quizSessions.findFirst({
        where: eq(quizSessions.id, sessionId)
    });

    if (!session) {
        redirect("/admin/dashboard?error=session_not_found#quiz-manager");
    }

    // Fetch Quiz Details
    const quiz = await db.query.quizzes.findFirst({
        where: eq(quizzes.id, session.quizId),
        with: {
            questions: {
                with: {
                    options: true
                },
                orderBy: (questions, { asc }) => [asc(questions.displayOrder)]
            }
        }
    });

    if (!quiz) {
        redirect("/admin/dashboard?error=quiz_not_found#quiz-manager");
    }

    return (
        <LiveQuizHost
            sessionId={session.id}
            initialPin={session.pin}
            quizTitle={quiz.title}
            totalQuestions={quiz.questions.length}
        />
    );
}
