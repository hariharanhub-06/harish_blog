import { db } from "@/db";
import { websitePolls, websiteQuestions, socialGameSessions, pollResponses, websiteQuestionResponses } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;

    const warnings: string[] = [];
    let polls: any[] = [];
    let questions: any[] = [];
    let games: any[] = [];

    try {
        const pollsData = await db.query.websitePolls.findMany({
            with: { responses: true },
            orderBy: [desc(websitePolls.createdAt)]
        });

        polls = pollsData.map(poll => {
            const counts: Record<number, number> = {};
            if (poll.responses) {
                poll.responses.forEach(r => {
                    counts[r.optionIndex] = (counts[r.optionIndex] || 0) + 1;
                });
            }
            const rawOptions = Array.isArray(poll.options) ? poll.options : [];
            const options = rawOptions.map((opt: any, i: number) => {
                const base = typeof opt === 'string' ? { text: opt } : opt;
                return { ...base, count: counts[i] || 0 };
            });

            const platformBreakdown: Record<string, number> = {};
            (poll.responses ?? []).forEach(r => {
                const p = r.platform || "direct";
                platformBreakdown[p] = (platformBreakdown[p] || 0) + 1;
            });

            return { ...poll, options, totalVotes: poll.responses?.length || 0, platformBreakdown };
        });
    } catch (err: any) {
        warnings.push("Polls unavailable — run repair-db: " + err.message);
    }

    try {
        questions = await db.query.websiteQuestions.findMany({
            with: { responses: true },
            orderBy: [desc(websiteQuestions.createdAt)]
        });
    } catch (err: any) {
        warnings.push("Questions unavailable — run repair-db: " + err.message);
    }

    try {
        games = await db.select().from(socialGameSessions).orderBy(desc(socialGameSessions.createdAt));
    } catch (err: any) {
        warnings.push("Games unavailable — run repair-db: " + err.message);
    }

    return NextResponse.json({
        polls,
        questions,
        games,
        ...(warnings.length > 0 && { warnings }),
    });
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
    } catch (error: any) {
        console.error("Create interaction failed:", error);
        return NextResponse.json({ error: "Failed to create interaction", details: error.message }, { status: 500 });
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
            await db.delete(pollResponses).where(eq(pollResponses.pollId, id));
            await db.delete(websitePolls).where(eq(websitePolls.id, id));
        } else if (type === 'question') {
            await db.delete(websiteQuestionResponses).where(eq(websiteQuestionResponses.questionId, id));
            await db.delete(websiteQuestions).where(eq(websiteQuestions.id, id));
        } else if (type === 'game') {
            await db.delete(socialGameSessions).where(eq(socialGameSessions.id, id));
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete interaction failed:", error);
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
    } catch (error: any) {
        console.error("Toggle interaction failed:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
