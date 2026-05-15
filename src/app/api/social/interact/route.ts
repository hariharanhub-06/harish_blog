import { db } from "@/db";
import { pollResponses, websiteQuestionResponses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, id, optionIndex, answerText, userName, platform } = body;

        if (!type || !id) {
            return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
        const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

        if (type === 'poll') {
            if (optionIndex === undefined || optionIndex === null) {
                return NextResponse.json({ error: "Missing optionIndex" }, { status: 400 });
            }

            const existing = await db.select()
                .from(pollResponses)
                .where(and(eq(pollResponses.pollId, id), eq(pollResponses.ipHash, ipHash)))
                .limit(1);

            if (existing.length > 0) {
                return NextResponse.json({ error: "Already voted" }, { status: 400 });
            }

            await db.insert(pollResponses).values({
                pollId: id,
                optionIndex: Number(optionIndex),
                ipHash,
                platform: platform || 'direct'
            });

            return NextResponse.json({ success: true });
        }

        if (type === 'question') {
            if (!answerText?.trim()) {
                return NextResponse.json({ error: "Answer text required" }, { status: 400 });
            }

            // Rate-limit: one answer per IP per question
            const existing = await db.select()
                .from(websiteQuestionResponses)
                .where(and(eq(websiteQuestionResponses.questionId, id), eq(websiteQuestionResponses.ipHash, ipHash)))
                .limit(1);

            if (existing.length > 0) {
                return NextResponse.json({ error: "Already answered" }, { status: 400 });
            }

            await db.insert(websiteQuestionResponses).values({
                questionId: id,
                userName: (userName || "Anonymous").substring(0, 50),
                answerText: answerText.trim().substring(0, 1000),
                ipHash
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Operation failed" }, { status: 500 });
    }
}
