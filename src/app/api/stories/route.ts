import { db } from "@/db";
import { stories, storyEpisodes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch all active stories
        const allStories = await db.query.stories.findMany({
            where: eq(stories.isActive, true),
            orderBy: [desc(stories.displayOrder), desc(stories.createdAt)],
        });

        // Get episode counts for each story
        const storiesWithCounts = await Promise.all(
            allStories.map(async (story) => {
                const episodes = await db.query.storyEpisodes.findMany({
                    where: eq(storyEpisodes.storyId, story.id),
                });

                return {
                    ...story,
                    episodeCount: episodes.filter((ep) => ep.isActive).length,
                };
            })
        );

        return NextResponse.json(storiesWithCounts);
    } catch (error) {
        console.error("Error fetching stories:", error);
        return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
    }
}
