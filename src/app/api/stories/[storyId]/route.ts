import { db } from "@/db";
import { stories, storyEpisodes } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storyId: string }> }
) {
    try {
        const { storyId } = await params;

        const story = await db.query.stories.findFirst({
            where: eq(stories.id, storyId),
        });

        if (!story || !story.isActive) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        const allEpisodes = await db.query.storyEpisodes.findMany({
            where: eq(storyEpisodes.storyId, storyId),
            orderBy: [asc(storyEpisodes.episodeNumber)],
        });

        const activeEpisodes = allEpisodes.filter((ep) => ep.isActive);

        return NextResponse.json({
            story,
            episodes: activeEpisodes
        });
    } catch (error) {
        console.error("Error fetching story detail:", error);
        return NextResponse.json({ error: "Failed to fetch story details" }, { status: 500 });
    }
}
