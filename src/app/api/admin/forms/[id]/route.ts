import { db } from "@/db";
import { forms, formQuestions, formResponses, formResponseAnswers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const formData = await db.select().from(forms).where(eq(forms.id, id)).limit(1);

        if (formData.length === 0) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        const questionsData = await db.select().from(formQuestions).where(eq(formQuestions.formId, id)).orderBy(formQuestions.displayOrder);

        return NextResponse.json({ ...formData[0], questions: questionsData });
    } catch (error) {
        console.error("GET /api/admin/forms/[id] error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, description, isPublished, questions } = body;

        await db.update(forms)
            .set({ title, description, isPublished, updatedAt: new Date() })
            .where(eq(forms.id, id));

        if (questions && Array.isArray(questions)) {
            // Re-create questions for simplicity
            await db.delete(formQuestions).where(eq(formQuestions.formId, id));
            if (questions.length > 0) {
                const newQuestions = questions.map((q: any, i: number) => ({
                    formId: id,
                    type: q.type,
                    questionText: q.questionText,
                    required: q.required || false,
                    options: q.options || null,
                    displayOrder: i,
                }));
                await db.insert(formQuestions).values(newQuestions);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT /api/admin/forms/[id] error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Clean up answers and responses
        const responses = await db.select({ id: formResponses.id }).from(formResponses).where(eq(formResponses.formId, id));
        for (const r of responses) {
            await db.delete(formResponseAnswers).where(eq(formResponseAnswers.responseId, r.id));
        }
        await db.delete(formResponses).where(eq(formResponses.formId, id));

        // Clean up questions
        await db.delete(formQuestions).where(eq(formQuestions.formId, id));

        // Delete form
        await db.delete(forms).where(eq(forms.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/admin/forms/[id] error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
