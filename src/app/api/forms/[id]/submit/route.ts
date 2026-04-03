import { db } from "@/db";
import { forms, formQuestions, formResponses, formResponseAnswers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // 1. Ensure form exists and is published
        const formResult = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
        if (formResult.length === 0 || !formResult[0].isPublished) {
            return NextResponse.json({ error: "Form not open or not found" }, { status: 400 });
        }
        const form = formResult[0];

        // 2. Fetch all questions to map QuestionText for tag replacement tracking
        const questionsRes = await db.select().from(formQuestions).where(eq(formQuestions.formId, id));
        const questionMap = new Map();
        questionsRes.forEach(q => {
            // Map Both ID -> Text and Text -> ID just in case
            questionMap.set(q.id, q.questionText);
        });

        // 3. Insert response record
        const newResponse = await db.insert(formResponses).values({
            formId: id,
        }).returning({ id: formResponses.id });

        const responseId = newResponse[0].id;
        const processedAnswers: Record<string, string> = {};

        // 4. Insert answers
        if (body.answers && typeof body.answers === 'object') {
            const answerInserts = [];
            for (const questionId of Object.keys(body.answers)) {
                let text = "";
                let choices = null;
                const ans = body.answers[questionId];

                if (Array.isArray(ans)) {
                    choices = ans;
                    text = ans.join(", ");
                } else {
                    text = String(ans);
                }

                if (questionMap.has(questionId)) {
                    const qText = questionMap.get(questionId);
                    processedAnswers[qText.toLowerCase()] = text; // map lowercased question text to the answer string for easy {{template}} matching
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

        // 5. POST SUBMISSION AUTOMATIONS (Email, WhatsApp, SMS)
        // If automation is enabled and there is a template, we process it!
        if (form.automationEnabled && form.automationTemplate && form.automationChannels) {
            let finalMessage = form.automationTemplate;

            // Replace tags like {{Name}} or {{Email}} with actual answers if they exist
            // Regex matches {{ TagName }} ignoring spaces
            finalMessage = finalMessage.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, tagName) => {
                const searchKey = tagName.trim().toLowerCase();
                // Find matching question answer
                // E.g. {{ Email Address }} matches question "Email Address"
                return processedAnswers[searchKey] || match; // fallback to keeping the tag if not found
            });

            // Iterate through selected channels and DISPATCH mock implementations
            const channels = (form.automationChannels as string[]) || [];

            for (const channel of channels) {
                // TODO: Integrate actual Twilio / Resend / WhatsApp Business API Here
                console.log(`[AUTOMATION TRIGGERED] -> Provider: ${channel.toUpperCase()}`);
                console.log(`[AUTOMATION MESSAGE DRAFT]\n${finalMessage}\n--------------------------`);

                // For a fully live system, you would call your API logic:
                // if (channel === 'whatsapp') await sendWhatsAppMessage(..., finalMessage);
                // if (channel === 'email') await sendEmail(..., finalMessage);
            }
        }

        return NextResponse.json({ success: true, responseId, action: form.postSubmissionAction });
    } catch (error) {
        console.error("POST /api/forms/[id]/submit error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
