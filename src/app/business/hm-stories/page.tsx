import { db } from "@/db";
import { stories, storyEpisodes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import HMStoriesView from "@/components/HMStoriesView";

export const revalidate = 3600; // Cache for 1 hour (Increased from 0 to reduce ISR writes)

export const metadata = {
    title: "HM Stories | Episodic Content & Video Series",
    description: "Watch episodic stories and video series from HM. Explore curated playlists and engaging content.",
    keywords: ["HM Stories", "video series", "episodic content", "YouTube playlists", "stories"],
};

export default function HMStoriesPage() {
    return <HMStoriesView stories={[]} />;
}
