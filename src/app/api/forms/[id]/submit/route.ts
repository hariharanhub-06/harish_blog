import { db } from "@/db";
import { forms, formQuestions, formResponses, formResponseAnswers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Ensure form exists and is published
        const form = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
        if (form.length === 0 || !form[0].isPublished) {
            return NextResponse.json({ error: "Form not open or not found" }, { status: 400 });
        }

        // Insert response
        const newResponse = await db.insert(formResponses).values({
            formId: id,
        }).returning({ id: formResponses.id });

        const responseId = newResponse[0].id;

        // Insert answers
        if (body.answers && typeof body.answers === 'object') {
            const answerInserts = [];
            for (const questionId of Object.keys(body.answers)) {
                let text = "";
                let choices = null;
                const ans = body.answers[questionId];

                if (Array.isArray(ans)) {
                    choices = ans;
                } else {
                    text = String(ans);
                }

                answerInserts.push({
                    responseId,
                    questionId,
                    answerText: text,
                    answerChoices: choices,
                });
            }

            if (answerInserts.length > 0) {
                await db.insert(formResponseAnswers).values(answerInserts);
            }
        }

        return NextResponse.json({ success: true, responseId });
    } catch (error) {
        console.error("POST /api/forms/[id]/submit error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
