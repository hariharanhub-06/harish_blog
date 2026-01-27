
import { db } from "@/db";
import { quizSessions, quizzes, quizQuestions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import LiveQuizHost from "@/components/admin/LiveQuizHost";

interface PageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function HostLivePage({ params }: PageProps) {
    const { sessionId } = await params;

    const session = await db.query.quizSessions.findFirst({
        where: eq(quizSessions.id, sessionId)
    });

    if (!session) return notFound();

    const quiz = await db.query.quizzes.findFirst({
        where: eq(quizzes.id, session.quizId),
        with: {
            questions: true
        }
    });

    if (!quiz) return notFound();

    return (
        <LiveQuizHost
            sessionId={session.id}
            initialPin={session.pin}
            quizTitle={quiz.title}
            totalQuestions={quiz.questions.length}
        />
    );
}
