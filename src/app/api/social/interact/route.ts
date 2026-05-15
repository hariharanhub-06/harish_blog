import { db } from "@/db";
import { websitePolls, pollResponses, websiteQuestions, websiteQuestionResponses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, id, optionIndex, answerText, userName, platform } = body;

        // Get IP for basic duplicate protection
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

        if (type === 'poll') {
            // Check if already voted (basic check)
            const existing = await db.select()
                .from(pollResponses)
                .where(and(eq(pollResponses.pollId, id), eq(pollResponses.ipHash, ipHash)))
                .limit(1);

            if (existing.length > 0) {
                return NextResponse.json({ error: "Already voted" }, { status: 400 });
            }

            await db.insert(pollResponses).values({
                pollId: id,
                optionIndex,
                ipHash,
                platform: platform || 'direct'
            });

            return NextResponse.json({ success: true });
        }

        if (type === 'question') {
            await db.insert(websiteQuestionResponses).values({
                questionId: id,
                userName: userName || "Anonymous",
                answerText
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 });
    } catch (error) {
        console.error("Interaction failed", error);
        return NextResponse.json({ error: "Operation failed" }, { status: 500 });
    }
}
