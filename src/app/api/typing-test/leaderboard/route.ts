
import { db } from "@/db";
import { typingTestResults } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const duration = searchParams.get("duration");

        let query = db.select().from(typingTestResults);

        // Sorting by WPM (desc) then Accuracy (desc)
        // Drizzle ORM query builder approach
        const results = await db.query.typingTestResults.findMany({
            where: duration ? (t, { eq }) => eq(t.duration, parseInt(duration)) : undefined,
            orderBy: [desc(typingTestResults.wpm), desc(typingTestResults.accuracy)],
            limit: 50 // Limit to top 50
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
