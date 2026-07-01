import { db } from "@/db";
import { forms, formQuestions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Public, unauthenticated read-only endpoint so a shared form link works for
// non-admin visitors. Admin CRUD stays on the authenticated
// /api/admin/forms/[id] route. Only published forms (and safe fields) are exposed.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const formData = await db.select().from(forms).where(eq(forms.id, id)).limit(1);

        if (formData.length === 0) {
            return NextResponse.json({ error: "Form not found" }, { status: 404 });
        }

        const form = formData[0];

        // Not published yet: tell the page so it shows "not accepting responses"
        // instead of leaking form contents.
        if (!form.isPublished) {
            return NextResponse.json({ isPublished: false });
        }

        const questionsData = await db
            .select()
            .from(formQuestions)
            .where(eq(formQuestions.formId, id))
            .orderBy(formQuestions.displayOrder);

        // Return only the fields the public form page consumes — never the
        // automation config (channels/template) which may hold sensitive data.
        return NextResponse.json({
            id: form.id,
            title: form.title,
            description: form.description,
            isPublished: form.isPublished,
            bannerUrl: form.bannerUrl,
            bannerPosition: form.bannerPosition,
            themeColor: form.themeColor,
            postSubmissionAction: form.postSubmissionAction,
            postSubmissionData: form.postSubmissionData,
            customSuccessMessage: form.customSuccessMessage,
            questions: questionsData,
        });
    } catch (error) {
        console.error("GET /api/forms/[id] error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
