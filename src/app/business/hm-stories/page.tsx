import { db } from "@/db";
import { stories, storyEpisodes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import HMStoriesView from "@/components/HMStoriesView";

export const revalidate = 0; // Disable cache to show updates immediately

export const metadata = {
    title: "HM Stories | Episodic Content & Video Series",
    description: "Watch episodic stories and video series from HM. Explore curated playlists and engaging content.",
    keywords: ["HM Stories", "video series", "episodic content", "YouTube playlists", "stories"],
};

export default async function HMStoriesPage() {
    // Fetch all active stories with episode counts
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

    return <HMStoriesView stories={storiesWithCounts} />;
}
