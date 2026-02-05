import { db } from "@/db";
import { gameScores } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get("gameId");
        const limit = parseInt(searchParams.get("limit") || "10");

        let scores;
        if (gameId) {
            scores = await db.query.gameScores.findMany({
                where: eq(gameScores.gameId, gameId),
                orderBy: [desc(gameScores.score)],
                limit: limit
            });
        } else {
            scores = await db.query.gameScores.findMany({
                orderBy: [desc(gameScores.score)],
                limit: limit
            });
        }

        return NextResponse.json(scores);
    } catch (error) {
        console.error("GET Scores failed:", error);
        return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { gameId, userName, score, moves, timeTaken } = body;

        if (!gameId || !userName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newScore = await db.insert(gameScores).values({
            gameId,
            userName,
            score: score || 0,
            moves,
            timeTaken,
        }).returning();

        return NextResponse.json(newScore[0]);
    } catch (error) {
        console.error("POST Score failed:", error);
        return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await db.delete(gameScores).where(eq(gameScores.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
