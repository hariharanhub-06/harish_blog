import { db } from "@/db";
import { stories, storyEpisodes } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import StoryEpisodesViewer from "@/components/StoryEpisodesViewer";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Cache for 1 hour (Increased from 0 to reduce ISR writes)

export async function generateMetadata({ params }: { params: Promise<{ storyId: string }> }) {
    const { storyId } = await params;
    const story = await db.query.stories.findFirst({
        where: eq(stories.id, storyId),
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

export default async function StoryPage({ params }: { params: Promise<{ storyId: string }> }) {
    const { storyId } = await params;
    return <StoryEpisodesViewer story={{ id: storyId, title: "Loading...", description: null, thumbnailUrl: null }} episodes={[]} />;
}
