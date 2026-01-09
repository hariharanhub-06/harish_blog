import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import HMTechView from "@/components/HMTechView";

export const revalidate = 300; // Cache for 5 minutes

export const metadata = {
    title: "HM Tech | Premium Web & App Development Services",
    description: "High-performance web development, mobile apps, and digital transformation by HM Tech. Expert solutions for small-scale to big-scale businesses.",
    keywords: ["web development coimbatore", "app development", "HM Tech", "software consulting", "digital transformation"],
};

export default async function HMTechPage() {
    // Fetch Projects using Server Component functionality
    const allProjects = await db.query.projects.findMany({
        orderBy: [desc(projects.order), desc(projects.createdAt)],
    });

    return (
        <HMTechView projects={allProjects} />
    );
}
