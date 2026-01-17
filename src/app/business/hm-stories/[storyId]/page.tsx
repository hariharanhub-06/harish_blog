import { db } from "@/db";
import { stories, storyEpisodes } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import StoryEpisodesViewer from "@/components/StoryEpisodesViewer";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { storyId: string } }) {
    const story = await db.query.stories.findFirst({
        where: eq(stories.id, params.storyId),
    });

    if (!story) {
        return {
            title: "Story Not Found",
        };
    }

    return {
        title: `${story.title} | HM Stories`,
        description: story.description || `Watch all episodes of ${story.title}`,
        openGraph: {
            title: story.title,
            description: story.description || undefined,
            images: story.thumbnailUrl ? [story.thumbnailUrl] : [],
        },
    };
}

export default async function StoryPage({ params }: { params: { storyId: string } }) {
    const story = await db.query.stories.findFirst({
        where: eq(stories.id, params.storyId),
    });

    if (!story || !story.isActive) {
        notFound();
    }

    const allEpisodes = await db.query.storyEpisodes.findMany({
        where: eq(storyEpisodes.storyId, params.storyId),
        orderBy: [asc(storyEpisodes.episodeNumber)],
    });

    const activeEpisodes = allEpisodes.filter((ep) => ep.isActive);

    return <StoryEpisodesViewer story={story} episodes={activeEpisodes} />;
}
