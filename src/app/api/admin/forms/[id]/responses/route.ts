import { db } from "@/db";
import { formResponses, formResponseAnswers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Fetch all responses for the form
        const responses = await db.select().from(formResponses).where(eq(formResponses.formId, id)).orderBy(desc(formResponses.createdAt));

        if (responses.length === 0) {
            return NextResponse.json([]);
        }

        const responseIds = responses.map(r => r.id);

        // Fetch all answers for these responses
        // We'll map them by responseId
        let answersData: any[] = [];

        for (const rId of responseIds) {
            const rowAnswers = await db.select().from(formResponseAnswers).where(eq(formResponseAnswers.responseId, rId));
            answersData = answersData.concat(rowAnswers);
        }

        const result = responses.map(r => {
            const relevantAnswers = answersData.filter(a => a.responseId === r.id);
            return {
                ...r,
                answers: relevantAnswers
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("GET /api/admin/forms/[id]/responses error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { responseIds } = await req.json();

        if (!responseIds || !Array.isArray(responseIds)) {
            return NextResponse.json({ error: "Invalid response IDs" }, { status: 400 });
        }

        // Delete answers for these responses
        for (const rId of responseIds) {
            await db.delete(formResponseAnswers).where(eq(formResponseAnswers.responseId, rId));
        }

        // Delete responses
        for (const rId of responseIds) {
            await db.delete(formResponses).where(eq(formResponses.id, rId));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/admin/forms/[id]/responses error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
