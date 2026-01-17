import { NextResponse } from "next/server";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET: Fetch all stories with episode counts
export async function GET() {
    try {
        const allStories = await db.query.stories.findMany({
            orderBy: [desc(stories.displayOrder), desc(stories.createdAt)],
        });

        // Get episode counts for each story
        const storiesWithCounts = await Promise.all(
            allStories.map(async (story) => {
                const episodes = await db.query.storyEpisodes.findMany({
                    where: (storyEpisodes, { eq }) => eq(storyEpisodes.storyId, story.id),
                });

                return {
                    ...story,
                    episodeCount: episodes.length,
                };
            })
        );

        return NextResponse.json(storiesWithCounts);
    } catch (error) {
        console.error("Error fetching stories:", error);
        return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
    }
}

// POST: Create new story (manual entry - no API required)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, thumbnailUrl, isActive } = body;

        // Validate required fields
        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        // Create story with manual data
        const [newStory] = await db
            .insert(stories)
            .values({
                title,
                description: description || null,
                thumbnailUrl: thumbnailUrl || null,
                youtubePlaylistId: null,
                isActive: isActive ?? true,
                displayOrder: 0,
            })
            .returning();

        return NextResponse.json(newStory, { status: 201 });
    } catch (error) {
        console.error("Error creating story:", error);
        return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
    }
}
