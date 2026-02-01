
import { db } from "@/db";
import { typingTestResults } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc, and, eq } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const duration = searchParams.get("duration");
        const difficulty = searchParams.get("difficulty");

        const results = await db.query.typingTestResults.findMany({
            where: (t, { and, eq }) => {
                const conditions = [];
                if (duration) conditions.push(eq(t.duration, parseInt(duration)));
                if (difficulty) conditions.push(eq(t.difficulty, difficulty));
                return conditions.length > 0 ? and(...conditions) : undefined;
            },
            orderBy: [desc(typingTestResults.wpm), desc(typingTestResults.accuracy)],
            limit: 50
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await db.delete(typingTestResults).where(eq(typingTestResults.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete result:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
