import { db } from "@/db";
import { websitePolls, websiteQuestions, socialGameSessions, pollResponses, websiteQuestionResponses } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        // Fetch polls with response counts
        const pollsData = await db.query.websitePolls.findMany({
            with: {
                responses: true
            },
            orderBy: [desc(websitePolls.createdAt)]
        });

        // Enrich polls with option counts
        const polls = pollsData.map(poll => {
            const counts: Record<number, number> = {};
            poll.responses.forEach(r => {
                counts[r.optionIndex] = (counts[r.optionIndex] || 0) + 1;
            });

            const options = (poll.options as any[]).map((opt, i) => ({
                ...opt,
                count: counts[i] || 0
            }));

            return {
                ...poll,
                options,
                totalVotes: poll.responses.length
            };
        });

        const questions = await db.query.websiteQuestions.findMany({
            with: {
                responses: true
            },
            orderBy: [desc(websiteQuestions.createdAt)]
        });

        const games = await db.select().from(socialGameSessions).orderBy(desc(socialGameSessions.createdAt));

        return NextResponse.json({ polls, questions, games });
    } catch (error) {
        console.error("Fetch interactions failed:", error);
        return NextResponse.json({ error: "Failed to fetch interactions" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const body = await req.json();
        const { type, data } = body;

        if (type === 'poll') {
            const [newPoll] = await db.insert(websitePolls).values({
                question: data.question,
                options: data.options,
                backgroundUrl: data.backgroundUrl,
                backgroundType: data.backgroundType || 'image',
                isActive: true
            }).returning();
            return NextResponse.json(newPoll);
        }

        if (type === 'question') {
            const [newQuestion] = await db.insert(websiteQuestions).values({
                prompt: data.prompt,
                backgroundUrl: data.backgroundUrl,
                backgroundType: data.backgroundType || 'image',
                isActive: true
            }).returning();
            return NextResponse.json(newQuestion);
        }

        if (type === 'game') {
            const [newGame] = await db.insert(socialGameSessions).values({
                gameId: data.gameId || 'memory',
                title: data.title,
                isActive: true
            }).returning();
            return NextResponse.json(newGame);
        }

        return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 });
    } catch (error) {
        console.error("Create interaction failed:", error);
        return NextResponse.json({ error: "Failed to create interaction" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type");

        if (!id || !type) return NextResponse.json({ error: "Missing ID or type" }, { status: 400 });

        if (type === 'poll') {
            await db.delete(websitePolls).where(eq(websitePolls.id, id));
            await db.delete(pollResponses).where(eq(pollResponses.pollId, id));
        } else if (type === 'question') {
            await db.delete(websiteQuestions).where(eq(websiteQuestions.id, id));
            await db.delete(websiteQuestionResponses).where(eq(websiteQuestionResponses.questionId, id));
        } else if (type === 'game') {
            await db.delete(socialGameSessions).where(eq(socialGameSessions.id, id));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const body = await req.json();
        const { id, type, isActive } = body;

        if (type === 'poll') {
            await db.update(websitePolls).set({ isActive }).where(eq(websitePolls.id, id));
        } else if (type === 'question') {
            await db.update(websiteQuestions).set({ isActive }).where(eq(websiteQuestions.id, id));
        } else if (type === 'game') {
            await db.update(socialGameSessions).set({ isActive }).where(eq(socialGameSessions.id, id));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
